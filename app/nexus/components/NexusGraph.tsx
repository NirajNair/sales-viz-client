"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { NexusNode, NexusLink, HsnDetail } from "../types";

// Dynamic import to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

interface NexusGraphProps {
  nodes: NexusNode[];
  links: NexusLink[];
  isLoading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraphNode = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraphLink = any;

// Node dimensions and spacing - increased for better separation
const NODE_WIDTH = 135;
const NODE_HEIGHT = 62;
const NODE_SPACING = 180; // Space between nodes vertically
const COLUMN_SPACING = 220; // Space between columns horizontally
const ZONE_SPACING = 800; // Space between selected entity zones
const SELLER_OFFSET = -500; // Distance from center to sellers
const BUYER_OFFSET = 500; // Distance from center to buyers
const BOTH_OFFSET_Y = 350; // Distance below center for both buyer & seller

export function NexusGraph({ nodes, links, isLoading }: NexusGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLink, setHoveredLink] = useState<{
    link: NexusLink;
    x: number;
    y: number;
  } | null>(null);

  // Process nodes to assign positions based on their relationship to selected entities
  const processedNodes = useMemo(() => {
    const selectedEntities = nodes.filter((n) => n.isSelected);
    const otherNodes = nodes.filter((n) => !n.isSelected);

    const nodeMap = new Map<string, ForceGraphNode>();

    // Position selected entities in a horizontal line at center
    selectedEntities.forEach((node, index) => {
      const totalWidth = (selectedEntities.length - 1) * ZONE_SPACING;
      const x = -totalWidth / 2 + index * ZONE_SPACING;
      nodeMap.set(node.id, {
        ...node,
        x,
        y: 0,
        fx: x,
        fy: 0,
      });
    });

    // Calculate how many nodes fit in one column based on graph height
    const maxNodesPerColumn = 8;

    // Group other nodes by their relationship to each selected entity
    selectedEntities.forEach((selectedNode, selectedIndex) => {
      const centerX =
        -((selectedEntities.length - 1) * ZONE_SPACING) / 2 +
        selectedIndex * ZONE_SPACING;

      // Find connected nodes for this selected entity
      const connectedNodes = otherNodes.filter((node) => {
        return links.some(
          (link) =>
            (link.source === selectedNode.id && link.target === node.id) ||
            (link.target === selectedNode.id && link.source === node.id),
        );
      });

      // Group by type
      const sellers = connectedNodes.filter((n) => n.isSeller && !n.isBuyer);
      const buyers = connectedNodes.filter((n) => n.isBuyer && !n.isSeller);
      const both = connectedNodes.filter((n) => n.isBuyer && n.isSeller);

      // Position sellers to the left in multiple columns if needed
      sellers.forEach((node, idx) => {
        if (!nodeMap.has(node.id)) {
          const col = Math.floor(idx / maxNodesPerColumn);
          const row = idx % maxNodesPerColumn;
          const xPos = centerX + SELLER_OFFSET - col * COLUMN_SPACING;
          const yPos =
            (row - Math.min(sellers.length, maxNodesPerColumn) / 2 + 0.5) *
            NODE_SPACING;
          nodeMap.set(node.id, {
            ...node,
            x: xPos,
            y: yPos,
            fx: xPos,
            fy: yPos,
          });
        }
      });

      // Position buyers to the right in multiple columns if needed
      buyers.forEach((node, idx) => {
        if (!nodeMap.has(node.id)) {
          const col = Math.floor(idx / maxNodesPerColumn);
          const row = idx % maxNodesPerColumn;
          const xPos = centerX + BUYER_OFFSET + col * COLUMN_SPACING;
          const yPos =
            (row - Math.min(buyers.length, maxNodesPerColumn) / 2 + 0.5) *
            NODE_SPACING;
          nodeMap.set(node.id, {
            ...node,
            x: xPos,
            y: yPos,
            fx: xPos,
            fy: yPos,
          });
        }
      });

      // Position both below in multiple columns if needed
      both.forEach((node, idx) => {
        if (!nodeMap.has(node.id)) {
          const col = Math.floor(idx / maxNodesPerColumn);
          const row = idx % maxNodesPerColumn;
          const xPos =
            centerX +
            col * COLUMN_SPACING -
            (Math.floor(both.length / maxNodesPerColumn) * COLUMN_SPACING) / 2;
          const yPos = BOTH_OFFSET_Y + row * NODE_SPACING;
          nodeMap.set(node.id, {
            ...node,
            x: xPos,
            y: yPos,
            fx: xPos,
            fy: yPos,
          });
        }
      });
    });

    // Handle nodes not connected to any selected entity (position deterministically below)
    const unconnectedNodes = otherNodes.filter((node) => !nodeMap.has(node.id));
    unconnectedNodes.forEach((node, index) => {
      const col = Math.floor(index / maxNodesPerColumn);
      const row = index % maxNodesPerColumn;
      const totalCols = Math.ceil(unconnectedNodes.length / maxNodesPerColumn);
      const startX = -((totalCols - 1) * COLUMN_SPACING) / 2;
      const xPos = startX + col * COLUMN_SPACING;
      const yPos = BOTH_OFFSET_Y + 400 + row * NODE_SPACING;

      nodeMap.set(node.id, {
        ...node,
        x: xPos,
        y: yPos,
        fx: xPos,
        fy: yPos,
      });
    });

    return Array.from(nodeMap.values());
  }, [nodes, links]);

  const getNodeColor = useCallback((node: ForceGraphNode): string => {
    if (node.isSelected) {
      return "#2563eb"; // blue-600 for selected nodes
    }
    if (node.isBuyer && node.isSeller) {
      return "#0891b2"; // cyan-600 for both
    }
    if (node.isBuyer) {
      return "#059669"; // emerald-600 for buyers
    }
    return "#7c3aed"; // violet-600 for sellers
  }, []);

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const nodeCanvasObject = useCallback(
    (node: ForceGraphNode, ctx: CanvasRenderingContext2D) => {
      const x = node.x - NODE_WIDTH / 2;
      const y = node.y - NODE_HEIGHT / 2;
      const color = getNodeColor(node);

      // Draw shadow (lighter to not obscure arrows)
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Draw rectangle
      ctx.fillStyle = color;
      drawRoundedRect(ctx, x, y, NODE_WIDTH, NODE_HEIGHT, 8);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, NODE_WIDTH, NODE_HEIGHT, 8);
      ctx.stroke();

      // Draw name (first line)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Truncate name if too long
      let name = node.name;
      const maxWidth = NODE_WIDTH - 16;
      if (ctx.measureText(name).width > maxWidth) {
        while (
          ctx.measureText(name + "...").width > maxWidth &&
          name.length > 0
        ) {
          name = name.slice(0, -1);
        }
        name += "...";
      }

      ctx.fillText(name, node.x, node.y - 8);

      // Draw GSTIN (second line, smaller)
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(node.gstin, node.x, node.y + 12);
    },
    [getNodeColor],
  );

  const getNodeId = (node: ForceGraphNode | string): string => {
    return typeof node === "string" ? node : node.id;
  };

  const handleLinkHover = useCallback((link: ForceGraphLink | null): void => {
    if (link) {
      setHoveredLink({
        link: {
          source: getNodeId(link.source),
          target: getNodeId(link.target),
          hsnDetails: link.hsnDetails || [],
        },
        x: 0,
        y: 0,
      });
    } else {
      setHoveredLink(null);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent): void => {
    setHoveredLink((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX + 10,
            y: e.clientY - 10,
          }
        : null,
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[90vh] rounded-md border bg-card">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[90vh] rounded-md border bg-card text-muted-foreground">
        Select entities to view the network graph
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[90vh] rounded-md border bg-card overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <ForceGraph2D
        graphData={{ nodes: processedNodes, links }}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={(
          node: ForceGraphNode,
          color: string,
          ctx: CanvasRenderingContext2D,
        ) => {
          ctx.fillStyle = color;
          drawRoundedRect(
            ctx,
            node.x - NODE_WIDTH / 2,
            node.y - NODE_HEIGHT / 2,
            NODE_WIDTH,
            NODE_HEIGHT,
            8,
          );
          ctx.fill();
        }}
        linkColor={(): string => "#64748b"}
        linkWidth={2.5}
        linkDirectionalArrowLength={14}
        linkDirectionalArrowRelPos={0.88}
        backgroundColor="#fafafa"
        onLinkHover={handleLinkHover}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        warmupTicks={0}
        cooldownTicks={0}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.6}
        height={800}
      />

      {hoveredLink && (
        <div
          className="fixed z-50 pointer-events-none bg-popover border rounded-md shadow-md p-3 max-w-xs"
          style={{
            left: hoveredLink.x,
            top: hoveredLink.y,
          }}
        >
          <div className="text-sm font-medium mb-2">Transaction Details</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {hoveredLink.link.hsnDetails.map(
              (detail: HsnDetail, idx: number) => (
                <div key={idx} className="text-xs">
                  <span className="font-mono bg-secondary px-1 rounded">
                    {detail.code}
                  </span>
                  {detail.chemicalName && (
                    <span className="text-muted-foreground ml-2">
                      {detail.chemicalName}
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border rounded-md p-3 space-y-2">
        <div className="text-xs font-medium">Node Types</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span>Selected Entity</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-cyan-600"></div>
            <span>Buyer & Seller</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-emerald-600"></div>
            <span>Buyer Only</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-violet-600"></div>
            <span>Seller Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
