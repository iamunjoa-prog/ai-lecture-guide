"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button, cn, IconArrowRight, IconChevronDown, IconInfo, IconX } from "@/components/ui";
import type { KnownIdLists } from "@/components/catalog";
import { MissionActions, PracticeMissionBody, resolvePrompts } from "@/components/PracticeMissionBlock";
import { decodeDiagnosis } from "@/lib/diagnosis-state";
import type { PracticeMission } from "@/lib/practice";
import { theoryHref } from "@/lib/glossary-tabs";
import {
  emptySaved,
  exportFileName,
  exportSaved,
  LECTURE_STATUS_LABELS,
  LECTURE_STATUSES,
  mergeSaved,
  MISSION_STATUS_LABELS,
  MISSION_STATUSES,
  missionOf,
  parseSaved,
  pruneSaved,
  removeLecture,
  removeMission,
  setLectureStatus,
  setMissionStatus,
  skillProgress,
  summarizeSaved,
  type LectureStatus,
  type MissionStatus,
  type SavedState,
} from "@/lib/saved";
import { focusSegmentedOnMount, Segmented } from "./Segmented";
import { applySaved, SaveToggle, UNAVAILABLE_MESSAGE } from "./SaveToggle";
import { toKnownIds, useSavedPrune } from "./SavedHeaderLink";
import { showToast } from "./toast";
import { nowIso, useSaved } from "./use-saved";

// ---------------------------------------------------------------------------
// 데이터 (서버가 필요한 만큼만 넘긴다)
// ---------------------------------------------------------------------------

export interface SavedLectureInfo {
  id: string;
  title: string;
  instructorName: string;
  url: string;
  durationLabel: string;
}
export interface SavedSkillInfo {
  id: string;
  name: string;
  tagline: string;
  lectureIds: string[];
}
export interface SavedTermInfo {
  id: string;
  term: string;
  termEn?: string;
  short: string;
  detail: string;
}
export interface SavedTheoryInfo {
  id: string;
  title: string;
  summary: string;
}
export interface SavedCatalog {
  lectures: Record<string, SavedLectureInfo>;
  missions: Record<string, PracticeMission>;
  skills: SavedSkillInfo[];
  terms: Record<string, SavedTermInfo>;
  theory: Record<string, SavedTheoryInfo>;
  known: KnownIdLists;
}

type TabId = "lectures" | "missions" | "skills" | "theory" | "terms";
const TABS: { id: TabId; label: string }[] = [
  { id: "lectures", label: "강의" },
  { id: "missions", label: "실습" },
  { id: "skills", label: "스킬" },
  { id: "theory", label: "이론" },
  { id: "terms", label: "용어" },
];

const linkCls = "inline-flex min-h-11 items-center gap-1.5 rounded-full text-[14px] font-medium text-accent-ink";

// ---------------------------------------------------------------------------
// 상단 요약 (무대 위)
// ---------------------------------------------------------------------------

export function SavedHeroStatus() {
  const { state, ready, available } = useSaved();
  const sum = summarizeSaved(state);
  const href = state.lastDiagnosis?.href;
  return (
    <div className={cn("mt-6 transition-opacity duration-200", !ready && "invisible")} data-testid="saved-summary">
      <p className="text-[16px] font-medium text-stage-fg tabular-nums">
        {available ? (
          <>
            강의 {sum.lecturesDone}/{sum.lectures} 완료 · 실습 {sum.missionsDone}개 완료
          </>
        ) : (
          UNAVAILABLE_MESSAGE
        )}
      </p>
      <div className="mt-3">
        {href ? (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stage-border px-4 text-[15px] font-medium text-stage-fg transition-colors duration-200 hover:border-stage-muted"
          >
            최근 진단 결과 다시 보기
            <IconArrowRight size={16} strokeWidth={2} />
          </Link>
        ) : (
          <Link
            href="/diagnosis"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-stage-border px-4 text-[15px] font-medium text-stage-fg transition-colors duration-200 hover:border-stage-muted"
          >
            진단하고 맞춤 로드맵 받기
            <IconArrowRight size={16} strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 본문
// ---------------------------------------------------------------------------

export function SavedView({ catalog }: { catalog: SavedCatalog }) {
  useSavedPrune(catalog.known);
  const snap = useSaved();
  const { ready, available } = snap;
  const known = useMemo(() => toKnownIds(catalog.known), [catalog.known]);
  // 화면에는 지금 데이터에 있는 항목만 (정리 쓰기가 끝나기 전에도)
  const state = useMemo(() => pruneSaved(snap.state, known), [snap.state, known]);

  const [tab, setTab] = useState<TabId>("lectures");
  const [focusMission, setFocusMission] = useState<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const uid = useId();

  const domains = useMemo(() => {
    const href = state.lastDiagnosis?.href;
    const d = href ? decodeDiagnosis(href.slice(href.indexOf("?"))) : null;
    return d?.domains ?? [];
  }, [state.lastDiagnosis?.href]);

  const counts: Record<TabId, number> = {
    lectures: state.lectures.length,
    missions: state.missions.length,
    skills: state.skills.length,
    theory: state.theory.length,
    terms: state.terms.length,
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  /** '다 봤어요' 강의 → 실습 탭에서 그 미션을 펼친다 (없으면 '해볼 예정'으로 저장) */
  const goMission = (videoId: string) => {
    if (!missionOf(state, videoId)) {
      if (!applySaved((s) => setMissionStatus(s, videoId, "todo", nowIso()))) return;
    }
    setFocusMission(videoId);
    setTab("missions");
  };

  const emptyCta = state.lastDiagnosis ? { href: state.lastDiagnosis.href, label: "결과 보기" } : { href: "/diagnosis", label: "진단하기" };

  return (
    <>
      <nav
        aria-label="내 학습함 분류"
        className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-xl backdrop-saturate-150"
      >
        <div
          role="tablist"
          aria-label="내 학습함"
          onKeyDown={onTabKey}
          className="mx-auto grid max-w-content grid-cols-5 gap-1 px-5 py-2"
        >
          {TABS.map((t) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`${uid}-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-1 rounded-full text-[14px] font-medium transition-colors duration-200",
                  selected ? "bg-ink text-ink-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {t.label}
                <span className={cn("text-[12px] tabular-nums", selected ? "opacity-80" : "text-fg-muted")}>
                  {ready ? counts[t.id] : ""}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto w-full max-w-content px-5 pt-8 pb-10 pl-[max(20px,env(safe-area-inset-left))] pr-[max(20px,env(safe-area-inset-right))]">
        {ready && !available && (
          <p className="mb-6 flex gap-2.5 rounded-md border border-border px-4 py-3.5 text-[14px] leading-relaxed text-fg-muted" data-testid="saved-unavailable">
            <span aria-hidden="true" className="mt-[3px] flex shrink-0">
              <IconInfo size={16} />
            </span>
            <span>
              {UNAVAILABLE_MESSAGE}. 사생활 보호(시크릿) 모드이거나 브라우저에서 사이트 데이터 저장을 막아 두면 그래요. 강의·실습·용어는 저장 없이도 그대로 볼 수
              있어요.
            </span>
          </p>
        )}

        {TABS.map((t) => (
          <section
            key={t.id}
            role="tabpanel"
            id={`${uid}-panel-${t.id}`}
            aria-labelledby={`${uid}-tab-${t.id}`}
            hidden={t.id !== tab}
            tabIndex={0}
            className="min-h-[240px] rounded-md"
            data-testid={`panel-${t.id}`}
          >
            {!ready || t.id !== tab ? null : t.id === "lectures" ? (
              <LecturesPanel state={state} catalog={catalog} onGoMission={goMission} emptyCta={emptyCta} />
            ) : t.id === "missions" ? (
              <MissionsPanel state={state} catalog={catalog} domains={domains} focusId={focusMission} />
            ) : t.id === "skills" ? (
              <SkillsPanel state={state} catalog={catalog} />
            ) : t.id === "theory" ? (
              <TheoryPanel state={state} catalog={catalog} />
            ) : (
              <TermsPanel state={state} catalog={catalog} />
            )}
          </section>
        ))}

        <DataControls state={snap.state} disabled={!ready || !available} known={known} />
      </div>
    </>
  );
}

function EmptyState({ title, desc, cta }: { title: string; desc: string; cta: { href: string; label: string } }) {
  return (
    <div className="rounded-xl bg-surface-2 px-6 py-8 text-center" data-testid="saved-empty">
      <p className="text-[17px] font-semibold tracking-[-0.015em] text-fg">{title}</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{desc}</p>
      <Button href={cta.href} size="sm" className="mt-4" trailingIcon={<IconArrowRight size={16} strokeWidth={2} />}>
        {cta.label}
      </Button>
    </div>
  );
}

function GroupTitle({ children, count }: { children: ReactNode; count: number }) {
  return (
    <h3 className="flex items-baseline gap-2 text-[17px] font-bold tracking-[-0.02em] text-fg">
      {children}
      <span className="text-[13px] font-medium text-fg-muted tabular-nums">{count}</span>
    </h3>
  );
}

// ---------------------------------------------------------------------------
// 강의
// ---------------------------------------------------------------------------

const LECTURE_OPTIONS = LECTURE_STATUSES.map((v) => ({ value: v, label: LECTURE_STATUS_LABELS[v] }));

function LecturesPanel({
  state,
  catalog,
  onGoMission,
  emptyCta,
}: {
  state: SavedState;
  catalog: SavedCatalog;
  onGoMission: (videoId: string) => void;
  emptyCta: { href: string; label: string };
}) {
  if (state.lectures.length === 0) {
    return (
      <EmptyState
        title="저장한 강의가 없어요"
        desc="결과 화면의 강의 카드에서 북마크를 누르면 여기에 모여요."
        cta={emptyCta}
      />
    );
  }
  const setStatus = (id: string, status: LectureStatus) => {
    focusSegmentedOnMount(`lecture:${id}`);
    applySaved((s) => setLectureStatus(s, id, status, nowIso()), `'${LECTURE_STATUS_LABELS[status]}'로 옮겼어요`);
  };
  return (
    <div className="flex flex-col gap-9">
      {LECTURE_STATUSES.map((status) => {
        const items = state.lectures.filter((l) => l.status === status);
        if (items.length === 0) return null;
        return (
          <div key={status} data-testid={`lectures-${status}`}>
            <GroupTitle count={items.length}>{LECTURE_STATUS_LABELS[status]}</GroupTitle>
            <ul className="mt-3 border-t border-border">
              {items.map((l) => {
                const info = catalog.lectures[l.id];
                if (!info) return null;
                const hasMission = Boolean(catalog.missions[l.id]);
                return (
                  <li key={l.id} className="border-b border-border py-4" data-testid="saved-lecture">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <a
                          href={info.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[16px] leading-snug font-semibold tracking-[-0.015em] text-fg underline-offset-4 hover:underline"
                        >
                          {info.title}
                          <span className="sr-only"> (유튜브, 새 탭에서 열림)</span>
                        </a>
                        <p className="mt-0.5 text-[13px] text-fg-muted">
                          {info.instructorName} · {info.durationLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`목록에서 빼기: ${info.title}`}
                        onClick={() => applySaved((s) => removeLecture(s, l.id), "목록에서 뺐어요")}
                        className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg"
                      >
                        <IconX size={18} />
                      </button>
                    </div>
                    <Segmented
                      label={`시청 상태: ${info.title}`}
                      options={LECTURE_OPTIONS}
                      value={l.status}
                      onChange={(v) => setStatus(l.id, v)}
                      focusKey={`lecture:${l.id}`}
                      className="mt-3"
                    />
                    {l.status === "done" && hasMission && (
                      <button
                        type="button"
                        onClick={() => onGoMission(l.id)}
                        className={cn(linkCls, "mt-1")}
                        data-testid="lecture-mission-nudge"
                      >
                        이 강의 실습하러 가기
                        <IconArrowRight size={16} strokeWidth={2} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 실습
// ---------------------------------------------------------------------------

const MISSION_OPTIONS = MISSION_STATUSES.map((v) => ({ value: v, label: MISSION_STATUS_LABELS[v] }));

function MissionsPanel({
  state,
  catalog,
  domains,
  focusId,
}: {
  state: SavedState;
  catalog: SavedCatalog;
  domains: Parameters<typeof resolvePrompts>[1];
  focusId: string | null;
}) {
  if (state.missions.length === 0) {
    return (
      <EmptyState
        title="저장한 실습이 없어요"
        desc="강의 없이 바로 해볼 수 있는 실습이 많아요. 실습 모음에서 마음에 드는 실습을 저장해 보세요."
        cta={{ href: "/practice", label: "실습 모음에서 골라 보기" }}
      />
    );
  }
  const ordered = [...state.missions.filter((m) => m.status === "todo"), ...state.missions.filter((m) => m.status === "done")];
  return (
    <ul className="border-t border-border">
      {ordered.map((m) => {
        const mission = catalog.missions[m.videoId];
        if (!mission) return null;
        return (
          <SavedMissionItem
            key={m.videoId}
            mission={mission}
            status={m.status}
            lecture={catalog.lectures[m.videoId]}
            prompts={resolvePrompts(mission, domains)}
            relatedSkills={catalog.skills.filter((s) => s.lectureIds.includes(m.videoId))}
            focus={focusId === m.videoId}
          />
        );
      })}
    </ul>
  );
}

function SavedMissionItem({
  mission,
  status,
  lecture,
  prompts,
  relatedSkills,
  focus,
}: {
  mission: PracticeMission;
  status: MissionStatus;
  lecture?: SavedLectureInfo;
  prompts: { label: string; text: string }[];
  relatedSkills: SavedSkillInfo[];
  focus: boolean;
}) {
  const [open, setOpen] = useState(focus);
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const focused = useRef(false);
  // 강의 탭에서 넘어왔으면 이 미션으로 스크롤하고 제목에 포커스 (처음 한 번)
  const setHeading = (el: HTMLHeadingElement | null) => {
    headingRef.current = el;
    if (el && focus && !focused.current) {
      focused.current = true;
      requestAnimationFrame(() => {
        el.focus();
        el.scrollIntoView({ block: "start" });
      });
    }
  };
  const setStatus = (v: MissionStatus) => {
    focusSegmentedOnMount(`mission:${mission.videoId}`);
    applySaved((s) => setMissionStatus(s, mission.videoId, v, nowIso()), v === "done" ? "실습 완료! 잘하셨어요" : "해볼 예정으로 바꿨어요");
  };
  return (
    <li className="scroll-mt-24 border-b border-border py-4" data-testid="saved-mission" data-video-id={mission.videoId}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3
            ref={setHeading}
            tabIndex={-1}
            className="scroll-mt-24 text-[16px] leading-snug font-semibold tracking-[-0.015em] text-fg"
          >
            {mission.title}
          </h3>
          {lecture && <p className="mt-0.5 text-[13px] text-fg-muted">강의 · {lecture.title}</p>}
        </div>
        <button
          type="button"
          aria-label={`목록에서 빼기: ${mission.title}`}
          onClick={() => applySaved((s) => removeMission(s, mission.videoId), "목록에서 뺐어요")}
          className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg"
        >
          <IconX size={18} />
        </button>
      </div>
      <Segmented
        label={`실습 상태: ${mission.title}`}
        options={MISSION_OPTIONS}
        value={status}
        onChange={setStatus}
        focusKey={`mission:${mission.videoId}`}
        className="mt-3 max-w-[260px]"
      />
      {status === "done" && relatedSkills.length > 0 && (
        <div className="mt-3 rounded-md bg-accent-soft px-4 py-3" data-testid="mission-skill-nudge">
          <p className="text-[13px] font-semibold text-accent-soft-fg">이 실습과 이어지는 스킬</p>
          <ul className="mt-1">
            {relatedSkills.slice(0, 2).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <Link href={`/skills#${s.id}`} className="inline-flex min-h-11 min-w-0 items-center gap-1.5 text-[15px] font-semibold text-accent-soft-fg">
                  <span className="min-w-0">{s.name}</span>
                  <IconArrowRight size={16} strokeWidth={2} />
                </Link>
                <SaveToggle kind="skill" id={s.id} label={`스킬 저장: ${s.name}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${uid}-body`}
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex min-h-11 w-full items-center justify-between text-[14px] font-medium text-fg"
      >
        <span>{open ? "미션 접기" : "미션 보기"}</span>
        <span aria-hidden="true" className={cn("flex text-fg-muted transition-transform duration-300", open && "rotate-180")}>
          <IconChevronDown size={18} />
        </span>
      </button>
      <div id={`${uid}-body`} hidden={!open} className="pt-1 pb-2">
        <PracticeMissionBody mission={mission} prompts={prompts} />
        <MissionActions videoId={mission.videoId} className="mt-4" />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// 스킬 · 이론 · 용어
// ---------------------------------------------------------------------------

function SkillsPanel({ state, catalog }: { state: SavedState; catalog: SavedCatalog }) {
  const knownLectures = useMemo(() => new Set(Object.keys(catalog.lectures)), [catalog.lectures]);
  const byId = new Map(catalog.skills.map((s) => [s.id, s]));
  const items = state.skills.map((r) => byId.get(r.id)).filter((s): s is SavedSkillInfo => Boolean(s));
  if (items.length === 0) {
    return (
      <EmptyState
        title="저장한 스킬이 없어요"
        desc="요즘 주목받는 AI 스킬에서 북마크를 누르면 강의 진행도와 함께 볼 수 있어요."
        cta={{ href: "/skills", label: "스킬 보러 가기" }}
      />
    );
  }
  return (
    <ul className="border-t border-border">
      {items.map((s) => {
        const p = skillProgress(state, s.lectureIds, knownLectures);
        const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
        return (
          <li key={s.id} className="border-b border-border py-4" data-testid="saved-skill">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/skills#${s.id}`}
                  className="text-[16px] leading-snug font-semibold tracking-[-0.015em] text-fg underline-offset-4 hover:underline"
                >
                  {s.name}
                </Link>
                <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">{s.tagline}</p>
              </div>
              <SaveToggle kind="skill" id={s.id} label={`스킬 저장: ${s.name}`} className="-mt-2 -mr-2" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <p className="shrink-0 text-[13px] text-fg-muted tabular-nums" data-testid="skill-progress">
                강의 {p.done}/{p.total} 다 봤어요
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TheoryPanel({ state, catalog }: { state: SavedState; catalog: SavedCatalog }) {
  const items = state.theory.map((r) => catalog.theory[r.id]).filter((c): c is SavedTheoryInfo => Boolean(c));
  if (items.length === 0) {
    return (
      <EmptyState
        title="저장한 이론이 없어요"
        desc="3분 이론의 북마크를 누르면 다시 읽고 싶은 개념을 모아 둘 수 있어요."
        cta={{ href: theoryHref(), label: "3분 이론 보기" }}
      />
    );
  }
  return (
    <ul className="border-t border-border">
      {items.map((c) => (
        <li key={c.id} className="flex items-start gap-2 border-b border-border py-4" data-testid="saved-theory">
          <div className="min-w-0 flex-1">
            <Link href={theoryHref({ conceptId: c.id })} className="text-[16px] leading-snug font-semibold tracking-[-0.015em] text-fg underline-offset-4 hover:underline">
              {c.title}
            </Link>
            <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">{c.summary}</p>
          </div>
          <SaveToggle kind="theory" id={c.id} label={`이론 저장: ${c.title}`} className="-mt-2 -mr-2" />
        </li>
      ))}
    </ul>
  );
}

function TermsPanel({ state, catalog }: { state: SavedState; catalog: SavedCatalog }) {
  const [quiz, setQuiz] = useState(false);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const items = state.terms.map((r) => catalog.terms[r.id]).filter((t): t is SavedTermInfo => Boolean(t));
  if (items.length === 0) {
    return (
      <EmptyState
        title="저장한 용어가 없어요"
        desc="용어 옆 북마크를 누르면 여기서 뜻을 가리고 복습할 수 있어요."
        cta={{ href: "/glossary", label: "용어집 보기" }}
      />
    );
  }
  const toggleQuiz = () => {
    setQuiz((v) => !v);
    setRevealed(new Set());
  };
  const reveal = (id: string) =>
    setRevealed((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] text-fg-muted">{quiz ? "용어를 보고 뜻을 떠올린 뒤 눌러 확인해 보세요." : `${items.length}개`}</p>
        <button
          type="button"
          aria-pressed={quiz}
          onClick={toggleQuiz}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[14px] font-medium transition-colors duration-200",
            quiz ? "border-transparent bg-ink text-ink-fg" : "border-border-strong text-fg hover:bg-surface-2",
          )}
        >
          뜻 가리고 복습하기
        </button>
      </div>
      <ul className="border-t border-border" data-testid="saved-terms">
        {items.map((t) => {
          const shown = !quiz || revealed.has(t.id);
          const panelId = `term-${t.id}-meaning`;
          return (
            <li key={t.id} className="border-b border-border py-4" data-testid="saved-term">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <Link href={`/glossary#${t.id}`} className="text-[17px] font-semibold tracking-[-0.015em] text-fg underline-offset-4 hover:underline">
                      {t.term}
                    </Link>
                    {t.termEn && <span className="text-[13px] text-fg-muted">{t.termEn}</span>}
                  </p>
                </div>
                <SaveToggle kind="term" id={t.id} label={`용어 저장: ${t.term}`} className="-mt-2 -mr-2" />
              </div>
              {quiz && (
                <button
                  type="button"
                  aria-expanded={shown}
                  aria-controls={panelId}
                  onClick={() => reveal(t.id)}
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-border-strong px-4 text-[14px] font-medium text-fg"
                >
                  {shown ? "뜻 가리기" : "뜻 보기"}
                </button>
              )}
              <div id={panelId} hidden={!shown} className="mt-1.5" data-testid="term-meaning">
                <p className="text-[15px] leading-relaxed text-fg">{t.short}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-fg-muted">{t.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 내보내기 · 가져오기 · 전체 삭제
// ---------------------------------------------------------------------------

function DataControls({ state, disabled, known }: { state: SavedState; disabled: boolean; known: ReturnType<typeof toKnownIds> }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const clearRef = useRef<HTMLButtonElement | null>(null);
  const [confirming, setConfirming] = useState(false);

  const onExport = () => {
    const now = nowIso();
    try {
      const blob = new Blob([exportSaved(state, now)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFileName(now);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("내보내기 파일을 만들었어요");
    } catch {
      showToast("파일을 만들지 못했어요", "error");
    }
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("too big");
      const text = await file.text();
      const raw: unknown = JSON.parse(text);
      const incoming = pruneSaved(parseSaved(raw, nowIso()), known);
      let added = 0;
      const ok = applySaved((s) => {
        const r = mergeSaved(s, incoming);
        added = r.added;
        return r.state;
      });
      if (ok) showToast(added > 0 ? `${added}개 항목을 가져왔어요` : "새로 가져올 항목이 없어요", "ok", 3000);
    } catch {
      showToast("가져올 수 없는 파일이에요. 내보내기로 만든 JSON 파일인지 확인해 주세요.", "error", 3600);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onClear = () => {
    const ok = applySaved(() => emptySaved(), "모두 지웠어요");
    setConfirming(false);
    if (ok) requestAnimationFrame(() => clearRef.current?.focus());
  };

  const btn =
    "inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 text-[14px] font-medium text-fg transition-colors duration-200 hover:bg-surface-2 disabled:cursor-not-allowed disabled:text-fg-muted";

  return (
    <section aria-labelledby="saved-data-title" className="mt-12 border-t border-border pt-6" data-testid="saved-controls">
      <h2 id="saved-data-title" className="text-[15px] font-semibold text-fg">
        저장한 내용 관리
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
        저장한 내용은 이 브라우저에만 있어요. 다른 기기로 옮기려면 내보낸 파일을 그 기기에서 가져오세요.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={onExport} disabled={disabled}>
          내보내기
        </button>
        <button type="button" className={btn} onClick={() => fileRef.current?.click()} disabled={disabled}>
          가져오기
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          tabIndex={-1}
          aria-hidden="true"
          data-testid="import-input"
          onChange={(e) => onImportFile(e.target.files?.[0])}
        />
        <button
          ref={clearRef}
          type="button"
          className={btn.replace("text-fg ", "text-danger ")}
          onClick={() => setConfirming(true)}
          disabled={disabled}
          aria-expanded={confirming}
          aria-controls="saved-clear-confirm"
        >
          전체 삭제
        </button>
      </div>
      <div id="saved-clear-confirm" hidden={!confirming} className="mt-4 rounded-md border border-border px-4 py-4">
        {confirming && (
          <>
            <p className="text-[14px] leading-relaxed text-fg" role="alert">
              저장한 강의·실습·스킬·이론·용어와 최근 진단 기록을 모두 지울까요? 되돌릴 수 없어요.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                autoFocus
                onClick={onClear}
                className="inline-flex min-h-11 items-center rounded-full bg-danger px-4 text-[14px] font-semibold text-white"
              >
                모두 지우기
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  requestAnimationFrame(() => clearRef.current?.focus());
                }}
                className={btn}
              >
                취소
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

