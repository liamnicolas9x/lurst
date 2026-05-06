import { MAP_HEIGHT, MAP_WIDTH } from "../constants/game";
import type { EntityId } from "../types/ids";
import type { MapDefinition, MapObstacle } from "../types/world";

export function createHandmadeMap(): MapDefinition {
  const obstacles: MapObstacle[] = [
    {
      id: ("river-1" as unknown) as EntityId,
      kind: "river",
      shape: "rect",
      x: MAP_WIDTH * 0.45,
      y: 0,
      w: MAP_WIDTH * 0.12,
      h: MAP_HEIGHT,
    },
  ];

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
