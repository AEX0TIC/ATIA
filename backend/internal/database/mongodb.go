package database

import (
	"context"
	"time"

	"github.com/AEX0TIC/ATIA/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	client     *mongo.Client
	database   *mongo.Database
	collection *mongo.Collection
}

func NewMongoDB(uri, dbName string) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Ping the database
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	db := client.Database(dbName)
	collection := db.Collection("threats")

	// Create indexes
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "indicator", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	_, err = collection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return nil, err
	}

	return &MongoDB{
		client:     client,
		database:   db,
		collection: collection,
	}, nil
}

// CreateIndexes ensures the required indexes exist for the collection.
// It's safe to call multiple times.
func (m *MongoDB) CreateIndexes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "indicator", Value: 1}},
		Options: options.Index().SetUnique(true),
	}

	_, err := m.collection.Indexes().CreateOne(ctx, indexModel)
	return err
}

func (m *MongoDB) SaveThreat(threat *models.ThreatIndicator) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	threat.LastUpdated = time.Now()
	if threat.FirstSeen.IsZero() {
		threat.FirstSeen = time.Now()
	}

	filter := bson.M{"indicator": threat.Indicator}
	update := bson.M{"$set": threat}
	opts := options.Update().SetUpsert(true)

	_, err := m.collection.UpdateOne(ctx, filter, update, opts)
	return err
}

func (m *MongoDB) GetThreat(indicator string) (*models.ThreatIndicator, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var threat models.ThreatIndicator
	err := m.collection.FindOne(ctx, bson.M{"indicator": indicator}).Decode(&threat)
	if err != nil {
		return nil, err
	}

	return &threat, nil
}

func (m *MongoDB) GetAllThreats(limit int64) ([]models.ThreatIndicator, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetLimit(limit).SetSort(bson.D{{Key: "last_updated", Value: -1}})
	cursor, err := m.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var threats []models.ThreatIndicator
	if err := cursor.All(ctx, &threats); err != nil {
		return nil, err
	}

	return threats, nil
}

func (m *MongoDB) GetThreatHistory(indicator string) ([]models.ThreatIndicator, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := m.collection.Find(ctx, bson.M{"indicator": indicator})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var history []models.ThreatIndicator
	if err := cursor.All(ctx, &history); err != nil {
		return nil, err
	}

	return history, nil
}

func (m *MongoDB) DeleteThreat(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = m.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

func (m *MongoDB) Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return m.client.Disconnect(ctx)
}

// Close is an alias for Disconnect to provide a simpler API for callers.
func (m *MongoDB) Close() error {
	return m.Disconnect()
}
