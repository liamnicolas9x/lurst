import type { Vec2 } from "@shared/types/math";
import type { MapDefinition, MapObstacle } from "@shared/types/world";
import { PATHFINDING_CELL_SIZE, PATHFINDING_MAX_ITERATIONS, VILLAGER_RADIUS } from "@shared/constants/game";

type GridNode = {
  x: number;
  y: number;
  gx: number;
  gy: number;
  g: number;
  f: number;
  parent: GridNode | null;
};

export type HardObstacle = MapObstacle & { shape: "circle" | "rect" };

export class Pathfinder {
  private cols: number;
  private rows: number;
  private blocked: boolean[] = [];

  constructor(private map: MapDefinition, private cellSize = PATHFINDING_CELL_SIZE) {
    this.cols = Math.ceil(map.width / cellSize);
    this.rows = Math.ceil(map.height / cellSize);
    this.rebuild();
  }

  rebuild() {
    this.blocked = new Array(this.cols * this.rows).fill(false);
    for (let gy = 0; gy < this.rows; gy++) {
      for (let gx = 0; gx < this.cols; gx++) {
        const world = this.cellToWorld(gx, gy);
        this.blocked[this.key(gx, gy)] = this.map.obstacles.some((o) => this.isPointBlocked(world, VILLAGER_RADIUS + 7, o));
      }
    }
  }

  findPath(start: Vec2, target: Vec2): Vec2[] {
    const safeTarget = this.nearestOpenPoint(target) ?? this.nearestOpenPoint(start) ?? start;
    const startCell = this.worldToCell(start);
    const targetCell = this.worldToCell(safeTarget);
    if (!this.isCellOpen(startCell.gx, startCell.gy) || !this.isCellOpen(targetCell.gx, targetCell.gy)) return [safeTarget];
    if (startCell.gx === targetCell.gx && startCell.gy === targetCell.gy) return [safeTarget];

    const open: GridNode[] = [{ ...startCell, g: 0, f: this.heuristic(startCell, targetCell), parent: null }];
    const seen = new Map<number, GridNode>();
    const closed = new Set<number>();
    seen.set(this.key(startCell.gx, startCell.gy), open[0]);

    let iterations = 0;
    while (open.length > 0 && iterations++ < PATHFINDING_MAX_ITERATIONS) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;
      const currentKey = this.key(current.gx, current.gy);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);

      if (current.gx === targetCell.gx && current.gy === targetCell.gy) {
        return this.smoothPath(this.unwind(current), safeTarget);
      }

      for (const n of this.neighbors(current)) {
        const nKey = this.key(n.gx, n.gy);
        if (closed.has(nKey)) continue;
        const stepCost = n.gx !== current.gx && n.gy !== current.gy ? 1.4 : 1;
        const g = current.g + stepCost;
        const known = seen.get(nKey);
        if (known && known.g <= g) continue;
        const next: GridNode = {
          ...n,
          g,
          f: g + this.heuristic(n, targetCell),
          parent: current,
        };
        seen.set(nKey, next);
        open.push(next);
      }
    }

    return [safeTarget];
  }

  isWalkablePoint(point: Vec2, padding = VILLAGER_RADIUS) {
    if (point.x < padding || point.y < padding || point.x > this.map.width - padding || point.y > this.map.height - padding) return false;
    return !this.map.obstacles.some((o) => this.isPointBlocked(point, padding, o));
  }

  private nearestOpenPoint(point: Vec2): Vec2 | null {
    if (this.isWalkablePoint(point)) return point;
    const start = this.worldToCell(point);
    for (let radius = 1; radius < Math.max(this.cols, this.rows); radius++) {
      for (let gy = start.gy - radius; gy <= start.gy + radius; gy++) {
        for (let gx = start.gx - radius; gx <= start.gx + radius; gx++) {
          if (gx !== start.gx - radius && gx !== start.gx + radius && gy !== start.gy - radius && gy !== start.gy + radius) continue;
          if (!this.isCellOpen(gx, gy)) continue;
          return this.cellToWorld(gx, gy);
        }
      }
    }
    return null;
  }

  private neighbors(node: GridNode): GridNode[] {
    const result: GridNode[] = [];
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        if (ox === 0 && oy === 0) continue;
        const gx = node.gx + ox;
        const gy = node.gy + oy;
        if (!this.isCellOpen(gx, gy)) continue;
        if (ox !== 0 && gy !== node.gy && (!this.isCellOpen(node.gx + ox, node.gy) || !this.isCellOpen(node.gx, node.gy + oy))) continue;
        const world = this.cellToWorld(gx, gy);
        result.push({ ...world, gx, gy, g: 0, f: 0, parent: null });
      }
    }
    return result;
  }

  private smoothPath(path: Vec2[], finalTarget: Vec2) {
    const points = path.length > 0 ? path : [finalTarget];
    const smoothed: Vec2[] = [];
    let anchor = points[0];
    smoothed.push(anchor);
    for (let i = 2; i < points.length; i++) {
      if (!this.hasLineOfSight(anchor, points[i])) {
        anchor = points[i - 1];
        smoothed.push(anchor);
      }
    }
    if (this.hasLineOfSight(smoothed[smoothed.length - 1], finalTarget)) {
      smoothed.push(finalTarget);
    } else {
      smoothed.push(points[points.length - 1]);
    }
    return smoothed.slice(1);
  }

  private hasLineOfSight(a: Vec2, b: Vec2) {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(d / (this.cellSize * 0.5)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (!this.isWalkablePoint({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return false;
    }
    return true;
  }

  private unwind(node: GridNode) {
    const path: Vec2[] = [];
    let current: GridNode | null = node;
    while (current) {
      path.push({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path.reverse();
  }

  private isPointBlocked(point: Vec2, padding: number, obstacle: MapObstacle) {
    if (obstacle.shape === "circle" && typeof obstacle.r === "number") {
      return Math.hypot(point.x - obstacle.x, point.y - obstacle.y) <= obstacle.r + padding;
    }
    if (obstacle.shape === "rect" && typeof obstacle.w === "number" && typeof obstacle.h === "number") {
      return (
        point.x >= obstacle.x - padding &&
        point.x <= obstacle.x + obstacle.w + padding &&
        point.y >= obstacle.y - padding &&
        point.y <= obstacle.y + obstacle.h + padding
      );
    }
    return false;
  }

  private worldToCell(point: Vec2) {
    const gx = Math.max(0, Math.min(this.cols - 1, Math.floor(point.x / this.cellSize)));
    const gy = Math.max(0, Math.min(this.rows - 1, Math.floor(point.y / this.cellSize)));
    const world = this.cellToWorld(gx, gy);
    return { ...world, gx, gy };
  }

  private cellToWorld(gx: number, gy: number): Vec2 {
    return {
      x: Math.min(this.map.width - VILLAGER_RADIUS, gx * this.cellSize + this.cellSize * 0.5),
      y: Math.min(this.map.height - VILLAGER_RADIUS, gy * this.cellSize + this.cellSize * 0.5),
    };
  }

  private isCellOpen(gx: number, gy: number) {
    return gx >= 0 && gy >= 0 && gx < this.cols && gy < this.rows && !this.blocked[this.key(gx, gy)];
  }

  private key(gx: number, gy: number) {
    return gy * this.cols + gx;
  }

  private heuristic(a: { gx: number; gy: number }, b: { gx: number; gy: number }) {
    return Math.hypot(a.gx - b.gx, a.gy - b.gy);
  }
}
