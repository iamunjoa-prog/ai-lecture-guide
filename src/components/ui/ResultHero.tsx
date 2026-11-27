"use client";

import { useId, useState, type ReactNode } from "react";
import { Chip } from "./Chip";
import { IconChevronDown } from "./icons";
import { cn } from "./cn";

export interface ResultHeroChip {
  label: ReactNode;
  icon?: ReactNode;
  /** 칩 앞의 작은 강조 표시. 예: "1순위" */
  badge?: string;
}

/** 칩 묶음 (예: 수준 · 분야 · 목표). 묶음 이름이 왼쪽에 작게 붙는다 */
export interface ResultHeroChipGroup {
  label: string;
  chips: ResultHeroChip[];
}

export interface ResultHeroProps {
  /** 작은 상단 라벨. 예: "진단 완료" */
  eyebrow?: ReactNode;
  /** 헤드라인 */
  title: ReactNode;
  /** 진단 결론 두 줄: 지금 할 수 있는 것 + 다음 한 걸음 */
  conclusion?: { now: ReactNode; next: ReactNode };
  /** 진단 요약 한 줄 (누르면 chipGroups가 펼쳐진다). 예: "입문자 · 업무 자동화 · 목표 1개" */
  summary?: string;
  /** 펼치면 보이는 진단 요약 칩 */
  chipGroups?: ResultHeroChipGroup[];
  /** 라벨 줄 오른쪽 작은 동작들 (예: 공유 · 다시 진단) */
  actions?: ReactNode;
  className?: string;
}

/**
 * 결과 화면 상단 (어두운 Slide 안에 둔다). 짧게: 라벨 + 동작 · 제목 · 결론 두 줄 · 요약 한 줄.
 * 요약 한 줄은 펼침 버튼이고, 펼치면 수준·분야·목표(1순위)·언어 칩이 보인다.
 */
export function ResultHero({ eyebrow, title, conclusion, summary, chipGroups, actions, className }: ResultHeroProps) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const hasChips = Boolean(chipGroups && chipGroups.length > 0);
  return (
    <div className={cn("animate-fade-in pt-1 pb-5", className)}>
      <div className="flex min-h-11 items-center justify-between gap-2">
        {eyebrow && <p className="eyebrow-ko text-[13px] text-stage-muted">{eyebrow}</p>}
        {actions && <div className="-mr-2 flex shrink-0 items-center">{actions}</div>}
      </div>
      <h1 className="display mt-1 text-[clamp(26px,7.6vw,32px)] text-stage-fg text-balance">{title}</h1>
      {conclusion && (
        <section aria-label="진단 결론" data-testid="diagnosis-conclusion" className="mt-3.5 border-l-2 border-accent pl-3.5">
          <p className="text-[15px] leading-relaxed text-stage-muted">{conclusion.now}</p>
          <p className="mt-0.5 text-[15px] font-semibold leading-relaxed text-stage-fg">{conclusion.next}</p>
        </section>
      )}
      {summary && (
        <div className="mt-3">
          {hasChips ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`${uid}-chips`}
              onClick={() => setOpen((v) => !v)}
              className="-ml-1 inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full px-1 text-left text-[14px] font-medium text-stage-muted transition-colors duration-200 hover:text-stage-fg"
              data-testid="summary-toggle"
            >
              <span className="min-w-0">
                <span className="sr-only">진단 요약: </span>
                {summary}
              </span>
              <span aria-hidden="true" className={cn("flex shrink-0 transition-transform duration-300", open && "rotate-180")}>
                <IconChevronDown size={16} />
              </span>
            </button>
          ) : (
            <p className="text-[14px] font-medium text-stage-muted">{summary}</p>
          )}
          {hasChips && (
            <div
              id={`${uid}-chips`}
              role="group"
              aria-label="진단 요약"
              hidden={!open}
              className="mt-1 pb-1"
              data-testid="diagnosis-summary"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {chipGroups!.map((g, gi) => (
                  <div key={gi} className="flex min-w-0 items-center gap-2">
                    <span id={`${uid}-g${gi}`} className="shrink-0 text-[12px] font-semibold text-stage-muted">
                      {g.label}
                    </span>
                    <ul aria-labelledby={`${uid}-g${gi}`} className="flex min-w-0 flex-wrap gap-1.5">
                      {g.chips.map((chip, i) => (
                        <li key={i}>
                          <Chip tone="stage" size="sm" icon={chip.icon}>
                            {chip.badge && <span className="text-[11px] font-bold text-accent">{chip.badge}</span>}
                            {chip.label}
                          </Chip>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
