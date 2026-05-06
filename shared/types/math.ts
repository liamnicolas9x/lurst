export type Vec2 = { x: number; y: number };

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function dist(a: Vec2, b: Vec2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function len(v: Vec2) {
  return Math.hypot(v.x, v.y);
}

export function normalize(v: Vec2): Vec2 {
  const l = len(v);
  if (l <= 0.000001) return { x: 0, y: 0 };
  return { x: v.x / l, y: v.y / l };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

