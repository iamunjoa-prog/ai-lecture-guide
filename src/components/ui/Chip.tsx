import type { ReactNode } from "react";
import { cn } from "./cn";

export type ChipTone = "neutral" | "primary" | "accent" | "success";

export interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  /** 앞쪽 아이콘(이모지) */
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

const tones: Record<ChipTone, string> = {
  neutral: "bg-surface-2 text-fg-muted border-border",
  primary: "bg-primary-soft text-primary-soft-fg border-transparent",
  accent: "bg-accent-soft text-accent-soft-fg border-transparent",
  success: "bg-success-soft text-success-soft-fg border-transparent",
};

/** 요약 칩 / 배지 */
export function Chip({ children, tone = "neutral", icon, size = "md", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        tones[tone],
        className,
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/** Chip 별칭 (작은 배지 용도) */
export function Tag(props: ChipProps) {
  return <Chip size="sm" {...props} />;
}
