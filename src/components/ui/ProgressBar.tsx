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
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken", className)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-[color-mix(in_oklab,var(--primary)_70%,var(--accent))] transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
