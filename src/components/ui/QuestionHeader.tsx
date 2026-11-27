import type { ReactNode } from "react";
import { cn } from "./cn";

export interface QuestionHeaderProps {
  /** 작은 단계 라벨. 예: "AI 활용 수준 · 1/5" */
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
    <div className={cn("pt-8 pb-8", className)}>
      {stepLabel && <p className="eyebrow-ko mb-3 text-[13px] text-fg-muted">{stepLabel}</p>}
      <h1 id={id} className="display text-[30px] text-fg text-balance outline-none">
        {title}
      </h1>
      {helper && <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{helper}</p>}
    </div>
  );
}
