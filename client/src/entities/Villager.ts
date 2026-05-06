import Phaser from "phaser";
import type { Vec2 } from "@shared/types/math";
import type { EntityId, PlayerId } from "@shared/types/ids";
import { VILLAGER_RADIUS, VILLAGER_SPEED_PX_PER_SEC } from "@shared/constants/game";

export class Villager {
  readonly id: EntityId;
  readonly ownerPlayerId: PlayerId;
  readonly body: Phaser.GameObjects.Arc;
  private selection: Phaser.GameObjects.Arc;
  private target: Vec2 | null = null;
  private selected = false;

  constructor(scene: Phaser.Scene, opts: { id: EntityId; ownerPlayerId: PlayerId; x: number; y: number; color: number }) {
    this.id = opts.id;
    this.ownerPlayerId = opts.ownerPlayerId;
    this.body = scene.add.circle(opts.x, opts.y, VILLAGER_RADIUS, opts.color, 1);
    this.body.setDepth(10);
    this.selection = scene.add.circle(opts.x, opts.y, VILLAGER_RADIUS + 7, 0x00ff88, 0.18);
    this.selection.setStrokeStyle(2, 0x00ff88, 0.85);
    this.selection.setVisible(false);
    this.selection.setDepth(9);
  }

  destroy() {
    this.body.destroy();
    this.selection.destroy();
  }

  getPos(): Vec2 {
    return { x: this.body.x, y: this.body.y };
  }

  setSelected(v: boolean) {
    this.selected = v;
    this.selection.setVisible(v);
  }

  isSelected() {
    return this.selected;
  }

  setMoveTarget(target: Vec2 | null) {
    this.target = target;
  }

  update(dtSec: number, obstacles: { x: number; y: number; r: number }[]) {
    if (!this.target) return;
    const dx = this.target.x - this.body.x;
    const dy = this.target.y - this.body.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) {
      this.target = null;
      return;
    }

    const step = Math.min(d, VILLAGER_SPEED_PX_PER_SEC * dtSec);
    const nx = dx / d;
    const ny = dy / d;

    const nextX = this.body.x + nx * step;
    const nextY = this.body.y + ny * step;

    for (const o of obstacles) {
      const odx = nextX - o.x;
      const ody = nextY - o.y;
      const overlap = Math.hypot(odx, ody) - (o.r + VILLAGER_RADIUS);
      if (overlap < 0) {
        this.target = null;
        return;
      }
    }

    this.body.setPosition(nextX, nextY);
    this.selection.setPosition(nextX, nextY);
  }
}

