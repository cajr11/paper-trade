# PaperTrade

A simulated cryptocurrency trading application that lets users practice trading with real-time market prices and a virtual cash balance. Built as a full-stack portfolio project with a Go backend and React Native mobile frontend.

## Tech Stack

- **Backend**: Go, Chi router, PostgreSQL, JWT authentication, Binance API for live market data
- **Frontend**: React Native, Expo SDK 55, TypeScript, Zustand, Expo Router

## Repository Structure

```
paper-trade/
  backend/    Go REST API server (see backend/README.md)
  mobile/     React Native mobile app (see mobile/README.md)
```

## Getting Started

Each directory has its own README with detailed setup instructions:

- [Backend setup](./backend/README.md) -- Docker-based, no local Go installation required
- [Mobile setup](./mobile/README.md) -- Requires Node.js and Xcode or Android Studio
