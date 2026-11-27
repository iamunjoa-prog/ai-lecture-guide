"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/components/ui";
import { GLOSSARY_TABS, glossaryLevelAnchor, parseGlossaryTab, resolveGlossaryHash, type GlossaryTab } from "@/lib/glossary-tabs";
import { HASH_EVENT, useLocationHash } from "./use-location-hash";

const LABELS: Record<GlossaryTab, string> = { terms: "용어", theory: "3분 이론" };
const panelId = (t: GlossaryTab) => `glossary-panel-${t}`;
const tabId = (t: GlossaryTab) => `glossary-tab-${t}`;

/**
 * /glossary 탭 (용어 | 3분 이론).
 * - 두 패널을 서버에서 모두 그리고 `hidden`으로만 숨긴다. 탭은 쿼리 `?tab=theory`(서버도 안다)로 정해지고,
 *   해시(#theory, #theory-<개념>, #<용어>, 예전 /theory#<개념>)가 있으면 하이드레이션 뒤 그 탭으로 바꾼다.
 * - 해시가 가리키는 용어·개념은 펼치고 스크롤한다. `?l=<수준>`이면 그 수준 구역으로 스크롤한다.
 * - 탭을 누르면 방문 기록에 남아 뒤로 가기로 이전 탭으로 돌아간다.
 */
export function GlossaryTabs({
  initialTab,
  termIds,
  theoryIds,
  panels,
}: {
  initialTab: GlossaryTab;
  termIds: string[];
  theoryIds: string[];
  panels: Record<GlossaryTab, ReactNode>;
}) {
  const [queryTab, setQueryTab] = useState<GlossaryTab>(initialTab);
  const hash = useLocationHash();
  const terms = useMemo(() => new Set(termIds), [termIds]);
  const concepts = useMemo(() => new Set(theoryIds), [theoryIds]);
  // 하이드레이션 중에는 hash가 ""라 서버와 같은 탭으로 그린다
  const { tab: active, target } = resolveGlossaryHash(hash, queryTab, terms, concepts);
  const tabRefs = useRef<Partial<Record<GlossaryTab, HTMLButtonElement | null>>>({});
  const firstRun = useRef(true);

  // 뒤로·앞으로 가기: 쿼리에서 탭을 다시 읽는다 (해시는 useLocationHash가 따라간다)
  useEffect(() => {
    const onPop = () => setQueryTab(parseGlossaryTab(new URLSearchParams(window.location.search).get("tab")));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 해시가 가리키는 요소를 (탭이 보이게 된 뒤) 펼치고 스크롤. 처음 열 때 해시가 없고 ?l=이 있으면 그 수준 구역으로
  useEffect(() => {
    const isFirst = firstRun.current;
    firstRun.current = false;
    let id = target;
    if (!id && isFirst && !window.location.hash) {
      const level = new URLSearchParams(window.location.search).get("l");
      if (level) id = glossaryLevelAnchor(active, level);
    }
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.scrollIntoView({ block: "start" });
  }, [target, active]);

  // 하이드레이션이 끝났다는 표시 (E2E에서 기다린다)
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    navRef.current?.setAttribute("data-ready", "");
  }, []);

  const select = (t: GlossaryTab, focus = false) => {
    if (focus) tabRefs.current[t]?.focus();
    if (t === active && !window.location.hash) return;
    setQueryTab(t);
    window.history.pushState(null, "", t === "theory" ? "/glossary?tab=theory" : "/glossary");
    window.dispatchEvent(new Event(HASH_EVENT));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = GLOSSARY_TABS.indexOf(active);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % GLOSSARY_TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + GLOSSARY_TABS.length) % GLOSSARY_TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = GLOSSARY_TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(GLOSSARY_TABS[next], true);
  };

  return (
    <>
      <nav
        ref={navRef}
        aria-label="용어집 분류"
        className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-xl backdrop-saturate-150"
        data-testid="glossary-tabs"
      >
        <div role="tablist" aria-label="용어집 보기" onKeyDown={onKeyDown} className="mx-auto grid max-w-content grid-cols-2 gap-1 px-5 py-2">
          {GLOSSARY_TABS.map((t) => {
            const selected = t === active;
            return (
              <button
                key={t}
                ref={(el) => {
                  tabRefs.current[t] = el;
                }}
                type="button"
                role="tab"
                id={tabId(t)}
                aria-selected={selected}
                aria-controls={panelId(t)}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(t)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full px-2 text-[15px] font-medium whitespace-nowrap transition-colors duration-200",
                  selected ? "bg-ink text-ink-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {LABELS[t]}
              </button>
            );
          })}
        </div>
      </nav>
      {GLOSSARY_TABS.map((t) => (
        <div
          key={t}
          role="tabpanel"
          id={panelId(t)}
          aria-labelledby={tabId(t)}
          hidden={t !== active}
          data-tab-panel={t}
          data-testid={`glossary-panel-${t}`}
        >
          {panels[t]}
        </div>
      ))}
    </>
  );
}
