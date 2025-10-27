package main()

import(
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"atia/internal/api"
	"atia/internal/config"
	"atia/internal/database"
	"atia/internal/services"

	"github.com/gin-gonic/gin"
)

func main(){
	cfg, err := config.Loadconfig()
	if err != nil{
		log.Fatalf("Failed to load config:%v", err)
	}
}