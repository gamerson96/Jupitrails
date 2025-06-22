import { Token } from "../types/jupiter";

// Fallback tokens in case API fails
export const FALLBACK_TOKENS: Record<string, Token> = {
  SOL: {
    name: "Solana",
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logo: "🟣",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logo: "💵",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    logo: "💰",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
  },
  JUP: {
    name: "Jupiter",
    symbol: "JUP",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    logo: "🪐",
    logoURI: "https://static.jup.ag/jup/icon.png",
  },
  RAY: {
    name: "Raydium",
    symbol: "RAY",
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    decimals: 6,
    logo: "⚡",
  },
  BONK: {
    name: "Bonk",
    symbol: "BONK",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logo: "🐕",
  },
};

// Default tokens (will be replaced with API data)
export let TOKENS = FALLBACK_TOKENS;
export let TOKEN_LIST = Object.values(FALLBACK_TOKENS);

export const updateTokens = (newTokens: Record<string, Token>) => {
  TOKENS = newTokens;
  TOKEN_LIST = Object.values(newTokens);
};

export const getTokenByMint = (mint: string): Token | undefined => {
  return Object.values(TOKENS).find((token) => token.mint === mint);
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return Object.values(TOKENS).find((token) => token.symbol === symbol);
};
