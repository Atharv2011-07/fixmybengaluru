import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Dot = { x: number; y: number; tx: number; ty: number; r: number; c: string; d: number };

const PALETTE = [
  "oklch(0.62 0.25 27)", // red
  "oklch(0.7 0.18 50)", // orange
  "oklch(0.82 0.16 95)", // amber
  "oklch(0.64 0.16 150)", // green
  "oklch(0.99 0.01 20)", // white
];

function buildDots(w: number, h: number): Dot[] {
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const big = Math.min(w * 0.16, 150);
  ctx.font = `900 ${big}px "Sora", system-ui, sans-serif`;
  ctx.fillText("NAMMA", w / 2, h / 2 - big * 0.55);
  ctx.fillText("BENGALURU", w / 2, h / 2 + big * 0.55);
  const img = ctx.getImageData(0, 0, w, h).data;
  const dots: Dot[] = [];
  const gap = Math.max(5, Math.floor(big / 22));
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (img[(y * w + x) * 4 + 3] > 128) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          tx: x + (Math.random() - 0.5) * gap,
          ty: y + (Math.random() - 0.5) * gap,
          r: gap * (0.32 + Math.random() * 0.22),
          c: PALETTE[(Math.random() * PALETTE.length) | 0],
          d: Math.random() * 0.5,
        });
      }
    }
  }
  return dots;
}

export function CityIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const dots = buildDots(w, h);

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const dot of dots) {
        const p = Math.min(1, Math.max(0, (t - dot.d) / 1.1));
        const e = 1 - Math.pow(1 - p, 3);
        const x = dot.x + (dot.tx - dot.x) * e;
        const y = dot.y + (dot.ty - dot.y) * e;
        ctx.globalAlpha = 0.25 + e * 0.75;
        ctx.beginPath();
        ctx.arc(x, y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = dot.c;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const finish = setTimeout(() => setShow(false), 3400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finish);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[2000] overflow-hidden bg-[oklch(0.16_0.02_25)]"
        >
          {/* graffiti spray blobs */}
          <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-[radial-gradient(circle,oklch(0.62_0.25_27/0.45),transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 size-[28rem] rounded-full bg-[radial-gradient(circle,oklch(0.7_0.18_50/0.4),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(oklch(1_0_0)_1px,transparent_1px)] [background-size:22px_22px]" />

          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute inset-x-0 bottom-[18%] text-center font-display text-sm uppercase tracking-[0.4em] text-[oklch(0.82_0.16_95)] sm:text-base"
          >
            Report · Track · Resolve
          </motion.p>

          <button
            onClick={() => setShow(false)}
            className="absolute bottom-6 right-6 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
