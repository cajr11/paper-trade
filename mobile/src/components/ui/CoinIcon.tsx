import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Maps known crypto base assets to their brand colors and display symbols.
 * Falls back to a hash-based color with the first letter of the asset name.
 */
const COIN_CONFIG: Record<string, { color: string; symbol: string; label: string }> = {
  BTC: { color: "#F7931A", symbol: "B", label: "Bitcoin" },
  ETH: { color: "#627EEA", symbol: "E", label: "Ethereum" },
  SOL: { color: "#00D18C", symbol: "S", label: "Solana" },
  BNB: { color: "#F3BA2F", symbol: "B", label: "BNB" },
  XRP: { color: "#23292F", symbol: "X", label: "XRP" },
  ADA: { color: "#0033AD", symbol: "A", label: "Cardano" },
  DOGE: { color: "#C2A633", symbol: "D", label: "Dogecoin" },
  DOT: { color: "#E6007A", symbol: "D", label: "Polkadot" },
  AVAX: { color: "#E84142", symbol: "A", label: "Avalanche" },
  MATIC: { color: "#8247E5", symbol: "M", label: "Polygon" },
  POL: { color: "#8247E5", symbol: "P", label: "Polygon" },
  LINK: { color: "#2A5ADA", symbol: "L", label: "Chainlink" },
  UNI: { color: "#FF007A", symbol: "U", label: "Uniswap" },
  ATOM: { color: "#2E3148", symbol: "A", label: "Cosmos" },
  LTC: { color: "#345D9D", symbol: "L", label: "Litecoin" },
  NEAR: { color: "#000000", symbol: "N", label: "NEAR" },
  TRX: { color: "#EF0027", symbol: "T", label: "TRON" },
  FIL: { color: "#0090FF", symbol: "F", label: "Filecoin" },
  APT: { color: "#000000", symbol: "A", label: "Aptos" },
  ARB: { color: "#28A0F0", symbol: "A", label: "Arbitrum" },
  OP: { color: "#FF0420", symbol: "O", label: "Optimism" },
  PEPE: { color: "#4C9141", symbol: "P", label: "Pepe" },
  SHIB: { color: "#FFA409", symbol: "S", label: "Shiba Inu" },
  SUI: { color: "#4DA2FF", symbol: "S", label: "Sui" },
  SEI: { color: "#9B1C2E", symbol: "S", label: "Sei" },
  INJ: { color: "#00F2FE", symbol: "I", label: "Injective" },
  AAVE: { color: "#B6509E", symbol: "A", label: "Aave" },
  CRV: { color: "#FF3A3A", symbol: "C", label: "Curve" },
  ALGO: { color: "#000000", symbol: "A", label: "Algorand" },
  FTM: { color: "#1969FF", symbol: "F", label: "Fantom" },
  SAND: { color: "#04ADEF", symbol: "S", label: "The Sandbox" },
  MANA: { color: "#FF2D55", symbol: "M", label: "Decentraland" },
  AXS: { color: "#0055D5", symbol: "A", label: "Axie Infinity" },
  GALA: { color: "#000000", symbol: "G", label: "Gala" },
  RENDER: { color: "#000000", symbol: "R", label: "Render" },
  FET: { color: "#1B1464", symbol: "F", label: "Fetch.ai" },
  RUNE: { color: "#33FF99", symbol: "R", label: "THORChain" },
  BONK: { color: "#F8A422", symbol: "B", label: "Bonk" },
  WIF: { color: "#8B5E3C", symbol: "W", label: "dogwifhat" },
  JUP: { color: "#00BFA5", symbol: "J", label: "Jupiter" },
  WLD: { color: "#000000", symbol: "W", label: "Worldcoin" },
  FLOKI: { color: "#D4A843", symbol: "F", label: "Floki" },
  NOT: { color: "#000000", symbol: "N", label: "Notcoin" },
  TON: { color: "#0098EA", symbol: "T", label: "Toncoin" },
  TIA: { color: "#7B2FBE", symbol: "T", label: "Celestia" },
  PYTH: { color: "#6540C7", symbol: "P", label: "Pyth" },
  JTO: { color: "#14F195", symbol: "J", label: "Jito" },
  W: { color: "#FFFFFF", symbol: "W", label: "Wormhole" },
  STRK: { color: "#EC796B", symbol: "S", label: "Starknet" },
  ENA: { color: "#7C5CFC", symbol: "E", label: "Ethena" },
  EIGEN: { color: "#1A0E3E", symbol: "E", label: "EigenLayer" },
  PENDLE: { color: "#1C9CEA", symbol: "P", label: "Pendle" },
};

/**
 * Generate a deterministic color from a string (for unknown coins).
 */
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}

type CoinIconProps = {
  symbol: string; // e.g. "BTC", "ETH"
  size?: number;
};

export default function CoinIcon({ symbol, size = 40 }: CoinIconProps) {
  const config = COIN_CONFIG[symbol.toUpperCase()];
  const bgColor = config?.color ?? hashColor(symbol);
  const letter = config?.symbol ?? symbol.charAt(0).toUpperCase();
  const fontSize = size * 0.42;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.letter,
          {
            fontSize,
            lineHeight: fontSize * 1.2,
          },
        ]}
      >
        {letter}
      </Text>
    </View>
  );
}

/**
 * Get the full display name for a known crypto asset, or return the symbol itself.
 */
export function getCoinName(baseAsset: string): string {
  return COIN_CONFIG[baseAsset.toUpperCase()]?.label ?? baseAsset;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  letter: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});
