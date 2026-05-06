import type { MapDefinition } from "../../shared/types/world";
import { MAP_HEIGHT, MAP_WIDTH } from "../../shared/constants/game";
import type { EntityId } from "../../shared/types/ids";

export function createServerBootstrap(): { map: MapDefinition } {
  const map: MapDefinition = {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    obstacles: [
      {
        id: ("river-1" as unknown) as EntityId,
        kind: "river",
        shape: "rect",
        x: MAP_WIDTH * 0.45,
        y: 0,
        w: MAP_WIDTH * 0.12,
        h: MAP_HEIGHT
      }
    ]
  };
  return { map };
}

