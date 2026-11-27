"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./cn";

export interface RevealProps {
  children: ReactNode;
  /** 등장 지연(ms) — 같은 화면 안에서 순서대로 보이게 할 때 */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}

/**
 * 화면에 들어올 때 살짝(8px) 떠오르며 나타난다.
 * JS가 없거나 '동작 줄이기' 설정이면 처음부터 보인다(globals.css 참고).
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal={shown ? "shown" : "hidden"}
      className={cn(className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
