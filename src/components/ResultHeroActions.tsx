"use client";

import { useRouter } from "next/navigation";
import { cn, IconLink, IconRefresh } from "@/components/ui";
import { clearAllDiagnosisStorage } from "./progress-storage";
import { copyText } from "./saved/clipboard";
import { showToast } from "./saved/toast";

/** 지금 결과 링크 복사 + 알림 */
export async function shareResultLink() {
  const ok = await copyText(window.location.href);
  showToast(ok ? "링크를 복사했어요" : "복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.", ok ? "ok" : "error");
}

/** 다시 진단하기: 진단 중간 상태와 결과를 지우고 처음 질문으로 */
export function useRestartDiagnosis() {
  const router = useRouter();
  return () => {
    clearAllDiagnosisStorage();
    router.push("/diagnosis");
  };
}

const stageBtn =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-[14px] font-medium text-stage-muted transition-colors duration-200 hover:text-stage-fg";

/** 결과 히어로 오른쪽 위: 공유(링크 복사) · 다시 진단 */
export function ResultHeroActions() {
  const restart = useRestartDiagnosis();
  return (
    <>
      <button type="button" onClick={shareResultLink} aria-label="공유: 결과 링크 복사" className={stageBtn} data-testid="hero-share">
        <span aria-hidden="true" className="flex">
          <IconLink size={16} />
        </span>
        공유
      </button>
      <button type="button" onClick={restart} className={stageBtn} data-testid="hero-restart">
        <span aria-hidden="true" className="flex">
          <IconRefresh size={16} />
        </span>
        다시 진단
      </button>
    </>
  );
}

/** 본문 위 '다시 진단하기' (여정을 모두 마쳤을 때) */
export function RestartDiagnosisButton({ className }: { className?: string }) {
  const restart = useRestartDiagnosis();
  return (
    <button
      type="button"
      onClick={restart}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent px-5 text-[15px] font-semibold text-accent-fg transition-colors duration-200 hover:bg-accent-hover",
        className,
      )}
      data-testid="journey-restart"
    >
      <span aria-hidden="true" className="flex">
        <IconRefresh size={16} />
      </span>
      다시 진단하기
    </button>
  );
}
