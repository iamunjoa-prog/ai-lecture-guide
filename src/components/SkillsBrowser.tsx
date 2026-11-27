"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { cn, IconArrowRight } from "@/components/ui";
import type { TrendingSkill } from "@/lib/skills";
import { SkillCard } from "./SkillCard";
import { SKILL_FILTERS, type SkillFilter, type SkillLectureLink } from "./skill-links";
import { useLocationHash } from "./use-location-hash";

export interface SkillsBrowserItem {
  skill: TrendingSkill;
  lectures: SkillLectureLink[];
  terms: { id: string; term: string }[];
}

/** /skills: 수준 필터(전체 · 활용자 · 실무자 · 개발자, 주소 `?l=`와 맞춤) + 스킬 목록 */
export function SkillsBrowser({ items, initial }: { items: SkillsBrowserItem[]; initial: SkillFilter }) {
  const [filter, setFilter] = useState<SkillFilter>(initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const hash = useLocationHash();

  // 해시가 가리키는 스킬이 필터에 걸러졌다면 전체를 보여 준다 (딥링크가 항상 열리게)
  const hashSkill = items.find((it) => `#${it.skill.id}` === hash)?.skill;
  const effective: SkillFilter = hashSkill && filter !== "all" && !hashSkill.levels.includes(filter) ? "all" : filter;
  const shown = effective === "all" ? items : items.filter((it) => it.skill.levels.includes(effective));
  const current = Math.max(
    0,
    SKILL_FILTERS.findIndex((f) => f.value === effective),
  );

  const choose = (v: SkillFilter) => {
    setFilter(v);
    const url = new URL(window.location.href);
    if (v === "all") url.searchParams.delete("l");
    else url.searchParams.set("l", v);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (current + keys[e.key] + SKILL_FILTERS.length) % SKILL_FILTERS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = SKILL_FILTERS.length - 1;
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    choose(SKILL_FILTERS[next].value);
  };

  return (
    <>
      <div role="radiogroup" aria-label="수준별로 보기" onKeyDown={onKeyDown} className="flex flex-wrap gap-2" data-testid="skill-filters">
        {SKILL_FILTERS.map((f, i) => {
          const checked = f.value === effective;
          return (
            <button
              key={f.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={i === current ? 0 : -1}
              onClick={() => choose(f.value)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-[14px] font-medium whitespace-nowrap transition-colors duration-200 max-[359px]:px-3.5",
                checked ? "border-ink bg-ink text-ink-fg" : "border-border-strong text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[14px] leading-relaxed text-fg-muted" data-testid="beginner-note">
        입문자라면 기본 강의와 실습부터 시작해 보세요.{" "}
        <Link href="/diagnosis" className="inline-flex min-h-11 items-center gap-1 rounded-full font-medium whitespace-nowrap text-accent-ink align-middle">
          진단하기
          <IconArrowRight size={14} strokeWidth={2} />
        </Link>
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        스킬 {shown.length}개
      </p>
      <div className="mt-2 border-t border-border" data-testid="skills-list" data-filter={effective}>
        {shown.map((it) => (
          <SkillCard key={it.skill.id} skill={it.skill} anchor lectures={it.lectures} terms={it.terms} />
        ))}
      </div>
    </>
  );
}
