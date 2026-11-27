"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { Button, cn, IconCheck, IconX } from "@/components/ui";
import { instructors, videos } from "./catalog";
import { CRITERIA, EXCLUDED_NOTE } from "./criteria";

export interface CriteriaSheetProps {
  /** 트리거 버튼 문구 */
  triggerLabel?: string;
  className?: string;
}

/** "강사 선정 기준" 안내 — 버튼을 누르면 하단 시트(<dialog>)로 열린다 */
export function CriteriaSheet({ triggerLabel = "강사 선정 기준 보기", className }: CriteriaSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = useCallback(() => {
    const d = ref.current;
    if (!d || d.open) return;
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }, []);
  const close = useCallback(() => {
    const d = ref.current;
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  }, []);

  // 시트가 열려 있는 동안 뒤 페이지 스크롤 잠금
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const sync = () => {
      document.documentElement.style.overflow = d.open ? "hidden" : "";
    };
    const observer = new MutationObserver(sync);
    observer.observe(d, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-fg underline decoration-border-strong underline-offset-[6px] transition-colors duration-200 hover:decoration-fg",
          className,
        )}
        aria-haspopup="dialog"
      >
        {triggerLabel}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={(e) => {
          // 바깥(backdrop) 클릭 시 닫기
          if (e.target === e.currentTarget) close();
        }}
        className={cn(
          "fixed inset-x-0 top-auto bottom-0 m-0 mx-auto w-full max-w-content max-h-[88dvh] overflow-y-auto",
          "rounded-t-xl bg-surface p-0 text-fg shadow-sheet",
          "backdrop:bg-black/40 backdrop:backdrop-blur-sm open:animate-fade-in",
        )}
      >
        <div className="relative px-6 pt-8 pb-[max(24px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-surface-2 text-fg-muted transition-colors hover:text-fg"
          >
            <IconX size={18} />
          </button>
          <p className="eyebrow text-fg-muted">Selection Criteria</p>
          <h2 id={titleId} className="mt-2 pr-10 text-[24px] font-bold leading-tight tracking-[-0.03em] text-fg">
            이런 강사의 유튜브 강의만 선별합니다
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
            아래 기준 중 하나 이상을 충족한 강사의 유튜브 강의만 담았습니다. 현재 강사 {instructors.length}명, 강의{" "}
            {videos.length}개입니다.
          </p>
          <ul className="mt-6 border-t border-border">
            {CRITERIA.map((c) => (
              <li key={c.title} className="flex items-start gap-3 border-b border-border py-4">
                <span aria-hidden="true" className="mt-[3px] flex shrink-0 text-accent-ink">
                  <IconCheck size={18} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">{c.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-fg-muted">{c.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-fg-muted">
            {EXCLUDED_NOTE} 모든 링크는 실제로 열어 확인한 것만 등록합니다.
          </p>
          <Button fullWidth size="lg" className="mt-7" onClick={close}>
            확인
          </Button>
        </div>
      </dialog>
    </>
  );
}
