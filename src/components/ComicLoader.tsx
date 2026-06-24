import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import panel1 from "@/assets/bengaluru-panel-1.jpg";
import panel2 from "@/assets/bengaluru-panel-2.jpg";
import panel3 from "@/assets/bengaluru-panel-3.jpg";

const PANELS = [panel1, panel2, panel3];

export function ComicLoader({
  message = "Loading",
  fullscreen = false,
}: {
  message?: string;
  fullscreen?: boolean;
}) {
  // Start deterministic for SSR/hydration, then randomize on the client.
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(Math.floor(Math.random() * PANELS.length)), []);
  const src = PANELS[idx];
  return (
    <div
      className={
        "comic-surface flex flex-col items-center justify-center gap-5 " +
        (fullscreen ? "fixed inset-0 z-[1500]" : "h-full w-full min-h-[240px]")
      }
    >
      <motion.div
        initial={{ rotate: -3, scale: 0.9 }}
        animate={{ rotate: [-3, 3, -3], y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="comic-panel w-28 sm:w-36"
      >
        <img src={src} alt="" width={1024} height={1024} className="block aspect-square w-full object-cover" />
      </motion.div>
      <div className="flex items-center gap-1.5">
        <span className="comic-tagline">{message}</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            className="size-1.5 rounded-full bg-[oklch(0.45_0.18_265)]"
          />
        ))}
      </div>
    </div>
  );
}
