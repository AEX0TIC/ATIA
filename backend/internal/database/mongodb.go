package database

import (
	"context"
	"log"
	"time"

	"github.com/AEX0TIC/ATIA/backend/internal/models"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDB struct {
	client   *mongo.Client
	database *mongo.Database
}

func NewMongoDB(uri, dbName string) (*MongoDB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	database := client.Database(dbName)
	return &MongoDB{
		client:   client,
		database: database,
	}, nil
}

func (db *MongoDB) CreateIndexes() error {
	ctx := context.Background()

	// Create indexes for the threats collection
	threatsCollection := db.database.Collection("threats")

	indexes := []mongo.IndexModel{
		{
			Keys: map[string]interface{}{
				"indicator": 1,
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: map[string]interface{}{
				"type": 1,
			},
		},
		{
			Keys: map[string]interface{}{
				"score": 1,
			},
		},
	}

	_, err := threatsCollection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		log.Printf("Error creating indexes: %v", err)
		return err
	}

	return nil
}

func (db *MongoDB) InsertThreat(threat *models.Threat) error {
	collection := db.database.Collection("threats")
	ctx := context.Background()

	_, err := collection.InsertOne(ctx, threat)
	return err
}

func (db *MongoDB) Close() error {
	ctx := context.Background()
	return db.client.Disconnect(ctx)
}
