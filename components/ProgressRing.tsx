"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number;       // 0-100
  size?: number;       // px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  color = "#7c3aed",
  trackColor,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  const trackFill = trackColor ?? "rgba(148,163,184,0.15)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackFill}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>

      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && (
            <span className="text-lg font-bold leading-none text-slate-900 dark:text-white">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
