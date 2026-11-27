import type { ReactNode } from "react";
import { Chip } from "./Chip";
import { IconArrowRight, IconChevronDown } from "./icons";
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
  /** 큰 헤드라인 */
  title: ReactNode;
  description?: ReactNode;
  /** 진단 결론 두 줄: 지금 할 수 있는 것 + 다음 한 걸음 */
  conclusion?: { now: ReactNode; next: ReactNode };
  /** 진단 요약 칩 */
  chips?: ResultHeroChip[];
  /** 묶음으로 나눈 진단 요약 칩 (있으면 chips 대신 쓴다) */
  chipGroups?: ResultHeroChipGroup[];
  /** 진단 결론 아래 한 줄 링크 (예: 다음에 익히면 좋은 스킬) */
  teaser?: { href: string; label: ReactNode };
  /** 바로가기 링크(예: 추천 강의 바로 보기) */
  jump?: { href: string; label: ReactNode };
  className?: string;
}

/** 결과 화면 상단 키노트 슬라이드 내용 (어두운 Slide 안에 둔다) */
export function ResultHero({ eyebrow, title, description, conclusion, teaser, chips, chipGroups, jump, className }: ResultHeroProps) {
  return (
    <div className={cn("animate-fade-in pt-8 pb-10", className)}>
      {eyebrow && <p className="eyebrow-ko text-[13px] text-stage-muted">{eyebrow}</p>}
      <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg text-balance">{title}</h1>
      {description && <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">{description}</p>}
      {conclusion && (
        <section aria-label="진단 결론" data-testid="diagnosis-conclusion" className="mt-6 border-l-2 border-accent pl-4">
          <p className="eyebrow-ko text-[12px] text-stage-muted" aria-hidden="true">
            진단 결론
          </p>
          <p className="mt-1.5 text-[16px] leading-relaxed text-stage-muted">{conclusion.now}</p>
          <p className="mt-1 text-[16px] font-semibold leading-relaxed text-stage-fg">{conclusion.next}</p>
        </section>
      )}
      {teaser && (
        <a
          href={teaser.href}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] leading-snug text-stage-muted transition-colors duration-200 hover:text-stage-fg"
          data-testid="hero-teaser"
        >
          <span className="min-w-0">{teaser.label}</span>
          <span aria-hidden="true" className="flex shrink-0 text-accent">
            <IconArrowRight size={16} strokeWidth={2} />
          </span>
        </a>
      )}
      {jump && (
        <a
          href={jump.href}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-[16px] font-semibold text-accent-fg transition-colors duration-200 hover:bg-accent-hover"
        >
          {jump.label}
          <IconChevronDown size={16} strokeWidth={2} />
        </a>
      )}
      {chipGroups && chipGroups.length > 0 && (
        <div
          role="group"
          aria-label="진단 요약"
          className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2"
          data-testid="diagnosis-summary"
        >
          {chipGroups.map((g, gi) => (
            <div key={gi} className="flex min-w-0 items-center gap-2">
              <span id={`summary-group-${gi}`} className="shrink-0 text-[12px] font-semibold text-stage-muted">
                {g.label}
              </span>
              <ul aria-labelledby={`summary-group-${gi}`} className="flex min-w-0 flex-wrap gap-1.5">
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
      )}
      {!chipGroups && chips && chips.length > 0 && (
        <ul className="mt-7 flex flex-wrap gap-2" aria-label="진단 요약">
          {chips.map((chip, i) => (
            <li key={i}>
              <Chip tone="stage" icon={chip.icon}>
                {chip.label}
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
