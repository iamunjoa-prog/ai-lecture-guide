"use client";

import { useSyncExternalStore } from "react";
import { cn, IconCheck } from "@/components/ui";

export interface ToastMessage {
  id: number;
  text: string;
  /** ok: 완료(체크 아이콘) · info: 안내 · error: 실패 */
  tone: "ok" | "info" | "error";
}

let current: ToastMessage | null = null;
let seq = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** 화면 아래 짧은 알림 + 스크린리더 안내 (role=status) */
export function showToast(text: string, tone: ToastMessage["tone"] = "ok", ms = 2400) {
  if (timer) clearTimeout(timer);
  current = { id: ++seq, text, tone };
  emit();
  timer = setTimeout(() => {
    current = null;
    emit();
  }, ms);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** 레이아웃에 한 번 둔다. 서버에서도 빈 live region을 미리 그려 둬야 첫 알림이 읽힌다 */
export function ToastRegion() {
  const toast = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="toast"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-5"
    >
      {toast && (
        <p
          key={toast.id}
          className={cn(
            "flex max-w-[440px] animate-fade-in items-center gap-2 rounded-full px-4 py-2.5 text-center text-sm font-medium shadow-sheet",
            toast.tone === "error" ? "bg-danger text-white" : "bg-ink text-ink-fg",
          )}
        >
          {toast.tone === "ok" && <IconCheck size={16} strokeWidth={2} />}
          {toast.text}
        </p>
      )}
    </div>
  );
}
