"use client";

import type { ReactNode } from "react";
import { IconArrowRight } from "@/components/ui";
import { countDoneToday, pinnedWeeklyId } from "@/lib/card-deck";
import { missionAnchorId, practiceStepAnchorId } from "@/lib/journey";
import type { PracticeMission } from "@/lib/practice";
import { setMissionStatus } from "@/lib/saved";
import { lectureAnchorId } from "@/lib/theory";
import { CardDeck, type DeckEndContext, type DeckItem } from "./CardDeck";
import { MissionReadyLabel, PracticeMissionBody, type ResolvedPrompt } from "./PracticeMissionBlock";
import { MissionItem, WeeklyMissionHighlight } from "./PracticeMissions";
import { DoneLine, EndLinkItems, type DeckLink } from "./deck-parts";
import { applySaved, SaveToggle } from "./saved/SaveToggle";
import { nowIso, useSaved } from "./saved/use-saved";

export interface PracticeDeckMission {
  mission: PracticeMission;
  prompts: ResolvedPrompt[];
  lecture: { id: string; title: string };
  stepNumber: number;
  stepLabel: string;
}

interface MissionCard extends DeckItem {
  m: PracticeDeckMission;
}

/**
 * 결과 화면 실습 탭: '오늘의 실습' 카드 덱(기본) ↔ 전체 목록(예전 단계별 목록).
 * 순서 = 로드맵 단계 순서(lib/card-deck.ts `missionDeckOrder`).
 * 이번 주 실습 미션: 실습이 주인공인 공부 방법이면 덱 순서에서 아직 끝내지 않은 첫 미션(`pinnedWeeklyId`,
 * 덱이 시작하는 카드와 같다), 그 밖에는 목표로 고른 미션(`goalWeeklyId`, lib/practice.ts `weeklyMission`).
 */
export function PracticeDeck({
  storageKey,
  missions,
  pinWeekly,
  goalWeeklyId,
  prominent,
  practiceHubHref,
  links,
  journey,
}: {
  storageKey: string;
  missions: PracticeDeckMission[];
  pinWeekly: boolean;
  goalWeeklyId?: string;
  prominent: boolean;
  practiceHubHref: string;
  /** 끝 카드의 '다른 탭' 링크 */
  links: DeckLink[];
  journey?: ReactNode;
}) {
  const { state, ready, available } = useSaved();
  const loaded = ready && available;
  const doneIds = ready ? new Set(state.missions.filter((m) => m.status === "done").map((m) => m.videoId)) : null;
  const ids = missions.map((m) => m.mission.videoId);
  const weeklyId = pinWeekly ? pinnedWeeklyId(ids, (id) => Boolean(doneIds?.has(id))) : goalWeeklyId;
  const weekly = missions.find((m) => m.mission.videoId === weeklyId);

  const items: MissionCard[] = missions.map((m, i) => ({
    id: m.mission.videoId,
    anchors:
      i === 0 || missions[i - 1].stepNumber !== m.stepNumber
        ? [missionAnchorId(m.mission.videoId), practiceStepAnchorId(m.stepNumber)]
        : [missionAnchorId(m.mission.videoId)],
    m,
  }));

  const groups = [...new Set(missions.map((m) => m.stepNumber))].map((n) => ({
    number: n,
    label: missions.find((m) => m.stepNumber === n)!.stepLabel,
    items: missions.filter((m) => m.stepNumber === n),
  }));

  const list = (
    <>
      {weekly && (
        <div className="mt-2">
          <WeeklyMissionHighlight
            mission={weekly.mission}
            lecture={weekly.lecture}
            stepLabel={`${weekly.stepNumber}단계`}
            prominent={prominent}
          />
        </div>
      )}
      {journey}
      <h2 className="mt-8 text-[19px] font-bold tracking-[-0.02em] text-fg">직접 해보기</h2>
      <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">
        강의를 본 뒤 직접 해 보면 오래 남아요. 완료하면 학습 여정에 표시돼요.
      </p>
      {groups.map((g) => (
        <section
          key={g.number}
          id={practiceStepAnchorId(g.number)}
          aria-labelledby={`practice-step-${g.number}`}
          className="mt-6 scroll-mt-20"
          data-testid="practice-step"
        >
          <h3 id={`practice-step-${g.number}`} className="text-[15px] font-semibold text-fg-muted">
            {g.number}단계 · {g.label}
          </h3>
          <div className="mt-2.5 flex flex-col gap-3">
            {g.items.map(({ mission, prompts, lecture }) => (
              <MissionItem
                key={mission.videoId}
                mission={mission}
                prompts={prompts}
                lecture={lecture}
                weekly={weeklyId === mission.videoId}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );

  const doneTotal = loaded ? ids.filter((id) => doneIds?.has(id)).length : 0;
  const today = loaded
    ? countDoneToday(
        ids,
        state.missions.filter((m) => m.status === "done").map((m) => ({ id: m.videoId, at: m.updatedAt })),
        new Date(),
      )
    : 0;

  const renderEnd = ({ headingId }: DeckEndContext) => (
    <div data-testid="practice-end">
      <h3
        id={headingId}
        tabIndex={-1}
        className="text-[22px] font-bold leading-snug tracking-[-0.02em] text-fg outline-none"
      >
        {today > 0
          ? `오늘 ${today}개 해냈어요`
          : doneTotal === ids.length && ids.length > 0
            ? "실습을 모두 마쳤어요"
            : "마지막 카드까지 봤어요"}
      </h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted" data-testid="practice-end-line">
        {ids.length}개 중 {doneTotal}개를 완료했어요.{" "}
        {doneTotal < ids.length ? "건너뛴 실습은 언제든 다시 해 볼 수 있어요." : "잘하셨어요. 천천히 다음 걸음을 골라 보세요."}
      </p>
    </div>
  );

  return (
    <CardDeck
      kind="practice"
      storageKey={storageKey}
      title="오늘의 실습"
      counterLabel="실습"
      items={items}
      doneIds={doneIds}
      primaryLabel={(_, done) => (done ? null : "완료했어요")}
      onComplete={(it, done) => {
        if (done) return true;
        if (!ready) return false;
        return applySaved((s) => setMissionStatus(s, it.id, "done", nowIso()), "실습 완료! 내 학습함에 기록했어요");
      }}
      renderCard={(it, ctx) => (
        <MissionCardBody
          m={it.m}
          headingId={ctx.headingId}
          done={ctx.done}
          weekly={it.id === weeklyId}
          onUndo={() => applySaved((s) => setMissionStatus(s, it.id, "todo", nowIso()), "해볼 예정으로 바꿨어요")}
        />
      )}
      renderEnd={renderEnd}
      endLinks={<EndLinkItems links={[...links, { href: practiceHubHref, label: "실습 모음에서 더 해 보기" }]} />}
      list={list}
      after={journey}
    />
  );
}

function MissionCardBody({
  m,
  headingId,
  done,
  weekly,
  onUndo,
}: {
  m: PracticeDeckMission;
  headingId: string;
  done: boolean;
  weekly: boolean;
  onUndo: () => void;
}) {
  const { mission, prompts, lecture } = m;
  return (
    <>
      <div className="-mt-2 -mr-3 flex items-center justify-between gap-2">
        <p className="min-w-0 text-[13px] text-fg-muted">
          {weekly && <span className="font-semibold text-accent-ink">이번 주 미션 · </span>}
          {m.stepNumber}단계 · {m.stepLabel}
        </p>
        <SaveToggle kind="mission" id={mission.videoId} label={`실습 저장: ${mission.title}`} />
      </div>
      <h3
        id={headingId}
        tabIndex={-1}
        className="mt-0.5 text-[20px] font-bold leading-snug tracking-[-0.02em] text-fg outline-none"
        data-testid="deck-card-title"
      >
        {mission.title}
      </h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-fg">{mission.goal}</p>
      <MissionReadyLabel mission={mission} className="mt-2" />
      {done && <DoneLine text="완료한 실습이에요" undo="완료 취소" onUndo={onUndo} />}
      <div className="mt-4 border-t border-border pt-4">
        <PracticeMissionBody mission={mission} prompts={prompts} hideIntro />
      </div>
      <a
        href={`#${lectureAnchorId(lecture.id)}`}
        className="mt-3 flex min-h-11 items-center gap-2 border-t border-border pt-2 text-[13px] leading-snug text-fg-muted"
        data-testid="deck-lecture-link"
      >
        <span className="min-w-0 flex-1">
          (선택) 관련 강의 보기 ·{" "}
          <span className="font-medium text-fg underline decoration-border-strong underline-offset-4">{lecture.title}</span>
        </span>
        <IconArrowRight size={15} strokeWidth={2} className="shrink-0 text-accent-ink" />
      </a>
    </>
  );
}
