"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "./cn";

export interface LoadingPlanProps {
  /** 차례로 바뀌는 한 줄 문구 */
  messages?: string[];
  /** 전체 연출 시간(ms). 문구는 이 시간을 나눠 바뀐다. 기본 1200 */
  durationMs?: number;
  /** 있으면 "건너뛰기" 버튼을 보여 준다 */
  onSkip?: () => void;
  className?: string;
}

const DEFAULT_MESSAGES = ["수준을 분석하고 있어요", "강의를 고르고 있어요", "로드맵을 정리하고 있어요"];

/** 진단 → 결과 사이의 어두운 키노트 슬라이드. 한 줄 문구 + 얇은 진행선 */
export function LoadingPlan({ messages = DEFAULT_MESSAGES, durationMs = 1200, onSkip, className }: LoadingPlanProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const step = durationMs / messages.length;
    const id = window.setInterval(() => setIndex((i) => Math.min(i + 1, messages.length - 1)), step);
    return () => window.clearInterval(id);
  }, [messages.length, durationMs]);

  return (
    <div className={cn("flex flex-1 flex-col justify-center py-16", className)}>
      <p className="eyebrow mb-6 text-stage-muted">AI Lecture Guide</p>
      <div role="status" aria-live="polite" className="min-h-[2.4em]">
        <p key={index} className="display animate-fade-in text-[32px] text-stage-fg">
          {messages[index]}
        </p>
      </div>
      <div className="mt-10 h-px w-full overflow-hidden bg-stage-border" aria-hidden="true">
        <div
          className="progress-line h-full w-full bg-accent"
          style={{ "--progress-duration": `${durationMs}ms` } as CSSProperties}
        />
      </div>
      <p className="mt-4 text-[13px] text-stage-muted">선별된 유튜브 강의 중에서 고르고 있어요</p>
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-8 -ml-3 inline-flex min-h-11 min-w-11 items-center self-start rounded-full px-3 text-[15px] font-medium text-stage-muted underline underline-offset-4 transition-colors duration-200 hover:text-stage-fg"
        >
          건너뛰기
        </button>
      )}
    </div>
  );
}
