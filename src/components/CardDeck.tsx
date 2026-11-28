"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Button, cn, IconArrowRight, IconChevronLeft } from "@/components/ui";
import {
  clampDeckIndex,
  deckPositionLabel,
  deckViewOf,
  indexForHash,
  keyToMove,
  moveIndex,
  positionAt,
  rememberPosition,
  resolveDeckStart,
  setDeckView,
  swipeAxis,
  swipeMove,
  type DeckKind,
  type DeckMove,
} from "@/lib/card-deck";
import { END_ROW } from "./deck-parts";
import { updateDeckMemory, useDeckMemory } from "./use-deck-memory";
import { useLocationHash } from "./use-location-hash";

export interface DeckItem {
  id: string;
  /** 이 카드를 가리키는 주소 해시 id. 첫 값이 카드 요소의 id (#mission-… 등), 나머지는 별칭 (#practice-group-n) */
  anchors: readonly string[];
}

export interface DeckCardContext {
  index: number;
  total: number;
  /** 카드 제목에 붙일 id (카드가 바뀌면 이 제목으로 초점이 간다) */
  headingId: string;
  current: boolean;
  done: boolean;
}

export interface DeckEndContext {
  headingId: string;
}

export interface CardDeckProps<T extends DeckItem> {
  kind: DeckKind;
  /** 진단별 기억 키 (lib/card-deck.ts `deckKey`) */
  storageKey: string;
  /** 덱 이름 (영역 이름·머리 작은 제목). 예: "오늘의 실습" */
  title: string;
  /** 진행 표시 앞말. 예: "실습" → "실습 1 / 7" */
  counterLabel: string;
  items: readonly T[];
  /** 끝낸 카드 id. null이면 아직 내 학습함을 읽기 전 */
  doneIds: ReadonlySet<string> | null;
  renderCard: (item: T, ctx: DeckCardContext) => ReactNode;
  /** 주 버튼 앞말. "완료했어요" → [완료했어요 → 다음]. null이면 [다음 →] (이미 끝냈거나 끝낼 것이 없는 카드) */
  primaryLabel: (item: T, done: boolean) => string | null;
  /** 주 버튼: 끝냄 표시. false를 돌려주면 넘기지 않는다(저장 실패 등) */
  onComplete?: (item: T, done: boolean) => boolean | void;
  onSkip?: (item: T) => void;
  /** 끝 카드 머리(제목 · 한 줄). 아래 '다음에 해 볼 것'은 CardDeck이 그린다 */
  renderEnd: (ctx: DeckEndContext) => ReactNode;
  /** 끝 카드 '다음에 해 볼 것' 앞쪽 항목 (<li>들: 다른 탭 · 모음 링크). 뒤에 '처음 카드부터 다시 보기' · '전체 목록으로 보기'가 붙는다 */
  endLinks?: ReactNode;
  /** '전체 목록 보기'에서 보여 줄 목록 */
  list: ReactNode;
  /** 덱 UI(덱 · 목록 머리)를 감싸는 틀. 목록(list)은 감싸지 않는다 (목록이 이미 전체 폭 구역일 때) */
  frame?: (children: ReactNode) => ReactNode;
  /** 한 장씩 보기일 때 덱 아래 (예: 내 학습 여정) */
  after?: ReactNode;
  /** 목록 보기일 때 목록 머리 아래·목록 위 */
  listBefore?: ReactNode;
  className?: string;
}

/** 덱 영역이 위로 지나갔으면 탭 줄 아래로 맞춰 올린다 (긴 카드 아래에서 버튼을 눌렀을 때) */
function revealTop(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  if (top < 56) el.scrollIntoView({ block: "start" });
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * 한 장씩 넘기는 카드 덱 (결과 화면 실습 · 준비/개념 탭).
 * - 머리: "실습 1 / 7" + 점 진행(장식) · 이전/다음 · '전체 목록 보기'(선택 기억)
 * - 카드는 모두 서버에서 그리고 지금 카드만 보인다 → 주소 해시(#mission-…)가 늘 DOM에 있고, 해시로 오면 그 카드를 연다
 * - 바닥에 붙는 동작 줄: [건너뛰기] [완료했어요 → 다음]. 불투명 배경이라 뒤 글자와 겹쳐 보이지 않고, 끝까지 내리면 내용 아래에 놓인다
 * - 넘기기: 버튼 · ←/→ (덱 안에 초점이 있을 때) · 터치로 가로 밀기(세로 스크롤·글 선택·버튼은 그대로)
 * - 카드가 바뀌면 카드 제목으로 초점이 가고 "n번째 카드"를 읽어 준다
 * - 보던 카드는 진단마다 기억한다(이어서 보기). 서버·하이드레이션 중에는 첫 카드
 */
export function CardDeck<T extends DeckItem>({
  kind,
  storageKey,
  title,
  counterLabel,
  items,
  doneIds,
  renderCard,
  primaryLabel,
  onComplete,
  onSkip,
  renderEnd,
  endLinks,
  list,
  frame = (c) => c,
  after,
  listBefore,
  className,
}: CardDeckProps<T>) {
  const uid = useId();
  const memory = useDeckMemory();
  const view = deckViewOf(memory, kind);
  const ids = items.map((it) => it.id);
  const total = items.length;
  const isDone = (id: string) => Boolean(doneIds?.has(id));

  // 시작 카드: 서버·하이드레이션 중에는 0, 브라우저 저장을 읽으면 보던 카드 → 끝내지 않은 첫 카드
  const start = memory && doneIds ? resolveDeckStart(ids, memory.positions[storageKey], isDone) : { index: 0, resumed: false };
  const [chosen, setChosen] = useState<number | null>(null);
  const index = clampDeckIndex(chosen ?? start.index, total);
  const atEnd = index >= total;
  const resumed = chosen === null && start.resumed;

  // 주소 해시가 덱의 카드를 가리키면 그 카드로 (처음 열 때 · 강의 카드의 '실습하기' · 뒤로 가기)
  const hash = useLocationHash();
  const [seenHash, setSeenHash] = useState("");
  if (hash !== seenHash) {
    setSeenHash(hash);
    const i = indexForHash(
      hash,
      items.map((it) => it.anchors),
    );
    if (i >= 0 && i !== index) setChosen(i);
  }

  const [announce, setAnnounce] = useState("");
  const pendingFocus = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headingIdAt = (i: number) => (i >= total ? `${uid}-end` : `${uid}-h${i}`);

  const go = (next: number, { focus = true }: { focus?: boolean } = {}) => {
    const i = clampDeckIndex(next, total);
    setChosen(i);
    setAnnounce(i >= total ? "마지막 정리 카드" : `${i + 1}번째 카드`);
    pendingFocus.current = focus;
    updateDeckMemory((m) => rememberPosition(m, storageKey, positionAt(ids, i, new Date().toISOString())));
  };
  const move = (m: DeckMove) => go(moveIndex(index, m, total));

  // 카드가 바뀐 뒤: 제목으로 초점, 덱 머리가 위로 지나갔으면 올린다
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const h = document.getElementById(headingIdAt(index));
    h?.focus({ preventScroll: true });
    revealTop(rootRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // 같은 해시 링크를 다시 눌렀을 때(해시가 그대로라 위 규칙이 안 걸린다)도 그 카드로. 결과 탭의 스크롤보다 먼저 그린다
  const latest = useRef({ items, index, view, go });
  useEffect(() => {
    latest.current = { items, index, view, go };
  });
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!(a instanceof HTMLAnchorElement)) return;
      const { items: list, index: cur, view: v, go: goTo } = latest.current;
      if (v !== "deck") return;
      const i = indexForHash(
        a.getAttribute("href")!,
        list.map((it) => it.anchors),
      );
      if (i < 0 || i === cur) return;
      flushSync(() => goTo(i, { focus: false }));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const setView = (v: "deck" | "list") => {
    updateDeckMemory((m) => setDeckView(m, kind, v));
    // 바꾼 뒤 그 자리(덱 머리)에서 이어 보도록
    requestAnimationFrame(() => {
      revealTop(rootRef.current);
      document.getElementById(`${uid}-toggle`)?.focus({ preventScroll: true });
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest("input,textarea,select,[contenteditable='true']")) return;
    const m = keyToMove(e.key);
    if (!m) return;
    e.preventDefault();
    move(m);
  };

  // 터치로 가로 밀기 (마우스는 글 선택을 위해 제외). touch-action: pan-y라 세로 스크롤은 브라우저가 그대로 한다
  const drag = useRef<{ id: number; x: number; y: number; t: number; axis: "x" | "y" | null; animate: boolean } | null>(null);
  const resetDrag = () => {
    drag.current = null;
    const el = cardsRef.current;
    if (el) {
      el.style.transform = "";
      el.style.transition = "";
    }
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || !e.isPrimary) return;
    if ((e.target as Element).closest("button,a,input,textarea,select,summary,[data-no-swipe]")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, axis: null, animate: !reducedMotion() };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.axis === null) d.axis = swipeAxis(dx, dy);
    if (d.axis === "y") return resetDrag();
    if (d.axis === "x" && d.animate && cardsRef.current) {
      cardsRef.current.style.transition = "none";
      cardsRef.current.style.transform = `translateX(${Math.round(dx * 0.35)}px)`;
    }
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const m = swipeMove(e.clientX - d.x, e.clientY - d.y, e.timeStamp - d.t);
    resetDrag();
    // 글을 고르는 중이면 넘기지 않는다
    if (!m || (window.getSelection()?.toString() ?? "") !== "") return;
    if (m === "prev" && index === 0) return;
    if (m === "next" && atEnd) return;
    move(m);
  };

  const toggle = (
    <button
      id={`${uid}-toggle`}
      type="button"
      onClick={() => setView(view === "deck" ? "list" : "deck")}
      className="-mr-2 inline-flex min-h-11 shrink-0 items-center rounded-full px-2 text-[14px] font-medium text-fg-muted underline decoration-border-strong underline-offset-4 hover:text-fg"
      data-testid="deck-view-toggle"
    >
      {view === "deck" ? "전체 목록 보기" : "한 장씩 보기"}
    </button>
  );

  if (view === "list") {
    return (
      <div className={className} data-testid="deck-list" data-deck={kind}>
        {frame(
          <>
            <div
              ref={rootRef as React.RefObject<HTMLDivElement>}
              className="flex scroll-mt-16 items-center justify-between gap-3 pt-5"
            >
              <p className="eyebrow-ko text-fg-muted">{title} · 전체 목록</p>
              {toggle}
            </div>
            {listBefore}
          </>,
        )}
        {list}
      </div>
    );
  }

  const current = items[index];
  const done = current ? isDone(current.id) : false;
  const regionLabel = title;

  return frame(
    <>
      <section
        ref={rootRef}
        aria-roledescription="카드 넘기기"
        aria-label={regionLabel}
        onKeyDown={onKeyDown}
        className={cn("scroll-mt-16 pt-5", className)}
        data-testid="card-deck"
        data-deck={kind}
        data-index={index}
        data-total={total}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow-ko text-accent-ink">{title}</p>
          {toggle}
        </div>
        <div className="-mt-1 flex items-center gap-3">
          <p className="shrink-0 text-[15px] font-semibold text-fg tabular-nums" data-testid="deck-counter">
            <span aria-hidden="true">{atEnd ? `${counterLabel} 마무리` : `${counterLabel} ${index + 1} / ${total}`}</span>
            <span className="sr-only">{atEnd ? "마지막 정리 카드" : deckPositionLabel(index, total)}</span>
          </p>
          <ol aria-hidden="true" className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5" data-testid="deck-dots">
            {items.map((it, i) => (
              <li
                key={it.id}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-300",
                  i === index ? "w-4 bg-ink" : isDone(it.id) ? "w-1.5 bg-accent" : "w-1.5 bg-border-strong",
                )}
                data-done={isDone(it.id) ? "" : undefined}
              />
            ))}
          </ol>
          <div className="-mr-2 flex shrink-0">
            <button
              type="button"
              onClick={() => move("prev")}
              disabled={index === 0}
              aria-label="이전 카드"
              className="inline-flex size-11 items-center justify-center rounded-full text-fg hover:bg-surface-2 disabled:text-fg-subtle"
              data-testid="deck-prev"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => move("next")}
              disabled={atEnd}
              aria-label="다음 카드"
              className="inline-flex size-11 items-center justify-center rounded-full text-fg hover:bg-surface-2 disabled:text-fg-subtle"
              data-testid="deck-next"
            >
              <IconChevronLeft size={20} className="rotate-180" />
            </button>
          </div>
        </div>
        {resumed && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-fg-muted" data-testid="deck-resumed">
            지난번에 보던 카드부터 이어서 보여 드려요.
            <button
              type="button"
              onClick={() => go(0)}
              className="inline-flex min-h-11 items-center font-semibold text-fg underline underline-offset-4"
            >
              처음부터 보기
            </button>
          </p>
        )}
        <p aria-live="polite" className="sr-only" data-testid="deck-live">
          {announce}
        </p>

        <div
          ref={cardsRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={resetDrag}
          className="mt-3 touch-pan-y transition-transform duration-200"
          data-testid="deck-cards"
        >
          {items.map((it, i) => {
            const isCur = i === index;
            const anchorId = it.anchors[0];
            return (
              <section
                key={it.id}
                id={anchorId}
                hidden={!isCur}
                aria-labelledby={headingIdAt(i)}
                aria-roledescription="카드"
                className="animate-fade-in scroll-mt-20 rounded-xl border border-border bg-surface px-5 pt-5 pb-6"
                data-testid="deck-card"
                data-id={it.id}
                data-done={isDone(it.id) ? "" : undefined}
              >
                {it.anchors.slice(1).map((alias) => (
                  <span key={alias} id={alias} className="block scroll-mt-20" />
                ))}
                {renderCard(it, { index: i, total, headingId: headingIdAt(i), current: isCur, done: isDone(it.id) })}
              </section>
            );
          })}
          <section
            hidden={!atEnd}
            aria-labelledby={headingIdAt(total)}
            aria-roledescription="카드"
            className="animate-fade-in rounded-xl border border-border bg-surface-2 px-5 pt-6 pb-6"
            data-testid="deck-end"
          >
            {renderEnd({ headingId: headingIdAt(total) })}
            <div className="mt-5">
              <p className="eyebrow-ko text-fg-muted">다음에 해 볼 것</p>
              <ul className="mt-1 border-t border-border" data-testid="deck-end-links">
                {endLinks}
                <li>
                  <button type="button" onClick={() => go(0)} className={END_ROW} data-testid="deck-restart">
                    <span className="min-w-0 flex-1">처음 카드부터 다시 보기</span>
                    <IconArrowRight size={16} strokeWidth={2} className="shrink-0 text-fg-muted" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setView("list")} className={END_ROW}>
                    <span className="min-w-0 flex-1">전체 목록으로 보기</span>
                    <IconArrowRight size={16} strokeWidth={2} className="shrink-0 text-fg-muted" />
                  </button>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {current && (
          <div
            className="sticky bottom-0 z-10 -mx-5 mt-4 bg-bg px-5 pt-2 pb-[max(16px,env(safe-area-inset-bottom))]"
            data-testid="deck-actions"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-full h-4 bg-gradient-to-t from-bg to-transparent"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="md"
                className="min-h-12 shrink-0 px-5"
                onClick={() => {
                  onSkip?.(current);
                  move("next");
                }}
                data-testid="deck-skip"
              >
                건너뛰기
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (onComplete?.(current, done) === false) return;
                  move("next");
                }}
                className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-4 text-[15px] font-semibold whitespace-nowrap text-ink-fg transition-colors duration-200 hover:bg-ink-hover"
                data-testid="deck-complete"
              >
                {(() => {
                  const label = primaryLabel(current, done);
                  return label ? (
                    <>
                      <span>{label}</span>
                      <IconArrowRight size={17} strokeWidth={2} />
                      <span>다음</span>
                    </>
                  ) : (
                    <>
                      <span>다음</span>
                      <IconArrowRight size={17} strokeWidth={2} />
                    </>
                  );
                })()}
              </button>
            </div>
          </div>
        )}
      </section>
      {after && <div className="mt-8 border-t border-border">{after}</div>}
    </>,
  );
}
