"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 0.8,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = prevValue.current;
    prevValue.current = value;

    const controls = animate(from, value, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
