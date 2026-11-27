import type { ReactNode } from "react";
import { Chip, type ChipTone } from "./Chip";
import { cn } from "./cn";

export interface ResultHeroChip {
  label: ReactNode;
  icon?: ReactNode;
  tone?: ChipTone;
}

export interface ResultHeroProps {
  /** 큰 이모지. 기본 "🎉" */
  emoji?: ReactNode;
  /** 작은 상단 라벨. 예: "진단 완료" */
  eyebrow?: ReactNode;
  /** 축하 헤드라인 */
  title: ReactNode;
  description?: ReactNode;
  /** 진단 요약 칩 */
  chips?: ResultHeroChip[];
  className?: string;
}

const CONFETTI = [
  { c: "bg-accent", x: "10%", y: "14%", r: "12deg" },
  { c: "bg-primary", x: "86%", y: "10%", r: "-20deg" },
  { c: "bg-success", x: "22%", y: "6%", r: "35deg" },
  { c: "bg-accent", x: "74%", y: "22%", r: "-8deg" },
  { c: "bg-primary", x: "16%", y: "26%", r: "45deg" },
  { c: "bg-success", x: "92%", y: "28%", r: "60deg" },
];

/** 결과 화면 상단 축하 헤더 */
export function ResultHero({ emoji = "🎉", eyebrow, title, description, chips, className }: ResultHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl px-6 pt-10 pb-7 text-center",
        "bg-[radial-gradient(120%_90%_at_50%_0%,var(--primary-soft)_0%,var(--surface)_70%)] border border-border shadow-md",
        className,
      )}
    >
      {CONFETTI.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn("absolute h-2.5 w-1.5 rounded-sm opacity-80 animate-pop", p.c)}
          style={{ left: p.x, top: p.y, rotate: p.r, animationDelay: `${120 + i * 60}ms` }}
        />
      ))}
      <div aria-hidden="true" className="relative mx-auto mb-4 text-6xl leading-none animate-pop">
        {emoji}
      </div>
      {eyebrow && <p className="relative text-sm font-bold text-primary-soft-fg">{eyebrow}</p>}
      <h1 className="relative mt-1 text-[26px] font-bold leading-[1.35] tracking-[-0.025em] text-fg text-balance">{title}</h1>
      {description && <p className="relative mt-2 text-[15px] leading-relaxed text-fg-muted">{description}</p>}
      {chips && chips.length > 0 && (
        <ul className="relative mt-5 flex flex-wrap justify-center gap-2" aria-label="진단 요약">
          {chips.map((chip, i) => (
            <li key={i} className="animate-fade-up" style={{ animationDelay: `${200 + i * 70}ms` }}>
              <Chip tone={chip.tone ?? "primary"} icon={chip.icon}>
                {chip.label}
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
