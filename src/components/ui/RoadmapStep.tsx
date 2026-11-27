import type { ReactNode } from "react";
import { cn } from "./cn";

export interface RoadmapStepProps {
  /** 단계 번호 */
  step: number;
  /** 단계 이름. 예: "기초 다지기" */
  label: ReactNode;
  /** 단계 설명(선택) */
  description?: ReactNode;
  /** 마지막 단계면 연결선 숨김 */
  isLast?: boolean;
  children?: ReactNode;
  className?: string;
}

/** 세로 타임라인형 로드맵 단계. <ol> 안에 나열하세요 */
export function RoadmapStep({ step, label, description, isLast = false, children, className }: RoadmapStepProps) {
  return (
    <li className={cn("relative flex gap-4", className)}>
      <div className="flex flex-col items-center" aria-hidden="true">
        <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-fg shadow-cta ring-4 ring-bg">
          {step}
        </span>
        {!isLast && <span className="mt-1 w-0.5 flex-1 rounded-full bg-gradient-to-b from-primary/60 to-border" />}
      </div>
      <div className={cn("min-w-0 flex-1", isLast ? "pb-2" : "pb-8")}>
        <h3 className="pt-1 text-lg font-bold text-fg">
          <span className="sr-only">{step}단계: </span>
          {label}
        </h3>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
        {children && <div className="mt-4 flex flex-col gap-4">{children}</div>}
      </div>
    </li>
  );
}
