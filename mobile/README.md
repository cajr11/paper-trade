# PaperTrade Mobile

React Native mobile app built with Expo.

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Project Structure

```
src/
  app/
    _layout.tsx           # Root layout
    index.tsx             # Entry route
    login.tsx             # Login screen
    (authenticated)/      # Protected route group
      _layout.tsx         # Authenticated layout
      index.tsx           # Home screen

  components/
    ui/                   # Primitives (smallest building blocks)
    composed/             # Composed (built from primitives)
    navigation/           # Navigation
    screens/              # Screen-level components

  hooks/                  # Custom React hooks
  lib/                    # Utility libraries
  providers/              # React context providers
  constants/              # Theme, spacing, colors
  assets/                 # Images, fonts
```
