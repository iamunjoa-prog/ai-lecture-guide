import type { ReactNode } from "react";
import { cn } from "./cn";

export interface QuestionHeaderProps {
  /** 작은 단계 라벨. 예: "질문 2" */
  stepLabel?: ReactNode;
  /** 큰 질문 제목 */
  title: ReactNode;
  /** 보조 설명 */
  helper?: ReactNode;
  /** 제목 h1의 id (OptionGroup labelledBy 연결용) */
  id?: string;
  className?: string;
}

export function QuestionHeader({ stepLabel, title, helper, id, className }: QuestionHeaderProps) {
  return (
    <div className={cn("animate-fade-up pt-6 pb-7", className)}>
      {stepLabel && <p className="mb-2 text-sm font-bold tracking-wide text-primary-soft-fg">{stepLabel}</p>}
      <h1 id={id} className="text-[26px] font-bold leading-[1.35] tracking-[-0.025em] text-fg text-balance">
        {title}
      </h1>
      {helper && <p className="mt-2.5 text-[15px] leading-relaxed text-fg-muted">{helper}</p>}
    </div>
  );
}
