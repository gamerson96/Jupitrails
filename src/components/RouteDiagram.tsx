import React, { useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  BackgroundVariant,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Activity, Zap, Wallet, Building2, DollarSign } from "lucide-react";
import { ProcessedRoute } from "../types/jupiter";
import { getTokenByMint } from "../utils/jupiter";

interface RouteDiagramProps {
  routeData: ProcessedRoute | null;
  loading: boolean;
}

// Custom Token Node Component
const TokenNode = ({ data }: { data: any }) => {
  const { token, isStart, isEnd, amount } = data;
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ pointerEvents: "all" }}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-white !border-2 !border-gray-400 !rounded-full w-3 h-3"
        />
      )}

      {/* Compact circular token representation with proper hover area */}
      <div
        className={`relative flex items-center justify-center w-16 h-16 rounded-full border-3 shadow-lg transition-all duration-300 cursor-pointer ${
          isHovered ? "scale-110" : ""
        } ${
          isStart
            ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300"
            : isEnd
            ? "bg-gradient-to-br from-green-500 to-green-600 border-green-300"
            : "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300"
        }`}
      >
        {token.logoURI ? (
          <img
            src={token.logoURI}
            alt={token.name}
            className="border-2 border-white/40 rounded-full w-12 h-12 pointer-events-none"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-bold text-white text-lg pointer-events-none">
            {token.symbol.charAt(0)}
          </span>
        )}

        {/* Status indicator */}
        <div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
            isStart ? "bg-blue-300" : isEnd ? "bg-green-300" : "bg-purple-300"
          } animate-ping pointer-events-none`}
        />
      </div>

      {/* Hover tooltip */}
      <div
        className={`absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3 min-w-48 transition-opacity duration-200 pointer-events-none z-[9999] ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mb-1 font-bold text-white text-sm">{token.symbol}</div>
        <div className="mb-2 text-gray-300 text-xs">{token.name}</div>
        {amount && (
          <div className="font-mono text-gray-200 text-xs">
            Amount:{" "}
            {parseFloat(amount).toLocaleString(undefined, {
              maximumFractionDigits: 6,
              minimumFractionDigits: 2,
            })}
          </div>
        )}
        <div className="mt-1 text-gray-400 text-xs">
          {isStart
            ? "Input Token"
            : isEnd
            ? "Output Token"
            : "Intermediate Token"}
        </div>
      </div>

      {!isEnd && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-white !border-2 !border-gray-400 !rounded-full w-3 h-3"
        />
      )}
    </div>
  );
};

// Custom AMM Pool Node
const AmmPoolNode = ({ data }: { data: any }) => {
  const {
    label,
    inputToken,
    outputToken,
    feePercent,
    feeAmount,
    inAmount,
    outAmount,
  } = data;
  const [isHovered, setIsHovered] = useState(false);

  const feeLevel = parseFloat(feePercent);
  const feeStatus =
    feeLevel < 0.1
      ? "excellent"
      : feeLevel < 0.3
      ? "good"
      : feeLevel < 0.5
      ? "fair"
      : "high";
  const feeColor =
    feeLevel < 0.1
      ? "text-emerald-400"
      : feeLevel < 0.3
      ? "text-yellow-400"
      : feeLevel < 0.5
      ? "text-orange-400"
      : "text-red-400";
  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ pointerEvents: "all" }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-orange-500 !border-2 !border-white !rounded-full w-4 h-4"
      />

      {/* Compact rectangular AMM representation with proper hover area */}
      <div
        className={`relative bg-gradient-to-br from-orange-500/80 to-red-500/80 shadow-lg backdrop-blur-sm px-4 py-3 border-2 border-orange-400/80 rounded-xl min-w-32 transition-all duration-300 cursor-pointer ${
          isHovered ? "scale-105" : ""
        }`}
      >
        <div className="text-center pointer-events-none">
          <div className="flex justify-center items-center bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-2 rounded-full w-8 h-8">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="font-bold text-orange-100 text-sm">{label}</div>{" "}
          <div className="text-gray-300 text-xs">
            {parseFloat(feeAmount) > 0 ? (
              <>
                Fee: ~{parseFloat(feeAmount).toFixed(4)} {inputToken}
              </>
            ) : (
              <>Fee: ~{parseFloat(feePercent).toFixed(4)}%</>
            )}
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      <div
        className={`absolute top-16 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 min-w-64 transition-opacity duration-200 pointer-events-none z-[9999] ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mb-2 font-bold text-orange-400 text-sm">
          {label} Pool
        </div>
        <div className="mb-3 text-gray-300 text-xs">
          {inputToken} → {outputToken}
        </div>

        <div className="gap-3 grid grid-cols-2 mb-3">
          <div>
            <div className="text-gray-400 text-xs">Input</div>
            <div className="font-mono text-white text-xs">
              {parseFloat(inAmount).toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Output</div>
            <div className="font-mono text-white text-xs">
              {parseFloat(outAmount).toFixed(4)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-gray-600 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Fee</span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  feeStatus === "excellent"
                    ? "bg-emerald-400"
                    : feeStatus === "good"
                    ? "bg-yellow-400"
                    : feeStatus === "fair"
                    ? "bg-orange-400"
                    : "bg-red-400"
                }`}
              />{" "}
              <span className={`text-xs font-bold ${feeColor}`}>
                ~{parseFloat(feePercent).toFixed(3)}% ({feeStatus})
              </span>
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-orange-500 !border-2 !border-white !rounded-full w-4 h-4"
      />
    </div>
  );
};

// Custom Fee Wallet Node
const FeeWalletNode = ({ data }: { data: any }) => {
  const { label, address, type } = data;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-44 ${
        type === "protocol"
          ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500"
          : "bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            type === "protocol" ? "bg-purple-500" : "bg-pink-500"
          }`}
        >
          <DollarSign className="w-4 h-4 text-white" />
        </div>
        <div>
          <div
            className={`font-bold text-sm ${
              type === "protocol" ? "text-purple-400" : "text-pink-400"
            }`}
          >
            {label}
          </div>
          <div className="font-mono text-gray-400 text-xs">{address}</div>
        </div>
      </div>
    </div>
  );
};

// Custom Recipient Wallet Node
const RecipientWalletNode = ({ data }: { data: any }) => {
  const { label, address } = data;

  return (
    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 shadow-xl px-6 py-4 border-2 border-green-500 rounded-xl min-w-48">
      <div className="flex items-center gap-3">
        <div className="flex justify-center items-center bg-green-500 rounded-full w-10 h-10">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-green-400 text-lg">{label}</div>
          <div className="font-mono text-gray-400 text-xs">{address}</div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  tokenNode: TokenNode,
  ammPool: AmmPoolNode,
  feeWallet: FeeWalletNode,
  recipientWallet: RecipientWalletNode,
};

export const RouteDiagram: React.FC<RouteDiagramProps> = ({
  routeData,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-br from-jupiter-dark to-jupiter-darkSecondary shadow-2xl backdrop-blur-sm p-6 border border-jupiter-purple-700 rounded-2xl h-full">
        <div className="text-center">
          <div className="mx-auto mb-4 border-4 border-jupiter-primary border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-gray-300">Analyzing swap route...</p>
        </div>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-br from-jupiter-dark to-jupiter-darkSecondary shadow-2xl backdrop-blur-sm p-6 border border-jupiter-purple-700 rounded-2xl h-full">
        <div className="text-center">
          <div className="flex justify-center items-center bg-jupiter-purple-600 mx-auto mb-4 rounded-full w-12 h-12">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="mb-2 font-semibold text-white text-lg">
            Ready to Visualize Swap
          </h3>
          <p className="max-w-sm text-gray-400 text-sm">
            Configure your swap and click "Get Best Route" to see the
            transaction flow
          </p>
        </div>
      </div>
    );
  } // Generate nodes and edges for React Flow (Token Route Visualization)
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const HORIZONTAL_SPACING = 250; // Increased spacing for better edge label visibility
    const TOKEN_Y = 150;
    const AMM_Y = 80;
    let currentX = 80;

    // 1. Add Input Token
    const firstHop = routeData.hops[0];
    const inputToken = getTokenByMint(firstHop.inputMint);
    if (inputToken) {
      nodes.push({
        id: "input-token",
        type: "tokenNode",
        position: { x: currentX, y: TOKEN_Y },
        data: {
          token: inputToken,
          isStart: true,
          isEnd: false,
          amount: firstHop.inAmount,
        },
      });
    }

    // 2. Add AMM nodes and intermediate tokens for each hop
    routeData.hops.forEach((hop, index) => {
      const isLastHop = index === routeData.hops.length - 1;
      const inputToken = getTokenByMint(hop.inputMint);
      const outputToken = getTokenByMint(hop.outputMint);

      currentX += HORIZONTAL_SPACING;

      // Add AMM node
      const ammNodeId = `amm-${index}`;
      nodes.push({
        id: ammNodeId,
        type: "ammPool",
        position: { x: currentX, y: AMM_Y },
        data: {
          label: hop.amm,
          inputToken: inputToken?.symbol || "TOKEN",
          outputToken: outputToken?.symbol || "TOKEN",
          feePercent: hop.feePercent,
          feeAmount: hop.feeAmount,
          inAmount: hop.inAmount,
          outAmount: hop.outAmount,
        },
      });

      // Add edge from input token to AMM with enhanced styling
      const sourceId = index === 0 ? "input-token" : `token-${index - 1}`;
      edges.push({
        id: `edge-to-amm-${index}`,
        source: sourceId,
        target: ammNodeId,
        type: "smoothstep",
        animated: true,
        label: `${parseFloat(hop.inAmount).toFixed(2)} ${
          inputToken?.symbol || "TOKEN"
        }`,
        labelStyle: {
          fontSize: "11px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "rgba(153, 69, 255, 0.9)",
          padding: "4px 8px",
          borderRadius: "8px",
          border: "1px solid #9945FF",
        },
        style: {
          stroke: "#9945FF",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#9945FF",
          width: 20,
          height: 20,
        },
      });

      // Add output token (final or intermediate)
      currentX += HORIZONTAL_SPACING;
      const tokenId = isLastHop ? "output-token" : `token-${index}`;

      if (outputToken) {
        nodes.push({
          id: tokenId,
          type: "tokenNode",
          position: { x: currentX, y: TOKEN_Y },
          data: {
            token: outputToken,
            isStart: false,
            isEnd: isLastHop,
            amount: isLastHop ? routeData.totalOut : hop.outAmount,
          },
        });

        // Add edge from AMM to output token with enhanced styling
        edges.push({
          id: `edge-from-amm-${index}`,
          source: ammNodeId,
          target: tokenId,
          type: "smoothstep",
          animated: true,
          label: `${parseFloat(
            isLastHop ? routeData.totalOut : hop.outAmount
          ).toFixed(2)} ${outputToken.symbol}`,
          labelStyle: {
            fontSize: "11px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: isLastHop
              ? "rgba(20, 241, 149, 0.9)"
              : "rgba(153, 69, 255, 0.9)",
            padding: "4px 8px",
            borderRadius: "8px",
            border: `1px solid ${isLastHop ? "#14F195" : "#9945FF"}`,
          },
          style: {
            stroke: isLastHop ? "#14F195" : "#9945FF",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isLastHop ? "#14F195" : "#9945FF",
            width: 20,
            height: 20,
          },
        });
      }
    });

    return { nodes, edges };
  }, [routeData]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  return (
    <div className="flex flex-col bg-gradient-to-br from-jupiter-dark to-jupiter-darkSecondary shadow-2xl backdrop-blur-sm p-6 border border-jupiter-purple-700 rounded-2xl h-full">
      <div className="flex flex-shrink-0 items-center gap-4 mb-4">
        <div className="flex justify-center items-center bg-gradient-to-r from-jupiter-primary to-jupiter-secondary rounded-xl w-8 h-8">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-space font-bold text-white text-lg">
          Token Swap Route
        </h2>
        <div className="ml-auto text-gray-400 text-xs">
          {routeData.hops.length} hop{routeData.hops.length > 1 ? "s" : ""} •
          Via {routeData.hops.map((h) => h.amm).join(" → ")}
        </div>
      </div>
      {/* Main flow diagram */}
      <div className="flex-1 bg-gradient-to-br from-gray-900/50 to-black/50 mb-4 border border-jupiter-purple-600/30 rounded-xl overflow-hidden">
        {" "}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
          className="bg-gradient-to-br from-jupiter-dark/30 to-jupiter-darkSecondary/30"
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          nodeOrigin={[0.5, 0.5]}
        >
          <Background
            color="#6D28D9"
            gap={25}
            size={1.5}
            variant={BackgroundVariant.Dots}
          />
          <Controls
            className="bg-jupiter-darkSecondary/80 backdrop-blur-sm border-jupiter-purple-600 rounded-lg"
            showInteractive={false}
          />
          {/* Compact Route Analysis Overlay */}
          <div className="top-4 right-4 z-10 absolute bg-black/80 backdrop-blur-md p-3 border border-jupiter-primary/30 rounded-xl min-w-48">
            {/* Header with score */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-jupiter-primary" />
                <span className="font-semibold text-white text-xs">
                  Route Summary
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const totalFees = routeData.hops.reduce(
                    (sum, hop) => sum + parseFloat(hop.feePercent),
                    0
                  );
                  const score = Math.max(
                    1,
                    Math.min(
                      5,
                      Math.round(
                        4.5 -
                          (routeData.hops.length - 1) * 0.3 -
                          parseFloat(routeData.priceImpact) * 2 -
                          totalFees * 8
                      )
                    )
                  );
                  return (
                    <div
                      key={star}
                      className={`w-1.5 h-1.5 rounded-full ${
                        star <= score ? "bg-yellow-400" : "bg-gray-600"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Compact metrics */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Hops</span>
                <div className="text-right">
                  <div className="font-bold text-white text-xs">
                    {routeData.hops.length}
                  </div>
                  <div
                    className={`text-xs ${
                      routeData.hops.length <= 2
                        ? "text-emerald-400"
                        : routeData.hops.length <= 4
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {routeData.hops.length <= 2
                      ? "Simple"
                      : routeData.hops.length <= 4
                      ? "Medium"
                      : "Complex"}
                  </div>
                </div>
              </div>{" "}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Slippage</span>
                <div className="text-right">
                  <div className="font-bold text-white text-xs">
                    {(() => {
                      const impact = parseFloat(routeData.priceImpact);
                      if (impact === 0) {
                        return "~0.01%";
                      } else if (impact < 0.01) {
                        return `~${impact.toFixed(4)}%`;
                      } else {
                        return `~${impact.toFixed(3)}%`;
                      }
                    })()}
                  </div>
                  <div
                    className={`text-xs ${
                      parseFloat(routeData.priceImpact) < 0.5
                        ? "text-emerald-400"
                        : parseFloat(routeData.priceImpact) < 1
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {parseFloat(routeData.priceImpact) < 0.5
                      ? "Low"
                      : parseFloat(routeData.priceImpact) < 1
                      ? "Med"
                      : "High"}
                  </div>
                </div>
              </div>{" "}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Fees</span>
                <div className="text-right">
                  {" "}
                  <div className="font-bold text-white text-xs">
                    {(() => {
                      const totalFees = routeData.hops.reduce(
                        (sum, hop) => sum + parseFloat(hop.feePercent),
                        0
                      );
                      if (totalFees === 0) {
                        return "~0.01%";
                      } else if (totalFees < 0.01) {
                        return `~${totalFees.toFixed(4)}%`;
                      } else {
                        return `~${totalFees.toFixed(3)}%`;
                      }
                    })()}
                  </div>
                  <div
                    className={`text-xs ${
                      routeData.hops.reduce(
                        (sum, hop) => sum + parseFloat(hop.feePercent),
                        0
                      ) < 0.1
                        ? "text-emerald-400"
                        : routeData.hops.reduce(
                            (sum, hop) => sum + parseFloat(hop.feePercent),
                            0
                          ) < 0.5
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {routeData.hops.reduce(
                      (sum, hop) => sum + parseFloat(hop.feePercent),
                      0
                    ) < 0.1
                      ? "Great"
                      : routeData.hops.reduce(
                          (sum, hop) => sum + parseFloat(hop.feePercent),
                          0
                        ) < 0.5
                      ? "Good"
                      : "High"}
                  </div>
                </div>
              </div>{" "}
              {/* Route Savings Impact */}
              <div className="flex justify-between items-center mt-2 pt-2 border-gray-700/50 border-t">
                <div className="w-full text-right">
                  <div className="font-bold text-emerald-400 text-xs">
                    {(() => {
                      if (routeData.hops.length === 1) {
                        return "Direct route 🎯";
                      }

                      const totalFees = routeData.hops.reduce(
                        (sum, hop) => sum + parseFloat(hop.feePercent),
                        0
                      );
                      const slippage = parseFloat(routeData.priceImpact);
                      const totalCost = totalFees + slippage;

                      // Calculate savings vs worse route
                      const baselineCost = Math.max(1.5, totalCost * 1.8);
                      const savings = baselineCost - totalCost;
                      const dollarSavingsPer1000 = (savings / 100) * 1000;

                      // Choose appropriate emoji based on savings amount
                      const emoji =
                        dollarSavingsPer1000 >= 15
                          ? "🎉"
                          : dollarSavingsPer1000 >= 8
                          ? "🎊"
                          : dollarSavingsPer1000 >= 3
                          ? "👍"
                          : "💰";

                      return `You just saved $${dollarSavingsPer1000.toFixed(
                        0
                      )} per $1000 ${emoji}`;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
        </ReactFlow>
      </div>
    </div>
  );
};
