import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import panel1 from "@/assets/bengaluru-panel-1.jpg";
import panel2 from "@/assets/bengaluru-panel-2.jpg";
import panel3 from "@/assets/bengaluru-panel-3.jpg";

const DURATION = 10000;

const PANELS = [
  { src: panel1, label: "Vidhana Soudha", rotate: -3 },
  { src: panel2, label: "Filter Coffee & Dosa", rotate: 2 },
  { src: panel3, label: "Namma City", rotate: -1.5 },
];

const WORDS = ["NAMMA", "BENGALURU"];
const TAGLINES = ["Report ·", "Track ·", "Resolve"];

export function CityIntro({ onDone }: { onDone: () => void }) {
  const [show, setShow] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const end = setTimeout(() => setShow(false), DURATION);
    const cycle = setInterval(() => setActive((a) => (a + 1) % PANELS.length), 1500);
    return () => {
      clearTimeout(end);
      clearInterval(cycle);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="comic-surface fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden px-4"
        >
          <h1 className="comic-title flex flex-wrap justify-center gap-x-4 text-center text-5xl leading-none sm:text-7xl">
            {WORDS.map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: -40, skewX: -10, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, skewX: 0, scale: 1 }}
                transition={{ delay: i * 0.18, type: "spring", stiffness: 400, damping: 16 }}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <div className="mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-3 sm:gap-6">
            {PANELS.map((p, i) => (
              <motion.figure
                key={p.label}
                initial={{ opacity: 0, y: 80, scale: 0.7, rotate: p.rotate * 5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: active === i ? 1.08 : 0.94,
                  rotate: p.rotate,
                }}
                transition={{
                  delay: 0.3 + i * 0.15,
                  type: "spring",
                  stiffness: 320,
                  damping: 18,
                }}
                className={`comic-panel w-[8.5rem] transition-shadow sm:w-60 ${
                  active === i ? "z-10" : "opacity-80"
                }`}
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

          <div className="comic-tagline mt-10 flex gap-2 text-xl sm:text-2xl">
            {TAGLINES.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.2, type: "spring", stiffness: 300 }}
              >
                {t}
              </motion.span>
            ))}
          </div>

          {/* progress bar */}
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-black/10">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: DURATION / 1000, ease: "linear" }}
              className="h-full bg-[oklch(0.32_0.12_265)]"
            />
          </div>

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
