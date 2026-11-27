"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell, BottomCTA, LoadingPlan, OptionCard, OptionGroup, QuestionHeader, TopBar } from "@/components/ui";
import { buildDiagnosis, DIAGNOSIS_QUESTIONS, type DiagnosisAnswers, type Question } from "@/lib/questions";
import { diagnosisHref, saveDiagnosisToSession } from "@/lib/diagnosis-state";
import { loadProgress, saveProgress } from "./progress-storage";

const QUESTIONS: readonly Question[] = DIAGNOSIS_QUESTIONS;
const TOTAL = QUESTIONS.length;
const AUTO_ADVANCE_MS = 400;
const LOADING_MS = 1200;
const NUDGE_MS = 1600;

const STEP_LABELS: Record<Question["step"], string> = {
  level: "AI 활용 수준",
  domain: "관심 분야",
  goal: "학습 목표",
  language: "강의 언어",
};

function stepLabel(q: Question, index: number): string {
  if (q.step === "level") {
    const levelQs = QUESTIONS.filter((x) => x.step === "level");
    const n = levelQs.findIndex((x) => x.id === q.id) + 1;
    return `${STEP_LABELS.level} · ${n}/${levelQs.length}`;
  }
  return index === TOTAL - 1 ? STEP_LABELS.language : STEP_LABELS[q.step];
}

/** 다중 선택 질문 하단 안내 문구 */
function multiHelper(
  q: Question,
  { exclusivePicked, full, count, maxSelect }: { exclusivePicked: boolean; full: boolean; count: number; maxSelect: number },
): string {
  if (q.step === "goal") {
    if (exclusivePicked) return "AI가 무엇인지부터 차근차근 알려 드려요";
    if (full) return "목표를 모두 골랐어요. 숫자는 고른 순서예요";
    if (count >= 1) return "먼저 고른 목표가 1순위예요";
    return `최대 ${maxSelect}개, 중요한 것부터 골라 주세요`;
  }
  if (exclusivePicked) return "분야를 정하지 않고 폭넓게 추천해 드려요";
  if (full) return `${maxSelect}개를 모두 골랐어요. 바꾸려면 고른 항목을 눌러 해제하세요`;
  return `최대 ${maxSelect}개까지 고를 수 있어요`;
}

function isAnswered(q: Question, answers: DiagnosisAnswers): boolean {
  const picked = answers[q.id] ?? [];
  return picked.length > 0 && picked.every((id) => q.options.some((o) => o.id === id));
}

export function DiagnosisFlow() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>({});
  const [phase, setPhase] = useState<"quiz" | "loading">("quiz");
  const [hydrated, setHydrated] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const timer = useRef<number | null>(null);
  const navigated = useRef(false);
  const resultHref = useRef<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const nudgeTimer = useRef<number | null>(null);

  const question = QUESTIONS[index];
  const selected = answers[question.id] ?? [];
  const isMulti = question.type === "multi";
  const maxSelect = isMulti ? (question.maxSelect ?? question.options.length) : 1;
  const isLast = index === TOTAL - 1;
  const headingId = `q-${question.id}`;
  const helperId = `q-${question.id}-helper`;
  const hintsId = `q-${question.id}-hints`;
  const describedBy = [question.subtitle ? helperId : "", question.hints?.length ? hintsId : ""].filter(Boolean).join(" ");

  // 진행 중이던 답변 복원 (SSR 결과와 맞추기 위해 마운트 후에 읽는다)
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setAnswers(saved.answers);
      // 아직 답하지 않은 첫 질문을 넘어가지 않도록 위치를 보정
      const firstOpen = QUESTIONS.findIndex((q) => !isAnswered(q, saved.answers));
      const maxIndex = firstOpen === -1 ? TOTAL - 1 : firstOpen;
      setIndex(Math.min(Math.max(0, Math.trunc(saved.index)), maxIndex));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress({ index, answers });
  }, [hydrated, index, answers]);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setAdvancing(false);
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  // 질문이 바뀌면 맨 위로 + 제목에 포커스(스크린리더가 새 질문을 읽도록)
  useEffect(() => {
    if (!navigated.current) return;
    window.scrollTo({ top: 0 });
    const el = document.getElementById(headingId);
    if (el) {
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  }, [headingId]);

  const finish = useCallback(
    (final: DiagnosisAnswers) => {
      const d = buildDiagnosis(final);
      if (!d) {
        // 정상 흐름에서는 일어나지 않지만, 빠진 질문이 있으면 그 질문으로 돌려보낸다
        const missing = QUESTIONS.findIndex((q) => q.step !== "level" && !isAnswered(q, final));
        navigated.current = true;
        setIndex(missing === -1 ? 0 : missing);
        return;
      }
      saveDiagnosisToSession(d);
      const href = diagnosisHref(d, "/result");
      resultHref.current = href;
      router.prefetch(href);
      setPhase("loading");
      window.scrollTo({ top: 0 });
      timer.current = window.setTimeout(() => router.push(href), LOADING_MS);
    },
    [router],
  );

  /** 로딩을 건너뛰고 바로 결과로 */
  const skipLoading = useCallback(() => {
    const href = resultHref.current;
    if (!href) return;
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    router.push(href);
  }, [router]);

  useEffect(
    () => () => {
      if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current);
    },
    [],
  );

  /** 최대 개수를 다 고른 상태에서 더 눌렀을 때 안내 문구를 잠깐 강조 */
  const showNudge = () => {
    setNudge(true);
    if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current);
    nudgeTimer.current = window.setTimeout(() => setNudge(false), NUDGE_MS);
  };

  const goNext = useCallback(
    (current: DiagnosisAnswers) => {
      clearTimer();
      if (index >= TOTAL - 1) {
        finish(current);
        return;
      }
      navigated.current = true;
      setIndex((i) => Math.min(i + 1, TOTAL - 1));
    },
    [clearTimer, finish, index],
  );

  const goBack = useCallback(() => {
    clearTimer();
    navigated.current = true;
    setIndex((i) => Math.max(0, i - 1));
  }, [clearTimer]);

  const choose = (optionId: string) => {
    if (phase !== "quiz") return;
    if (isMulti) {
      clearTimer();
      setAnswers((prev) => {
        const cur = prev[question.id] ?? [];
        const exclusiveIds = question.options.filter((o) => o.exclusive).map((o) => o.id as string);
        let next: string[];
        if (cur.includes(optionId)) {
          next = cur.filter((x) => x !== optionId);
        } else if (exclusiveIds.includes(optionId)) {
          next = [optionId]; // "잘 모르겠어요"는 다른 선택을 모두 지운다
        } else {
          const rest = cur.filter((x) => !exclusiveIds.includes(x)); // 다른 분야를 고르면 "잘 모르겠어요"가 풀린다
          next = rest.length >= maxSelect ? rest : [...rest, optionId];
        }
        return { ...prev, [question.id]: next };
      });
      return;
    }
    const next = { ...answers, [question.id]: [optionId] };
    setAnswers(next);
    clearTimer();
    // 단일 선택은 선택 효과를 잠깐 보여 준 뒤 자동으로 다음 질문으로
    setAdvancing(true);
    timer.current = window.setTimeout(() => goNext(next), AUTO_ADVANCE_MS);
  };

  if (phase === "loading") {
    return (
      <AppShell tone="stage">
        <LoadingPlan durationMs={LOADING_MS} onSkip={skipLoading} />
      </AppShell>
    );
  }

  const full = isMulti && selected.length >= maxSelect;
  const canProceed = isAnswered(question, answers);
  const exclusivePicked = selected.some((id) => question.options.find((o) => o.id === id)?.exclusive);

  return (
    <AppShell>
      <TopBar
        step={index + 1}
        total={TOTAL}
        backHref={index === 0 ? "/" : undefined}
        onBack={index === 0 ? undefined : goBack}
      />
      <div key={question.id} data-question-body="" className="flex animate-fade-in flex-col pb-8">
        <QuestionHeader
          id={headingId}
          stepLabel={stepLabel(question, index)}
          title={question.title}
          helper={question.subtitle}
          helperId={helperId}
          hints={question.hints}
          hintsId={hintsId}
        />
        <OptionGroup variant={question.type} labelledBy={headingId} describedBy={describedBy}>
          {question.options.map((o) => {
            const isSelected = selected.includes(o.id);
            const order = question.ordered && isSelected && !o.exclusive ? selected.indexOf(o.id) + 1 : undefined;
            return (
              <OptionCard
                key={o.id}
                variant={question.type}
                title={o.label}
                description={o.description}
                hint={o.hint}
                order={order}
                selected={isSelected}
                disabled={full && !isSelected && !o.exclusive}
                onDisabledClick={showNudge}
                onClick={() => choose(o.id)}
              />
            );
          })}
        </OptionGroup>
      </div>
      {isMulti || (canProceed && !advancing) ? (
        <BottomCTA
          label={isLast ? "결과 보기" : "다음"}
          disabled={!canProceed}
          onClick={() => goNext(answers)}
          helperText={
            isMulti ? (
              <span
                aria-live="polite"
                className={nudge ? "rounded-md bg-accent-soft px-2 py-1 font-semibold text-accent-soft-fg" : undefined}
              >
                {multiHelper(question, { exclusivePicked, full, count: selected.length, maxSelect })}
                {!exclusivePicked && (
                  <span className="ml-1.5 font-semibold text-fg tabular-nums">
                    ({selected.length}/{maxSelect})
                  </span>
                )}
              </span>
            ) : undefined
          }
        />
      ) : (
        <p className="mt-auto pt-8 pb-[max(24px,env(safe-area-inset-bottom))] text-center text-[14px] text-fg-muted">
          {index === 0 ? "고르면 바로 다음 질문으로 넘어가요. 잘못 골랐다면 왼쪽 위 화살표로 돌아올 수 있어요." : "고르면 바로 다음으로 넘어가요."}
        </p>
      )}
    </AppShell>
  );
}
