import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * neutral 본문 위 헤어라인 알약
 * stage   어두운 무대 위 밝은 회색 테두리 알약
 * accent  연한 오렌지 배지
 */
export type ChipTone = "neutral" | "stage" | "accent";

export interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  /** 앞쪽 아이콘(SVG) */
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

const tones: Record<ChipTone, string> = {
  neutral: "border-border-strong text-fg-muted",
  stage: "border-stage-border text-stage-fg",
  accent: "border-transparent bg-accent-soft text-accent-soft-fg",
};

/** 요약 칩 / 배지 */
export function Chip({ children, tone = "neutral", icon, size = "md", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-[13px]" : "px-3.5 py-1.5 text-sm",
        tones[tone],
        className,
      )}
    >
      {icon && <span aria-hidden="true" className="flex">{icon}</span>}
      {children}
    </span>
  );
}

/** Chip 별칭 (작은 배지 용도) */
export function Tag(props: ChipProps) {
  return <Chip size="sm" {...props} />;
}
