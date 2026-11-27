import type { ReactNode } from "react";
import { cn } from "./cn";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
  /** 콘텐츠 영역 기본 좌우 여백(20px) 적용 여부. 기본 true */
  padded?: boolean;
  /** 렌더링할 태그. 기본 "main" */
  as?: "main" | "div" | "section";
}

/** 모바일 우선 480px 중앙 컬럼 + safe-area 여백 */
export function AppShell({ children, className, padded = true, as: Tag = "main" }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Tag
        className={cn(
          "mx-auto flex min-h-dvh w-full max-w-content flex-col",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
          className,
        )}
      >
        <div className={cn("flex flex-1 flex-col", padded && "px-5")}>{children}</div>
      </Tag>
    </div>
  );
}
