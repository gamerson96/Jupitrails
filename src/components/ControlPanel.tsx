import React, { useEffect, useState } from "react";
import { Settings, ArrowUpDown, Zap, Droplets } from "lucide-react";
import { Token } from "../types/jupiter";
import { TokenSelector } from "./TokenSelector";
import { fetchTokenPrices } from "../services/jupiterApi";

interface ControlPanelProps {
  inputToken: Token;
  outputToken: Token;
  amount: number;
  outputAmount?: number;
  slippage: number;
  loading: boolean;
  walletConnected: boolean;
  availableTokens: Token[];
  tokensLoading: boolean;
  onInputTokenChange: (token: Token) => void;
  onOutputTokenChange: (token: Token) => void;
  onAmountChange: (amount: number) => void;
  onOutputAmountChange?: (amount: number) => void;
  onSlippageChange: (slippage: number) => void;
  onSwapTokens: () => void;
  onGetRoute: () => void;
  onExecuteSwap: () => void;
  isSwapping?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  inputToken,
  outputToken,
  amount,
  outputAmount = 0,
  slippage,
  loading,
  walletConnected,
  availableTokens,
  tokensLoading,
  onInputTokenChange,
  onOutputTokenChange,
  onAmountChange,
  onOutputAmountChange,
  onSlippageChange,
  onSwapTokens,
  onGetRoute,
  onExecuteSwap,
  isSwapping = false,
}) => {
  const [amountInput, setAmountInput] = useState(amount.toString());
  const [outputAmountInput, setOutputAmountInput] = useState(
    outputAmount.toString()
  );
  const [slippageInput, setSlippageInput] = useState(
    (slippage / 100).toString()
  );
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  // Fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const prices = await fetchTokenPrices([
          inputToken.mint,
          outputToken.mint,
        ]);
        setTokenPrices(prices);
      } catch (error) {
        console.warn("Failed to fetch token prices:", error);
      }
    };

    fetchPrices();
  }, [inputToken.mint, outputToken.mint]);

  // Sync prop -> local input (only when significantly different)
  useEffect(() => {
    const currentValue = parseFloat(amountInput) || 0;
    // Only sync if the parent value is significantly different from what we have locally
    // or if the input is empty and parent has a value
    if (
      Math.abs(amount - currentValue) > 0.0001 ||
      (amountInput === "" && amount > 0)
    ) {
      setAmountInput(amount === 0 ? "" : amount.toString());
    }
  }, [amount, amountInput]);

  useEffect(() => {
    const currentValue = parseFloat(outputAmountInput) || 0;
    // Only sync if the parent value is significantly different from what we have locally
    // or if the input is empty and parent has a value
    if (
      Math.abs(outputAmount - currentValue) > 0.0001 ||
      (outputAmountInput === "" && outputAmount > 0)
    ) {
      setOutputAmountInput(outputAmount === 0 ? "" : outputAmount.toString());
    }
  }, [outputAmount, outputAmountInput]);

  useEffect(() => {
    setSlippageInput(slippage === 0 ? "" : (slippage / 100).toString());
  }, [slippage]);

  const handleAmountChange = (value: string) => {
    // Allow valid decimal patterns including `.`, `0.`, `1.00`
    if (/^\d*\.?\d*$/.test(value)) {
      setAmountInput(value);

      // Always update parent with the parsed value, even if it's 0
      // This allows proper handling of partial decimal inputs
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onAmountChange(parsed);
      } else if (value === "" || value === ".") {
        // Handle empty or just decimal point
        onAmountChange(0);
      }
    }
  };

  const handleOutputAmountChange = (value: string) => {
    if (!onOutputAmountChange) return;

    if (/^\d*\.?\d*$/.test(value)) {
      setOutputAmountInput(value);

      // Always update parent with the parsed value, even if it's 0
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onOutputAmountChange(parsed);
      } else if (value === "" || value === ".") {
        // Handle empty or just decimal point
        onOutputAmountChange(0);
      }
    }
  };

  const handleSlippageChange = (value: string) => {
    // Allow valid decimal patterns including `.`, `0.`, `1.00`
    if (/^\d*\.?\d*$/.test(value)) {
      setSlippageInput(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onSlippageChange(Math.round(parsed * 100));
      } else {
        onSlippageChange(0);
      }
    }
  };

  // Calculate USD values
  const calculateUSDValue = (amount: number, tokenMint: string): string => {
    const price = tokenPrices[tokenMint] || 0;
    const usdValue = amount * price;
    if (usdValue === 0) return "≈ $0.00";
    if (usdValue < 0.01) return "< $0.01";
    return `≈ $${usdValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-gradient-to-br from-jupiter-dark to-jupiter-darkSecondary shadow-2xl backdrop-blur-sm p-4 sm:p-6 border border-jupiter-purple-700 rounded-2xl">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="flex justify-center items-center bg-gradient-to-r from-jupiter-primary to-jupiter-secondary rounded-lg w-6 sm:w-8 h-6 sm:h-8">
          <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
        </div>
        <h2 className="font-space font-bold text-white text-lg sm:text-xl">
          Swap
        </h2>
      </div>

      <div className="relative">
        {/* FROM */}
        <div className="bg-jupiter-darkSecondary/50 p-3 sm:p-4 border border-jupiter-purple-600/20 rounded-2xl">
          <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-[30%]">
              <TokenSelector
                selectedToken={inputToken}
                onTokenSelect={onInputTokenChange}
                tokens={availableTokens.filter(
                  (token) => token.mint !== outputToken.mint
                )}
                label="From"
                disabled={tokensLoading}
              />
            </div>
            <div className="w-full sm:w-[70%]">
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-bold text-white text-2xl sm:text-3xl text-left placeholder-gray-400 focus:placeholder-gray-500"
                placeholder="0.0"
              />
              <div className="text-gray-400 text-sm text-left">
                {calculateUSDValue(
                  parseFloat(amountInput || "0"),
                  inputToken.mint
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="hidden sm:block top-1/2 right-[20%] z-10 absolute -translate-y-1/2 transform">
          <button
            onClick={onSwapTokens}
            className="flex justify-center items-center bg-jupiter-dark shadow-xl border-2 border-jupiter-purple-600/50 hover:border-jupiter-primary rounded-full w-12 h-12 hover:rotate-180 hover:scale-105 transition-all transform"
          >
            <ArrowUpDown className="w-5 h-5 text-jupiter-primary" />
          </button>
        </div>

        {/* Mobile Swap Arrow */}
        <div className="sm:hidden flex justify-center items-center -my-2">
          <button
            onClick={onSwapTokens}
            className="z-10 flex justify-center items-center bg-jupiter-dark shadow-xl border-2 border-jupiter-purple-600/50 hover:border-jupiter-primary rounded-full w-12 h-12 hover:rotate-180 hover:scale-105 transition-all mobile-touch-button"
          >
            <ArrowUpDown className="w-5 h-5 text-jupiter-primary" />
          </button>
        </div>

        {/* TO */}
        <div className="bg-jupiter-darkSecondary/50 p-3 sm:p-4 border border-jupiter-purple-600/20 rounded-2xl">
          <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-[30%]">
              <TokenSelector
                selectedToken={outputToken}
                onTokenSelect={onOutputTokenChange}
                tokens={availableTokens.filter(
                  (token) => token.mint !== inputToken.mint
                )}
                label="To"
                disabled={tokensLoading}
              />
            </div>
            <div className="w-full sm:w-[70%]">
              <input
                type="text"
                inputMode="decimal"
                value={outputAmountInput}
                onChange={(e) => handleOutputAmountChange(e.target.value)}
                className={`bg-transparent border-none outline-none w-full font-bold text-2xl sm:text-3xl text-left placeholder-gray-400 focus:placeholder-gray-500 ${
                  onOutputAmountChange
                    ? "text-white cursor-text"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                placeholder="0.0"
                disabled={!onOutputAmountChange}
                readOnly={!onOutputAmountChange}
              />
              <div className="text-gray-400 text-sm text-left">
                {calculateUSDValue(
                  parseFloat(outputAmountInput || "0"),
                  outputToken.mint
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slippage */}
      <div className="mt-4 mb-4">
        <div className="bg-jupiter-darkSecondary/50 p-3 sm:p-4 border border-jupiter-purple-600/20 rounded-2xl">
          <div className="flex sm:flex-row flex-col sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-[30%]">
              <div className="relative">
                <label className="-top-2.5 left-3 z-10 absolute bg-gradient-to-r from-jupiter-dark to-jupiter-darkSecondary px-2 border-jupiter-purple-600/30 border-r border-l rounded-sm font-medium text-jupiter-secondary text-xs">
                  Slippage
                </label>
                <div className="flex justify-center items-center bg-transparent px-3 sm:px-4 py-2 sm:py-3 border border-jupiter-purple-600 hover:border-jupiter-purple-500 rounded-lg w-full min-h-[44px] text-white">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-[70%]">
              <input
                type="text"
                inputMode="decimal"
                value={slippageInput}
                onChange={(e) => handleSlippageChange(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-bold text-white text-2xl sm:text-3xl text-left placeholder-gray-400 focus:placeholder-gray-500"
                placeholder="0.5"
              />
              <div className="text-gray-400 text-sm text-left">
                Maximum slippage tolerance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onGetRoute}
          disabled={loading || amount <= 0}
          className="group relative bg-gradient-to-r from-jupiter-primary hover:from-jupiter-purple-600 disabled:from-gray-600 via-jupiter-purple-500 hover:via-jupiter-purple-400 disabled:via-gray-700 to-jupiter-secondary hover:to-jupiter-green-500 disabled:to-gray-600 shadow-xl hover:shadow-2xl disabled:shadow-none px-6 py-4 rounded-2xl w-full overflow-hidden font-bold text-white text-lg hover:scale-[1.02] disabled:scale-100 transition-all duration-300 disabled:cursor-not-allowed route-button transform"
        >
          {loading ? (
            <div className="z-10 relative flex justify-center items-center gap-3">
              <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
              <span className="font-medium">Finding best route...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700 ease-out"></div>
              <div className="z-10 relative flex justify-center items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Get Route</span>
              </div>
            </>
          )}
        </button>

        {walletConnected && (
          <button
            onClick={onExecuteSwap}
            disabled={loading || amount <= 0 || isSwapping}
            className="group relative bg-gradient-to-r from-jupiter-green-600 hover:from-jupiter-green-500 disabled:from-gray-600 via-jupiter-green-500 hover:via-jupiter-green-400 disabled:via-gray-700 to-jupiter-green-400 hover:to-jupiter-green-300 disabled:to-gray-600 shadow-xl hover:shadow-2xl disabled:shadow-none px-6 py-4 border border-jupiter-green-500/30 hover:border-jupiter-green-400/50 disabled:border-gray-600/30 rounded-2xl w-full overflow-hidden font-bold text-white text-lg hover:scale-[1.02] disabled:scale-100 transition-all duration-300 disabled:cursor-not-allowed swap-button transform"
          >
            {isSwapping ? (
              <div className="z-10 relative flex justify-center items-center gap-3">
                <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
                <span className="font-medium">Swapping...</span>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform translate-x-[-100%] group-hover:translate-x-[100%] duration-700 ease-out"></div>
                <div className="z-10 relative flex justify-center items-center gap-3">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Swap</span>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-jupiter-darkSecondary/50 mt-6 p-3 border border-jupiter-purple-700/30 rounded-lg">
        <div className="space-y-1 text-gray-400 text-xs">
          <div className="flex justify-between">
            <span>API:</span>
            <span className="text-jupiter-secondary">Jupiter Lite API</span>
          </div>
          <div className="flex justify-between">
            <span>Dynamic Slippage:</span>
            <span className="text-jupiter-green-400">Enabled</span>
          </div>
          <div className="flex justify-between">
            <span>Priority Fee:</span>
            <span className="text-jupiter-green-400">Auto</span>
          </div>
        </div>
      </div>
    </div>
  );
};
