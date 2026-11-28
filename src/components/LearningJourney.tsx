"use client";

import { useId, useState } from "react";
import { cn, IconArrowRight, IconCheck } from "@/components/ui";
import {
  buildJourney,
  practiceStepAnchorId,
  stepAccessibleName,
  stepAnchorId,
  stepDetailLine,
  type JourneyStepInput,
} from "@/lib/journey";
import { journeyTarget, PROGRESS_HINTS } from "@/lib/study-style";
import type { Level, StudyStyle } from "@/types";
import { RestartDiagnosisButton } from "./ResultHeroActions";
import { useSaved } from "./saved/use-saved";

type Selection = number | "next";

/**
 * 내 학습 여정: [지금] → [1단계] → [2단계] → [3단계] → [다음 위치]
 * - 진행은 이 브라우저의 내 학습함(강의 '다 봤어요', 실습 '완료', 3분 이론 '읽었어요')으로 센다.
 *   무엇을 세는지는 공부 방법이 정한다(lib/study-style.ts). 서버·하이드레이션 중에는 0
 * - 단계 노드를 누르면 아래 상세가 그 단계로 바뀌고, '이 단계 강의 보기'로 그 단계 구역으로 간다
 * - 모두 마치면 '다음 위치'가 켜지고 다시 진단을 권한다
 */
export function LearningJourney({
  level,
  steps,
  studyStyle = "all",
}: {
  level: Level;
  steps: JourneyStepInput[];
  studyStyle?: StudyStyle;
}) {
  const uid = useId();
  const { state, ready, available } = useSaved();
  const journey = buildJourney(level, steps, ready && available ? state : null, studyStyle);
  const toPractice = journeyTarget(studyStyle) === "practice";
  // 고른 노드는 '모두 마침' 여부가 같을 때만 유지 (마지막 단계를 끝내면 다음 위치를 보여 준다)
  const [picked, setPicked] = useState<{ sel: Selection; allDone: boolean } | null>(null);
  const selected: Selection =
    picked && picked.allDone === journey.allDone ? picked.sel : journey.allDone ? "next" : journey.activeIndex;
  const detailId = `${uid}-detail`;
  const n = journey.steps.length + 2;
  const step = typeof selected === "number" ? journey.steps[selected] : undefined;
  const nextIsCurrent = journey.allDone;

  const pick = (sel: Selection) => setPicked({ sel, allDone: journey.allDone });

  return (
    <section aria-labelledby={`${uid}-title`} className="pt-5 pb-2" data-testid="journey" data-ready={ready ? "" : undefined}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={`${uid}-title`} className="text-[17px] font-bold tracking-[-0.02em] text-fg">
          내 학습 여정
        </h2>
        <p className="shrink-0 text-[13px] text-fg-muted tabular-nums" data-testid="journey-total">
          완료 {journey.done}/{journey.total}
        </p>
      </div>

      <ol
        aria-label="학습 단계"
        className="mt-3 grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        data-testid="journey-steps"
      >
        {/* 지금 위치 */}
        <li className="relative flex flex-col items-center" data-node="now">
          <div className="flex flex-col items-center px-0.5 pt-0.5 text-center">
            <span
              aria-hidden="true"
              className="relative z-10 flex size-7 items-center justify-center rounded-full bg-ink"
            >
              <span className="size-2 rounded-full bg-ink-fg" />
            </span>
            <span className="mt-1.5 text-[11px] font-medium text-fg-muted">지금</span>
            <span className="text-[12px] font-semibold leading-tight text-fg break-keep">
              <span className="sr-only">지금 위치: </span>
              {journey.currentLabel}
            </span>
          </div>
        </li>

        {journey.steps.map((s, i) => {
          const current = i === journey.activeIndex;
          const isSel = selected === i;
          const ratio = s.total > 0 ? s.done / s.total : 0;
          return (
            <li
              key={s.label}
              className="relative flex flex-col items-center"
              aria-current={current ? "step" : undefined}
              data-node="step"
              data-complete={s.complete ? "" : undefined}
            >
              <Connector ratio={ratio} />
              <button
                type="button"
                aria-pressed={isSel}
                aria-controls={detailId}
                aria-label={stepAccessibleName(s, current)}
                onClick={() => pick(i)}
                className="group flex min-h-11 w-full flex-col items-center rounded-md px-0.5 pt-0.5 text-center"
                data-testid="journey-step"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative z-10 flex size-7 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums transition-colors duration-300",
                    s.complete
                      ? "bg-accent text-accent-fg"
                      : current
                        ? "border-2 border-accent bg-bg text-accent-ink"
                        : "border border-border-strong bg-bg text-fg-muted",
                    isSel && "ring-2 ring-fg/25 ring-offset-2 ring-offset-bg",
                  )}
                >
                  {s.complete ? <IconCheck size={15} strokeWidth={2.5} /> : s.number}
                </span>
                <span aria-hidden="true" className={cn("mt-1.5 text-[11px] font-medium", current ? "text-accent-ink" : "text-fg-muted")}>
                  {s.number}단계
                </span>
                <span
                  aria-hidden="true"
                  className={cn("text-[12px] leading-tight break-keep", isSel ? "font-semibold text-fg" : "font-medium text-fg-muted")}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}

        {/* 다음 위치 */}
        <li
          className="relative flex flex-col items-center"
          aria-current={nextIsCurrent ? "step" : undefined}
          data-node="next"
          data-lit={journey.allDone ? "" : undefined}
        >
          <Connector ratio={journey.allDone ? 1 : 0} />
          <button
            type="button"
            aria-pressed={selected === "next"}
            aria-controls={detailId}
            aria-label={`다음 위치 ${journey.nextLabel}, ${journey.allDone ? "도착할 준비가 됐어요" : "모든 단계를 마치면 닿는 곳"}`}
            onClick={() => pick("next")}
            className="flex min-h-11 w-full flex-col items-center rounded-md px-0.5 pt-0.5 text-center"
            data-testid="journey-next"
          >
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-7 items-center justify-center rounded-full transition-colors duration-300",
                journey.allDone ? "bg-accent text-accent-fg" : "border border-dashed border-border-strong bg-bg text-fg-muted",
                selected === "next" && "ring-2 ring-fg/25 ring-offset-2 ring-offset-bg",
              )}
            >
              <IconArrowRight size={14} strokeWidth={2} />
            </span>
            <span aria-hidden="true" className={cn("mt-1.5 text-[11px] font-medium", journey.allDone ? "text-accent-ink" : "text-fg-muted")}>
              다음 위치
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "text-[12px] leading-tight break-keep",
                selected === "next" || journey.allDone ? "font-semibold text-fg" : "font-medium text-fg-muted",
              )}
            >
              {journey.nextLabel}
            </span>
          </button>
        </li>
      </ol>

      {/* 고른 단계 상세 */}
      <div id={detailId} aria-live="polite" className="mt-3 rounded-xl bg-surface-2 px-4 pt-3 pb-1" data-testid="journey-detail">
        {step ? (
          <>
            <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-semibold text-fg">
              {step.number}단계 · {step.label}
              {step.complete ? (
                <span className="text-[12px] font-semibold text-accent-ink">완료</span>
              ) : (
                selected === journey.activeIndex && <span className="text-[12px] font-semibold text-accent-ink">지금 할 단계</span>
              )}
            </p>
            <p className="mt-0.5 text-[13px] text-fg-muted tabular-nums" data-testid="journey-detail-line">
              {stepDetailLine(step)}
              {step.termsSaved > 0 && ` (용어 ${step.termsSaved}개 저장)`}
            </p>
            {journey.done === 0 && (
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted" data-testid="journey-hint">
                {PROGRESS_HINTS[studyStyle]}
              </p>
            )}
            <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full origin-left rounded-full bg-accent transition-transform duration-500"
                style={{ transform: `scaleX(${step.total > 0 ? step.done / step.total : 0})` }}
              />
            </div>
            {/* 처음 화면에서 1단계는 바로 아래에 있으므로, 노드를 눌렀거나 2단계 이후일 때만 */}
            {picked || step.number > 1 || toPractice ? (
              <a
                href={`#${toPractice && step.missions > 0 ? practiceStepAnchorId(step.number) : stepAnchorId(step.number)}`}
                className="mt-1 inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-accent-ink"
                data-testid="journey-goto"
              >
                {toPractice && step.missions > 0 ? "이 단계 실습 보기" : "이 단계 강의 보기"}
                <IconArrowRight size={15} strokeWidth={2} />
              </a>
            ) : (
              <div className="h-3" />
            )}
          </>
        ) : journey.allDone ? (
          <div className="pb-3" data-testid="journey-done">
            <p className="text-[15px] font-semibold text-fg">모든 단계를 마쳤어요</p>
            <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">다시 진단해서 다음 로드맵을 받아 보세요.</p>
            <RestartDiagnosisButton className="mt-3" />
          </div>
        ) : (
          <div className="pb-3">
            <p className="text-[15px] font-semibold text-fg">다음 위치 · {journey.nextLabel}</p>
            <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">
              모든 단계를 마치면 닿는 곳이에요. 그때 다시 진단해서 다음 로드맵을 받아 보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/** 앞 노드에서 이 노드까지 잇는 선. ratio만큼 포인트 색으로 채운다 */
function Connector({ ratio }: { ratio: number }) {
  return (
    <span aria-hidden="true" className="absolute top-[15px] right-1/2 h-0.5 w-full bg-border">
      <span
        className="block h-full origin-left bg-accent transition-transform duration-500"
        style={{ transform: `scaleX(${Math.max(0, Math.min(1, ratio))})` }}
      />
    </span>
  );
}
