"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, cn } from "@/components/ui";
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

// 320px 같은 좁은 화면에서는 아이콘을 숨기고 글자를 줄여 두 버튼이 한 줄에 들어가게 한다
const narrow = "min-w-0 flex-1 px-3 max-[359px]:gap-0 max-[359px]:px-2 max-[359px]:text-base";

/** 결과 화면 하단: 링크 복사 + 다시 진단하기 */
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
    show(ok ? "링크를 복사했어요. 친구에게 공유해 보세요!" : "복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.", ok);
  };

  const onRestart = () => {
    clearAllDiagnosisStorage();
    router.push("/diagnosis");
  };

  return (
    <>
      <div className="sticky bottom-0 z-20 -mx-5 mt-8 flex gap-2.5 bg-gradient-to-t from-bg from-70% to-transparent px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Button variant="secondary" size="lg" className={narrow} onClick={onCopy} leadingIcon={<span className="max-[359px]:hidden">🔗</span>}>
          링크 복사하기
        </Button>
        <Button size="lg" className={narrow} onClick={onRestart} leadingIcon={<span className="max-[359px]:hidden">↻</span>}>
          다시 진단하기
        </Button>
      </div>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-30 flex justify-center px-5"
      >
        {toast && (
          <p
            key={toast.text}
            className={cn(
              "animate-fade-up rounded-full px-4 py-2.5 text-center text-sm font-semibold shadow-lg",
              toast.ok ? "bg-fg text-bg" : "bg-danger text-white",
            )}
          >
            {toast.ok && <span aria-hidden="true">✓ </span>}
            {toast.text}
          </p>
        )}
      </div>
    </>
  );
}
