import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, ExternalLink, CheckCircle, Wallet } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ControlPanel } from "./ControlPanel";
import { RouteDiagram } from "./RouteDiagram";
import { Token, ProcessedRoute } from "../types/jupiter";
import { TOKENS, FALLBACK_TOKENS, updateTokens } from "../constants/tokens";
import { fetchQuote, buildSwapTransaction } from "../services/jupiterApi";
import { processRoute, toLamports } from "../utils/jupiter";
import {
  fetchPopularTokens,
  convertJupiterTokenToToken,
} from "../services/tokenApi";
import {
  executeSwapTransaction,
  confirmTransaction,
  getTransactionUrl,
  TransactionStatus,
} from "../utils/transaction";

export const JupiterVisualizer: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [inputToken, setInputToken] = useState<Token>(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState<Token>(TOKENS.USDC);
  const [amount, setAmount] = useState<number>(1);
  const [outputAmount, setOutputAmount] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(50); // 0.5%
  const [routeData, setRouteData] = useState<ProcessedRoute | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [availableTokens, setAvailableTokens] = useState<Token[]>(
    Object.values(TOKENS)
  );
  const [tokensLoading, setTokensLoading] = useState<boolean>(true);
  const [lastInputSource, setLastInputSource] = useState<"input" | "output">(
    "input"
  );
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Debounced quote function for dynamic price calculation
  const getQuoteForAmount = useCallback(
    async (
      fromToken: Token,
      toToken: Token,
      amount: number,
      isFromInput: boolean = true
    ) => {
      if (amount <= 0) {
        if (isFromInput) {
          setOutputAmount(0);
        } else {
          setAmount(0);
        }
        return;
      }

      try {
        const amountInLamports = toLamports(amount, fromToken.decimals);
        // Use a fixed slippage for price calculations, not the user's slippage setting
        const quote = await fetchQuote(
          fromToken.mint,
          toToken.mint,
          amountInLamports,
          50 // Fixed 0.5% slippage for price calculations
        );

        const outputTokenDecimals = toToken.decimals;
        const outputAmountValue =
          parseInt(quote.outAmount) / Math.pow(10, outputTokenDecimals);

        if (isFromInput) {
          setOutputAmount(outputAmountValue);
        } else {
          setAmount(outputAmountValue);
        }
      } catch (err) {
        console.error("Failed to get quote for price calculation:", err);
        // Don't show error for automatic price calculations
      }
    },
    [] // Remove slippage dependency - use fixed slippage for price calculations
  );

  // Debounced effect for input amount changes
  useEffect(() => {
    if (lastInputSource !== "input") return;

    const timeoutId = setTimeout(() => {
      getQuoteForAmount(inputToken, outputToken, amount, true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    amount,
    inputToken.mint,
    outputToken.mint,
    getQuoteForAmount,
    lastInputSource,
  ]);

  // Debounced effect for output amount changes
  useEffect(() => {
    if (lastInputSource !== "output") return;

    const timeoutId = setTimeout(() => {
      getQuoteForAmount(outputToken, inputToken, outputAmount, false);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    outputAmount,
    inputToken.mint,
    outputToken.mint,
    getQuoteForAmount,
    lastInputSource,
  ]);

  // Handle amount changes with source tracking
  const handleAmountChange = useCallback((newAmount: number) => {
    setLastInputSource("input");
    setAmount(newAmount);
  }, []);

  const handleOutputAmountChange = useCallback((newAmount: number) => {
    setLastInputSource("output");
    setOutputAmount(newAmount);
  }, []);

  // Load tokens from Jupiter API on component mount
  useEffect(() => {
    const loadTokens = async () => {
      setTokensLoading(true);
      try {
        // Fetch popular tokens (top 100 by volume)
        const jupiterTokens = await fetchPopularTokens(100);

        // Convert to our Token format
        const tokens = jupiterTokens.map(convertJupiterTokenToToken);

        // Create tokens map with symbol as key
        const tokensMap: Record<string, Token> = {};
        tokens.forEach((token) => {
          tokensMap[token.symbol] = token;
        });

        // Update global tokens
        updateTokens(tokensMap);
        setAvailableTokens(tokens);

        // Update selected tokens if they exist in the new list
        const newInputToken =
          tokens.find((t) => t.mint === inputToken.mint) || inputToken;
        const newOutputToken =
          tokens.find((t) => t.mint === outputToken.mint) || outputToken;

        setInputToken(newInputToken);
        setOutputToken(newOutputToken);

        console.log(`Loaded ${tokens.length} tokens from Jupiter API`);
      } catch (err) {
        console.error("Failed to load tokens from API, using fallback:", err);
        // Use fallback tokens if API fails
        setAvailableTokens(Object.values(FALLBACK_TOKENS));
      } finally {
        setTokensLoading(false);
      }
    };

    loadTokens();
  }, []);

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (wallet.connected && wallet.publicKey) {
        try {
          console.log("Fetching balance for:", wallet.publicKey.toString());
          const balance = await connection.getBalance(wallet.publicKey);
          console.log("Raw balance (lamports):", balance);
          const solBalance = balance / LAMPORTS_PER_SOL;
          console.log("SOL balance:", solBalance);
          setWalletBalance(solBalance);
        } catch (error) {
          console.error("Failed to fetch wallet balance:", error);
          setWalletBalance(0);
        }
      } else {
        setWalletBalance(0);
      }
    };

    fetchWalletBalance();

    // Also set up an interval to refresh balance every 10 seconds
    let intervalId: NodeJS.Timeout | null = null;
    if (wallet.connected && wallet.publicKey) {
      intervalId = setInterval(fetchWalletBalance, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [wallet.connected, wallet.publicKey, connection]);

  const handleGetRoute = async () => {
    if (amount <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const amountInLamports = toLamports(amount, inputToken.decimals);
      const quote = await fetchQuote(
        inputToken.mint,
        outputToken.mint,
        amountInLamports,
        slippage
      );

      const processed = processRoute(quote, inputToken, outputToken);
      setRouteData(processed);
    } catch (err) {
      console.error("Failed to fetch route:", err);
      setError("Failed to fetch route. Please try again.");
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!wallet.connected || !wallet.publicKey || !routeData) {
      setError("Wallet not connected or no route available");
      return;
    }

    setIsSwapping(true);
    setError(null);
    setTransactionStatus({ status: "pending" });

    try {
      // Build swap transaction
      const swapResponse = await buildSwapTransaction(
        routeData.quote,
        wallet.publicKey.toString(),
        {
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: {
            priorityLevelWithMaxLamports: {
              maxLamports: 1000000,
              priorityLevel: "veryHigh",
            },
          },
        }
      );

      // Execute the transaction
      const txStatus = await executeSwapTransaction(
        connection,
        wallet,
        swapResponse.swapTransaction
      );

      if (txStatus.status === "failed") {
        setError(txStatus.error || "Transaction failed");
        setTransactionStatus(txStatus);
        return;
      }

      setTransactionStatus(txStatus);

      // Confirm the transaction
      if (txStatus.signature) {
        setTransactionStatus({ ...txStatus, status: "confirming" });

        const confirmation = await confirmTransaction(
          connection,
          txStatus.signature
        );
        setTransactionStatus(confirmation);

        if (confirmation.status === "confirmed") {
          // Clear route data after successful swap
          setRouteData(null);
        }
      }
    } catch (err) {
      console.error("Swap execution failed:", err);
      setError("Swap execution failed. Please try again.");
      setTransactionStatus({
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);

    // Swap the amounts as well
    const tempAmount = amount;
    setAmount(outputAmount);
    setOutputAmount(tempAmount);

    setTransactionStatus(null); // Clear transaction status
    setLastInputSource("input"); // Reset to input as source
  };

  // Handle token changes with automatic route fetching
  const handleInputTokenChange = useCallback((token: Token) => {
    setInputToken(token);
    setTransactionStatus(null); // Clear transaction status
    setError(null); // Clear any errors
  }, []);

  const handleOutputTokenChange = useCallback((token: Token) => {
    setOutputToken(token);
    setTransactionStatus(null); // Clear transaction status
    setError(null); // Clear any errors
  }, []);

  // Auto-fetch route when tokens or amount change
  useEffect(() => {
    if (
      amount > 0 &&
      inputToken &&
      outputToken &&
      inputToken.mint !== outputToken.mint
    ) {
      // Debounce the route fetching to avoid too many API calls
      const timeoutId = setTimeout(() => {
        handleGetRoute();
      }, 1000); // 1 second debounce for route fetching

      return () => clearTimeout(timeoutId);
    } else {
      // Clear route if amount is 0 or tokens are invalid
      setRouteData(null);
    }
  }, [amount, inputToken.mint, outputToken.mint]);

  return (
    <div className="flex flex-col bg-gradient-to-br from-jupiter-dark via-jupiter-darkSecondary to-jupiter-dark min-h-screen">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="mx-auto px-4 py-4 max-w-full container">
          {/* Header with Logo and Wallet */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="flex justify-center items-center w-8 h-8">
                <img
                  src="/assets/logo.svg"
                  alt="JupiTrails Logo"
                  className="w-8 h-8"
                />
              </div>
              <h1 className="bg-clip-text bg-gradient-to-r from-jupiter-primary to-jupiter-secondary font-space font-bold text-transparent text-xl">
                JupiTrails
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {wallet.connected && (
                <div className="flex items-center gap-2 bg-jupiter-darkSecondary/50 px-3 py-2 border border-jupiter-purple-600/30 rounded-lg">
                  <Wallet className="w-4 h-4 text-jupiter-secondary" />
                  <span className="font-mono text-white text-sm">
                    {walletBalance.toFixed(4)} SOL
                  </span>
                </div>
              )}
              <WalletMultiButton>
                {wallet.connected ? "Connected" : "Connect Wallet"}
              </WalletMultiButton>
            </div>
          </div>

          {/* Subtitle and Token Status */}
          <div className="mb-6 text-center">
            <p className="mx-auto mb-3 max-w-2xl text-gray-400 text-sm">
              Visualize and analyze optimal swap routes on Solana using
              Jupiter's aggregation technology
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/20 mb-4 p-4 border border-red-500/50 rounded-lg">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
              <span className="text-red-200 break-words">{error}</span>
            </div>
          )}

          {/* Transaction Status */}
          {transactionStatus && (
            <div
              className={`mb-4 p-4 rounded-lg border flex items-center gap-3 ${
                transactionStatus.status === "confirmed"
                  ? "bg-green-500/20 border-green-500/50"
                  : transactionStatus.status === "failed"
                  ? "bg-red-500/20 border-red-500/50"
                  : "bg-blue-500/20 border-blue-500/50"
              }`}
            >
              <div className="flex flex-1 items-center gap-3 min-w-0">
                {transactionStatus.status === "confirmed" && (
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400" />
                )}
                {transactionStatus.status === "failed" && (
                  <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
                )}
                {(transactionStatus.status === "pending" ||
                  transactionStatus.status === "confirming") && (
                  <div className="flex-shrink-0 border-2 border-t-transparent border-blue-400 rounded-full w-5 h-5 animate-spin" />
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-medium ${
                      transactionStatus.status === "confirmed"
                        ? "text-green-200"
                        : transactionStatus.status === "failed"
                        ? "text-red-200"
                        : "text-blue-200"
                    }`}
                  >
                    {transactionStatus.status === "pending" &&
                      "Transaction Submitted"}
                    {transactionStatus.status === "confirming" &&
                      "Confirming Transaction..."}
                    {transactionStatus.status === "confirmed" &&
                      "Transaction Confirmed!"}
                    {transactionStatus.status === "failed" &&
                      "Transaction Failed"}
                  </span>
                  {transactionStatus.error && (
                    <div className="mt-1 text-gray-300 text-sm break-words">
                      {transactionStatus.error}
                    </div>
                  )}
                </div>
              </div>
              {transactionStatus.signature && (
                <a
                  href={getTransactionUrl(transactionStatus.signature)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-shrink-0 items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm transition-all"
                >
                  View on Solscan
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 mx-auto px-8 pb-4 max-w-full container">
          {/* Main Layout */}
          <div className="flex-1 gap-4 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
            {/* Control Panel */}
            <div className="flex flex-col lg:col-span-4">
              <ControlPanel
                inputToken={inputToken}
                outputToken={outputToken}
                amount={amount}
                outputAmount={outputAmount}
                slippage={slippage}
                loading={loading}
                walletConnected={wallet.connected}
                availableTokens={availableTokens}
                tokensLoading={tokensLoading}
                onInputTokenChange={handleInputTokenChange}
                onOutputTokenChange={handleOutputTokenChange}
                onAmountChange={handleAmountChange}
                onOutputAmountChange={handleOutputAmountChange}
                onSlippageChange={setSlippage}
                onSwapTokens={handleSwapTokens}
                onGetRoute={handleGetRoute}
                onExecuteSwap={handleExecuteSwap}
                isSwapping={isSwapping}
              />
            </div>

            {/* Route Visualization */}
            <div className="flex flex-col lg:col-span-8 overflow-hidden">
              <RouteDiagram routeData={routeData} loading={loading} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 mt-6 text-gray-500 text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="text-sm">Powered by</span>
              <img
                src="/assets/jupiter-logo.svg"
                alt="Jupiter Protocol"
                className="w-5 h-5"
              />
              <span className="text-sm">• Real-time routing data</span>
            </div>
            <div className="flex justify-center items-center gap-2 mt-2">
              <div className="bg-jupiter-secondary rounded-full w-2 h-2 animate-pulse"></div>
              <span className="text-xs">Live API Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
