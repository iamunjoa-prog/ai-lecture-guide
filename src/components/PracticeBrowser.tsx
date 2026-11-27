"use client";

import { useEffect, useId, useState } from "react";
import type { Domain, Goal, Level } from "@/types";
import { missionAnchorId } from "@/lib/journey";
import type { PracticeMission, PracticeTool } from "@/lib/practice";
import {
  DEFAULT_PRACTICE_FILTER,
  filterForHash,
  filterMissions,
  isDefaultFilter,
  parsePracticeDomain,
  parsePracticeFilter,
  practiceQuery,
  type PracticeFilter,
} from "@/lib/practice-browse";
import { DOMAIN_LABELS, DOMAINS, GOAL_LABELS, GOALS, LEVEL_LABELS, LEVELS } from "@/lib/questions";
import { ChipRadioGroup, type ChipOption } from "./ChipRadioGroup";
import { resolvePrompts } from "./PracticeMissionBlock";
import { MissionItem } from "./PracticeMissions";
import { HASH_EVENT, useLocationHash } from "./use-location-hash";

export interface PracticeBrowserItem {
  mission: PracticeMission;
  video: { id: string; title: string; url: string; levels: Level[]; goals: Goal[] };
  instructorName: string;
}

const LEVEL_OPTIONS: ChipOption<Level | "all">[] = [{ value: "all", label: "전체" }, ...LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))];
const GOAL_OPTIONS: ChipOption<Goal | "all">[] = [{ value: "all", label: "전체" }, ...GOALS.map((g) => ({ value: g, label: GOAL_LABELS[g] }))];
const TOOL_OPTIONS: ChipOption<PracticeTool | "all">[] = [
  { value: "all", label: "전체" },
  { value: "chat", label: "챗봇만 있으면 돼요" },
  { value: "coding", label: "코딩" },
  { value: "automation", label: "자동화" },
];

interface BrowseState {
  filter: PracticeFilter;
  domain: Domain | null;
}

function readLocation(): BrowseState {
  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  return { filter: parsePracticeFilter(params), domain: parsePracticeDomain(params.d) };
}

/**
 * /practice 실습 모음: 수준 · 목표 · 필요한 도구 필터(주소 `?l=&g=&t=`와 맞춤, 함께 쓸 수 있음)와
 * 프롬프트 분야(`?d=`), 미션 목록. 필터를 바꾸면 방문 기록에 남아 뒤로 가기로 돌아간다.
 * 주소 해시 #mission-<id>가 가리키는 미션이 필터에 걸러졌으면 필터를 풀어 보여 주고 펼친다.
 */
export function PracticeBrowser({
  items,
  initialFilter,
  initialDomain,
}: {
  items: PracticeBrowserItem[];
  initialFilter: PracticeFilter;
  initialDomain: Domain | null;
}) {
  const [state, setState] = useState<BrowseState>({ filter: initialFilter, domain: initialDomain });
  const hash = useLocationHash();
  const domainId = useId();

  // 뒤로·앞으로 가기: 주소에서 필터를 다시 읽는다
  useEffect(() => {
    const onPop = () => setState(readLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const hashMission = hash.startsWith("#mission-") ? decodeURIComponent(hash.slice("#mission-".length)) : null;
  // 하이드레이션 중에는 hash가 ""라 서버와 같은 필터로 그린다
  const filter = filterForHash(items, state.filter, hashMission);
  const shown = filterMissions(items, filter);

  // 해시로 온 미션이 화면 밖이면 그 미션으로 스크롤 (필터를 풀어 새로 그려진 경우 포함)
  useEffect(() => {
    if (!hashMission) return;
    const el = document.getElementById(missionAnchorId(hashMission));
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.6) el.scrollIntoView({ block: "start" });
  }, [hashMission]);

  const update = (next: BrowseState) => {
    setState(next);
    const url = `${window.location.pathname}${practiceQuery(next.filter, next.domain)}`;
    // 필터를 바꾸면 해시(특정 미션 딥링크)는 뗀다
    window.history.pushState(null, "", url);
    window.dispatchEvent(new Event(HASH_EVENT));
  };
  const setFilter = (patch: Partial<PracticeFilter>) => update({ ...state, filter: { ...filter, ...patch } });

  return (
    <>
      <div className="flex flex-col gap-4" data-testid="practice-filters">
        <ChipRadioGroup label="수준" options={LEVEL_OPTIONS} value={filter.level} onChange={(level) => setFilter({ level })} testId="filter-level" />
        <ChipRadioGroup label="목표" options={GOAL_OPTIONS} value={filter.goal} onChange={(goal) => setFilter({ goal })} testId="filter-goal" />
        <ChipRadioGroup label="필요한 도구" options={TOOL_OPTIONS} value={filter.tool} onChange={(tool) => setFilter({ tool })} testId="filter-tool" />
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={domainId} className="text-[13px] font-semibold text-fg-muted">
              프롬프트 예시 분야
            </label>
            <select
              id={domainId}
              value={state.domain ?? ""}
              onChange={(e) => update({ ...state, filter, domain: parsePracticeDomain(e.target.value) })}
              aria-describedby={`${domainId}-hint`}
              className="min-h-10 min-w-0 max-w-[60%] rounded-full border border-border-strong bg-bg px-3.5 text-[14px] font-medium text-fg"
              data-testid="domain-select"
            >
              <option value="">기본 예시</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
          <p id={`${domainId}-hint`} className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
            고르면 일부 프롬프트가 그 분야에 맞는 예시로 바뀌어요.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-b border-border pb-2">
        <p className="text-[15px] font-semibold text-fg" role="status" aria-live="polite" data-testid="practice-count">
          실습 <span className="tabular-nums">{shown.length}</span>개
        </p>
        {!isDefaultFilter(filter) && (
          <button
            type="button"
            onClick={() => update({ ...state, filter: DEFAULT_PRACTICE_FILTER })}
            className="inline-flex min-h-11 items-center rounded-full px-2 text-[14px] font-medium text-accent-ink underline underline-offset-4"
            data-testid="filter-reset"
          >
            필터 초기화
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border px-5 py-8 text-center" data-testid="practice-empty">
          <p className="text-[16px] font-semibold text-fg">조건에 맞는 실습이 아직 없어요</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">수준이나 도구를 바꿔 보거나 필터를 처음으로 돌려 보세요.</p>
          <button
            type="button"
            onClick={() => update({ ...state, filter: DEFAULT_PRACTICE_FILTER })}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[14px] font-semibold text-ink-fg transition-colors duration-200 hover:bg-ink-hover"
          >
            전체 실습 보기
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3" data-testid="practice-list">
          {shown.map((it) => (
            <MissionItem
              key={it.mission.videoId}
              mission={it.mission}
              prompts={resolvePrompts(it.mission, state.domain ? [state.domain] : [])}
              lecture={{ id: it.video.id, title: it.video.title, url: it.video.url, instructorName: it.instructorName }}
              titleAs="h3"
            />
          ))}
        </div>
      )}
    </>
  );
}
