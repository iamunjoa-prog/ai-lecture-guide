import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** 왼쪽 아이콘(이모지/SVG) */
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
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-[-0.01em] " +
  "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:active:scale-100 aria-disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg shadow-cta hover:bg-primary-hover active:bg-primary-pressed " +
    "disabled:bg-surface-sunken disabled:text-fg-subtle disabled:shadow-none",
  secondary:
    "bg-surface text-fg border border-border-strong shadow-sm hover:bg-surface-2 " +
    "disabled:text-fg-subtle disabled:bg-surface-2",
  ghost: "bg-transparent text-primary-soft-fg hover:bg-primary-soft disabled:text-fg-subtle",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm rounded-md",
  md: "min-h-12 px-5 text-base rounded-lg",
  lg: "min-h-14 px-6 text-[17px] rounded-lg",
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
      {leadingIcon && <span aria-hidden="true" className="shrink-0">{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span aria-hidden="true" className="shrink-0">{trailingIcon}</span>}
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
