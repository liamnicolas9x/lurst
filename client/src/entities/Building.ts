import Phaser from "phaser";
import { BUILDING_SPECS } from "@shared/buildings/buildingCatalog";
import type { BuildingState } from "@shared/types/world";

export class Building {
  private base: Phaser.GameObjects.Rectangle;
  private outline: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private progressBack: Phaser.GameObjects.Rectangle;
  private progressFill: Phaser.GameObjects.Rectangle;
  private scaffold: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene, private state: BuildingState) {
    const spec = BUILDING_SPECS[state.kind];
    const centerX = state.pos.x + state.w / 2;
    const centerY = state.pos.y + state.h / 2;
    this.base = scene.add.rectangle(centerX, centerY, state.w, state.h, 0x7c5a33, 0.9).setDepth(6);
    this.outline = scene.add.rectangle(centerX, centerY, state.w, state.h).setDepth(7);
    this.label = scene.add
      .text(centerX, state.pos.y - 14, spec.label, {
        color: "#f5f5f4",
        fontFamily: "Arial",
        fontSize: "12px",
        stroke: "#0b0f0c",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);
    this.progressBack = scene.add.rectangle(centerX, state.pos.y + state.h + 9, state.w * 0.72, 5, 0x0b0f0c, 0.85).setDepth(12);
    this.progressFill = scene.add.rectangle(centerX - (state.w * 0.72) / 2, state.pos.y + state.h + 9, 1, 5, 0x86efac, 0.95).setOrigin(0, 0.5).setDepth(13);
    this.scaffold = scene.add.graphics().setDepth(11);
    this.render();
  }

  destroy() {
    this.base.destroy();
    this.outline.destroy();
    this.label.destroy();
    this.progressBack.destroy();
    this.progressFill.destroy();
    this.scaffold.destroy();
  }

  update(dtSec: number, speedMultiplier: number) {
    if (this.state.phase !== "construction") return;
    const elapsed = Math.min(this.state.constructionDurationMs, this.state.constructionElapsedMs + dtSec * 1000 * speedMultiplier);
    this.state = {
      ...this.state,
      constructionElapsedMs: elapsed,
      phase: elapsed >= this.state.constructionDurationMs ? "completed" : "construction",
      hp: Math.max(1, Math.round((elapsed / this.state.constructionDurationMs) * this.state.maxHp)),
      updatedAt: Date.now(),
    };
    this.render();
  }

  getState() {
    return this.state;
  }

  getObstacle() {
    return {
      id: this.state.id,
      kind: "blocked" as const,
      shape: "rect" as const,
      x: this.state.pos.x,
      y: this.state.pos.y,
      w: this.state.w,
      h: this.state.h,
    };
  }

  private render() {
    const progress = this.state.constructionDurationMs > 0 ? this.state.constructionElapsedMs / this.state.constructionDurationMs : 1;
    const isDone = this.state.phase === "completed";
    const fill = this.state.kind === "townCenter" ? 0x8b6f47 : 0x6f5538;
    const roof = this.state.kind === "townCenter" ? 0x4d2f22 : 0x7a3326;
    this.base.setFillStyle(isDone ? fill : 0x6b5a44, isDone ? 1 : 0.72);
    this.base.setStrokeStyle(2, isDone ? 0x211812 : 0xd6b56d, isDone ? 0.95 : 0.75);
    this.outline.setStrokeStyle(1, isDone ? 0xf5e6b6 : 0x86efac, isDone ? 0.35 : 0.75);
    this.progressBack.setVisible(!isDone);
    this.progressFill.setVisible(!isDone);
    this.progressFill.width = Math.max(1, this.state.w * 0.72 * progress);
    this.label.setText(isDone ? BUILDING_SPECS[this.state.kind].label : `${BUILDING_SPECS[this.state.kind].label} ${Math.floor(progress * 100)}%`);

    this.scaffold.clear();
    if (isDone) {
      this.scaffold.fillStyle(roof, 0.9);
      this.scaffold.fillRect(this.state.pos.x + 10, this.state.pos.y + 10, this.state.w - 20, Math.max(18, this.state.h * 0.28));
      this.scaffold.lineStyle(2, 0x2f2118, 0.9);
      this.scaffold.strokeRect(this.state.pos.x + 12, this.state.pos.y + this.state.h * 0.45, this.state.w - 24, this.state.h * 0.34);
      return;
    }

    this.scaffold.lineStyle(2, 0xfacc15, 0.75);
    const x = this.state.pos.x;
    const y = this.state.pos.y;
    this.scaffold.strokeLineShape(new Phaser.Geom.Line(x + 8, y + 8, x + this.state.w - 8, y + this.state.h - 8));
    this.scaffold.strokeLineShape(new Phaser.Geom.Line(x + this.state.w - 8, y + 8, x + 8, y + this.state.h - 8));
    this.scaffold.strokeRect(x + 8, y + 8, this.state.w - 16, this.state.h - 16);
  }
}
