"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";

export interface LoadingPlanProps {
  /** 큰 제목. 기본 "당신만의 플랜을 만들고 있어요" */
  title?: string;
  /** 순환하는 보조 문구 */
  messages?: string[];
  /** 문구 교체 간격(ms). 기본 1400 */
  intervalMs?: number;
  className?: string;
}

const DEFAULT_MESSAGES = [
  "답변을 꼼꼼히 읽고 있어요",
  "수준에 맞는 강의를 고르는 중이에요",
  "검증된 강사만 추려내고 있어요",
  "학습 순서를 정리하고 있어요",
];

const ORBIT = ["📚", "🤖", "💡", "🎯"];
const ORBIT_POS = ["left-1/2 top-0", "left-full top-1/2", "left-1/2 top-full", "left-0 top-1/2"];

/** 진단 → 결과 사이 "플랜 만드는 중" 연출 */
export function LoadingPlan({
  title = "당신만의 플랜을 만들고 있어요",
  messages = DEFAULT_MESSAGES,
  intervalMs = 1400,
  className,
}: LoadingPlanProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), intervalMs);
    return () => window.clearInterval(id);
  }, [messages.length, intervalMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-1 flex-col items-center justify-center px-2 py-16 text-center", className)}
    >
      <div className="relative mb-10 size-40" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-primary-soft" />
        <div className="absolute inset-5 rounded-full bg-surface shadow-lg" />
        <div className="absolute inset-0 flex items-center justify-center text-5xl animate-float">✨</div>
        <div className="absolute inset-0 animate-orbit">
          {ORBIT.map((e, i) => (
            <span key={e} className={cn("absolute -translate-x-1/2 -translate-y-1/2", ORBIT_POS[i])}>
              <span className="flex size-10 items-center justify-center rounded-full bg-surface text-xl shadow-md animate-orbit [animation-direction:reverse]">
                {e}
              </span>
            </span>
          ))}
        </div>
      </div>
      <h2 className="text-[22px] font-bold tracking-[-0.02em] text-fg text-balance">{title}</h2>
      <p key={index} className="mt-3 min-h-6 animate-fade-up text-[15px] text-fg-muted">
        {messages[index]}
      </p>
      <div className="mt-8 flex gap-1.5" aria-hidden="true">
        {messages.map((m, i) => (
          <span
            key={m}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-border-strong",
            )}
          />
        ))}
      </div>
    </div>
  );
}
