import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/**
 * primary   잉크(검정) 알약 — 본문 화면의 주 버튼
 * accent    시그널 오렌지 — 어두운 무대 위의 대표 CTA 전용
 * secondary 헤어라인 테두리
 * ghost     글자만
 */
export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** 왼쪽 아이콘(SVG) */
  leadingIcon?: ReactNode;
  /** 오른쪽 아이콘 */
  trailingIcon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export type ButtonProps = CommonProps &
  (
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>)
    | {
        /** 있으면 링크로 렌더링 (내부: next/link, external: <a target="_blank" rel="noopener noreferrer">) */
        href: string;
        external?: boolean;
        "aria-label"?: string;
        onClick?: () => void;
      }
  );

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] " +
  "transition-[background-color,color,border-color,opacity] duration-200 ease-out " +
  "disabled:cursor-not-allowed aria-disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-fg hover:bg-ink-hover disabled:bg-surface-sunken disabled:text-fg-muted",
  accent: "bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-40",
  secondary:
    "border border-border-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-surface-2 disabled:text-fg-muted",
  ghost: "bg-transparent text-fg hover:bg-surface-2 disabled:text-fg-muted",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-[15px]",
  lg: "min-h-14 px-7 text-[17px]",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    leadingIcon,
    trailingIcon,
    className,
    children,
  } = props;
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
  const content = (
    <>
      {leadingIcon && <span aria-hidden="true" className="flex shrink-0">{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span aria-hidden="true" className="flex shrink-0">{trailingIcon}</span>}
    </>
  );

  if (props.href !== undefined) {
    const { href, external, onClick } = props;
    const ariaLabel = props["aria-label"];
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick} aria-label={ariaLabel}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, size: _s, fullWidth: _f, leadingIcon: _l, trailingIcon: _t, className: _c, children: _ch, href: _h, ...rest } = props;
  return (
    <button type="button" {...rest} className={classes}>
      {content}
    </button>
  );
}
