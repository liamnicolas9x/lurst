import type { MapDefinition } from "../../shared/types/world";
import { createHandmadeMap } from "../../shared/world/handmadeMap";

export function createServerBootstrap(): { map: MapDefinition } {
  return { map: createHandmadeMap() };
}

