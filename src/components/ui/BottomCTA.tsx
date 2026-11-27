import type { ReactNode } from "react";
import { Button } from "./Button";
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
  /** 버튼 위 보조 문구(예: "여러 개 선택할 수 있어요") */
  helperText?: ReactNode;
  /** 버튼 아래 보조 액션(예: 건너뛰기 링크/버튼) */
  secondary?: ReactNode;
  trailingIcon?: ReactNode;
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
  className,
}: BottomCTAProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-5 mt-auto px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]",
        "bg-gradient-to-t from-bg from-70% to-transparent",
        className,
      )}
    >
      {helperText && <p className="mb-2 text-center text-sm text-fg-muted">{helperText}</p>}
      {href && !disabled ? (
        <Button href={href} size="lg" fullWidth trailingIcon={trailingIcon}>
          {label}
        </Button>
      ) : (
        <Button type={type} size="lg" fullWidth disabled={disabled} onClick={onClick} trailingIcon={trailingIcon}>
          {label}
        </Button>
      )}
      {secondary && <div className="mt-2 flex justify-center">{secondary}</div>}
    </div>
  );
}
