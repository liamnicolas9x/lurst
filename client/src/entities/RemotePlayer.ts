import Phaser from "phaser";
import type { PlayerId } from "@shared/types/ids";
import type { Vec2 } from "@shared/types/math";

export class RemotePlayerMarker {
  readonly playerId: PlayerId;
  private dot: Phaser.GameObjects.Arc;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, opts: { playerId: PlayerId; displayName: string; color: number; pos: Vec2 }) {
    this.playerId = opts.playerId;
    this.dot = scene.add.circle(opts.pos.x, opts.pos.y, 10, opts.color, 1);
    this.dot.setDepth(8);
    this.label = scene.add.text(opts.pos.x + 12, opts.pos.y - 10, opts.displayName, {
      fontFamily: "ui-sans-serif, system-ui",
      fontSize: "12px",
      color: "#d4d4d8",
      backgroundColor: "rgba(0,0,0,0.0)",
    });
    this.label.setDepth(8);
  }

  setPos(pos: Vec2) {
    this.dot.setPosition(pos.x, pos.y);
    this.label.setPosition(pos.x + 12, pos.y - 10);
  }

  destroy() {
    this.dot.destroy();
    this.label.destroy();
  }
}

