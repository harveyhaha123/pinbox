import { FLOOR_DEG, type FaceId } from "./axon";
import { renderFurnitureOnly } from "./draw-room";
import type { Pt } from "./homography";
export const GAME_CELL = 63;
export type GameAssetMeta = {
  kind: "dollhouse-furniture";
  projection: { type: "dimetric"; floorDeg: number; verticals: 90; vanishingPoints: 0; cell: number };
  tiles: { w: number; d: number; h: number };
  origin: { x: number; y: number };
  image: string;
  size: { w: number; h: number };
};
function trimSprite(canvas: HTMLCanvasElement, origin: Pt, pad = 2) {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width, h = canvas.height, data = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] < 10) continue;
    if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }
  if (maxX < minX) return { canvas, origin };
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
  const out = document.createElement("canvas");
  out.width = maxX - minX + 1; out.height = maxY - minY + 1;
  out.getContext("2d")!.drawImage(canvas, -minX, -minY);
  return { canvas: out, origin: { x: origin.x - minX, y: origin.y - minY } };
}
function downloadUrl(url: string, name: string) {
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
}
export function exportGameAsset(opts: {
  sourceData: ImageData; pins: Record<FaceId, Pt[]>; tilesW: number; tilesD: number; tilesH: number;
  rot: 0 | 90 | 180 | 270; warpMode?: "rigid" | "faces";
}): GameAssetMeta {
  const cell = GAME_CELL;
  const a = (FLOOR_DEG * Math.PI) / 180;
  const W = opts.rot === 90 || opts.rot === 270 ? opts.tilesD : opts.tilesW;
  const D = opts.rot === 90 || opts.rot === 270 ? opts.tilesW : opts.tilesD;
  const pad = 24;
  const raw = renderFurnitureOnly({ ...opts, scale: cell });
  const origin0 = { x: pad + cell * Math.cos(a) * D, y: pad + cell * opts.tilesH };
  const { canvas, origin } = trimSprite(raw, origin0);
  const w = opts.tilesW, d = opts.tilesD, h = opts.tilesH;
  const base = `furniture-${w}x${d}-h${h}`;
  const pngName = `${base}.png`;
  const meta: GameAssetMeta = {
    kind: "dollhouse-furniture",
    projection: { type: "dimetric", floorDeg: FLOOR_DEG, verticals: 90, vanishingPoints: 0, cell },
    tiles: { w, d, h },
    origin: { x: Math.round(origin.x * 10) / 10, y: Math.round(origin.y * 10) / 10 },
    image: pngName,
    size: { w: canvas.width, h: canvas.height },
  };
  downloadUrl(canvas.toDataURL("image/png"), pngName);
  const url = URL.createObjectURL(new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" }));
  window.setTimeout(() => { downloadUrl(url, `${base}.json`); URL.revokeObjectURL(url); }, 250);
  return meta;
}
