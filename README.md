# PaperTrade

A simulated cryptocurrency trading application for practicing trades with real-time market prices and a virtual cash balance. Users start with $10,000 in paper money and can buy and sell crypto assets quoted against USDT using live data from the Binance API.

Built as a full-stack portfolio project with a Go backend and React Native mobile frontend.

## Tech Stack

| Layer    | Technology                                                          |
| -------- | ------------------------------------------------------------------- |
| Backend  | Go 1.25, Chi router, PostgreSQL 16, JWT authentication, Binance API |
| Frontend | React Native 0.83, Expo SDK 55, TypeScript, Zustand, Expo Router    |
| Infra    | Docker Compose, Air (hot reload)                                    |

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

## Screens

<table>
  <tr>
    <th align="center" width="16%">Splash</th>
    <th align="center" width="16%">Login</th>
    <th align="center" width="16%">Sign Up</th>
    <th align="center" width="16%">Portfolio</th>
    <th align="center" width="16%">Explore</th>
    <th align="center" width="16%">Coin Detail</th>
  </tr>
  <tr>
    <td align="center"><img width="240" alt="splash" src="https://github.com/user-attachments/assets/f309a848-967d-486d-9ccd-c670972ac127" /></td>
    <td align="center"><img width="240" alt="login" src="https://github.com/user-attachments/assets/0d31d36c-d1a8-48f6-bafd-289b127bfcb7" /></td>
    <td align="center"><img width="240" alt="signup" src="https://github.com/user-attachments/assets/4ddd1b4e-0287-473a-9095-a844e09b5c23" /></td>
    <td align="center"><img width="240" alt="portfolio" src="https://github.com/user-attachments/assets/e3c25657-3862-45c7-baec-83b989a966c0" /></td>
    <td align="center"><img width="240" alt="explore" src="https://github.com/user-attachments/assets/f90832c6-e1ee-4d4e-abae-68e9d6b921ce" /></td>
    <td align="center"><img width="240" alt="detail" src="https://github.com/user-attachments/assets/c53ed609-f004-440d-af72-93574c625091" /></td>
  </tr>
  <tr>
    <th align="center">Watchlist</th>
    <th align="center">History</th>
    <th align="center">Profile</th>
    <th align="center">Notifications</th>
    <th align="center">Help & Support</th>
    <th align="center">FAQ</th>
  </tr>
  <tr>
    <td align="center"><img width="240" alt="watchlist" src="https://github.com/user-attachments/assets/afd44a2f-6dcb-4980-a8c1-cb97963a8a43" /></td>
    <td align="center"><img width="240" alt="history" src="https://github.com/user-attachments/assets/2699b13f-2c37-414c-a7cd-97c22bbc72d5" /></td>
    <td align="center"><img width="240" alt="profile" src="https://github.com/user-attachments/assets/202812c1-5ff1-41d6-9921-0cbaf13cc9c2" /></td>
    <td align="center"><img width="240" alt="notifications" src="https://github.com/user-attachments/assets/1d7d20c6-1306-4098-a2a8-e300b941512f" /></td>
    <td align="center"><img width="240" alt="help-support" src="https://github.com/user-attachments/assets/301512e8-b8b1-485f-a124-40b6c8b11cd2" /></td>
    <td align="center"><img width="240" alt="faq" src="https://github.com/user-attachments/assets/f546dc79-412f-48eb-b6bf-cde9516933de" /></td>
  </tr>
</table>


## Walkthrough


https://github.com/user-attachments/assets/5c1f13da-1e24-46a0-8860-01d8ad965599


## License

This project is for educational and portfolio demonstration purposes.
