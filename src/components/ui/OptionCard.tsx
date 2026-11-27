import type { ReactNode } from "react";
import { IconCheck } from "./icons";
import { cn } from "./cn";

export interface OptionCardProps {
  /** "single" → role="radio", "multi" → role="checkbox". 기본 "single" */
  variant?: "single" | "multi";
  /** 앞쪽 아이콘(선택) */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  /** 눌러도 선택되지 않는다. 네이티브 disabled가 아니라 aria-disabled라 포커스·탭이 가능하다 */
  disabled?: boolean;
  onClick?: () => void;
  /** disabled 상태에서 눌렀을 때(이유를 알려 주는 용도) */
  onDisabledClick?: () => void;
  className?: string;
}

/**
 * 선택지 카드.
 * 선택 전: #f5f5f7 면, 그림자 없음 · 선택: 흰 카드 + 2px 잉크 링 + 잉크 체크 원
 */
export function OptionCard({
  variant = "single",
  icon,
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
  onDisabledClick,
  className,
}: OptionCardProps) {
  const isMulti = variant === "multi";
  return (
    <button
      type="button"
      role={isMulti ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? onDisabledClick : onClick}
      className={cn(
        "relative flex w-full min-h-16 items-center gap-4 rounded-lg px-5 py-4 text-left",
        "transition-[background-color,box-shadow,opacity] duration-200 ease-out",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        selected
          ? "bg-surface-raised ring-2 ring-ink"
          : "bg-surface-2 ring-1 ring-transparent not-aria-disabled:hover:ring-border-strong",
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex shrink-0 text-fg-muted">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-fg">{title}</span>
        {description && <span className="text-sm leading-relaxed text-fg-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[22px] shrink-0 items-center justify-center transition-colors duration-200",
          isMulti ? "rounded-[6px]" : "rounded-full",
          selected ? "bg-ink text-ink-fg" : "border-[1.5px] border-border-strong",
        )}
      >
        {selected && <IconCheck size={14} strokeWidth={2.25} />}
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
      className={cn("flex flex-col gap-2.5", className)}
    >
      {children}
    </div>
  );
}
