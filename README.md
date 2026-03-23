# PaperTrade

A simulated cryptocurrency trading application for practicing trades with real-time market prices and a virtual cash balance. Users start with $10,000 in paper money and can buy and sell crypto assets quoted against USDT using live data from the Binance API.

Built as a full-stack portfolio project with a Go backend and React Native mobile frontend.

## Tech Stack

| Layer    | Technology                                                         |
|----------|--------------------------------------------------------------------|
| Backend  | Go 1.25, Chi router, PostgreSQL 16, JWT authentication, Binance API |
| Frontend | React Native 0.83, Expo SDK 55, TypeScript, Zustand, Expo Router   |
| Infra    | Docker Compose, Air (hot reload)                                   |

## Repository Structure

```
paper-trade/
  backend/   Go REST API server
  mobile/    React Native mobile app (Expo)
```

Each directory is self-contained with its own dependency files and README:

- [Backend README](./backend/README.md) -- Architecture, Docker setup, API reference, database schema
- [Mobile README](./mobile/README.md) -- Architecture, setup instructions, screen overview

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env   # configure database credentials
docker compose up      # starts Postgres + API server on port 8080
```

### Mobile

```bash
cd mobile
pnpm install
npx expo prebuild
npx expo run:ios       # or npx expo run:android
```

The mobile app connects to `http://localhost:8080/api/v1` in development mode.

## Features

- User registration and login with JWT authentication
- Live cryptocurrency prices from the Binance spot market API
- Buy and sell crypto with automatic balance and holdings management
- Portfolio dashboard with holdings overview
- Trade history with pagination
- Watchlist for tracking favorite assets
- In-app notifications for filled orders
- User profile management (name, email, username, phone, password)
- 24-hour ticker data with price change percentages

## License

This project is for educational and portfolio demonstration purposes.
