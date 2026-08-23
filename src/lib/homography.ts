export type Pt = { x: number; y: number };
function solve8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const d = M[col][col];
    if (Math.abs(d) < 1e-10) throw new Error("点可能共线，请重钉这一面");
    for (let j = col; j <= n; j++) M[col][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      for (let j = col; j <= n; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}
export function getHomography(src: Pt[], dst: Pt[]): number[] {
  if (src.length !== 4 || dst.length !== 4) throw new Error("需要四个点");
  const A: number[][] = []; const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]; const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  const h = solve8(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}
export function applyH(H: number[], x: number, y: number): Pt {
  const w = H[6] * x + H[7] * y + H[8];
  return { x: (H[0] * x + H[1] * y + H[2]) / w, y: (H[3] * x + H[4] * y + H[5]) / w };
}
export function pointInQuad(p: Pt, q: Pt[]): boolean {
  const tri = (a: Pt, b: Pt, c: Pt) => {
    const v0x = c.x - a.x, v0y = c.y - a.y, v1x = b.x - a.x, v1y = b.y - a.y, v2x = p.x - a.x, v2y = p.y - a.y;
    const dot00 = v0x * v0x + v0y * v0y, dot01 = v0x * v1x + v0y * v1y, dot02 = v0x * v2x + v0y * v2y, dot11 = v1x * v1x + v1y * v1y, dot12 = v1x * v2x + v1y * v2y;
    const inv = dot00 * dot11 - dot01 * dot01; if (Math.abs(inv) < 1e-12) return false;
    const u = (dot11 * dot02 - dot01 * dot12) / inv, v = (dot00 * dot12 - dot01 * dot02) / inv;
    return u >= -0.02 && v >= -0.02 && u + v <= 1.02;
  };
  return tri(q[0], q[1], q[2]) || tri(q[0], q[2], q[3]);
}
function sampleBilinear(data: Uint8ClampedArray, w: number, h: number, x: number, y: number): [number, number, number, number] | null {
  if (x < 0 || y < 0 || x >= w - 1 || y >= h - 1) return null;
  const x0 = Math.floor(x), y0 = Math.floor(y), dx = x - x0, dy = y - y0;
  const idx = (xx: number, yy: number) => (yy * w + xx) * 4;
  const i00 = idx(x0, y0), i10 = idx(x0 + 1, y0), i01 = idx(x0, y0 + 1), i11 = idx(x0 + 1, y0 + 1);
  const mix = (a: number, b: number, c: number, d: number) => a * (1 - dx) * (1 - dy) + b * dx * (1 - dy) + c * (1 - dx) * dy + d * dx * dy;
  return [mix(data[i00], data[i10], data[i01], data[i11]), mix(data[i00 + 1], data[i10 + 1], data[i01 + 1], data[i11 + 1]), mix(data[i00 + 2], data[i10 + 2], data[i01 + 2], data[i11 + 2]), mix(data[i00 + 3], data[i10 + 3], data[i01 + 3], data[i11 + 3])];
}
export function warpQuad(src: ImageData, srcQuad: Pt[], dest: ImageData, destQuad: Pt[]): void {
  const H = getHomography(destQuad, srcQuad);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of destQuad) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  const x0 = Math.max(0, Math.floor(minX) - 1), y0 = Math.max(0, Math.floor(minY) - 1);
  const x1 = Math.min(dest.width - 1, Math.ceil(maxX) + 1), y1 = Math.min(dest.height - 1, Math.ceil(maxY) + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!pointInQuad({ x, y }, destQuad)) continue;
    const s = applyH(H, x + 0.5, y + 0.5);
    const color = sampleBilinear(src.data, src.width, src.height, s.x, s.y);
    if (!color || color[3] < 8) continue;
    const di = (y * dest.width + x) * 4, a = color[3] / 255, ia = 1 - a;
    dest.data[di] = color[0] * a + dest.data[di] * ia;
    dest.data[di + 1] = color[1] * a + dest.data[di + 1] * ia;
    dest.data[di + 2] = color[2] * a + dest.data[di + 2] * ia;
    dest.data[di + 3] = Math.min(255, dest.data[di + 3] + color[3] * (1 - dest.data[di + 3] / 255));
  }
}
export function quadArea(q: Pt[]): number {
  let a = 0; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; a += q[i].x * q[j].y - q[j].x * q[i].y; } return Math.abs(a) / 2;
}
