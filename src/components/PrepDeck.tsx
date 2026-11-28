"use client";

import { useId, useState, type ReactNode } from "react";
import type { GlossaryTerm, StudyStyle, TheoryConcept } from "@/types";
import { cn, IconChevronDown, Slide, Tag } from "@/components/ui";
import { firstOpenIndex, prepDeckOrder } from "@/lib/card-deck";
import { addRef, removeRef } from "@/lib/saved";
import { CardDeck, type DeckEndContext, type DeckItem } from "./CardDeck";
import { DoneLine, EndLinkItems, type DeckLink } from "./deck-parts";
import { applySaved, SaveToggle } from "./saved/SaveToggle";
import { nowIso, useSaved } from "./saved/use-saved";
import { LEVEL_TAGS } from "./TermAccordion";

/** 결과 화면 개념 카드 앵커 (용어집 3분 이론 탭과 같은 규칙) */
const conceptAnchor = (id: string) => `theory-${id}`;
/** 결과 화면 용어 카드 앵커 */
export const termCardAnchor = (id: string) => `term-${id}`;

type PrepCard = DeckItem & ({ kind: "concept"; concept: TheoryConcept } | { kind: "term"; term: GlossaryTerm });

/**
 * 결과 화면 준비/개념 탭: 카드 덱(기본) ↔ 전체 목록(시작 전 용어 · 3분 이론).
 * 순서(lib/card-deck.ts `prepDeckOrder`): 개념이 주인공이면 개념 → 용어, 아니면 용어(몸풀기) → 개념.
 * 개념 카드: 제목·요약·첫 문단 → '더 보기'로 나머지 문단·쉽게 말하면·바로 해보기 → 출처(작게). [읽었어요 → 다음]
 * 용어 카드: 앞면 용어·영어 → '뜻 보기'로 한 줄 뜻·설명·예시.
 * 개념이 주인공이면 덱이 아직 읽지 않은 첫 개념에서 시작하고, 그 카드에 '이번 주 개념'을 붙인다(따로 카드를 두지 않는다).
 */
export function PrepDeck({
  storageKey,
  style,
  concepts,
  terms,
  weeklyConcept,
  glossaryHref,
  theoryHref,
  links,
  list,
  journey,
}: {
  storageKey: string;
  style: StudyStyle;
  concepts: TheoryConcept[];
  /** 덱에 넣을 용어 (시작 전 용어 중 처음 몇 개) */
  terms: GlossaryTerm[];
  /** 개념이 주인공이면 true: 읽지 않은 첫 개념에 '이번 주 개념' */
  weeklyConcept: boolean;
  glossaryHref: string;
  theoryHref: string;
  links: DeckLink[];
  list: ReactNode;
  journey?: ReactNode;
}) {
  const { state, ready, available } = useSaved();
  const loaded = ready && available;
  const readIds = ready ? new Set(state.theoryRead.map((r) => r.id)) : null;

  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  const termById = new Map(terms.map((t) => [t.id, t]));
  const items: PrepCard[] = prepDeckOrder(
    style,
    concepts.map((c) => c.id),
    terms.map((t) => t.id),
    terms.length,
  ).map((e) =>
    e.kind === "concept"
      ? { kind: "concept", id: e.id, anchors: [conceptAnchor(e.id)], concept: conceptById.get(e.id)! }
      : { kind: "term", id: `term-${e.id}`, anchors: [termCardAnchor(e.id)], term: termById.get(e.id)! },
  );
  const conceptIds = concepts.map((c) => c.id);
  const weeklyId = weeklyConcept
    ? conceptIds[
        Math.min(
          firstOpenIndex(conceptIds, (id) => Boolean(readIds?.has(id))),
          conceptIds.length - 1,
        )
      ]
    : undefined;
  const readCount = loaded ? conceptIds.filter((id) => readIds?.has(id)).length : 0;

  const renderEnd = ({ headingId }: DeckEndContext) => (
    <div data-testid="prep-end">
      <h3
        id={headingId}
        tabIndex={-1}
        className="text-[22px] font-bold leading-snug tracking-[-0.02em] text-fg outline-none"
      >
        {readCount > 0 ? `개념 ${readCount}개 읽었어요` : "용어와 개념을 한 번씩 훑어봤어요"}
      </h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">
        {readCount < concepts.length
          ? "다 읽지 않아도 괜찮아요. 강의를 보다가 막히면 다시 와서 보세요."
          : "이제 강의가 훨씬 잘 들릴 거예요."}
      </p>
    </div>
  );

  const frame = (children: ReactNode) => (
    <Slide tone="light" innerClassName="pb-10">
      {children}
    </Slide>
  );

  return (
    <CardDeck
      kind="prep"
      storageKey={storageKey}
      title={weeklyConcept ? "오늘의 개념" : "강의 전 준비"}
      counterLabel="카드"
      items={items}
      doneIds={readIds}
      primaryLabel={(it, done) => (it.kind === "concept" ? (done ? null : "읽었어요") : "알겠어요")}
      onComplete={(it, done) => {
        if (it.kind !== "concept" || done) return true;
        if (!ready) return false;
        return applySaved((s) => addRef(s, "theoryRead", it.id, nowIso()), "읽은 개념으로 기록했어요");
      }}
      renderCard={(it, ctx) =>
        it.kind === "concept" ? (
          <ConceptCardBody
            concept={it.concept}
            headingId={ctx.headingId}
            done={ctx.done}
            weekly={it.id === weeklyId}
            onUndo={() => applySaved((s) => removeRef(s, "theoryRead", it.id), "읽음 표시를 지웠어요")}
          />
        ) : (
          <TermCardBody term={it.term} headingId={ctx.headingId} />
        )
      }
      renderEnd={renderEnd}
      endLinks={
        <EndLinkItems
          links={[...links, { href: glossaryHref, label: "용어 전체 보기" }, { href: theoryHref, label: "3분 이론 전체 보기" }]}
        />
      }
      list={list}
      frame={frame}
      after={journey}
      listBefore={journey}
    />
  );
}

function ConceptCardBody({
  concept,
  headingId,
  done,
  weekly,
  onUndo,
}: {
  concept: TheoryConcept;
  headingId: string;
  done: boolean;
  weekly: boolean;
  onUndo: () => void;
}) {
  const uid = useId();
  const [more, setMore] = useState(false);
  const [first, ...rest] = concept.body;
  return (
    <div data-testid="concept-card">
      <div className="-mt-2 -mr-3 flex items-center justify-between gap-2">
        <p className="min-w-0 text-[13px] text-fg-muted">
          {weekly && <span className="font-semibold text-accent-ink">이번 주 개념 · </span>}
          3분 이론
        </p>
        <SaveToggle kind="theory" id={concept.id} label={`이론 저장: ${concept.title}`} />
      </div>
      <h3
        id={headingId}
        tabIndex={-1}
        className="mt-0.5 text-[20px] font-bold leading-snug tracking-[-0.02em] text-fg outline-none"
        data-testid="deck-card-title"
      >
        {concept.title}
      </h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{concept.summary}</p>
      {done && <DoneLine text="읽은 개념이에요" undo="읽음 취소" onUndo={onUndo} />}
      {first && <p className="mt-4 text-[16px] leading-[1.75] text-fg">{first}</p>}
      <div id={`${uid}-more`} hidden={!more} className="mt-3" data-testid="concept-more-body">
        <div className="space-y-3">
          {rest.map((p, i) => (
            <p key={i} className="text-[16px] leading-[1.75] text-fg">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-5 rounded-md bg-accent-soft px-4 py-3.5">
          <p className="text-[13px] font-semibold text-accent-soft-fg">쉽게 말하면</p>
          <p className="mt-1 text-[15px] leading-relaxed text-accent-soft-fg">{concept.analogy}</p>
        </div>
        {concept.tryIt && (
          <div className="mt-4 border-l-2 border-accent pl-3.5">
            <p className="text-[13px] font-semibold text-fg">바로 해보기</p>
            <p className="mt-0.5 text-[15px] leading-relaxed text-fg-muted">{concept.tryIt}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-expanded={more}
        aria-controls={`${uid}-more`}
        onClick={() => setMore((v) => !v)}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong px-4 text-[14px] font-medium text-fg hover:bg-surface-2"
        data-testid="concept-more"
      >
        {more ? "접기" : "더 보기 · 쉽게 말하면"}
        <span aria-hidden="true" className={cn("flex transition-transform duration-300", more && "rotate-180")}>
          <IconChevronDown size={16} />
        </span>
      </button>
      <div className="mt-5 border-t border-border pt-3">
        <p className="text-[12px] font-semibold text-fg-muted">출처</p>
        <ul className="mt-1 space-y-1" data-testid="theory-sources">
          {concept.sources.map((s) => (
            <li key={s.url} className="text-[12px] leading-relaxed text-fg-muted">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words underline decoration-border-strong underline-offset-4 hover:text-fg"
              >
                {s.publisher} · {s.title}
                <span className="sr-only"> (새 탭에서 열림)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** 용어 카드: 앞면(용어) → '뜻 보기'로 뒤집으면 한 줄 뜻 · 설명 · 예시 */
function TermCardBody({ term, headingId }: { term: GlossaryTerm; headingId: string }) {
  const uid = useId();
  const [flipped, setFlipped] = useState(false);
  return (
    <div data-testid="term-card" data-flipped={flipped ? "" : undefined}>
      <div className="-mt-2 -mr-3 flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-2 text-[13px] text-fg-muted">
          용어 <Tag>{LEVEL_TAGS[term.level]}</Tag>
        </p>
        <SaveToggle kind="term" id={term.id} label={`용어 저장: ${term.term}`} />
      </div>
      <div className={cn("mt-1 text-center", flipped ? "py-2" : "py-8")}>
        <h3
          id={headingId}
          tabIndex={-1}
          className="text-[26px] font-bold leading-snug tracking-[-0.025em] text-fg outline-none"
          data-testid="deck-card-title"
        >
          {term.term}
        </h3>
        {term.termEn && <p className="mt-1 text-[15px] text-fg-muted">{term.termEn}</p>}
        {!flipped && <p className="mt-4 text-[14px] text-fg-muted">어떤 뜻일지 떠올려 본 뒤 눌러 보세요.</p>}
      </div>
      <div id={`${uid}-back`} hidden={!flipped} className="animate-fade-in" data-testid="term-back">
        <p className="text-[17px] font-semibold leading-relaxed text-fg">{term.short}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-fg">{term.detail}</p>
        {term.example && (
          <div className="mt-3 rounded-md bg-accent-soft px-4 py-3">
            <p className="text-[13px] font-semibold text-accent-soft-fg">예시</p>
            <p className="mt-0.5 text-[15px] leading-relaxed text-accent-soft-fg">{term.example}</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          aria-expanded={flipped}
          aria-controls={`${uid}-back`}
          onClick={() => setFlipped((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border-strong px-5 text-[15px] font-medium text-fg hover:bg-surface-2"
          data-testid="term-flip"
        >
          {flipped ? "뜻 가리기" : "뜻 보기"}
        </button>
      </div>
    </div>
  );
}
