package main

import (
	"log"
	"net/http"
	"time"

	"github.com/cajr11/paper-trade/backend/internal/auth"
	"github.com/cajr11/paper-trade/backend/internal/health"
	appMiddleware "github.com/cajr11/paper-trade/backend/internal/middleware"
	"github.com/cajr11/paper-trade/backend/internal/store"
	"github.com/cajr11/paper-trade/backend/internal/tickers"
	"github.com/cajr11/paper-trade/backend/internal/trading"
	"github.com/cajr11/paper-trade/backend/internal/watchlist"
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
	r.Use(appMiddleware.CORS)

	// Initialize services and handlers
	authService := auth.NewAuthService(app.store.User)
	authHandler := auth.NewAuthHandler(authService)
	tradingService := trading.NewTradingService(app.store.DB, app.store.User, app.store.Holding, app.store.Trade)
	tradingHandler := trading.NewTradingHandler(tradingService, app.store.Holding, app.store.Trade, app.store.User)
	watchlistHandler := watchlist.NewWatchlistHandler(app.store.Watchlist)

	r.Route("/api/v1", func(r chi.Router) {
		// Public routes
		r.Get("/health", health.HandleHealthCheck)
		r.Get("/tickers", tickers.HandleGetAllPairs)
		r.Get("/tickers/price", tickers.HandleGetPrice)
		r.Get("/tickers/prices", tickers.HandleGetPrices)
		r.Post("/auth/signup", authHandler.HandleSignup)
		r.Post("/auth/login", authHandler.HandleLogin)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.AuthRequired)

			// User profile
			r.Get("/me", authHandler.HandleGetMe)

			// Portfolio
			r.Get("/portfolio", tradingHandler.HandleGetPortfolio)

			// Trading
			r.Post("/trades", tradingHandler.HandleExecuteTrade)
			r.Get("/trades", tradingHandler.HandleGetTradeHistory)

			// Watchlist
			r.Get("/watchlist", watchlistHandler.HandleGetWatchlist)
			r.Post("/watchlist", watchlistHandler.HandleAddToWatchlist)
			r.Delete("/watchlist", watchlistHandler.HandleRemoveFromWatchlist)
		})
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
