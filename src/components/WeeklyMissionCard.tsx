"use client";

import { useId, useState } from "react";
import { cn, IconArrowRight, IconChevronDown } from "@/components/ui";
import type { PracticeMission } from "@/lib/practice";
import { MissionActions, PracticeMissionBody, type ResolvedPrompt } from "./PracticeMissionBlock";

export interface WeeklyMissionCardProps {
  mission: PracticeMission;
  prompts: ResolvedPrompt[];
  lecture: { title: string; instructorName: string; href: string; stepLabel?: string };
}

/** 결과 화면 로드맵 위 '이번 주 실습 미션' (기본은 접힌 요약 카드) */
export function WeeklyMissionCard({ mission, prompts, lecture }: WeeklyMissionCardProps) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="mb-8 rounded-xl border border-border bg-surface-2 px-5 pt-4 pb-2"
      data-testid="weekly-mission"
    >
      <h3 id={`${uid}-title`} className="eyebrow-ko text-[13px] text-accent-ink">
        이번 주 실습 미션
      </h3>
      <p className="mt-1.5 text-[19px] font-bold leading-snug tracking-[-0.02em] text-fg">{mission.title}</p>
      <a
        href={lecture.href}
        className="mt-1 flex min-h-11 items-center gap-2 py-1 text-[14px] leading-snug text-fg-muted"
        data-testid="weekly-lecture-link"
      >
        <span className="min-w-0 flex-1">
          {lecture.stepLabel && <span className="font-semibold text-fg">{lecture.stepLabel} · </span>}
          <span className="underline decoration-border-strong underline-offset-4">{lecture.title}</span>
          <span> 강의를 보고 해 보세요</span>
        </span>
        <span aria-hidden="true" className="flex shrink-0 text-accent-ink">
          <IconArrowRight size={16} strokeWidth={2} />
        </span>
      </a>
      <div className="border-t border-border">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-body`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between text-[15px] font-medium text-fg"
        >
          <span>{open ? "미션 접기" : "미션 펼쳐 보기"}</span>
          <span aria-hidden="true" className={cn("flex text-fg-muted transition-transform duration-300", open && "rotate-180")}>
            <IconChevronDown size={18} />
          </span>
        </button>
      </div>
      <div id={`${uid}-body`} hidden={!open} className="pt-1 pb-3">
        <PracticeMissionBody mission={mission} prompts={prompts} />
        <MissionActions videoId={mission.videoId} className="mt-4" />
      </div>
    </section>
  );
}
