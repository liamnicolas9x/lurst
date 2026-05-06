import type { BuildingState, MapDefinition } from "../../shared/types/world";
import { createHandmadeMap } from "../../shared/world/handmadeMap";

export function createServerBootstrap(): { map: MapDefinition; buildings: BuildingState[] } {
  return { map: createHandmadeMap(), buildings: [] };
}

