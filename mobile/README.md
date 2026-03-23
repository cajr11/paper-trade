# PaperTrade Mobile

React Native mobile app for the PaperTrade cryptocurrency trading simulator. Built with Expo SDK 55, TypeScript, and Expo Router.

## Architecture

The app uses Expo Router for file-based routing with a nested layout structure. Authentication state is managed through a React context provider backed by secure storage. All server state is managed with Zustand stores that call a typed API client.

### Route Structure

```
app/
  _layout.tsx                     Root layout (Slot) -- loads fonts, providers
  index.tsx                       Entry redirect (checks auth state)
  login.tsx                       Login screen
  signup.tsx                      Signup screen
  (authenticated)/
    _layout.tsx                   Stack navigator (wraps tabs + modal screens)
    (tabs)/
      _layout.tsx                 Bottom tab bar (NativeTabs)
      index.tsx                   Portfolio -- balance, holdings summary
      explore.tsx                 Explore -- search and browse all tickers
      watchlist.tsx               Watchlist -- saved tickers with live prices
      history.tsx                 History -- paginated trade history
      profile.tsx                 Profile -- account settings menu
    trade.tsx                     Trade execution screen (buy/sell)
    holdings.tsx                  Detailed holdings view
    notifications.tsx             Notification list
    edit-profile.tsx              Edit name, email, username, phone
    security.tsx                  Change password
    notification-settings.tsx     Notification preferences
    help-support.tsx              Help and support page
    faq.tsx                       Frequently asked questions
```

Unauthenticated users see the login/signup screens. After authentication, the root layout redirects into the `(authenticated)` group which renders a Stack wrapping the tab navigator. Screens like trade, holdings, and profile sub-pages push onto the Stack on top of the tabs.

### Component Organization

```
components/
  ui/                   Primitives (smallest building blocks)
    CoinIcon.tsx          Crypto icon with fallback colored circle
    Collapsible.tsx       Expandable/collapsible container
    CustomButton.tsx      Styled button variants
    ErrorState.tsx        Error display with retry action
    ExternalLink.tsx      Opens URLs in browser
    PriceChart.tsx        SVG price chart component
    Skeleton.tsx          Loading skeleton placeholder
    ThemedText.tsx        Text with theme-aware styling and font variants
    ThemedTextInput.tsx   Text input with theme styling
    ThemedView.tsx        View with theme background
  composed/             Built from primitives
    AnimatedIcon.tsx      Animated icon for tab bar
    FormField.tsx         Label + input + error message
    HintRow.tsx           Hint text with icon
    LogoImage.tsx         App logo with variants
  navigation/
    AppTabs.tsx           Tab bar configuration
  screens/
    LoadingScreen.tsx     Full-screen loading indicator
```

### State Management

Zustand stores in `src/stores/` manage server-synced state:

| Store                | Responsibilities                               |
| -------------------- | ---------------------------------------------- |
| `portfolio-store`    | Holdings, balance, portfolio fetching          |
| `trade-store`        | Trade execution, trade history with pagination |
| `watchlist-store`    | Watchlist items, add/remove                    |
| `user-store`         | User profile, update profile, change password  |
| `notification-store` | Notifications, mark read, unread count         |

### API Client

`src/lib/api.ts` provides a typed fetch wrapper with automatic JWT injection for authenticated requests. In development mode it connects to `http://localhost:8080/api/v1`.

`src/lib/secure-store.ts` wraps Expo SecureStore for persisting the JWT session token.

### Theming

The app uses a custom theme system defined in `src/constants/theme.ts` with the Outfit font family (weights 200-900). Colors and spacing are accessed through the `useTheme` hook. The app respects the device color scheme setting (`userInterfaceStyle: "automatic"`).

## Setup

### Prerequisites

- Node.js (LTS)
- pnpm
- Xcode (for iOS) or Android Studio (for Android)
- The backend running on `localhost:8080` (see [backend README](../backend/README.md))

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Generate native projects:

```bash
npx expo prebuild
```

3. Run on iOS simulator:

```bash
npx expo run:ios
```

Or on Android emulator:

```bash
npx expo run:android
```
