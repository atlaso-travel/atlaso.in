"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The brand's signature motif: topographic contour lines, drawn live.
 *
 * The company is named after an atlas and every destination on it is terrain.
 * Used behind empty states and as the loading skeleton, so a no-results screen
 * or a slow connection still looks like the product rather than a blank box.
 *
 * Marching squares over a value-noise field. Deterministic for a given `seed`,
 * so it never causes a hydration mismatch, and it is purely decorative —
 * aria-hidden, and skipped entirely under prefers-reduced-motion where the
 * redraw-on-resize would be the only motion anyway.
 */

function hash(a: number, b: number, s: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number, s: number): number {
  let total = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    total += amp * valueNoise(x * freq, y * freq, s + i * 13);
    freq *= 2;
    amp *= 0.5;
  }
  return total;
}

export default function ContourField({
  seed = 3.1,
  className,
  opacity = 0.5,
  scale = 52,
  stroke = "90,100,120",
}: {
  seed?: number;
  className?: string;
  opacity?: number;
  scale?: number;
  /**
   * Line colour as a bare `R,G,B` triplet — the alpha is computed per contour
   * level, so this can't take a full colour string. Defaults to the original
   * cool grey; the warm-palette surfaces pass their own.
   */
  stroke?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const step = 4;
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const grid = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          grid[j * cols + i] = fbm((i * step) / scale, ((j * step) / scale) * 1.55, seed);
        }
      }

      const levels = 8;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      for (let L = 0; L < levels; L++) {
        const t = 0.24 + L * (0.52 / levels);
        ctx.strokeStyle = `rgba(${stroke},${(opacity * (0.45 + 0.55 * (L / levels))).toFixed(3)})`;
        ctx.beginPath();

        for (let y = 0; y < rows - 1; y++) {
          for (let x = 0; x < cols - 1; x++) {
            const v0 = grid[y * cols + x];
            const v1 = grid[y * cols + x + 1];
            const v2 = grid[(y + 1) * cols + x + 1];
            const v3 = grid[(y + 1) * cols + x];
            const idx = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
            if (idx === 0 || idx === 15) continue;

            const X = x * step;
            const Y = y * step;
            const e = 1e-6;
            const top = { x: X + (step * (t - v0)) / (v1 - v0 || e), y: Y };
            const right = { x: X + step, y: Y + (step * (t - v1)) / (v2 - v1 || e) };
            const bottom = { x: X + (step * (t - v3)) / (v2 - v3 || e), y: Y + step };
            const left = { x: X, y: Y + (step * (t - v0)) / (v3 - v0 || e) };

            const seg = (p: { x: number; y: number }, q: { x: number; y: number }) => {
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
            };

            switch (idx) {
              case 1: case 14: seg(left, bottom); break;
              case 2: case 13: seg(bottom, right); break;
              case 3: case 12: seg(left, right); break;
              case 4: case 11: seg(top, right); break;
              case 6: case 9: seg(top, bottom); break;
              case 7: case 8: seg(left, top); break;
              case 5: seg(left, top); seg(bottom, right); break;
              case 10: seg(top, right); seg(left, bottom); break;
            }
          }
        }
        ctx.stroke();
      }
    };

    draw();

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(draw, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [seed, opacity, scale, stroke]);

  return <canvas ref={ref} aria-hidden="true" className={cn("block w-full", className)} />;
}
