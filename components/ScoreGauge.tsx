"use client";

import { useEffect, useState } from "react";

const CX = 120;
const CY = 118;
const R = 98;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

function useAnimatedValue(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : durationMs;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

export function ScoreGauge({ score, answered }: { score: number; answered: number }) {
  const value = useAnimatedValue(score);
  const angle = Math.PI - (Math.PI * value) / 100;
  const markerX = CX + R * Math.cos(angle);
  const markerY = CY - R * Math.sin(angle);

  return (
    <div className="relative">
      <svg viewBox="0 0 240 132" className="mx-auto w-full max-w-[18.125rem]" role="img" aria-label={`Fertility score ${score} out of 100`}>
        <defs>
          <linearGradient id="gauge-fill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#7fb2e6" />
            <stop offset="100%" stopColor="#1d4f9c" />
          </linearGradient>
        </defs>
        <path d={ARC} fill="none" stroke="#e9ecf1" strokeWidth="16" strokeLinecap="round" />
        <path
          d={ARC}
          fill="none"
          stroke="url(#gauge-fill)"
          strokeWidth="16"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${Math.max(value, 0.01)} 100`}
        />
        <circle cx={markerX} cy={markerY} r="11" fill="#1677e5" stroke="#fff" strokeWidth="3.5" />
      </svg>
      <div className="absolute inset-x-0 top-[48%] text-center">
        <p className="text-[2.875rem] font-bold leading-none text-[#2d3748]">{Math.round(value)}</p>
      </div>
      <div className="mt-1 flex justify-between px-1 text-[0.875rem] text-ink">
        <span>Healthier</span>
        <span>Take help</span>
      </div>
      <p className="mt-2 text-center text-[0.8125rem] text-muted">Based on the {answered} answers</p>
      <ul className="mt-3 flex items-center justify-center gap-3 text-[0.75rem] text-ink">
        <li className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1677e5]" /> Low
        </li>
        <li className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1d4f9c]" /> Moderate
        </li>
        <li className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> High
        </li>
      </ul>
    </div>
  );
}
