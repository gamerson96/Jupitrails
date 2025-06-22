import axios from "axios";
import { JupiterTokenResponse, Token } from "../types/jupiter";

const JUPITER_API_BASE =
  import.meta.env.VITE_JUPITER_API_BASE || "https://lite-api.jup.ag/";

export const fetchTokenInfo = async (
  mint: string
): Promise<JupiterTokenResponse> => {
  const response = await axios.get(
    `${JUPITER_API_BASE}tokens/v1/token/${mint}`
  );

  if (!response.data) {
    throw new Error("No token data received");
  }

  return response.data;
};

export const fetchVerifiedTokens = async (): Promise<
  JupiterTokenResponse[]
> => {
  const response = await axios.get(
    `${JUPITER_API_BASE}tokens/v1/tagged/verified`
  );

  if (!response.data) {
    throw new Error("No token data received");
  }

  return response.data;
};

export const fetchTradableTokens = async (): Promise<string[]> => {
  const response = await axios.get(
    `${JUPITER_API_BASE}tokens/v1/mints/tradable`
  );

  if (!response.data) {
    throw new Error("No token data received");
  }

  return response.data;
};

export const fetchPopularTokens = async (
  limit: number = 50
): Promise<JupiterTokenResponse[]> => {
  try {
    // Fetch verified tokens and sort by daily volume
    const verifiedTokens = await fetchVerifiedTokens();

    // Sort by daily volume (descending) and take the top tokens
    const popularTokens = verifiedTokens
      .sort((a, b) => (b.daily_volume || 0) - (a.daily_volume || 0))
      .slice(0, limit);

    return popularTokens;
  } catch (error) {
    console.error("Failed to fetch popular tokens:", error);
    throw error;
  }
};

export const convertJupiterTokenToToken = (
  jupiterToken: JupiterTokenResponse
): Token => {
  return {
    name: jupiterToken.name,
    symbol: jupiterToken.symbol,
    mint: jupiterToken.address,
    decimals: jupiterToken.decimals,
    logo: getTokenEmoji(jupiterToken.symbol),
    logoURI: jupiterToken.logoURI,
    tags: jupiterToken.tags,
    daily_volume: jupiterToken.daily_volume,
    created_at: jupiterToken.created_at,
    freeze_authority: jupiterToken.freeze_authority,
    mint_authority: jupiterToken.mint_authority,
    permanent_delegate: jupiterToken.permanent_delegate,
    minted_at: jupiterToken.minted_at,
    extensions: jupiterToken.extensions,
  };
};

const getTokenEmoji = (symbol: string): string => {
  const emojiMap: Record<string, string> = {
    SOL: "🟣",
    USDC: "💵",
    USDT: "💰",
    JUP: "🪐",
    RAY: "⚡",
    BONK: "🐕",
    JupSOL: "🟣",
    mSOL: "🔥",
    bSOL: "🌊",
    jitoSOL: "⚡",
    WIF: "🧢",
    POPCAT: "🐱",
    MEW: "🐱",
    BOME: "📚",
    PNUT: "🥜",
  };

  return emojiMap[symbol] || "🪙";
};

export const searchTokens = async (
  query: string,
  tokens: JupiterTokenResponse[]
): Promise<JupiterTokenResponse[]> => {
  const lowerQuery = query.toLowerCase();

  return tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(lowerQuery) ||
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.address.toLowerCase().includes(lowerQuery)
  );
};

export const fetchAllTokens = async (): Promise<JupiterTokenResponse[]> => {
  try {
    // Fetch all available tokens (not limited to verified)
    const response = await axios.get(`${JUPITER_API_BASE}tokens/v1/all`);

    if (!response.data) {
      throw new Error("No token data received");
    }

    return response.data;
  } catch (error) {
    console.error("Failed to fetch all tokens:", error);
    throw error;
  }
};

export const searchTokensWithFallback = async (
  query: string,
  cachedTokens: JupiterTokenResponse[]
): Promise<JupiterTokenResponse[]> => {
  const lowerQuery = query.toLowerCase();

  // First, search in cached tokens
  const localResults = cachedTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(lowerQuery) ||
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.address.toLowerCase().includes(lowerQuery)
  );

  // If we have local results or query is too short, return local results
  if (localResults.length > 0 || query.length < 3) {
    return localResults;
  }

  // If no local results and query is long enough, search all tokens
  try {
    console.log(`Searching all tokens for: ${query}`);
    const allTokens = await fetchAllTokens();

    const searchResults = allTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(lowerQuery) ||
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.address.toLowerCase().includes(lowerQuery)
    );

    return searchResults;
  } catch (error) {
    console.error(
      "Failed to search all tokens, falling back to cached results:",
      error
    );
    return localResults;
  }
};

export const fetchTokenByAddress = async (
  address: string
): Promise<JupiterTokenResponse | null> => {
  try {
    const response = await axios.get(
      `${JUPITER_API_BASE}tokens/v1/token/${address}`
    );
    return response.data || null;
  } catch (error) {
    console.error(`Failed to fetch token ${address}:`, error);
    return null;
  }
};
