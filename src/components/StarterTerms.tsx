import Link from "next/link";
import type { GlossaryTerm } from "@/types";
import { IconArrowRight, Slide } from "@/components/ui";
import { TermAccordion } from "./TermAccordion";

/** 결과 화면: 시작 전에 알아두면 좋은 용어 */
export function StarterTerms({
  terms,
  byId,
  glossaryHref,
}: {
  terms: GlossaryTerm[];
  byId: Record<string, GlossaryTerm>;
  glossaryHref: string;
}) {
  if (terms.length === 0) return null;
  return (
    <Slide tone="muted" aria-labelledby="starter-title" innerClassName="pt-14 pb-12">
      <p className="eyebrow text-fg-muted">Before you watch</p>
      <h2 id="starter-title" className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-fg">
        시작 전에 알아두면 좋은 용어
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
        강의를 보기 전에 이 용어만 훑어 보세요. 모르는 말이 줄어들면 강의가 훨씬 잘 들립니다.
      </p>
      <div className="mt-6 border-t border-border" data-testid="starter-terms">
        {terms.map((t) => (
          <TermAccordion key={t.id} term={t} byId={byId} showLevel />
        ))}
      </div>
      <Link
        href={glossaryHref}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full text-[15px] font-medium text-accent-ink"
      >
        용어 전체 보기
        <IconArrowRight size={16} strokeWidth={2} />
      </Link>
    </Slide>
  );
}
