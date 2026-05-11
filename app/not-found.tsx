"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Construction, Ruler } from "lucide-react";
import ThemeToggle from "@/components/theme/theme-toggle";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/30 font-mono relative">
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      {/* 1. The Blueprint Grid (Static) - Reduced opacity for light mode */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 bg-[linear-gradient(to_right,#1e3a8a_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a_1px,transparent_1px)] bg-size-[50px_50px]" />
      {/* 2. Drifting Structural Lines (Animated) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -100 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              x: ["0%", "100%"],
              y: Math.random() * 100 + "%",
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
            className="absolute h-px w-full bg-primary/40 flex items-center justify-between px-4"
          >
            <span className="text-[8px] -translate-y-2">
              COORD_X: {Math.random().toFixed(4)}
            </span>
            <span className="text-[8px] -translate-y-2 text-red-500/50">
              FAULT_DETECTED
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-2xl px-6"
      >
        {/* Technical Icon Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px]" />
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative border border-primary/30 p-12 rounded-lg bg-card/40 backdrop-blur-md"
          >
            <Construction className="h-24 w-24 text-primary" strokeWidth={1} />
            {/* Architectural Ruler Detail */}
            <div className="absolute -bottom-4 -right-4 flex items-center gap-1 bg-primary px-3 py-1 text-[10px] font-black text-primary-foreground">
              <Ruler className="h-3 w-3" />
              STRUCTURAL_FAIL
            </div>
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-500 uppercase tracking-widest">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Warning: Invalid Coordinate
          </div>
          <h1 className="text-4xl font-black tracking-tighter sm:text-6xl uppercase">
            Error <span className="text-primary">404</span>
          </h1>
          <h2 className="text-xl font-medium text-foreground/80">
            Structural failure in the URL.
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            The requested resource could not be located. Please verify the URL
            path integrity or return to the dashboard for proper navigation.
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex justify-center w-full max-w-xs mx-auto">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Footer Data */}
        <div className="pt-8 text-[10px] text-muted-foreground/30 flex gap-4 uppercase font-bold">
          <span>Sys: Estate_Scraper_v4</span>
          <span>Env: Production</span>
          <span className="text-red-500/50">Status: Path_Integrity_Null</span>
        </div>
      </motion.div>
    </div>
  );
}
