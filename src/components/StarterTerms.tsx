"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { GlossaryTerm } from "@/types";
import { IconArrowRight, IconChevronDown, cn, Slide } from "@/components/ui";
import { INITIAL_TERMS } from "@/lib/glossary";
import { TermAccordion } from "./TermAccordion";


/** 결과 화면: 시작 전에 알아두면 좋은 용어 */
export function StarterTerms({
  terms,
  byId,
  glossaryHref,
  roadmapHref = "#roadmap",
}: {
  terms: GlossaryTerm[];
  byId: Record<string, GlossaryTerm>;
  glossaryHref: string;
  /** null이면 '추천 강의 바로 보기' 링크를 숨긴다 */
  roadmapHref?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  if (terms.length === 0) return null;
  const hidden = Math.max(0, terms.length - INITIAL_TERMS);
  const shown = expanded ? terms : terms.slice(0, INITIAL_TERMS);
  return (
    <Slide tone="muted" aria-labelledby="starter-title" innerClassName="pt-12 pb-10">
      <p className="eyebrow text-fg-muted">Before you watch</p>
      <h2 id="starter-title" className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-fg">
        시작 전에 알아두면 좋은 용어
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
        강의를 보기 전에 이 용어만 훑어 보세요. 모르는 말이 줄어들면 강의가 훨씬 잘 들립니다.
      </p>
      <div id={listId} className="mt-6 border-t border-border" data-testid="starter-terms">
        {shown.map((t) => (
          <TermAccordion key={t.id} term={t} byId={byId} showLevel />
        ))}
      </div>
      <div className="mt-5 flex flex-col items-start gap-1">
        {hidden > 0 && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 text-[15px] font-medium text-fg transition-colors duration-200 hover:bg-surface-sunken"
          >
            {expanded ? "용어 접기" : `용어 ${hidden}개 더 보기`}
            <span aria-hidden="true" className={cn("flex transition-transform duration-300", expanded && "rotate-180")}>
              <IconChevronDown size={16} />
            </span>
          </button>
        )}
        <Link href={glossaryHref} className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-medium text-accent-ink">
          용어 전체 보기
          <IconArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
      {roadmapHref && (
        <a
          href={roadmapHref}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-semibold text-fg underline underline-offset-4"
        >
          용어는 나중에, 추천 강의 바로 보기
          <IconChevronDown size={16} />
        </a>
      )}
    </Slide>
  );
}
