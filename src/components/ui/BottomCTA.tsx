import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";
import { cn } from "./cn";

export interface BottomCTAProps {
  /** 버튼 문구 */
  label: ReactNode;
  onClick?: () => void;
  /** 있으면 링크 버튼으로 렌더링 */
  href?: string;
  disabled?: boolean;
  /** form 제출용 등 */
  type?: "button" | "submit";
  /** 버튼 위 보조 문구(예: "최대 3개까지 고를 수 있어요") */
  helperText?: ReactNode;
  /** 버튼 아래 보조 액션 */
  secondary?: ReactNode;
  trailingIcon?: ReactNode;
  /** 기본 primary(잉크) */
  variant?: ButtonVariant;
  className?: string;
}

/** 화면 하단 고정 전체 폭 CTA. AppShell 내부(flex column) 마지막 자식으로 두면 됨 */
export function BottomCTA({
  label,
  onClick,
  href,
  disabled,
  type = "button",
  helperText,
  secondary,
  trailingIcon,
  variant = "primary",
  className,
}: BottomCTAProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-5 mt-auto px-5 pt-8 pb-[max(20px,env(safe-area-inset-bottom))]",
        "bg-gradient-to-t from-bg from-60% to-transparent",
        className,
      )}
    >
      {helperText && <p className="mb-3 text-center text-[13px] text-fg-muted">{helperText}</p>}
      {href && !disabled ? (
        <Button href={href} variant={variant} size="lg" fullWidth trailingIcon={trailingIcon}>
          {label}
        </Button>
      ) : (
        <Button type={type} variant={variant} size="lg" fullWidth disabled={disabled} onClick={onClick} trailingIcon={trailingIcon}>
          {label}
        </Button>
      )}
      {secondary && <div className="mt-2 flex justify-center">{secondary}</div>}
    </div>
  );
}
