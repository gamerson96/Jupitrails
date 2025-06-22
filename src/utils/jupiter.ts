import { Token, JupiterQuote, ProcessedRoute } from "../types/jupiter";
import { getTokenByMint as getTokenByMintFromConstants } from "../constants/tokens";

export const toLamports = (amount: number, decimals: number): string => {
  return Math.floor(amount * Math.pow(10, decimals)).toString();
};

export const lamportsToReadable = (
  lamports: string,
  decimals: number
): string => {
  const amount = parseInt(lamports) / Math.pow(10, decimals);
  return amount.toFixed(decimals > 4 ? 4 : decimals);
};

export const getTokenByMint = (mint: string): Token | undefined => {
  return getTokenByMintFromConstants(mint);
};

export const getTokenSymbol = (mint: string): string => {
  const token = getTokenByMint(mint);
  return token?.symbol || mint.slice(0, 6);
};

export const processRoute = (
  quote: JupiterQuote,
  inputToken: Token,
  outputToken: Token
): ProcessedRoute => {
  return {
    hops: quote.routePlan.map((plan) => {
      const feeAmountRaw = parseInt(plan.swapInfo.feeAmount);
      const inAmountRaw = parseInt(plan.swapInfo.inAmount);
      const feePercent =
        feeAmountRaw > 0 && inAmountRaw > 0
          ? (feeAmountRaw / inAmountRaw) * 100
          : 0;

      return {
        from: getTokenSymbol(plan.swapInfo.inputMint),
        to: getTokenSymbol(plan.swapInfo.outputMint),
        amm: plan.swapInfo.label,
        feePercent: feePercent.toString(),
        feeAmount: lamportsToReadable(
          plan.swapInfo.feeAmount,
          getTokenByMint(plan.swapInfo.inputMint)?.decimals ||
            inputToken.decimals
        ),
        inAmount: lamportsToReadable(
          plan.swapInfo.inAmount,
          getTokenByMint(plan.swapInfo.inputMint)?.decimals ||
            inputToken.decimals
        ),
        outAmount: lamportsToReadable(
          plan.swapInfo.outAmount,
          getTokenByMint(plan.swapInfo.outputMint)?.decimals ||
            outputToken.decimals
        ),
        inputMint: plan.swapInfo.inputMint,
        outputMint: plan.swapInfo.outputMint,
      };
    }),
    priceImpact: quote.priceImpactPct,
    totalOut: lamportsToReadable(quote.outAmount, outputToken.decimals),
    quote,
  };
};

export const formatTransactionUrl = (signature: string): string => {
  return `https://solscan.io/tx/${signature}`;
};
