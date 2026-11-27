import Link from "next/link";
import type { GlossaryTerm, Level } from "@/types";
import { cn, IconChevronDown, Tag } from "@/components/ui";

export const LEVEL_TAGS: Record<Level, string> = {
  beginner: "입문",
  user: "활용",
  practitioner: "실무",
  developer: "개발",
};

export interface TermAccordionProps {
  term: GlossaryTerm;
  /** 관련 용어 이름을 찾기 위한 id → 용어 */
  byId: Record<string, GlossaryTerm>;
  /** 수준 태그 표시 */
  showLevel?: boolean;
  /** 관련 용어를 같은 페이지 앵커 링크로 (용어집 페이지 전용) */
  linkRelated?: boolean;
  /** 앵커 id를 붙일지 (용어집 페이지 전용) */
  anchor?: boolean;
}

/** 용어 한 줄 아코디언 (네이티브 details). 접힘: 용어·영어·한 줄 정의 / 펼침: 설명·예시·관련 용어 */
export function TermAccordion({ term, byId, showLevel = false, linkRelated = false, anchor = false }: TermAccordionProps) {
  const related = (term.related ?? []).map((id) => byId[id]).filter(Boolean);
  return (
    <details id={anchor ? term.id : undefined} className="group scroll-mt-24 border-b border-border">
      <summary
        className={cn(
          "flex list-none items-start gap-3 rounded-md py-4 [&::-webkit-details-marker]:hidden",
          "cursor-pointer select-none",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {showLevel && <Tag>{LEVEL_TAGS[term.level]}</Tag>}
            <span className="text-[17px] font-semibold tracking-[-0.015em] text-fg">{term.term}</span>
            {term.termEn && <span className="text-[13px] text-fg-muted">{term.termEn}</span>}
          </span>
          <span className="mt-1 block text-[15px] leading-relaxed text-fg-muted">{term.short}</span>
        </span>
        <span
          aria-hidden="true"
          className="mt-1 flex shrink-0 text-fg-muted transition-transform duration-300 group-open:rotate-180"
        >
          <IconChevronDown size={20} />
        </span>
      </summary>
      <div className="pb-5 pr-8">
        <p className="text-[15px] leading-relaxed text-fg">{term.detail}</p>
        {term.example && (
          <div className="mt-3 rounded-md bg-accent-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-accent-soft-fg">예시</p>
            <p className="mt-0.5 text-[15px] leading-relaxed text-accent-soft-fg">{term.example}</p>
          </div>
        )}
        {related.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] text-fg-muted">관련 용어</span>
            {related.map((r) =>
              linkRelated ? (
                <Link
                  key={r.id}
                  href={`#${r.id}`}
                  className="rounded-full border border-border-strong px-2.5 py-0.5 text-[13px] font-medium text-fg-muted transition-colors duration-200 hover:text-fg"
                >
                  {r.term}
                </Link>
              ) : (
                <Tag key={r.id}>{r.term}</Tag>
              ),
            )}
          </div>
        )}
      </div>
    </details>
  );
}
