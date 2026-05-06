import Phaser from "phaser";
import { clamp } from "@shared/types/math";

export class DayNightTint {
  private overlay: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, world: { w: number; h: number }) {
    this.overlay = scene.add.rectangle(0, 0, world.w, world.h, 0x0b1020, 0.0);
    this.overlay.setOrigin(0, 0);
    this.overlay.setDepth(1000);
    this.overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  update() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const t = minutes / (24 * 60);

    const nightCenter = 0.02;
    const dayCenter = 0.52;

    const nightDist = Math.min(Math.abs(t - nightCenter), 1 - Math.abs(t - nightCenter));
    const dayDist = Math.min(Math.abs(t - dayCenter), 1 - Math.abs(t - dayCenter));

    const nightness = clamp((dayDist - nightDist + 0.22) / 0.44, 0, 1);
    const alpha = 0.06 + 0.34 * nightness;
    this.overlay.setFillStyle(0x0b1020, alpha);
  }
}

