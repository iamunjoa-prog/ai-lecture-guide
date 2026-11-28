/**
 * 결과 화면 '내 학습 여정' (순수 함수).
 *
 *   [지금: 현재 수준] → [1단계] → [2단계] → [3단계] → [다음 위치: 다음 수준]
 *
 * 진행 규칙 (정직하게 셀 수 있는 것만 완료로 센다. 무엇을 세는지는 공부 방법이 정한다: study-style.ts `progressRule`)
 *  - 강의: 내 학습함에서 상태가 '다 봤어요'(done)이면 완료
 *  - 실습: 그 단계 강의에 딸린 미션이 '완료'(done)이면 완료
 *  - 개념: 1단계의 3분 이론 개념이 '읽었어요'(theoryRead)면 완료
 *  - 공부 방법별: 골고루(all, 예전 링크) = 강의 + 실습 · 강의부터 = 강의 · 실습 위주 = 실습(실습 없는 단계는 강의)
 *    · 개념 위주 = 강의 + 1단계 개념 · 실습+개념 = 실습(없으면 강의) + 1단계 개념
 *    세지 않는 것도 개수는 상세 줄에 정보로 보인다
 *  - 용어: 개수와 저장한 개수만 정보로 보여 주고, 완료 계산에는 넣지 않는다
 *    (용어는 '저장'만 할 수 있어 익혔는지 알 수 없으므로)
 *  - 단계 완료 = 그 단계에서 세는 것을 모두 마침. 셀 것이 하나도 없는 단계는 없다(로드맵은 빈 단계를 빼고, 강의는 늘 있다)
 *  - 지금 단계 = 아직 끝나지 않은 첫 단계. 모두 끝나면 '다음 위치'가 켜진다
 *  - 저장 상태가 없으면(서버 렌더·하이드레이션 중) 진행은 모두 0
 */
import type { Level, StudyStyle } from "../types";
import { LEVEL_LABELS } from "./questions";
import type { SavedState } from "./saved";
import { progressRule } from "./study-style";

/** 로드맵을 다 마치면 닿는 '다음 위치' */
export const NEXT_POSITION_LABELS: Record<Level, string> = {
  beginner: LEVEL_LABELS.user,
  user: LEVEL_LABELS.practitioner,
  practitioner: LEVEL_LABELS.developer,
  developer: "AI 제품을 이끄는 단계",
};

/** 단계 한 줄 설명 (강의 탭 단계 제목 아래) */
export const STEP_SUMMARIES: Record<string, string> = {
  "기초 다지기": "먼저 기본기를 채워 두면 다음 단계가 수월해요.",
  "실전 활용": "지금 수준에서 바로 써먹을 수 있는 강의예요.",
  "한 단계 더": "익숙해지면 한 단계 더 나아가 보세요.",
};

export interface JourneyStepInput {
  label: string;
  lectureIds: readonly string[];
  /** 이 단계 강의 중 실습 미션이 있는 강의 id */
  missionIds: readonly string[];
  /** 이 단계에서 익히면 좋은 용어 id (정보용) */
  termIds: readonly string[];
  /** 이 단계의 3분 이론 개념 id (1단계에만. 개념을 세는 공부 방법에서 진행에 들어간다) */
  conceptIds?: readonly string[];
}

export interface JourneyStep {
  /** 1부터 */
  number: number;
  label: string;
  lectures: number;
  lecturesDone: number;
  missions: number;
  missionsDone: number;
  terms: number;
  termsSaved: number;
  concepts: number;
  conceptsRead: number;
  /** 진행에 세는 것 (공부 방법별) */
  counts: { lectures: boolean; missions: boolean; concepts: boolean };
  /** 세는 것의 합 */
  total: number;
  done: number;
  complete: boolean;
}

export interface Journey {
  level: Level;
  currentLabel: string;
  nextLabel: string;
  steps: JourneyStep[];
  /** 아직 끝나지 않은 첫 단계의 위치(0부터). 모두 끝났으면 steps.length */
  activeIndex: number;
  allDone: boolean;
  done: number;
  total: number;
}

type SavedLike = Pick<SavedState, "lectures" | "missions" | "terms"> & Partial<Pick<SavedState, "theoryRead">>;

export function buildJourney(
  level: Level,
  steps: readonly JourneyStepInput[],
  saved: SavedLike | null,
  style: StudyStyle = "all",
): Journey {
  const doneLectures = new Set(saved?.lectures.filter((l) => l.status === "done").map((l) => l.id));
  const doneMissions = new Set(saved?.missions.filter((m) => m.status === "done").map((m) => m.videoId));
  const savedTerms = new Set(saved?.terms.map((t) => t.id));
  const readConcepts = new Set(saved?.theoryRead?.map((t) => t.id));
  const rule = progressRule(style);

  const out: JourneyStep[] = steps.map((s, i) => {
    const lectureIds = [...new Set(s.lectureIds)];
    const missionIds = [...new Set(s.missionIds)];
    const termIds = [...new Set(s.termIds)];
    const conceptIds = [...new Set(s.conceptIds ?? [])];
    const lecturesDone = lectureIds.filter((id) => doneLectures.has(id)).length;
    const missionsDone = missionIds.filter((id) => doneMissions.has(id)).length;
    const conceptsRead = conceptIds.filter((id) => readConcepts.has(id)).length;
    const counts = {
      missions: rule.missions && missionIds.length > 0,
      lectures: rule.lectures === "always" || !(rule.missions && missionIds.length > 0),
      concepts: rule.concepts && conceptIds.length > 0,
    };
    const total =
      (counts.lectures ? lectureIds.length : 0) + (counts.missions ? missionIds.length : 0) + (counts.concepts ? conceptIds.length : 0);
    const done = (counts.lectures ? lecturesDone : 0) + (counts.missions ? missionsDone : 0) + (counts.concepts ? conceptsRead : 0);
    return {
      number: i + 1,
      label: s.label,
      lectures: lectureIds.length,
      lecturesDone,
      missions: missionIds.length,
      missionsDone,
      terms: termIds.length,
      termsSaved: termIds.filter((id) => savedTerms.has(id)).length,
      concepts: conceptIds.length,
      conceptsRead,
      counts,
      total,
      done,
      complete: total > 0 && done >= total,
    };
  });

  const firstOpen = out.findIndex((s) => !s.complete);
  const activeIndex = firstOpen < 0 ? out.length : firstOpen;
  return {
    level,
    currentLabel: LEVEL_LABELS[level],
    nextLabel: NEXT_POSITION_LABELS[level],
    steps: out,
    activeIndex,
    allDone: out.length > 0 && firstOpen < 0,
    done: out.reduce((n, s) => n + s.done, 0),
    total: out.reduce((n, s) => n + s.total, 0),
  };
}

/**
 * 로드맵 단계 → 여정 입력.
 * 용어: 1단계는 '준비' 탭에서 처음 보이는 시작 전 용어, 2단계부터는 그 단계 강의 카드의 핵심 용어
 * (앞 단계에서 이미 센 용어는 빼서 같은 용어를 두 번 세지 않는다).
 */
export function journeyInputs(
  steps: readonly { label: string; items: readonly { video: { id: string; terms?: readonly string[] } }[] }[],
  missionVideoIds: ReadonlySet<string>,
  starterTermIds: readonly string[],
  /** 1단계에 넣을 3분 이론 개념 id (결과 화면에 보이는 개념) */
  conceptIds: readonly string[] = [],
): JourneyStepInput[] {
  const counted = new Set<string>();
  return steps.map((st, i) => {
    const lectureIds = st.items.map((it) => it.video.id);
    const raw = i === 0 ? starterTermIds : st.items.flatMap((it) => it.video.terms ?? []);
    const termIds = [...new Set(raw)].filter((id) => !counted.has(id));
    termIds.forEach((id) => counted.add(id));
    return {
      label: st.label,
      lectureIds,
      missionIds: lectureIds.filter((id) => missionVideoIds.has(id)),
      termIds,
      ...(i === 0 && conceptIds.length > 0 ? { conceptIds: [...conceptIds] } : {}),
    };
  });
}

/**
 * 단계 상세 한 줄. 예: "강의 2 · 용어 4 · 실습 2 · 완료 1/4"
 * 진행에 세지 않는 것은 "(선택)"을 붙인다. 예(실습 위주): "강의 2(선택) · 실습 2 · 완료 1/2"
 */
export function stepDetailLine(s: JourneyStep): string {
  const all = s.counts.lectures && (s.missions === 0 || s.counts.missions);
  const opt = (counted: boolean) => (all || counted ? "" : "(선택)");
  const parts = [`강의 ${s.lectures}${opt(s.counts.lectures)}`];
  if (s.concepts > 0 && s.counts.concepts) parts.push(`개념 ${s.concepts}`);
  if (s.terms > 0) parts.push(`용어 ${s.terms}`);
  if (s.missions > 0) parts.push(`실습 ${s.missions}${opt(s.counts.missions)}`);
  parts.push(`완료 ${s.done}/${s.total}`);
  return parts.join(" · ");
}

/** 노드의 접근 가능한 이름. 예: "1단계 기초 다지기, 4개 중 1개 완료" */
export function stepAccessibleName(s: JourneyStep, isCurrent: boolean): string {
  const state = s.complete ? "완료" : `${s.total}개 중 ${s.done}개 완료`;
  return `${s.number}단계 ${s.label}, ${state}${isCurrent ? ", 지금 할 단계" : ""}`;
}

/** 진단 요약 한 줄. 예: "입문자 · 업무 자동화 외 1 · 목표 2개" */
export function summaryLine(levelLabel: string, domainLabels: readonly string[], goalCount: number): string {
  const domain =
    domainLabels.length === 0 ? "분야 미정" : domainLabels.length === 1 ? domainLabels[0] : `${domainLabels[0]} 외 ${domainLabels.length - 1}`;
  return `${levelLabel} · ${domain} · 목표 ${goalCount}개`;
}

/** 단계 구역 앵커 id (강의 탭) */
export const stepAnchorId = (n: number) => `step-${n}`;
/** 실습 탭의 단계 구역 앵커 id */
export const practiceStepAnchorId = (n: number) => `practice-group-${n}`;
/** 실습 미션 앵커 id (실습 탭) */
export const missionAnchorId = (videoId: string) => `mission-${videoId}`;
