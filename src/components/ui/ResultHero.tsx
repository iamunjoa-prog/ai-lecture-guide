import type { ReactNode } from "react";
import { Chip } from "./Chip";
import { cn } from "./cn";

export interface ResultHeroChip {
  label: ReactNode;
  icon?: ReactNode;
}

export interface ResultHeroProps {
  /** 작은 상단 라벨. 예: "진단 완료" */
  eyebrow?: ReactNode;
  /** 큰 헤드라인 */
  title: ReactNode;
  description?: ReactNode;
  /** 진단 요약 칩 */
  chips?: ResultHeroChip[];
  className?: string;
}

/** 결과 화면 상단 키노트 슬라이드 내용 (어두운 Slide 안에 둔다) */
export function ResultHero({ eyebrow, title, description, chips, className }: ResultHeroProps) {
  return (
    <div className={cn("animate-fade-in pt-14 pb-16", className)}>
      {eyebrow && <p className="eyebrow-ko text-[13px] text-stage-muted">{eyebrow}</p>}
      <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg text-balance">{title}</h1>
      {description && <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">{description}</p>}
      {chips && chips.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="진단 요약">
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
