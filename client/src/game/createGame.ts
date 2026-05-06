import Phaser from "phaser";
import { BootScene } from "@/scenes/BootScene";
import { WorldScene } from "@/scenes/WorldScene";
import type { MultiplayerClient } from "@/network/multiplayer/MultiplayerClient";
import type { PlayerId } from "@shared/types/ids";
import type { UserMode } from "@shared/types/world";

export type CreateGameOptions = {
  parent: HTMLElement;
  mode: UserMode;
  playerId: PlayerId;
  displayName: string;
  multiplayer: MultiplayerClient;
};

export function createGame(opts: CreateGameOptions) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: opts.parent,
    backgroundColor: "#0a0f0d",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
    fps: {
      target: 60,
      forceSetTimeOut: true,
    },
    scene: [
      new BootScene(),
      new WorldScene({
        mode: opts.mode,
        playerId: opts.playerId,
        displayName: opts.displayName,
        multiplayer: opts.multiplayer,
      }),
    ],
  });

  return game;
}

