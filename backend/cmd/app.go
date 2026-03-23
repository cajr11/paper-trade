package main

import (
	"fmt"
	"log"
	"os"

	"github.com/cajr11/paper-trade/backend/internal/db"
	"github.com/cajr11/paper-trade/backend/internal/store"
)

func main() {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")
	dbHost := os.Getenv("DB_HOST")

	dbAddr := fmt.Sprintf("postgres://%s:%s@%s:5432/%s?sslmode=disable", user, password, dbHost, dbName)

	cfg := config{
		addr: ":8080",
		db: dbConfig{
			addr:         dbAddr,
			maxOpenConns: 30,
			maxIdleConns: 30,
			maxIdleTime:  "15m",
		},
	}

	database, err := db.New(cfg.db.addr, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)
	if err != nil {
		log.Panic(err)
	}
	defer database.Close()

	storage := store.NewStorage(database)

	app := &application{
		config: cfg,
		store:  storage,
	}

	mux := app.mount()

	log.Fatal(app.run(mux))
}
