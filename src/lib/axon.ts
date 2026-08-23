import type { Pt } from "./homography";

export const FLOOR_DEG = 25;
export const ROOM_W = 12;
export const ROOM_D = 10;
export const WALL_H = 7;
export type Vec3 = { x: number; y: number; z: number };

export function project(x: number, y: number, z: number, cell: number, yaw = 0): Pt {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x2 = x * cy - z * sy;
  const z2 = x * sy + z * cy;
  const a = (FLOOR_DEG * Math.PI) / 180;
  return { x: cell * Math.cos(a) * (x2 - z2), y: cell * Math.sin(a) * (x2 + z2) - cell * y };
}

export function originForRoom(canvasW: number, canvasH: number, cell: number): Pt {
  const back = project(0, 0, 0, cell);
  const right = project(ROOM_W, 0, 0, cell);
  const left = project(0, 0, ROOM_D, cell);
  const near = project(ROOM_W, 0, ROOM_D, cell);
  const top = project(0, WALL_H, 0, cell);
  const minX = Math.min(back.x, right.x, left.x, near.x);
  const maxX = Math.max(back.x, right.x, left.x, near.x);
  const minY = Math.min(back.y, right.y, left.y, near.y, top.y);
  const maxY = Math.max(back.y, right.y, left.y, near.y);
  const w = maxX - minX;
  const h = maxY - minY;
  return { x: (canvasW - w) / 2 - minX, y: (canvasH - h) / 2 - minY + 8 };
}

export function fitCell(canvasW: number, canvasH: number): number {
  const c = 40;
  const probe = (cell: number) => {
    const pts = [project(0, 0, 0, cell), project(ROOM_W, 0, 0, cell), project(0, 0, ROOM_D, cell), project(ROOM_W, 0, ROOM_D, cell), project(0, WALL_H, 0, cell)];
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  };
  const p = probe(c);
  const s = Math.min((canvasW - 56) / Math.max(p.w, 1), (canvasH - 56) / Math.max(p.h, 1));
  if (!Number.isFinite(s) || s <= 0) return 12;
  return Math.max(8, c * s);
}

export type FaceId = "bottom" | "front" | "side" | "top";
export const FACE_META: Record<FaceId, { label: string; hint: string; color: string; order: number }> = {
  bottom: { label: "底面", hint: "贴地的平行四边形", color: "#C45C26", order: 0 },
  front: { label: "正面", hint: "朝观众的左立面", color: "#3A5A78", order: 1 },
  side: { label: "侧面", hint: "朝观众的右立面", color: "#3D6B4F", order: 2 },
  top: { label: "顶面", hint: "可选 · 床垫/台面", color: "#8A6A4B", order: 3 },
};

export function boxCorners(posX: number, posZ: number, w: number, d: number, h: number, rot: 0 | 90 | 180 | 270): Record<string, Vec3> {
  let W = w, D = d;
  if (rot === 90 || rot === 270) { W = d; D = w; }
  const o = { x: posX, y: 0, z: posZ };
  return {
    o: { x: o.x, y: 0, z: o.z },
    x: { x: o.x + W, y: 0, z: o.z },
    z: { x: o.x, y: 0, z: o.z + D },
    xz: { x: o.x + W, y: 0, z: o.z + D },
    oy: { x: o.x, y: h, z: o.z },
    xy: { x: o.x + W, y: h, z: o.z },
    zy: { x: o.x, y: h, z: o.z + D },
    xzy: { x: o.x + W, y: h, z: o.z + D },
  };
}

export function faceWorldQuads(posX: number, posZ: number, w: number, d: number, h: number, rot: 0 | 90 | 180 | 270): Record<FaceId, Vec3[]> {
  const c = boxCorners(posX, posZ, w, d, h, rot);
  return {
    bottom: [c.o, c.x, c.xz, c.z],
    front: [c.z, c.xz, c.xzy, c.zy],
    side: [c.x, c.xz, c.xzy, c.xy],
    top: [c.oy, c.xy, c.xzy, c.zy],
  };
}

export function projectQuad(world: Vec3[], cell: number, origin: Pt, yaw: number): Pt[] {
  return world.map((v) => {
    const p = project(v.x, v.y, v.z, cell, yaw);
    return { x: p.x + origin.x, y: p.y + origin.y };
  });
}
