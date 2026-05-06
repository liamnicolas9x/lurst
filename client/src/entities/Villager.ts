import Phaser from "phaser";
import type { Vec2 } from "@shared/types/math";
import type { EntityId, PlayerId } from "@shared/types/ids";
import type { UnitTaskState, VillagerState } from "@shared/types/world";
import {
  UNIT_MOVE_ARRIVAL_RADIUS,
  UNIT_SOFT_SEPARATION_RADIUS,
  UNIT_SOFT_SEPARATION_STRENGTH,
  VILLAGER_RADIUS,
  VILLAGER_SPEED_PX_PER_SEC,
} from "@shared/constants/game";
import { clamp } from "@shared/types/math";

export class Villager {
  readonly id: EntityId;
  readonly ownerPlayerId: PlayerId;
  readonly body: Phaser.GameObjects.Arc;
  private selection: Phaser.GameObjects.Arc;
  private label: Phaser.GameObjects.Text;
  private moveLine: Phaser.GameObjects.Graphics;
  private task: UnitTaskState = { kind: "idle" };
  private selected = false;

  constructor(
    private scene: Phaser.Scene,
    opts: { id: EntityId; ownerPlayerId: PlayerId; x: number; y: number; color: number; label?: string },
  ) {
    this.id = opts.id;
    this.ownerPlayerId = opts.ownerPlayerId;
    this.body = scene.add.circle(opts.x, opts.y, VILLAGER_RADIUS, opts.color, 1);
    this.body.setStrokeStyle(2, 0x292524, 0.85);
    this.body.setDepth(10);
    this.selection = scene.add.circle(opts.x, opts.y, VILLAGER_RADIUS + 7, 0x00ff88, 0.18);
    this.selection.setStrokeStyle(2, 0x00ff88, 0.85);
    this.selection.setVisible(false);
    this.selection.setDepth(9);
    this.label = scene.add
      .text(opts.x, opts.y - 31, opts.label ?? "Villager", {
        color: "#d6f7e8",
        fontFamily: "Arial",
        fontSize: "11px",
        stroke: "#0b0f0c",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12)
      .setVisible(false);
    this.moveLine = scene.add.graphics();
    this.moveLine.setDepth(8);
  }

  destroy() {
    this.body.destroy();
    this.selection.destroy();
    this.label.destroy();
    this.moveLine.destroy();
  }

  getPos(): Vec2 {
    return { x: this.body.x, y: this.body.y };
  }

  setSelected(v: boolean) {
    this.selected = v;
    this.selection.setVisible(v);
    this.label.setVisible(v);
    this.drawMoveLine();
  }

  isSelected() {
    return this.selected;
  }

  setMovePath(target: Vec2, path: Vec2[]) {
    this.task = {
      kind: "move",
      target,
      path: path.length > 0 ? path : [target],
      pathIndex: 0,
    };
    this.drawMoveLine();
  }

  getTask() {
    return this.task;
  }

  toState(): VillagerState {
    return {
      id: this.id,
      ownerPlayerId: this.ownerPlayerId,
      pos: this.getPos(),
      task: this.task,
      selected: this.selected,
    };
  }

  hitTest(point: Vec2, radius: number) {
    return Math.hypot(point.x - this.body.x, point.y - this.body.y) <= radius;
  }

  isInsideRect(rect: Phaser.Geom.Rectangle) {
    return Phaser.Geom.Rectangle.Contains(rect, this.body.x, this.body.y);
  }

  update(dtSec: number, units: Villager[], isWalkable: (point: Vec2) => boolean) {
    if (this.task.kind === "move") {
      this.updateMovement(dtSec, isWalkable);
    }

    this.applySeparation(dtSec, units, isWalkable);
    this.syncVisuals();
  }

  private updateMovement(dtSec: number, isWalkable: (point: Vec2) => boolean) {
    if (this.task.kind !== "move") return;
    const waypoint = this.task.path[this.task.pathIndex] ?? this.task.target;
    const dx = waypoint.x - this.body.x;
    const dy = waypoint.y - this.body.y;
    const d = Math.hypot(dx, dy);

    if (d <= UNIT_MOVE_ARRIVAL_RADIUS) {
      if (this.task.pathIndex < this.task.path.length - 1) {
        this.task = { ...this.task, pathIndex: this.task.pathIndex + 1 };
      } else {
        this.task = { kind: "idle" };
        this.drawMoveLine();
      }
      return;
    }

    const step = Math.min(d, VILLAGER_SPEED_PX_PER_SEC * dtSec);
    const nx = dx / d;
    const ny = dy / d;

    const desired = { x: this.body.x + nx * step, y: this.body.y + ny * step };
    const moved = this.tryMove(desired, isWalkable) || this.tryMove({ x: desired.x, y: this.body.y }, isWalkable) || this.tryMove({ x: this.body.x, y: desired.y }, isWalkable);
    if (!moved && this.task.pathIndex < this.task.path.length - 1) {
      this.task = { ...this.task, pathIndex: this.task.pathIndex + 1 };
    }
  }

  private applySeparation(dtSec: number, units: Villager[], isWalkable: (point: Vec2) => boolean) {
    let sx = 0;
    let sy = 0;
    for (const other of units) {
      if (other === this) continue;
      const dx = this.body.x - other.body.x;
      const dy = this.body.y - other.body.y;
      const d = Math.hypot(dx, dy);
      if (d <= 0.001 || d >= UNIT_SOFT_SEPARATION_RADIUS) continue;
      const push = (UNIT_SOFT_SEPARATION_RADIUS - d) / UNIT_SOFT_SEPARATION_RADIUS;
      sx += (dx / d) * push;
      sy += (dy / d) * push;
    }

    const force = Math.hypot(sx, sy);
    if (force <= 0.001) return;
    const step = Math.min(UNIT_SOFT_SEPARATION_STRENGTH * dtSec, force * 14);
    this.tryMove({ x: this.body.x + (sx / force) * step, y: this.body.y + (sy / force) * step }, isWalkable);
  }

  private tryMove(next: Vec2, isWalkable: (point: Vec2) => boolean) {
    const clamped = {
      x: clamp(next.x, VILLAGER_RADIUS, this.scene.scale.width + 100000),
      y: clamp(next.y, VILLAGER_RADIUS, this.scene.scale.height + 100000),
    };
    if (!isWalkable(clamped)) return false;
    this.body.setPosition(clamped.x, clamped.y);
    return true;
  }

  private syncVisuals() {
    this.selection.setPosition(this.body.x, this.body.y);
    this.label.setPosition(this.body.x, this.body.y - 31);
    if (this.selected) this.drawMoveLine();
  }

  private drawMoveLine() {
    this.moveLine.clear();
    if (!this.selected || this.task.kind !== "move") return;
    this.moveLine.lineStyle(1, 0x9fffd0, 0.38);
    this.moveLine.beginPath();
    this.moveLine.moveTo(this.body.x, this.body.y);
    for (let i = this.task.pathIndex; i < this.task.path.length; i++) {
      this.moveLine.lineTo(this.task.path[i].x, this.task.path[i].y);
    }
    this.moveLine.strokePath();
  }
}

