"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { diagnosisHref, loadDiagnosisFromSession } from "@/lib/diagnosis-state";

/** 결과 URL이 비었거나 잘못됐을 때. 이번 세션에 진단한 기록이 있으면 그 결과로 안내한다 */
export function ResultEmptyState() {
  const [savedHref, setSavedHref] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDiagnosisFromSession();
    if (d) setSavedHref(diagnosisHref(d, "/result"));
  }, []);

  return (
    <div className="flex flex-1 animate-fade-up flex-col items-center justify-center py-16 text-center">
      <div aria-hidden="true" className="mb-5 text-6xl leading-none">
        🧭
      </div>
      <h1 className="text-[24px] font-bold tracking-[-0.02em] text-fg text-balance">아직 진단 결과가 없어요</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
        링크가 잘못됐거나 만료된 것 같아요.
        <br />
        1분이면 나에게 맞는 강의를 찾을 수 있어요.
      </p>
      <div className="mt-8 flex w-full flex-col gap-2.5">
        <Button href="/diagnosis" size="lg" fullWidth trailingIcon="→">
          1분 진단 시작하기
        </Button>
        {savedHref && (
          <Button href={savedHref} variant="secondary" size="lg" fullWidth>
            최근 진단 결과 보기
          </Button>
        )}
      </div>
    </div>
  );
}
