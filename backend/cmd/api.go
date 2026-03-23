package main

import (
	"log"
	"net/http"
	"time"

	"github.com/cajr11/paper-trade/backend/internal/auth"
	"github.com/cajr11/paper-trade/backend/internal/health"
	"github.com/cajr11/paper-trade/backend/internal/store"
	"github.com/cajr11/paper-trade/backend/internal/tickers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type application struct {
	config config
	store  store.Storage
}

type config struct {
	addr string
	db   dbConfig
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// Initialize auth
	authService := auth.NewAuthService(app.store.User)
	authHandler := auth.NewAuthHandler(authService)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", health.HandleHealthCheck)
		r.Get("/tickers", tickers.HandleGetAllPairs)

		// Auth routes (public)
		r.Post("/auth/signup", authHandler.HandleSignup)
		r.Post("/auth/login", authHandler.HandleLogin)
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      mux,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	log.Printf("Server running at %s", app.config.addr)

	return srv.ListenAndServe()
}
