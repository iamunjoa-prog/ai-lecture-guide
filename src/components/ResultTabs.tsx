"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/components/ui";
import { setLocationHash, useLocationHash } from "./use-location-hash";

export type ResultTabId = "lectures" | "practice" | "prep" | "skills";

export interface ResultTab {
  id: ResultTabId;
  label: string;
  content: ReactNode;
}

export const DEFAULT_RESULT_TAB: ResultTabId = "lectures";
const panelId = (id: ResultTabId) => `result-panel-${id}`;
const tabId = (id: ResultTabId) => `result-tab-${id}`;

/** 요소가 들어 있는 탭 (탭 패널 밖이면 null) */
function tabOfElement(el: Element | null): ResultTabId | null {
  const panel = el?.closest<HTMLElement>("[data-tab-panel]");
  return (panel?.dataset.tabPanel as ResultTabId | undefined) ?? null;
}

type Pending = { kind: "tab" } | { kind: "el"; id: string } | null;

/**
 * 결과 화면 탭 (강의 · 실습 · 준비 · 스킬).
 * - 모든 패널을 서버에서 그려 두고 `hidden`으로만 숨긴다 → 패널 안 앵커(#lecture-…, #mission-…)가 항상 DOM에 있다.
 * - 선택된 탭은 주소 해시(#lectures 기본, #practice, #prep, #skills)로 정해진다. 서버·하이드레이션에서는 기본 탭.
 * - 숨은 패널 안의 앵커로 가는 링크(#roadmap, #lecture-…, #mission-…)를 누르면 그 탭으로 바꾼 뒤 스크롤한다.
 * - 탭을 누르면 방문 기록에 남아 뒤로 가기로 이전 탭으로 돌아간다.
 */
export function ResultTabs({ tabs, label = "결과 보기" }: { tabs: ResultTab[]; label?: string }) {
  const hash = useLocationHash();
  const ids = tabs.map((t) => t.id);
  const target = decodeURIComponent(hash.slice(1));
  const active: ResultTabId = (() => {
    if (!target) return DEFAULT_RESULT_TAB;
    if ((ids as string[]).includes(target)) return target as ResultTabId;
    // 해시가 패널 안 요소(#roadmap, #lecture-…)를 가리키면 그 패널. 하이드레이션 중에는 hash가 ""라 여기 오지 않는다
    const t = typeof document === "undefined" ? null : tabOfElement(document.getElementById(target));
    return t && ids.includes(t) ? t : DEFAULT_RESULT_TAB;
  })();

  const tabRefs = useRef<Partial<Record<ResultTabId, HTMLButtonElement | null>>>({});
  const anchorRef = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending>(null);
  /** 처음 열었을 때의 해시 (하이드레이션 중에는 hash가 ""이므로 실제 해시가 들어온 첫 번째만 '처음'으로 본다) */
  const initialHash = useRef<string | null>(null);
  const idsKey = ids.join(",");

  /** 탭 줄이 화면 위에 붙은 위치(=패널 시작)로 스크롤. 이미 그보다 위에 있으면 그대로 둔다 */
  const scrollToTabs = (force = false) => {
    const a = anchorRef.current;
    if (!a) return;
    const top = a.getBoundingClientRect().top + window.scrollY;
    if (force || window.scrollY > top) window.scrollTo({ top });
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.scrollIntoView({ block: "start" });
    // 링크를 누른 뒤 키보드 이동이 그 자리에서 이어지도록
    if (!el.hasAttribute("tabindex") && !el.matches("a,button,input,select,textarea,summary")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  // 해시가 바뀐 뒤(패널이 보이게 된 뒤) 스크롤
  useEffect(() => {
    const p = pending.current;
    pending.current = null;
    if (initialHash.current === null) initialHash.current = window.location.hash;
    const isFirst = hash !== "" && hash === initialHash.current;
    if (hash === initialHash.current) initialHash.current = "\0";
    if (p?.kind === "tab") return scrollToTabs();
    if (p?.kind === "el") return scrollToElement(p.id);
    if (!target) return;
    if ((ids as string[]).includes(target)) {
      // 공유 링크(#practice, #prep, #skills)로 처음 열면 그 탭 내용이 보이게
      if (isFirst && target !== DEFAULT_RESULT_TAB && window.scrollY === 0) scrollToTabs(true);
      return;
    }
    // 처음 열 때나 주소창·뒤로 가기로 패널 안 앵커에 왔을 때: 화면 밖이면 스크롤
    const el = document.getElementById(target);
    if (el && tabOfElement(el)) {
      const r = el.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.6) scrollToElement(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, active]);

  // 하이드레이션이 끝났다는 표시 (E2E에서 주소 해시를 바꾸기 전에 기다린다)
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    navRef.current?.setAttribute("data-ready", "");
  }, []);

  // 페이지 안 링크(#…) 가로채기: 탭 이름이면 탭 전환, 패널 안 요소면 그 탭으로 바꾼 뒤 스크롤
  useEffect(() => {
    const known = idsKey.split(",");
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!(a instanceof HTMLAnchorElement) || (a.target && a.target !== "_self")) return;
      const id = decodeURIComponent(a.getAttribute("href")!.slice(1));
      if (!id) return;
      const isTab = known.includes(id);
      const tab = isTab ? id : tabOfElement(document.getElementById(id));
      if (!tab || !known.includes(tab)) return;
      e.preventDefault();
      pending.current = isTab ? { kind: "tab" } : { kind: "el", id };
      if (window.location.hash === `#${id}`) {
        // 같은 해시: 상태는 그대로이므로 바로 스크롤
        pending.current = null;
        if (isTab) scrollToTabs();
        else scrollToElement(id);
        return;
      }
      setLocationHash(`#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [idsKey]);

  const select = (id: ResultTabId, focus = false) => {
    if (focus) tabRefs.current[id]?.focus();
    if (id === active && (target === id || (!target && id === DEFAULT_RESULT_TAB))) return;
    pending.current = { kind: "tab" };
    setLocationHash(`#${id}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = ids.indexOf(active);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % ids.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + ids.length) % ids.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ids.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(ids[next], true);
  };

  return (
    <>
      <div ref={anchorRef} aria-hidden="true" />
      <nav
        ref={navRef}
        aria-label="결과 보기 분류"
        className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-xl backdrop-saturate-150"
        data-testid="result-tabs"
      >
        <div
          role="tablist"
          aria-label={label}
          onKeyDown={onKeyDown}
          className={cn(
            "mx-auto grid max-w-content gap-1 px-5 py-2 max-[359px]:px-3",
            tabs.length === 4 ? "grid-cols-4" : tabs.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {tabs.map((t) => {
            const selected = t.id === active;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                type="button"
                role="tab"
                id={tabId(t.id)}
                aria-selected={selected}
                aria-controls={panelId(t.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(t.id)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full px-2 text-[15px] font-medium whitespace-nowrap transition-colors duration-200",
                  selected ? "bg-ink text-ink-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={panelId(t.id)}
          aria-labelledby={tabId(t.id)}
          hidden={t.id !== active}
          data-tab-panel={t.id}
          // 짧은 탭에서도 탭 줄이 위에 붙은 채로 전환되도록 최소 한 화면 높이
          className="min-h-dvh"
          data-testid={`result-panel-${t.id}`}
        >
          {t.content}
        </div>
      ))}
    </>
  );
}
