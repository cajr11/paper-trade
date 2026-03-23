# PaperTrade Backend

Go REST API server for the PaperTrade cryptocurrency trading simulator.

## Architecture

The backend follows a domain-driven structure where each domain owns its handler, service, and model layers. Shared persistence lives in the `store` package.

```
backend/
  cmd/
    api.go                  Application struct, router setup, route definitions
    app.go                  Entry point, config, database initialization
  internal/
    auth/
      auth.go               Request/response types (Session, SignupRequest, etc.)
      handler.go            HTTP handlers for signup, login, profile, password
      jwt.go                JWT token generation and validation
      repository.go         User persistence queries
      service.go            Auth business logic (create user, authenticate)
    context/
      context.go            Request context helpers (extract user ID from JWT)
    db/
      db.go                 Database connection pool setup
      migrate.go            Migration runner (applies SQL files in order)
      migrations/           Sequential SQL migration files (001-006)
    health/
      handler.go            Health check endpoint
    middleware/
      auth.go               JWT authentication middleware
      cors.go               CORS configuration
    notifications/
      handler.go            Notification list, mark-read, unread-count handlers
    store/
      storage.go            Storage aggregate (holds all store instances + DB ref)
      user.go               User CRUD and balance operations
      holding.go            Holdings upsert and queries
      trade.go              Trade record creation and history queries
      watchlist.go          Watchlist add, remove, list
      notification.go       Notification persistence
    tickers/
      tickers.go            Binance symbol types and USDT pair filtering
      service.go            Fetch all USDT trading pairs from Binance exchange info
      price_service.go      Price fetching with in-memory cache (30s TTL)
      handler.go            Handlers for tickers, price, prices, 24hr endpoints
    trading/
      handler.go            Execute trade, get portfolio, get trade history
      service.go            Trade execution with DB transactions, balance checks
    validator/
      validator.go          Struct validation using go-playground/validator
    watchlist/
      handler.go            Watchlist CRUD handlers
  compose.yml               Docker Compose for Postgres + backend services
  Dockerfile                Multi-stage build with Air hot reload
  .air.toml                 Air configuration for live rebuild on file changes
  .env.example              Template for required environment variables
```

## Dependencies

| Package                        | Purpose                        |
|--------------------------------|--------------------------------|
| go-chi/chi/v5                  | HTTP router and middleware     |
| go-playground/validator/v10    | Request struct validation      |
| golang-jwt/jwt/v5              | JWT token creation and parsing |
| lib/pq                         | PostgreSQL driver              |
| golang.org/x/crypto            | bcrypt password hashing        |

## Docker Setup

The backend runs entirely in Docker. No local Go installation is required.

### Prerequisites

- Docker and Docker Compose

### Steps

1. Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

The `.env` file requires these variables:

| Variable            | Description                          | Example                      |
|---------------------|--------------------------------------|------------------------------|
| `POSTGRES_USER`     | PostgreSQL username                  | `papertrader`                |
| `POSTGRES_PASSWORD` | PostgreSQL password                  | `secretpassword`             |
| `POSTGRES_DB`       | PostgreSQL database name             | `paper-trade-dev-db`         |
| `DB_HOST`           | Database host (set automatically)    | `db` (set by compose)        |

The compose file also accepts an optional `JWT_SECRET` variable. If not set, it defaults to `paper-trade-dev-secret`.

2. Start the services:

```bash
docker compose up
```

This starts two containers:

- **paper-trade-backend** -- Go API server on port 8080 with Air hot reload. Source files are bind-mounted so code changes rebuild automatically.
- **paper-trade-db** -- PostgreSQL 16 (Alpine) on port 5432 with a named volume (`paper-trade-db-data`) for data persistence across restarts.

The backend container waits for the database health check to pass before starting.

3. Stop the services:

```bash
docker compose down
```

Add `-v` to also remove the database volume and start fresh.

## Database Schema

Migrations run automatically on startup. They are applied in order from `internal/db/migrations/`.

### users

| Column        | Type                    | Notes                              |
|---------------|-------------------------|------------------------------------|
| id            | UUID (PK)               | Auto-generated                     |
| email         | TEXT (UNIQUE)           | Indexed                            |
| full_name     | TEXT                    |                                    |
| password_hash | TEXT                    | bcrypt hash                        |
| balance       | NUMERIC(15,2)           | Default: 10000.00                  |
| username      | TEXT                    | Optional, unique when set          |
| phone         | TEXT                    | Optional                           |
| created_at    | TIMESTAMPTZ             |                                    |
| updated_at    | TIMESTAMPTZ             |                                    |

### holdings

| Column        | Type                    | Notes                              |
|---------------|-------------------------|------------------------------------|
| id            | UUID (PK)               |                                    |
| user_id       | UUID (FK -> users)      | Indexed, CASCADE delete            |
| symbol        | TEXT                    | Trading pair (e.g., BTCUSDT)       |
| base_asset    | TEXT                    | Base currency (e.g., BTC)          |
| quantity      | NUMERIC(18,8)           |                                    |
| avg_buy_price | NUMERIC(18,8)           | Weighted average cost basis        |
| created_at    | TIMESTAMPTZ             |                                    |
| updated_at    | TIMESTAMPTZ             |                                    |

Unique constraint on (user_id, symbol).

### trades

| Column     | Type                    | Notes                              |
|------------|-------------------------|------------------------------------|
| id         | UUID (PK)               |                                    |
| user_id    | UUID (FK -> users)      | Indexed, CASCADE delete            |
| symbol     | TEXT                    |                                    |
| base_asset | TEXT                    |                                    |
| side       | TEXT                    | CHECK: 'buy' or 'sell'            |
| quantity   | NUMERIC(18,8)           |                                    |
| price      | NUMERIC(18,8)           |                                    |
| total      | NUMERIC(18,8)           | quantity * price                   |
| created_at | TIMESTAMPTZ             | Indexed DESC                       |

### watchlist

| Column     | Type                    | Notes                              |
|------------|-------------------------|------------------------------------|
| id         | UUID (PK)               |                                    |
| user_id    | UUID (FK -> users)      | Indexed, CASCADE delete            |
| symbol     | TEXT                    |                                    |
| base_asset | TEXT                    |                                    |
| created_at | TIMESTAMPTZ             |                                    |

Unique constraint on (user_id, symbol).

### notifications

| Column     | Type                    | Notes                              |
|------------|-------------------------|------------------------------------|
| id         | UUID (PK)               |                                    |
| user_id    | UUID (FK -> users)      | Indexed, CASCADE delete            |
| type       | TEXT                    | CHECK: order_filled, price_alert, new_listing, system |
| title      | TEXT                    |                                    |
| body       | TEXT                    |                                    |
| read       | BOOLEAN                 | Default: false                     |
| created_at | TIMESTAMPTZ             | Indexed DESC                       |

Composite index on (user_id, read) for unread count queries.

## API Reference

Base URL: `http://localhost:8080/api/v1`

All protected endpoints require an `Authorization: Bearer <token>` header. Tokens are returned from the signup and login endpoints.

### Public Endpoints

#### Health Check

```
GET /health
```

Returns `200 OK` with no body.

#### Authentication

```
POST /auth/signup
```

Request body:

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "minimum8chars"
}
```

Response `201 Created`:

```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "full_name": "Jane Doe",
    "username": null,
    "phone": null,
    "balance": 10000.00
  }
}
```

```
POST /auth/login
```

Request body:

```json
{
  "email": "jane@example.com",
  "password": "minimum8chars"
}
```

Response `200 OK`: same shape as signup.

#### Tickers (Market Data)

```
GET /tickers
```

Returns all Binance USDT spot trading pairs with icon URLs. No authentication required.

```
GET /tickers/price?symbol=BTCUSDT
```

Returns the current price for a single symbol.

Response:

```json
{
  "symbol": "BTCUSDT",
  "price": 67542.31
}
```

```
GET /tickers/prices?symbols=BTCUSDT,ETHUSDT
```

Returns prices for multiple symbols as a map.

Response:

```json
{
  "BTCUSDT": 67542.31,
  "ETHUSDT": 3421.05
}
```

```
GET /tickers/24hr
```

Returns 24-hour ticker data for all USDT pairs as a map keyed by symbol.

Response:

```json
{
  "BTCUSDT": {
    "symbol": "BTCUSDT",
    "priceChangePercent": 2.34,
    "lastPrice": 67542.31,
    "volume": 12345.67
  }
}
```

### Protected Endpoints

All endpoints below require `Authorization: Bearer <token>`.

#### User Profile

```
GET /me
```

Returns the authenticated user's profile.

```
PATCH /me
```

Update profile fields.

Request body:

```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "username": "janesmith",
  "phone": "+1234567890"
}
```

`full_name` and `email` are required. `username` and `phone` are optional.

```
PATCH /me/password
```

Change password.

Request body:

```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword8"
}
```

#### Portfolio

```
GET /portfolio
```

Returns the user's cash balance and all holdings.

Response:

```json
{
  "balance": 9500.00,
  "holdings": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "symbol": "BTCUSDT",
      "base_asset": "BTC",
      "quantity": 0.01,
      "avg_buy_price": 50000.00,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Trading

```
POST /trades
```

Execute a buy or sell trade. Runs in a database transaction: updates balance, upserts holding, records trade, and creates a notification.

Request body:

```json
{
  "symbol": "BTCUSDT",
  "base_asset": "BTC",
  "side": "buy",
  "quantity": 0.01,
  "price": 67000.00
}
```

`side` must be `buy` or `sell`. Returns `201 Created` with the trade record.

Error responses: `400` for insufficient funds, insufficient holdings, or invalid quantity.

```
GET /trades?limit=50&offset=0
```

Returns paginated trade history. `limit` defaults to 50 (max 100). `offset` defaults to 0.

#### Watchlist

```
GET /watchlist
```

Returns the user's watchlist items.

```
POST /watchlist
```

Add a symbol to the watchlist.

Request body:

```json
{
  "symbol": "ETHUSDT",
  "base_asset": "ETH"
}
```

```
DELETE /watchlist?symbol=ETHUSDT
```

Remove a symbol from the watchlist. The symbol is passed as a query parameter.

#### Notifications

```
GET /notifications?limit=50&offset=0
```

Returns paginated notifications. Same pagination defaults as trades.

```
PATCH /notifications/{id}/read
```

Mark a single notification as read.

```
GET /notifications/unread-count
```

Response:

```json
{
  "count": 3
}
```
