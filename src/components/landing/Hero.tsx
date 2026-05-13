"use client";

import { useState, useEffect, useRef } from "react";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const dur = 2000;

    function tick(now: number) {
      const t = Math.min((now - start) / dur, 1);
      setVal(Math.round(from + (target - from) * t));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return <>{val}{suffix}</>;
}

function JitterValue({ base, spread = 5, prefix = "", suffix = "" }: { base: number; spread?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(base);

  useEffect(() => {
    const iv = setInterval(() => {
      const delta = Math.floor(Math.random() * spread * 2 - spread);
      setVal(Math.max(0, base + delta));
    }, 2800 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, [base, spread]);

  return <>{prefix}{val}{suffix}</>;
}

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs font-medium text-red-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Live risk simulation
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
            See the money you are about to lose — before it happens.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
            UGZIO simulates your store in real time and shows risky orders before delivery fails.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/overview?demo=true"
              className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
            >
              Try Live Simulation
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-400/80">Live</span>
            </div>
            <span className="text-[10px] text-zinc-500 tracking-tight">Boutique Sidi Bou Said — Live Simulation</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-[10px] text-red-400/70 uppercase tracking-wider font-medium">At risk</p>
              <p className="text-lg font-bold text-red-400 mt-0.5">
                <AnimatedNumber target={347} suffix=" TND" />
              </p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-[10px] text-amber-400/70 uppercase tracking-wider font-medium">Orders</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">
                <AnimatedNumber target={12} />
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Risk avg</p>
              <p className="text-lg font-bold text-zinc-100 mt-0.5">
                <JitterValue base={47} spread={4} suffix="%" />
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span className="text-sm text-zinc-200">Ahmed B.</span>
                <span className="text-[10px] text-zinc-500">240 TND</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-red-400">Risk 89%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="text-sm text-zinc-200">Sarra M.</span>
                <span className="text-[10px] text-zinc-500">180 TND</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-amber-400">Risk 62%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span className="text-sm text-zinc-200">Karim J.</span>
                <span className="text-[10px] text-zinc-500">320 TND</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-red-400">Risk 78%</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <a
              href="/overview?demo=true"
              className="flex-1 rounded-lg bg-purple-600 px-3 py-2.5 text-center text-xs font-medium text-white hover:bg-purple-500 transition-colors"
            >
              Enter Simulation Mode
            </a>
            <a
              href="/overview?demo=true"
              className="flex-1 rounded-lg border border-zinc-700 px-3 py-2.5 text-center text-xs font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              Full overview &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
