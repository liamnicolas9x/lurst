import Phaser from "phaser";
import {
  CAMERA_EDGE_PX,
  CAMERA_MAX_ZOOM,
  CAMERA_MIN_ZOOM,
  CAMERA_SMOOTHING,
  CAMERA_SPEED_PX_PER_SEC,
  CAMERA_ZOOM_SMOOTHING,
  CAMERA_ZOOM_STEP,
} from "@shared/constants/game";
import { clamp } from "@shared/types/math";

export class RtsCameraController {
  private targetZoom = 1;
  private keys: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up2: Phaser.Input.Keyboard.Key;
    left2: Phaser.Input.Keyboard.Key;
    down2: Phaser.Input.Keyboard.Key;
    right2: Phaser.Input.Keyboard.Key;
  } | null = null;

  constructor(private scene: Phaser.Scene, private camera: Phaser.Cameras.Scene2D.Camera, private world: { w: number; h: number }) {
    this.targetZoom = camera.zoom;
    const k = scene.input.keyboard;
    if (k) {
      this.keys = k.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        up2: Phaser.Input.Keyboard.KeyCodes.UP,
        left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
        down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
        right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      }) as unknown as {
        up: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
        up2: Phaser.Input.Keyboard.Key;
        left2: Phaser.Input.Keyboard.Key;
        down2: Phaser.Input.Keyboard.Key;
        right2: Phaser.Input.Keyboard.Key;
      };
    }
    scene.input.on("wheel", (_p: unknown, _go: unknown, _dx: number, dy: number) => {
      const dir = dy > 0 ? -1 : 1;
      const next = this.targetZoom + dir * CAMERA_ZOOM_STEP;
      this.targetZoom = clamp(next, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
    });
  }

  update(dtSec: number) {
    const cam = this.camera;
    const pointer = this.scene.input.activePointer;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    let vx = 0;
    let vy = 0;
    if (pointer.x <= CAMERA_EDGE_PX) vx -= 1;
    if (pointer.x >= w - CAMERA_EDGE_PX) vx += 1;
    if (pointer.y <= CAMERA_EDGE_PX) vy -= 1;
    if (pointer.y >= h - CAMERA_EDGE_PX) vy += 1;

    if (this.keys) {
      if (this.keys.up.isDown || this.keys.up2.isDown) vy -= 1;
      if (this.keys.down.isDown || this.keys.down2.isDown) vy += 1;
      if (this.keys.left.isDown || this.keys.left2.isDown) vx -= 1;
      if (this.keys.right.isDown || this.keys.right2.isDown) vx += 1;
    }

    const speed = CAMERA_SPEED_PX_PER_SEC * dtSec;
    const desiredScrollX = cam.scrollX + vx * speed;
    const desiredScrollY = cam.scrollY + vy * speed;

    const viewW = cam.width / cam.zoom;
    const viewH = cam.height / cam.zoom;
    const maxX = Math.max(0, this.world.w - viewW);
    const maxY = Math.max(0, this.world.h - viewH);

    const clampedX = clamp(desiredScrollX, 0, maxX);
    const clampedY = clamp(desiredScrollY, 0, maxY);

    cam.scrollX = Phaser.Math.Linear(cam.scrollX, clampedX, 1 - Math.pow(1 - CAMERA_SMOOTHING, dtSec * 60));
    cam.scrollY = Phaser.Math.Linear(cam.scrollY, clampedY, 1 - Math.pow(1 - CAMERA_SMOOTHING, dtSec * 60));

    cam.zoom = Phaser.Math.Linear(cam.zoom, this.targetZoom, 1 - Math.pow(1 - CAMERA_ZOOM_SMOOTHING, dtSec * 60));
    cam.zoom = clamp(cam.zoom, CAMERA_MIN_ZOOM, CAMERA_MAX_ZOOM);
  }
}

