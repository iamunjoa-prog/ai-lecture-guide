import type { ReactNode } from "react";
import { cn } from "./cn";

export type SlideTone = "stage" | "light" | "muted";

export interface SlideProps {
  children: ReactNode;
  /** stage: 거의 검은 키노트 면 · light: 흰 본문 · muted: #f5f5f7 */
  tone?: SlideTone;
  className?: string;
  /** 안쪽 480px 컬럼에 붙일 클래스 */
  innerClassName?: string;
  as?: "section" | "header" | "footer" | "div";
  "aria-labelledby"?: string;
}

const tones: Record<SlideTone, string> = {
  stage: "stage bg-stage text-stage-fg",
  light: "bg-bg text-fg",
  muted: "bg-surface-2 text-fg",
};

/** 전체 폭 배경 + 가운데 480px 컬럼. 키노트 슬라이드 한 장 */
export function Slide({ children, tone = "light", className, innerClassName, as: Tag = "section", ...rest }: SlideProps) {
  return (
    <Tag className={cn("w-full", tones[tone], className)} aria-labelledby={rest["aria-labelledby"]}>
      <div
        className={cn(
          "mx-auto w-full max-w-content px-5",
          "pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
