"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Sprout } from "lucide-react";
import type { Variety } from "@/lib/types";
import type { PedigreeNode } from "@/lib/data";

type NodeData = {
  variety: Variety;
  highlight?: boolean;
  clickable: boolean;
};

const COL = 220; // горизонтальный шаг между узлами
const ROW = 160; // вертикальный шаг между поколениями

function VarietyNode({ data }: NodeProps) {
  const { variety, highlight, clickable } = data as NodeData;
  return (
    <div
      className={`w-44 cursor-grab overflow-hidden rounded-xl border bg-card shadow-sm transition active:cursor-grabbing ${
        highlight ? "border-primary ring-2 ring-primary/30" : "border-border"
      } ${clickable ? "hover:shadow-md" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="relative h-24 bg-muted">
        {variety.main_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={variety.main_photo_url}
            alt={variety.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Sprout className="size-7" />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-semibold">{variety.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {variety.species}
          {variety.year_created ? ` · ${variety.year_created}` : ""}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { variety: VarietyNode };

function depthOf(node: PedigreeNode): number {
  if (!node.parentA && !node.parentB) return 0;
  return (
    1 +
    Math.max(
      node.parentA ? depthOf(node.parentA) : 0,
      node.parentB ? depthOf(node.parentB) : 0
    )
  );
}

export function PedigreeTree({ root }: { root: PedigreeNode }) {
  const router = useRouter();

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const seen = new Set<string>();
    const maxDepth = depthOf(root);
    let leaf = 0;

    // Раскладка: листья (верхнее поколение) занимают последовательные колонки,
    // внутренний узел центрируется над своими родителями.
    const place = (node: PedigreeNode, depth: number): number => {
      const y = (maxDepth - depth) * ROW;
      let x: number;
      if (!node.parentA && !node.parentB) {
        x = leaf * COL;
        leaf += 1;
      } else {
        const xs: number[] = [];
        if (node.parentA) xs.push(place(node.parentA, depth + 1));
        if (node.parentB) xs.push(place(node.parentB, depth + 1));
        x = xs.reduce((a, b) => a + b, 0) / xs.length;
      }

      const id = node.variety.id;
      if (!seen.has(id)) {
        seen.add(id);
        nodes.push({
          id,
          type: "variety",
          position: { x, y },
          data: {
            variety: node.variety,
            highlight: depth === 0,
            clickable: depth !== 0,
          },
        });
      }

      const parents: [PedigreeNode | null, string][] = [
        [node.parentA, "A"],
        [node.parentB, "B"],
      ];
      for (const [parent, tag] of parents) {
        if (!parent) continue;
        edges.push({
          id: `${parent.variety.id}->${id}`,
          source: parent.variety.id,
          target: id,
          label: depth === 0 ? `Родитель ${tag}` : tag,
          animated: true,
        });
      }
      return x;
    };

    place(root, 0);
    return { nodes, edges };
  }, [root]);

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (node.id !== root.variety.id) router.push(`/variety/${node.id}`);
    },
    [root.variety.id, router]
  );

  if (!root.parentA && !root.parentB) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Это исходный (родительский) сорт — родословная не указана.
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl border bg-card sm:h-[460px]">
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.12}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
