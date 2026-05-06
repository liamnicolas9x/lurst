import Phaser from "phaser";
import { createTestMap, renderTestMap } from "@/scenes/TestMap";
import { Villager } from "@/entities/Villager";
import { RtsCameraController } from "@/systems/RtsCameraController";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { PlayerId, EntityId } from "@shared/types/ids";
import type { MapObstacle, PlayerPresenceState, UserMode, VillagerState } from "@shared/types/world";
import { MAP_HEIGHT, MAP_WIDTH, UNIT_SELECTION_HIT_RADIUS, VILLAGER_RADIUS } from "@shared/constants/game";
import { RemotePlayerMarker } from "@/entities/RemotePlayer";
import { DayNightTint } from "@/systems/DayNightTint";
import { Pathfinder } from "@/systems/Pathfinder";
import type { Vec2 } from "@shared/types/math";

type MinimapPayload = {
  map: { width: number; height: number; obstacles: MapObstacle[] };
  camera: { x: number; y: number; w: number; h: number };
  units: VillagerState[];
  players: PlayerPresenceState[];
};

export class WorldScene extends Phaser.Scene {
  private mode: UserMode;
  private playerId: PlayerId;
  private displayName: string;
  private multiplayer: MultiplayerClient;
  private villagers: Villager[] = [];
  private map = createTestMap();
  private cameraCtrl: RtsCameraController | null = null;
  private tint: DayNightTint | null = null;
  private pathfinder: Pathfinder | null = null;
  private selectionBox: Phaser.GameObjects.Graphics | null = null;
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

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    cam.centerOn(500, 620);

    this.cameraCtrl = new RtsCameraController(this, cam, { w: MAP_WIDTH, h: MAP_HEIGHT });
    this.tint = new DayNightTint(this, { w: MAP_WIDTH, h: MAP_HEIGHT });

    if (this.mode === "player") {
      this.spawnPhaseTwoVillagers();
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer));
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.onPointerMove(pointer));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.onPointerUp(pointer));

    this.unsubscribePresence = this.multiplayer.onPresence((players) => this.onPresence(players));
  }

  update(_time: number, deltaMs: number) {
    const dtSec = Math.min(0.05, deltaMs / 1000);
    this.cameraCtrl?.update(dtSec);
    this.tint?.update();

    if (this.villagers.length > 0 && this.pathfinder) {
      for (const villager of this.villagers) {
        villager.update(dtSec, this.villagers, (point) => this.pathfinder?.isWalkablePoint(point, VILLAGER_RADIUS) ?? true);
      }
      const units = this.villagers.map((v) => v.toState());
      const selectedUnitIds = this.getSelectedVillagers().map((v) => v.id);
      const lead = this.villagers[0].getPos();
      this.multiplayer.setLocalPresence(lead, units, selectedUnitIds);
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
    this.selectionBox?.destroy();
    this.selectionBox = null;
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
    if (pointer.leftButtonDown()) {
      this.dragStart = worldPoint;
      this.isDraggingSelection = false;
    }
    if (pointer.rightButtonDown()) {
      this.issueMoveCommand(worldPoint);
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
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
      players: this.latestPresence,
    };
    window.dispatchEvent(new CustomEvent<MinimapPayload>("rts:minimap", { detail: payload }));
  }
}

