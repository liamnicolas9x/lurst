import Phaser from "phaser";
import type { MapDefinition } from "@shared/types/world";
import { createHandmadeMap } from "@shared/world/handmadeMap";

export function createTestMap(): MapDefinition {
  return createHandmadeMap();
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

