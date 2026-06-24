import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import panel1 from "@/assets/bengaluru-panel-1.jpg";
import panel2 from "@/assets/bengaluru-panel-2.jpg";
import panel3 from "@/assets/bengaluru-panel-3.jpg";

const PANELS = [
  { src: panel1, label: "Vidhana Soudha", rotate: -2.5 },
  { src: panel2, label: "Filter Coffee & Dosa", rotate: 1.8 },
  { src: panel3, label: "Namma City", rotate: -1.2 },
];

export function CityIntro({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="comic-surface fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: -24, skewX: -6 }}
            animate={{ opacity: 1, y: 0, skewX: 0 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="comic-title text-center text-4xl leading-none sm:text-6xl"
          >
            NAMMA BENGALURU
          </motion.h1>

          <div className="mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-3 sm:gap-5">
            {PANELS.map((p, i) => (
              <motion.figure
                key={p.label}
                initial={{ opacity: 0, y: 60, scale: 0.85, rotate: p.rotate * 4 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: p.rotate }}
                transition={{ delay: 0.35 + i * 0.28, type: "spring", stiffness: 220, damping: 18 }}
                className="comic-panel w-[8.5rem] sm:w-56"
              >
                <img
                  src={p.src}
                  alt={p.label}
                  width={1024}
                  height={1024}
                  className="block aspect-square w-full object-cover"
                />
                <figcaption className="comic-caption">{p.label}</figcaption>
              </motion.figure>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="comic-tagline mt-8"
          >
            Report · Track · Resolve
          </motion.p>

          <button
            onClick={() => setShow(false)}
            className="absolute bottom-6 right-6 rounded-full border-2 border-[oklch(0.32_0.12_265)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[oklch(0.32_0.12_265)] transition-transform hover:scale-105"
          >
            Skip ›
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
