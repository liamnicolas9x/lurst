import Phaser from "phaser";
import { createTestMap, renderTestMap } from "@/scenes/TestMap";
import { Villager } from "@/entities/Villager";
import { RtsCameraController } from "@/systems/RtsCameraController";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { PlayerId, EntityId } from "@shared/types/ids";
import type { UserMode } from "@shared/types/world";
import { MAP_HEIGHT, MAP_WIDTH } from "@shared/constants/game";
import { RemotePlayerMarker } from "@/entities/RemotePlayer";
import type { PlayerPresenceState } from "@shared/types/world";
import { DayNightTint } from "@/systems/DayNightTint";

export class WorldScene extends Phaser.Scene {
  private mode: UserMode;
  private playerId: PlayerId;
  private displayName: string;
  private multiplayer: MultiplayerClient;
  private villager: Villager | null = null;
  private map = createTestMap();
  private cameraCtrl: RtsCameraController | null = null;
  private tint: DayNightTint | null = null;
  private obstacleCircles: { x: number; y: number; r: number }[] = [];
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

    this.obstacleCircles = this.map.obstacles
      .filter((o) => o.kind === "tree" && o.shape === "circle" && typeof o.r === "number")
      .map((o) => ({ x: o.x, y: o.y, r: o.r! }));

    const cam = this.cameras.main;
    cam.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    cam.centerOn(MAP_WIDTH * 0.3, MAP_HEIGHT * 0.45);

    this.cameraCtrl = new RtsCameraController(this, cam, { w: MAP_WIDTH, h: MAP_HEIGHT });
    this.tint = new DayNightTint(this, { w: MAP_WIDTH, h: MAP_HEIGHT });

    if (this.mode === "player") {
      this.villager = new Villager(this, {
        id: (("villager-1" as unknown) as EntityId),
        ownerPlayerId: this.playerId,
        x: 420,
        y: 460,
        color: 0xf5f5f4,
      });
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.villager) return;
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      if (pointer.leftButtonDown()) {
        const dx = worldPoint.x - this.villager.body.x;
        const dy = worldPoint.y - this.villager.body.y;
        const hit = Math.hypot(dx, dy) <= 26;
        this.villager.setSelected(hit);
      }
      if (pointer.rightButtonDown()) {
        if (!this.villager.isSelected()) return;
        this.villager.setMoveTarget({ x: worldPoint.x, y: worldPoint.y });
      }
    });

    this.unsubscribePresence = this.multiplayer.onPresence((players) => this.onPresence(players));
  }

  update(_time: number, deltaMs: number) {
    const dtSec = Math.min(0.05, deltaMs / 1000);
    this.cameraCtrl?.update(dtSec);
    this.tint?.update();

    if (this.villager) {
      this.villager.update(dtSec, this.obstacleCircles);
      const pos = this.villager.getPos();
      this.multiplayer.setLocalPresence(pos);
    } else {
      this.multiplayer.setLocalPresence(null);
    }
  }

  shutdown() {
    this.unsubscribePresence?.();
    this.unsubscribePresence = null;
    for (const m of this.remoteMarkers.values()) m.destroy();
    this.remoteMarkers.clear();
    this.villager?.destroy();
    this.villager = null;
  }

  private onPresence(players: PlayerPresenceState[]) {
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
}

