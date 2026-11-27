"use client";

import { useId, useState } from "react";
import { cn, IconArrowRight, IconChevronDown } from "@/components/ui";
import { missionAnchorId } from "@/lib/journey";
import type { PracticeMission } from "@/lib/practice";
import { lectureAnchorId } from "@/lib/theory";
import { MissionActions, MissionIntro, PracticeMissionBody, type ResolvedPrompt } from "./PracticeMissionBlock";
import { MissionDoneToggle } from "./saved/SaveToggle";
import { useLocationHash } from "./use-location-hash";

export interface MissionLecture {
  id: string;
  title: string;
}

export interface MissionItemProps {
  mission: PracticeMission;
  prompts: ResolvedPrompt[];
  lecture: MissionLecture;
  /** 이번 주 실습 미션이면 작은 표시 */
  weekly?: boolean;
}

/**
 * 실습 탭의 미션 하나 (기본은 접힘).
 * 접힘: 제목 · 목표 · 준비물 · 강의로 돌아가기 · 저장/완료 · '하는 방법 보기'
 * 펼침: 순서 · 프롬프트(복사) · 성공 기준 · 주의.
 * 주소 해시가 #mission-{강의 id}이면 펼친다 (강의 카드의 '실습하기'로 왔을 때).
 */
export function MissionItem({ mission, prompts, lecture, weekly = false }: MissionItemProps) {
  const uid = useId();
  const anchor = missionAnchorId(mission.videoId);
  const hash = useLocationHash();
  const hashOpen = hash === `#${anchor}`;
  const [open, setOpen] = useState(false);
  // 주소 해시로 이 미션에 오면 펼친다 (사용자가 직접 펼치고 접은 상태는 다른 탭을 다녀와도 유지)
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  if (hashOpen && openedFor !== hash) {
    setOpenedFor(hash);
    setOpen(true);
  } else if (!hashOpen && openedFor !== null) {
    setOpenedFor(null);
  }

  return (
    <section
      id={anchor}
      aria-labelledby={`${uid}-title`}
      className="scroll-mt-20 rounded-xl border border-border bg-surface p-5"
      data-testid="mission-item"
      data-video-id={mission.videoId}
      data-open={open ? "" : undefined}
    >
      {weekly && <p className="eyebrow-ko mb-1 text-accent-ink">이번 주 미션</p>}
      <h4 id={`${uid}-title`} className="text-[17px] font-semibold leading-snug tracking-[-0.015em] text-fg">
        {mission.title}
      </h4>
      <MissionIntro mission={mission} className="mt-1.5" />
      <a
        href={`#${lectureAnchorId(lecture.id)}`}
        className="mt-1 flex min-h-11 items-center gap-2 text-[14px] leading-snug text-fg-muted"
        data-testid="mission-lecture-link"
      >
        <span className="min-w-0 flex-1">
          <span className="font-semibold text-fg">강의</span> ·{" "}
          <span className="underline decoration-border-strong underline-offset-4">{lecture.title}</span>
        </span>
        <span aria-hidden="true" className="flex shrink-0 text-accent-ink">
          <IconArrowRight size={16} strokeWidth={2} />
        </span>
      </a>
      <MissionActions videoId={mission.videoId} title={mission.title} className="mt-2" />
      <div className="mt-3 border-t border-border pt-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-body`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between text-[15px] font-medium text-fg"
          data-testid="mission-more"
        >
          <span>{open ? "접기" : "하는 방법 보기"}</span>
          <span aria-hidden="true" className={cn("flex text-fg-muted transition-transform duration-300", open && "rotate-180")}>
            <IconChevronDown size={18} />
          </span>
        </button>
      </div>
      <div id={`${uid}-body`} hidden={!open} className="pt-2 pb-1">
        <PracticeMissionBody mission={mission} prompts={prompts} hideIntro />
      </div>
    </section>
  );
}

/** 실습 탭 맨 위 '이번 주 실습 미션' (요약 + 펼쳐 보기 + 완료) */
export function WeeklyMissionHighlight({
  mission,
  lecture,
  stepLabel,
}: {
  mission: PracticeMission;
  lecture: MissionLecture;
  stepLabel?: string;
}) {
  const uid = useId();
  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="rounded-xl border border-border bg-surface-2 px-5 pt-4 pb-4"
      data-testid="weekly-mission"
    >
      <h2 id={`${uid}-title`} className="eyebrow-ko text-[13px] text-accent-ink">
        이번 주 실습 미션
      </h2>
      <p className="mt-1.5 text-[19px] font-bold leading-snug tracking-[-0.02em] text-fg">{mission.title}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-fg">{mission.goal}</p>
      <p className="mt-1.5 text-[14px] leading-snug text-fg-muted">
        {stepLabel && <span className="font-semibold text-fg">{stepLabel} · </span>}
        {lecture.title} 강의를 보고 해 보세요
      </p>
      <div className="mt-3.5 flex flex-wrap gap-2">
        <a
          href={`#${missionAnchorId(mission.videoId)}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-5 text-[14px] font-semibold text-ink-fg transition-colors duration-200 hover:bg-ink-hover"
          data-testid="weekly-open"
        >
          미션 펼쳐 보기
          <IconChevronDown size={16} />
        </a>
        <MissionDoneToggle videoId={mission.videoId} title={mission.title} />
      </div>
    </section>
  );
}
