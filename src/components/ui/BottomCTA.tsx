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

/**
 * 화면 하단 고정 전체 폭 CTA. AppShell 내부(flex column) 마지막 자식으로 두면 됨.
 * 배경은 불투명이고 위로 24px(h-6) 흐림 띠가 있으니, 바로 위 콘텐츠는 아래 여백(24px 이상, 진단 화면은 pb-8)을 둔다.
 */
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
      data-bottom-cta=""
      className={cn(
        // 안내 문구·버튼 뒤는 불투명 배경: 뒤로 지나가는 선택지 글자와 겹쳐 보이지 않게 한다.
        // 위쪽 가장자리만 짧게 흐려지는 띠(아래 span)를 둔다. 목록 쪽은 이 띠 높이 이상 아래 여백을 둬야 한다.
        "sticky bottom-0 z-20 -mx-5 mt-auto bg-bg px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-gradient-to-t from-bg to-transparent"
      />
      {helperText && <p className="mb-3 text-center text-[14px] text-fg-muted">{helperText}</p>}
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
