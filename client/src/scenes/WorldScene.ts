import Phaser from "phaser";
import { Building } from "@/entities/Building";
import { createTestMap, renderTestMap } from "@/scenes/TestMap";
import { Villager } from "@/entities/Villager";
import { RtsCameraController } from "@/systems/RtsCameraController";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { PlayerId, EntityId } from "@shared/types/ids";
import type { BuildingKind, BuildingState, MapDefinition, MapObstacle, PlayerPresenceState, UserMode, VillagerState } from "@shared/types/world";
import { BUILDING_GRID_SIZE, DEV_BUILD_SPEED_MULTIPLIER, MAP_HEIGHT, MAP_WIDTH, UNIT_SELECTION_HIT_RADIUS, VILLAGER_RADIUS } from "@shared/constants/game";
import { RemotePlayerMarker } from "@/entities/RemotePlayer";
import { DayNightTint } from "@/systems/DayNightTint";
import { Pathfinder } from "@/systems/Pathfinder";
import type { Vec2 } from "@shared/types/math";
import { BUILDING_SPECS } from "@shared/buildings/buildingCatalog";

type MinimapPayload = {
  map: { width: number; height: number; obstacles: MapObstacle[] };
  camera: { x: number; y: number; w: number; h: number };
  units: VillagerState[];
  buildings: BuildingState[];
  players: PlayerPresenceState[];
};

type PlacementMode = {
  kind: BuildingKind;
  pos: Vec2;
  valid: boolean;
};

export class WorldScene extends Phaser.Scene {
  private mode: UserMode;
  private playerId: PlayerId;
  private displayName: string;
  private multiplayer: MultiplayerClient;
  private villagers: Villager[] = [];
  private buildings: Building[] = [];
  private map = createTestMap();
  private cameraCtrl: RtsCameraController | null = null;
  private tint: DayNightTint | null = null;
  private pathfinder: Pathfinder | null = null;
  private selectionBox: Phaser.GameObjects.Graphics | null = null;
  private buildingPreview: Phaser.GameObjects.Graphics | null = null;
  private placementMode: PlacementMode | null = null;
  private devFastBuild = false;
  private buildingSaveTimerMs = 0;
  private dragStart: Vec2 | null = null;
  private isDraggingSelection = false;
  private latestPresence: PlayerPresenceState[] = [];
  private remoteMarkers = new Map<string, RemotePlayerMarker>();
  private unsubscribePresence: (() => void) | null = null;

  constructor(opts: { mode: UserMode; playerId: PlayerId; displayName: string; multiplayer: MultiplayerClient }) {
    super("world");
    this.mode = opts.mode;
    this.playerId = opts.playerId;
    this.displayName = opts.displayName;
    this.multiplayer = opts.multiplayer;
  }

  create() {
    this.map = createTestMap();
    renderTestMap(this, this.map);
    this.pathfinder = new Pathfinder(this.map);
    this.selectionBox = this.add.graphics();
    this.selectionBox.setDepth(100);
    this.buildingPreview = this.add.graphics();
    this.buildingPreview.setDepth(101);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    cam.centerOn(500, 620);

    this.cameraCtrl = new RtsCameraController(this, cam, { w: MAP_WIDTH, h: MAP_HEIGHT });
    this.tint = new DayNightTint(this, { w: MAP_WIDTH, h: MAP_HEIGHT });

    if (this.mode === "player") {
      this.spawnPhaseTwoVillagers();
      this.loadBuildings();
      this.rebuildPathfinder();
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer));
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.onPointerMove(pointer));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.onPointerUp(pointer));
    window.addEventListener("rts:building-placement", this.onBuildingPlacementCommand);
    window.addEventListener("rts:dev-build-speed", this.onDevBuildSpeedCommand);

    this.unsubscribePresence = this.multiplayer.onPresence((players) => this.onPresence(players));
  }

  update(_time: number, deltaMs: number) {
    const dtSec = Math.min(0.05, deltaMs / 1000);
    this.cameraCtrl?.update(dtSec);
    this.tint?.update();
    this.updatePlacementPreview();

    const buildSpeed = this.devFastBuild && import.meta.env.DEV ? DEV_BUILD_SPEED_MULTIPLIER : 1;
    let buildingChanged = false;
    for (const building of this.buildings) {
      const before = building.getState();
      building.update(dtSec, buildSpeed);
      if (before !== building.getState()) buildingChanged = true;
    }
    if (buildingChanged) this.scheduleBuildingSave(deltaMs);

    if (this.villagers.length > 0 && this.pathfinder) {
      for (const villager of this.villagers) {
        villager.update(dtSec, this.villagers, (point) => this.pathfinder?.isWalkablePoint(point, VILLAGER_RADIUS) ?? true);
      }
      const units = this.villagers.map((v) => v.toState());
      const selectedUnitIds = this.getSelectedVillagers().map((v) => v.id);
      const lead = this.villagers[0].getPos();
      this.multiplayer.setLocalPresence(lead, units, selectedUnitIds, this.getBuildingStates());
    } else {
      this.multiplayer.setLocalPresence(null);
    }
    this.emitMinimapState();
  }

  shutdown() {
    this.unsubscribePresence?.();
    this.unsubscribePresence = null;
    for (const m of this.remoteMarkers.values()) m.destroy();
    this.remoteMarkers.clear();
    for (const villager of this.villagers) villager.destroy();
    this.villagers = [];
    for (const building of this.buildings) building.destroy();
    this.buildings = [];
    this.selectionBox?.destroy();
    this.selectionBox = null;
    this.buildingPreview?.destroy();
    this.buildingPreview = null;
    window.removeEventListener("rts:building-placement", this.onBuildingPlacementCommand);
    window.removeEventListener("rts:dev-build-speed", this.onDevBuildSpeedCommand);
  }

  private onPresence(players: PlayerPresenceState[]) {
    this.latestPresence = players;
    const meKey = this.playerId as unknown as string;
    const wanted = new Map<string, PlayerPresenceState>();
    for (const p of players) {
      const key = p.playerId as unknown as string;
      if (key === meKey) continue;
      if (!p.pos) continue;
      wanted.set(key, p);
    }

    for (const [key, marker] of this.remoteMarkers.entries()) {
      if (!wanted.has(key)) {
        marker.destroy();
        this.remoteMarkers.delete(key);
      }
    }

    for (const [key, p] of wanted.entries()) {
      const existing = this.remoteMarkers.get(key);
      if (existing) {
        existing.setPos(p.pos!);
        continue;
      }
      const color = p.mode === "spectator" ? 0x38bdf8 : 0xfbbf24;
      this.remoteMarkers.set(
        key,
        new RemotePlayerMarker(this, {
          playerId: p.playerId,
          displayName: p.displayName,
          color,
          pos: p.pos!,
        }),
      );
    }
  }

  private spawnPhaseTwoVillagers() {
    const starts = [
      { x: 420, y: 460 },
      { x: 460, y: 500 },
      { x: 390, y: 520 },
      { x: 505, y: 455 },
      { x: 445, y: 560 },
    ];

    this.villagers = starts.map(
      (pos, index) =>
        new Villager(this, {
          id: ((`villager-${index + 1}` as unknown) as EntityId),
          ownerPlayerId: this.playerId,
          x: pos.x,
          y: pos.y,
          color: 0xf5f5f4,
          label: `Villager ${index + 1}`,
        }),
    );
    this.villagers[0]?.setSelected(true);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.mode !== "player") return;
    const worldPoint = this.pointerWorld(pointer);
    if (this.placementMode) {
      if (pointer.leftButtonDown()) this.placeBuilding();
      if (pointer.rightButtonDown()) this.cancelBuildingPlacement();
      return;
    }
    if (pointer.leftButtonDown()) {
      this.dragStart = worldPoint;
      this.isDraggingSelection = false;
    }
    if (pointer.rightButtonDown()) {
      this.issueMoveCommand(worldPoint);
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.placementMode) {
      this.updatePlacementPreview(this.pointerWorld(pointer));
      return;
    }
    if (!this.dragStart || !pointer.leftButtonDown()) return;
    const worldPoint = this.pointerWorld(pointer);
    const dx = worldPoint.x - this.dragStart.x;
    const dy = worldPoint.y - this.dragStart.y;
    this.isDraggingSelection = Math.hypot(dx, dy) > 8;
    if (!this.isDraggingSelection) return;
    this.drawSelectionBox(this.dragStart, worldPoint);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (this.mode !== "player" || pointer.button !== 0 || !this.dragStart) return;
    if (this.placementMode) return;
    const worldPoint = this.pointerWorld(pointer);
    if (this.isDraggingSelection) {
      this.selectInBox(this.dragStart, worldPoint, pointer.event.shiftKey);
    } else {
      this.selectSingle(worldPoint, pointer.event.shiftKey);
    }
    this.clearSelectionBox();
    this.dragStart = null;
    this.isDraggingSelection = false;
  }

  private selectSingle(point: Vec2, additive: boolean) {
    const hit = [...this.villagers].reverse().find((v) => v.hitTest(point, UNIT_SELECTION_HIT_RADIUS));
    if (!additive) {
      for (const villager of this.villagers) villager.setSelected(false);
    }
    if (hit) hit.setSelected(additive ? !hit.isSelected() : true);
  }

  private selectInBox(a: Vec2, b: Vec2, additive: boolean) {
    const rect = new Phaser.Geom.Rectangle(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    if (!additive) {
      for (const villager of this.villagers) villager.setSelected(false);
    }
    for (const villager of this.villagers) {
      if (villager.isInsideRect(rect)) villager.setSelected(true);
    }
  }

  private issueMoveCommand(target: Vec2) {
    const selected = this.getSelectedVillagers();
    if (!this.pathfinder || selected.length === 0) return;

    const destinations = this.formationDestinations(target, selected.length);
    for (let i = 0; i < selected.length; i++) {
      const destination = destinations[i];
      const path = this.pathfinder.findPath(selected[i].getPos(), destination);
      selected[i].setMovePath(path[path.length - 1] ?? destination, path);
    }

    this.multiplayer.sendInput({
      playerId: this.playerId,
      at: Date.now(),
      command: {
        kind: "move",
        unitIds: selected.map((v) => v.id),
        target,
      },
    });
  }

  private formationDestinations(target: Vec2, count: number) {
    const cols = Math.ceil(Math.sqrt(count));
    const spacing = 42;
    const result: Vec2[] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = (col - (cols - 1) / 2) * spacing;
      const offsetY = (row - (Math.ceil(count / cols) - 1) / 2) * spacing;
      const candidate = { x: target.x + offsetX, y: target.y + offsetY };
      result.push(this.pathfinder?.isWalkablePoint(candidate) ? candidate : target);
    }
    return result;
  }

  private drawSelectionBox(a: Vec2, b: Vec2) {
    if (!this.selectionBox) return;
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(a.x - b.x);
    const h = Math.abs(a.y - b.y);
    this.selectionBox.clear();
    this.selectionBox.fillStyle(0x60f5b6, 0.09);
    this.selectionBox.fillRect(x, y, w, h);
    this.selectionBox.lineStyle(1, 0x8cffcf, 0.9);
    this.selectionBox.strokeRect(x, y, w, h);
  }

  private clearSelectionBox() {
    this.selectionBox?.clear();
  }

  private pointerWorld(pointer: Phaser.Input.Pointer): Vec2 {
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    return { x: worldPoint.x, y: worldPoint.y };
  }

  private getSelectedVillagers() {
    return this.villagers.filter((v) => v.isSelected());
  }

  private emitMinimapState() {
    const cam = this.cameras.main;
    const payload: MinimapPayload = {
      map: { width: this.map.width, height: this.map.height, obstacles: this.map.obstacles },
      camera: { x: cam.scrollX, y: cam.scrollY, w: cam.width / cam.zoom, h: cam.height / cam.zoom },
      units: this.villagers.map((v) => v.toState()),
      buildings: this.getBuildingStates(),
      players: this.latestPresence,
    };
    window.dispatchEvent(new CustomEvent<MinimapPayload>("rts:minimap", { detail: payload }));
  }

  private onBuildingPlacementCommand = (event: Event) => {
    if (this.mode !== "player") return;
    const detail = (event as CustomEvent<{ kind?: BuildingKind | "cancel" }>).detail;
    if (!detail?.kind || detail.kind === "cancel") {
      this.cancelBuildingPlacement();
      return;
    }
    this.startBuildingPlacement(detail.kind);
  };

  private onDevBuildSpeedCommand = (event: Event) => {
    if (!import.meta.env.DEV) return;
    const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
    this.devFastBuild = Boolean(detail?.enabled);
  };

  private startBuildingPlacement(kind: BuildingKind) {
    const pointer = this.pointerWorld(this.input.activePointer);
    const pos = this.snapBuildingPos(kind, pointer);
    this.placementMode = {
      kind,
      pos,
      valid: this.isValidBuildingPlacement(kind, pos),
    };
    this.clearSelectionBox();
    this.drawBuildingPreview();
    window.dispatchEvent(new CustomEvent("rts:building-placement-status", { detail: { kind } }));
  }

  private cancelBuildingPlacement() {
    this.placementMode = null;
    this.buildingPreview?.clear();
    window.dispatchEvent(new CustomEvent("rts:building-placement-status", { detail: { kind: null } }));
  }

  private updatePlacementPreview(point = this.pointerWorld(this.input.activePointer)) {
    if (!this.placementMode) return;
    const pos = this.snapBuildingPos(this.placementMode.kind, point);
    this.placementMode = {
      ...this.placementMode,
      pos,
      valid: this.isValidBuildingPlacement(this.placementMode.kind, pos),
    };
    this.drawBuildingPreview();
  }

  private drawBuildingPreview() {
    if (!this.placementMode || !this.buildingPreview) return;
    const spec = BUILDING_SPECS[this.placementMode.kind];
    const { pos, valid } = this.placementMode;
    const color = valid ? 0x22c55e : 0xef4444;
    this.buildingPreview.clear();
    this.buildingPreview.fillStyle(color, 0.24);
    this.buildingPreview.fillRect(pos.x, pos.y, spec.footprint.w, spec.footprint.h);
    this.buildingPreview.lineStyle(2, color, 0.9);
    this.buildingPreview.strokeRect(pos.x, pos.y, spec.footprint.w, spec.footprint.h);
    this.buildingPreview.lineStyle(1, 0xf8fafc, 0.24);
    for (let x = pos.x; x <= pos.x + spec.footprint.w; x += BUILDING_GRID_SIZE) {
      this.buildingPreview.lineBetween(x, pos.y, x, pos.y + spec.footprint.h);
    }
    for (let y = pos.y; y <= pos.y + spec.footprint.h; y += BUILDING_GRID_SIZE) {
      this.buildingPreview.lineBetween(pos.x, y, pos.x + spec.footprint.w, y);
    }
  }

  private placeBuilding() {
    if (!this.placementMode || !this.placementMode.valid) return;
    const spec = BUILDING_SPECS[this.placementMode.kind];
    const now = Date.now();
    const state: BuildingState = {
      id: ((`building-${crypto.randomUUID()}` as unknown) as EntityId),
      kind: this.placementMode.kind,
      ownerPlayerId: this.playerId,
      pos: this.placementMode.pos,
      w: spec.footprint.w,
      h: spec.footprint.h,
      hp: 1,
      maxHp: spec.maxHp,
      phase: "construction",
      constructionDurationMs: spec.constructionDurationMs,
      constructionElapsedMs: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.buildings.push(new Building(this, state));
    this.rebuildPathfinder();
    this.saveBuildings();
    this.startBuildingPlacement(this.placementMode.kind);
  }

  private snapBuildingPos(kind: BuildingKind, point: Vec2): Vec2 {
    const spec = BUILDING_SPECS[kind];
    return {
      x: Math.round((point.x - spec.footprint.w / 2) / BUILDING_GRID_SIZE) * BUILDING_GRID_SIZE,
      y: Math.round((point.y - spec.footprint.h / 2) / BUILDING_GRID_SIZE) * BUILDING_GRID_SIZE,
    };
  }

  private isValidBuildingPlacement(kind: BuildingKind, pos: Vec2) {
    const spec = BUILDING_SPECS[kind];
    const rect = new Phaser.Geom.Rectangle(pos.x, pos.y, spec.footprint.w, spec.footprint.h);
    if (rect.x < 0 || rect.y < 0 || rect.right > this.map.width || rect.bottom > this.map.height) return false;
    if (this.map.obstacles.some((o) => this.rectIntersectsObstacle(rect, o))) return false;
    if (this.buildings.some((b) => Phaser.Geom.Intersects.RectangleToRectangle(rect, this.buildingRect(b.getState())))) return false;
    if (this.villagers.some((v) => Phaser.Geom.Rectangle.Contains(rect, v.body.x, v.body.y))) return false;
    return true;
  }

  private rectIntersectsObstacle(rect: Phaser.Geom.Rectangle, obstacle: MapObstacle) {
    if (obstacle.shape === "rect" && obstacle.w && obstacle.h) {
      return Phaser.Geom.Intersects.RectangleToRectangle(rect, new Phaser.Geom.Rectangle(obstacle.x, obstacle.y, obstacle.w, obstacle.h));
    }
    if (obstacle.shape === "circle" && obstacle.r) {
      const closestX = Phaser.Math.Clamp(obstacle.x, rect.left, rect.right);
      const closestY = Phaser.Math.Clamp(obstacle.y, rect.top, rect.bottom);
      return Math.hypot(obstacle.x - closestX, obstacle.y - closestY) <= obstacle.r;
    }
    return false;
  }

  private rebuildPathfinder() {
    this.pathfinder = new Pathfinder(this.createPathfindingMap());
  }

  private createPathfindingMap(): MapDefinition {
    return {
      ...this.map,
      obstacles: [...this.map.obstacles, ...this.buildings.map((b) => b.getObstacle())],
    };
  }

  private buildingRect(state: BuildingState) {
    return new Phaser.Geom.Rectangle(state.pos.x, state.pos.y, state.w, state.h);
  }

  private getBuildingStates() {
    return this.buildings.map((b) => b.getState());
  }

  private loadBuildings() {
    const raw = window.localStorage.getItem(this.buildingStorageKey());
    if (!raw) return;
    try {
      const states = JSON.parse(raw) as BuildingState[];
      if (!Array.isArray(states)) return;
      this.buildings = states
        .filter((state) => state.kind === "townCenter" || state.kind === "house")
        .map((state) => new Building(this, state));
    } catch {
      this.buildings = [];
    }
  }

  private scheduleBuildingSave(deltaMs: number) {
    this.buildingSaveTimerMs += deltaMs;
    if (this.buildingSaveTimerMs < 1000) return;
    this.buildingSaveTimerMs = 0;
    this.saveBuildings();
  }

  private saveBuildings() {
    window.localStorage.setItem(this.buildingStorageKey(), JSON.stringify(this.getBuildingStates()));
  }

  private buildingStorageKey() {
    return `rts:${this.playerId as unknown as string}:phase3a:buildings`;
  }
}

