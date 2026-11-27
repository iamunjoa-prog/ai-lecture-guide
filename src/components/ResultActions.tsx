"use client";

import { useRouter } from "next/navigation";
import { Button, IconLink, IconRefresh } from "@/components/ui";
import { clearAllDiagnosisStorage } from "./progress-storage";
import { copyText } from "./saved/clipboard";
import { showToast } from "./saved/toast";

/** 결과 화면 하단: 링크 복사(잉크) + 다시 진단하기(고스트) */
export function ResultActions() {
  const router = useRouter();
  const onCopy = async () => {
    const ok = await copyText(window.location.href);
    showToast(ok ? "링크를 복사했어요" : "복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.", ok ? "ok" : "error");
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
    </>
  );
}
