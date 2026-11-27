"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, cn, IconCheck, IconLink, IconRefresh } from "@/components/ui";
import { clearAllDiagnosisStorage } from "./progress-storage";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 아래 대체 방식으로 시도 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** 결과 화면 하단: 링크 복사(잉크) + 다시 진단하기(고스트) */
export function ResultActions() {
  const router = useRouter();
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const show = (text: string, ok: boolean) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setToast({ text, ok });
    timer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const onCopy = async () => {
    const ok = await copyText(window.location.href);
    show(ok ? "링크를 복사했어요" : "복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.", ok);
  };

  const onRestart = () => {
    clearAllDiagnosisStorage();
    router.push("/diagnosis");
  };

  // 320px처럼 좁은 화면에서는 아이콘을 숨겨 두 버튼이 한 줄에 들어가게 한다
  const icon = "max-[359px]:hidden";

  return (
    <>
      <div className="sticky bottom-0 z-20 border-t border-border bg-bg/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-content gap-2 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Button
            size="lg"
            className="min-w-0 flex-1 px-4"
            onClick={onCopy}
            leadingIcon={<IconLink size={18} className={icon} />}
          >
            링크 복사하기
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="min-w-0 shrink-0 px-4 max-[359px]:px-3"
            onClick={onRestart}
            leadingIcon={<IconRefresh size={18} className={icon} />}
          >
            다시 진단하기
          </Button>
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-5"
      >
        {toast && (
          <p
            key={toast.text}
            className={cn(
              "flex animate-fade-in items-center gap-2 rounded-full px-4 py-2.5 text-center text-sm font-medium",
              toast.ok ? "bg-ink text-ink-fg" : "bg-danger text-white",
            )}
          >
            {toast.ok && <IconCheck size={16} strokeWidth={2} />}
            {toast.text}
          </p>
        )}
      </div>
    </>
  );
}
