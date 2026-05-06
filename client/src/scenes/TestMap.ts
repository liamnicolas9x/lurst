import Phaser from "phaser";
import type { MapDefinition, MapObstacle } from "@shared/types/world";
import type { EntityId } from "@shared/types/ids";
import { MAP_HEIGHT, MAP_WIDTH } from "@shared/constants/game";

export function createTestMap(): MapDefinition {
  const obstacles: MapObstacle[] = [];

  const river: MapObstacle = {
    id: ("river-1" as unknown) as EntityId,
    kind: "river",
    shape: "rect",
    x: MAP_WIDTH * 0.45,
    y: 0,
    w: MAP_WIDTH * 0.12,
    h: MAP_HEIGHT,
  };
  obstacles.push(river);

  const treePositions = [
    { x: 520, y: 560 },
    { x: 610, y: 620 },
    { x: 720, y: 540 },
    { x: 820, y: 680 },
    { x: 1380, y: 840 },
    { x: 1540, y: 780 },
    { x: 1720, y: 920 },
    { x: 2680, y: 520 },
    { x: 2840, y: 640 },
    { x: 2600, y: 720 },
    { x: 2380, y: 1720 },
    { x: 2520, y: 1860 },
    { x: 720, y: 1740 },
    { x: 540, y: 1900 },
    { x: 880, y: 1980 },
  ];

  for (let i = 0; i < treePositions.length; i++) {
    obstacles.push({
      id: ((`tree-${i + 1}` as unknown) as EntityId),
      kind: "tree",
      shape: "circle",
      x: treePositions[i].x,
      y: treePositions[i].y,
      r: 30,
    });
  }

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    obstacles,
  };
}

export function renderTestMap(scene: Phaser.Scene, map: MapDefinition) {
  const g = scene.add.graphics();
  g.fillStyle(0x264d2d, 1);
  g.fillRect(0, 0, map.width, map.height);

  const river = map.obstacles.find((o) => o.kind === "river" && o.shape === "rect");
  if (river && river.w && river.h) {
    g.fillStyle(0x1b4f73, 1);
    g.fillRect(river.x, river.y, river.w, river.h);
    g.fillStyle(0x2d6e93, 0.35);
    g.fillRect(river.x + 6, river.y, 10, river.h);
  }

  for (const o of map.obstacles) {
    if (o.kind !== "tree" || o.shape !== "circle" || !o.r) continue;
    g.fillStyle(0x1f2f1f, 1);
    g.fillCircle(o.x, o.y, o.r);
    g.fillStyle(0x2a422a, 1);
    g.fillCircle(o.x - 6, o.y - 6, o.r * 0.65);
  }

  g.lineStyle(4, 0x0b0f0c, 1);
  g.strokeRect(0, 0, map.width, map.height);

  return g;
}

