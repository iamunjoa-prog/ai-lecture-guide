"use client";

import { useEffect, useState } from "react";
import { Button, IconArrowRight } from "@/components/ui";
import { diagnosisHref, loadDiagnosisFromSession } from "@/lib/diagnosis-state";
import { DIAGNOSIS_MINUTES } from "@/lib/questions";

/** 결과 URL이 비었거나 잘못됐을 때. 이번 세션에 진단한 기록이 있으면 그 결과로 안내한다 */
export function ResultEmptyState() {
  const [savedHref, setSavedHref] = useState<string | null>(null);

  useEffect(() => {
    const d = loadDiagnosisFromSession();
    if (d) setSavedHref(diagnosisHref(d, "/result"));
  }, []);

  return (
    <div className="flex flex-1 animate-fade-in flex-col justify-center py-16">
      <p className="eyebrow text-fg-muted">AI Lecture Guide</p>
      <h1 className="display mt-4 text-[34px] text-fg text-balance">아직 진단 결과가 없어요</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">
        링크가 잘못되었거나 만료된 것 같습니다. {DIAGNOSIS_MINUTES}분 진단으로 나에게 맞는 강의 순서를 받아 보세요.
      </p>
      <div className="mt-10 flex w-full flex-col gap-2.5">
        <Button href="/diagnosis" size="lg" fullWidth trailingIcon={<IconArrowRight size={18} strokeWidth={2} />}>
          {DIAGNOSIS_MINUTES}분 진단 시작하기
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
