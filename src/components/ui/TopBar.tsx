import Link from "next/link";
import type { ReactNode } from "react";
import { ProgressBar } from "./ProgressBar";
import { cn } from "./cn";

export interface TopBarProps {
  /** 현재 단계(1부터) */
  step: number;
  /** 전체 단계 수 */
  total: number;
  /** 뒤로 가기 핸들러. onBack/backHref 둘 다 없으면 버튼 자리만 비워 둠 */
  onBack?: () => void;
  /** 뒤로 가기 링크(onBack 대신) */
  backHref?: string;
  /** 오른쪽 슬롯(예: "3/5" 대신 건너뛰기 버튼). 기본: "step/total" 표시 */
  right?: ReactNode;
  className?: string;
}

const backBtn =
  "-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg transition-colors duration-150 hover:bg-surface-2 active:bg-surface-sunken";

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 상단 고정 바: 뒤로 가기 + 얇은 진행 바 */
export function TopBar({ step, total, onBack, backHref, right, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 -mx-5 flex h-14 items-center gap-3 bg-bg/90 px-5 backdrop-blur-md",
        className,
      )}
    >
      {backHref ? (
        <Link href={backHref} aria-label="이전 단계로" className={backBtn}>
          <BackIcon />
        </Link>
      ) : onBack ? (
        <button type="button" onClick={onBack} aria-label="이전 단계로" className={backBtn}>
          <BackIcon />
        </button>
      ) : (
        <span className="-ml-2 size-11 shrink-0" aria-hidden="true" />
      )}
      <ProgressBar value={step} max={total} label="진단 진행률" valueText={`${total}단계 중 ${step}단계`} className="flex-1" />
      <div className="min-w-9 text-right text-sm font-semibold tabular-nums text-fg-muted">
        {right ?? (
          <span aria-hidden="true">
            {step}/{total}
          </span>
        )}
      </div>
    </header>
  );
}
