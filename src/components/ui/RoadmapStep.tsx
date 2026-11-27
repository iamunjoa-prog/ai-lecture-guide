import type { ReactNode } from "react";
import { cn } from "./cn";

export interface RoadmapStepProps {
  /** 단계 번호 */
  step: number;
  /** 단계 이름. 예: "기초 다지기" */
  label: ReactNode;
  /** 단계 설명(선택) */
  description?: ReactNode;
  /** 첫 단계면 위쪽 헤어라인 숨김 */
  isFirst?: boolean;
  /** (호환용) 마지막 단계 여부 */
  isLast?: boolean;
  children?: ReactNode;
  className?: string;
}

/** 로드맵 한 단계: 큰 얇은 숫자 "01" + 단계 이름 + 강의 카드들. <ol> 안에 나열하세요 */
export function RoadmapStep({ step, label, description, isFirst = false, children, className }: RoadmapStepProps) {
  const num = String(step).padStart(2, "0");
  return (
    <li className={cn("py-12", !isFirst && "border-t border-border", isFirst && "pt-4", className)}>
      <span aria-hidden="true" className="block text-[64px] leading-none font-extralight tracking-[-0.05em] text-fg tabular-nums">
        {num}
      </span>
      <h3 className="mt-5 text-[24px] font-bold tracking-[-0.03em] text-fg">
        <span className="sr-only">{step}단계: </span>
        {label}
      </h3>
      {description && <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{description}</p>}
      {children && <div className="mt-8 flex flex-col gap-5">{children}</div>}
    </li>
  );
}
