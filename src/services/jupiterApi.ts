import axios from "axios";
import { JupiterQuote, SwapResponse } from "../types/jupiter";

const JUPITER_API_BASE =
  import.meta.env.VITE_JUPITER_API_BASE || "https://lite-api.jup.ag/";

// Price fetching function
export const fetchTokenPrice = async (tokenMint: string): Promise<number> => {
  try {
    const response = await axios.get(
      `${JUPITER_API_BASE}price/v2?ids=${tokenMint}`
    );
    const priceData = response.data?.data?.[tokenMint];
    return priceData?.price || 0;
  } catch (error) {
    console.warn(`Failed to fetch price for token ${tokenMint}:`, error);
    return 0;
  }
};

// Batch price fetching for multiple tokens
export const fetchTokenPrices = async (
  tokenMints: string[]
): Promise<Record<string, number>> => {
  try {
    const ids = tokenMints.join(",");
    const response = await axios.get(`${JUPITER_API_BASE}price/v2?ids=${ids}`);
    const prices: Record<string, number> = {};

    for (const mint of tokenMints) {
      const priceData = response.data?.data?.[mint];
      prices[mint] = priceData?.price || 0;
    }

    return prices;
  } catch (error) {
    console.warn("Failed to fetch token prices:", error);
    return {};
  }
};

export const fetchQuote = async (
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: number = 50
): Promise<JupiterQuote> => {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    slippageBps: slippageBps.toString(),
    restrictIntermediateTokens: "true",
  });

  const response = await axios.get(
    `${JUPITER_API_BASE}swap/v1/quote?${params}`
  );

  if (!response.data) {
    throw new Error("No quote data received");
  }

  return response.data;
};

export const buildSwapTransaction = async (
  quoteResponse: JupiterQuote,
  userPublicKey: string,
  options: {
    dynamicComputeUnitLimit?: boolean;
    dynamicSlippage?: boolean;
    prioritizationFeeLamports?: {
      priorityLevelWithMaxLamports?: {
        maxLamports: number;
        priorityLevel: "medium" | "high" | "veryHigh";
      };
      jitoTipLamports?: number;
    };
  } = {}
): Promise<SwapResponse> => {
  const response = await axios.post(
    `${JUPITER_API_BASE}swap/v1/swap`,
    {
      quoteResponse,
      userPublicKey,
      dynamicComputeUnitLimit: options.dynamicComputeUnitLimit || true,
      dynamicSlippage: options.dynamicSlippage || true,
      prioritizationFeeLamports: options.prioritizationFeeLamports || {
        priorityLevelWithMaxLamports: {
          maxLamports: 1000000,
          priorityLevel: "veryHigh",
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.data) {
    throw new Error("No swap transaction data received");
  }

  return response.data;
};
