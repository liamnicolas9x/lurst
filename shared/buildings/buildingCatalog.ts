import type { BuildingKind } from "../types/world";

export type BuildingSpec = {
  kind: BuildingKind;
  label: string;
  footprint: { w: number; h: number };
  maxHp: number;
  constructionDurationMs: number;
};

export const BUILDING_SPECS: Record<BuildingKind, BuildingSpec> = {
  townCenter: {
    kind: "townCenter",
    label: "Town Center",
    footprint: { w: 192, h: 160 },
    maxHp: 2400,
    constructionDurationMs: 60_000,
  },
  house: {
    kind: "house",
    label: "House",
    footprint: { w: 96, h: 96 },
    maxHp: 550,
    constructionDurationMs: 180_000,
  },
};

export const BUILDING_KINDS: BuildingKind[] = ["townCenter", "house"];
