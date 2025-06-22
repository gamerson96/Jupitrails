import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Token } from "../types/jupiter";
import {
  searchTokensWithFallback,
  convertJupiterTokenToToken,
} from "../services/tokenApi";

interface TokenSelectorProps {
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  tokens: Token[];
  label: string;
  disabled?: boolean;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  tokens,
  label,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTokens, setFilteredTokens] = useState<Token[]>(tokens);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setFilteredTokens(tokens);
  }, [tokens]);

  useEffect(() => {
    const searchTokens = async () => {
      if (!searchQuery.trim()) {
        setFilteredTokens(tokens);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        // First try local search
        const localResults = tokens.filter(
          (token) =>
            token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.mint.toLowerCase().includes(searchQuery.toLowerCase())
        ); // If we have local results, show them immediately
        if (localResults.length > 0) {
          setFilteredTokens(localResults);
          setIsSearching(false);
          return;
        }

        // If no local results and query is long enough, search all tokens
        if (searchQuery.length >= 3) {
          // Convert current tokens to Jupiter format for the search function
          const jupiterTokens = tokens.map((token) => ({
            name: token.name,
            symbol: token.symbol,
            address: token.mint,
            decimals: token.decimals,
            logoURI: token.logoURI || "",
            tags: token.tags || [],
            daily_volume: token.daily_volume || 0,
            created_at: token.created_at || "",
            freeze_authority: token.freeze_authority || null,
            mint_authority: token.mint_authority || null,
            permanent_delegate: token.permanent_delegate || null,
            minted_at: token.minted_at || null,
            extensions: token.extensions || {},
          }));

          const searchResults = await searchTokensWithFallback(
            searchQuery,
            jupiterTokens
          );
          const convertedResults = searchResults.map(
            convertJupiterTokenToToken
          );
          setFilteredTokens(convertedResults);
        } else {
          setFilteredTokens([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setFilteredTokens([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchTokens, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery, tokens]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  const formatVolume = (volume?: number): string => {
    if (!volume) return "";
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };
  return (
    <div className="relative" ref={dropdownRef}>
      {" "}
      <div className="relative">
        {/* Material UI style floating label */}
        {label && (
          <label className="-top-2.5 left-3 z-10 absolute bg-gradient-to-r from-jupiter-dark to-jupiter-darkSecondary px-2 border-jupiter-purple-600/30 border-r border-l rounded-sm font-medium text-jupiter-secondary text-xs">
            {label}
          </label>
        )}{" "}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="flex justify-between items-center bg-transparent disabled:opacity-50 px-3 sm:px-4 py-2 sm:py-3 border border-jupiter-purple-600 hover:border-jupiter-purple-500 focus:border-jupiter-primary rounded-lg focus:ring-2 focus:ring-jupiter-primary w-full min-h-[44px] text-white transition-all disabled:cursor-not-allowed token-selector-button"
        >
          <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
            {selectedToken.logoURI ? (
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.name}
                className="flex-shrink-0 rounded-full w-5 sm:w-6 h-5 sm:h-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="flex-shrink-0 text-base sm:text-lg">
                {selectedToken.logo}
              </span>
            )}
            <div className="min-w-0 text-left">
              <div className="font-medium text-sm sm:text-base truncate">
                {selectedToken.symbol}
              </div>
            </div>
          </div>{" "}
          <div className="sm:hidden flex-shrink-0 ml-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>{" "}
      {isOpen && (
        <div className="top-full left-0 z-[9999] absolute bg-jupiter-darkSecondary shadow-2xl mt-1 border border-jupiter-purple-600 rounded-lg w-full sm:w-max sm:min-w-[300px] sm:max-w-[400px] max-h-[300px] sm:max-h-none overflow-hidden token-dropdown">
          {/* Search */}
          <div className="p-3 border-jupiter-purple-700 border-b">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-jupiter-dark py-2 pr-4 pl-10 border border-jupiter-purple-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-jupiter-primary w-full text-white text-sm"
                autoFocus
              />
            </div>
          </div>{" "}
          {/* Token List with Custom Scrollbar - Show exactly 3 tokens on desktop, more on mobile */}
          <div className="max-h-[240px] sm:max-h-[192px] overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="p-4 text-gray-400 text-center">
                <div className="inline-block mr-2 border-2 border-jupiter-primary border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
                Searching tokens...
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => handleTokenSelect(token)}
                  className="flex items-center gap-3 hover:bg-jupiter-purple-600/20 p-3 w-full text-left transition-colors"
                >
                  {token.logoURI ? (
                    <img
                      src={token.logoURI}
                      alt={token.name}
                      className="flex-shrink-0 rounded-full w-6 sm:w-8 h-6 sm:h-8"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="flex-shrink-0 text-lg sm:text-xl">
                      {token.logo}
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm sm:text-base">
                        {token.symbol}
                      </span>
                      {token.tags?.includes("verified") && (
                        <span className="text-jupiter-secondary text-xs">
                          ✓
                        </span>
                      )}
                      {token.daily_volume && token.daily_volume > 1000000 && (
                        <TrendingUp className="w-3 h-3 text-jupiter-green-400" />
                      )}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm truncate">
                      {token.name}
                    </div>
                    {token.daily_volume && (
                      <div className="text-jupiter-secondary text-xs">
                        {formatVolume(token.daily_volume)} 24h vol
                      </div>
                    )}{" "}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
