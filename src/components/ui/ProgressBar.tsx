import { cn } from "./cn";

export interface ProgressBarProps {
  /** 현재 값 (0..max) */
  value: number;
  /** 최댓값. 기본 100 */
  max?: number;
  /** 스크린리더용 라벨. 기본 "진행률" */
  label?: string;
  /** aria-valuetext. 예: "5단계 중 2단계" */
  valueText?: string;
  className?: string;
}

/** 헤어라인 진행 바 (잉크색 채움) */
export function ProgressBar({ value, max = 100, label = "진행률", valueText, className }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const pct = max > 0 ? (clamped / max) * 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
      className={cn("h-[2px] w-full overflow-hidden rounded-full bg-border", className)}
    >
      <div className="h-full bg-ink transition-[width] duration-400 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}
