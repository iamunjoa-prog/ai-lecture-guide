"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { Button, cn } from "@/components/ui";

const CRITERIA = [
  { icon: "🏢", title: "AI 기업 창업자", desc: "Anthropic, OpenAI, 업스테이지처럼 AI 기업을 세운 사람" },
  { icon: "🔬", title: "핵심 연구자", desc: "딥러닝 선구자처럼 기술을 직접 만든 연구자" },
  { icon: "🎓", title: "대학 교수", desc: "대학에서 정규 AI 강의를 하는 교수" },
  { icon: "✅", title: "AI 기업 공식 채널", desc: "AI를 만드는 회사가 직접 운영하는 채널" },
];

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
          "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-fg-muted underline-offset-4 transition-colors hover:bg-surface-2 hover:text-fg hover:underline",
          className,
        )}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">🛡️</span>
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
          "fixed inset-x-0 top-auto bottom-0 m-0 mx-auto w-full max-w-content max-h-[85dvh] overflow-y-auto",
          "rounded-t-xl border border-b-0 border-border bg-surface p-0 text-fg shadow-lg",
          "backdrop:bg-black/50 backdrop:backdrop-blur-[2px] open:animate-fade-up",
        )}
      >
        <div className="px-6 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-border-strong" aria-hidden="true" />
          <h2 id={titleId} className="text-xl font-bold text-fg">
            이런 강사의 강의만 추천해요
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">
            AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널만 추천해요. 아래 기준 중 하나 이상을 충족해야
            목록에 올라가요.
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {CRITERIA.map((c) => (
              <li key={c.title} className="flex items-start gap-3 rounded-lg bg-surface-2 px-4 py-3">
                <span aria-hidden="true" className="text-2xl leading-none">
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-fg">{c.title}</span>
                  <span className="block text-sm leading-relaxed text-fg-muted">{c.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-fg-muted">
            일반 유튜버, 유료 강의 판매 채널, 출처가 불분명한 재업로드 영상은 넣지 않아요. 모든 링크는 직접 확인한
            것만 등록해요.
          </p>
          <Button fullWidth size="lg" className="mt-6" onClick={close}>
            확인했어요
          </Button>
        </div>
      </dialog>
    </>
  );
}
