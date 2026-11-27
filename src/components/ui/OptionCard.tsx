import type { ReactNode } from "react";
import { cn } from "./cn";

export interface OptionCardProps {
  /** "single" → role="radio", "multi" → role="checkbox". 기본 "single" */
  variant?: "single" | "multi";
  /** 이모지 아이콘(예: "🧑‍💻") */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

function CheckMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="check-pop">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 큰 카드형 선택지. OptionGroup 안에서 쓰세요 */
export function OptionCard({
  variant = "single",
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
  className,
}: OptionCardProps) {
  const isMulti = variant === "multi";
  return (
    <button
      type="button"
      role={isMulti ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative flex w-full min-h-16 items-center gap-4 rounded-lg border-2 px-4 py-4 text-left",
        "transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out",
        "active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        selected
          ? "border-primary bg-primary-soft shadow-md"
          : "border-border bg-surface shadow-sm hover:border-border-strong hover:bg-surface-2",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-md text-[26px] leading-none transition-colors duration-200",
            selected ? "bg-surface" : "bg-surface-2",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-[17px] font-semibold leading-snug", selected ? "text-primary-soft-fg" : "text-fg")}>
          {title}
        </span>
        {description && <span className="text-sm leading-relaxed text-fg-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center border-2 transition-colors duration-200",
          isMulti ? "rounded-[7px]" : "rounded-full",
          selected ? "border-primary bg-primary text-primary-fg" : "border-border-strong bg-surface",
        )}
      >
        {selected && <CheckMark />}
      </span>
    </button>
  );
}

export interface OptionGroupProps {
  /** single → role="radiogroup", multi → role="group" */
  variant?: "single" | "multi";
  /** 질문 제목 요소의 id (QuestionHeader의 id) */
  labelledBy?: string;
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
}

export function OptionGroup({ variant = "single", labelledBy, children, className, ...rest }: OptionGroupProps) {
  return (
    <div
      role={variant === "multi" ? "group" : "radiogroup"}
      aria-labelledby={labelledBy}
      aria-label={rest["aria-label"]}
      className={cn("flex flex-col gap-3", className)}
    >
      {children}
    </div>
  );
}
