/**
 * '강의 보고 해보기' (강의 후 실습 미션). 순수 함수만 있고 I/O는 없다. 데이터는 `data/practice.json`.
 *
 * - 강의 1개당 미션 1개. 미션은 강의 '주제'를 사용자가 자기 AI(ChatGPT, Claude, Gemini, Copilot 등)로
 *   직접 해 보게 한다. 강의 속 구체적인 내용은 주장하지 않는다(영상을 시청해 만든 데이터가 아님).
 * - 프롬프트 text에는 사용자가 바꿔 넣을 자리표시자 `[...]`가 최대 1개 있다.
 * - domainVariants가 있으면 사용자의 분야(진단 순서상 첫 번째로 맞는 분야)에 맞춘 문구로 바꿔 보여 준다.
 *
 * 이번 주 실습 미션 (`weeklyMission`) — 결정적
 *  1) 실전(practice) 단계 강의 중 1순위 목표(goals[0])가 맞는 강의
 *  2) 로드맵 전체에서 1순위 목표가 맞는 강의
 *  3) 실전 단계 강의 중 다른 목표가 하나라도 맞는 강의
 *  4) 로드맵 전체에서 다른 목표가 하나라도 맞는 강의
 *  5) 미션이 있는 첫 로드맵 강의
 *  각 단계 안에서는 로드맵 순서를 따른다. 미션이 없는 강의는 건너뛴다.
 *  실전 단계 강의 id를 넘기지 않으면 '사용자 수준을 포함하는 강의'를 실전 단계로 본다
 *  (buildRoadmap의 실전 단계가 현재 수준 강의만 고르는 것과 같다).
 */
import type { DiagnosisResult, Domain, Video } from "../types";

export type PracticeTool = "chat" | "coding" | "automation";

export interface PracticePrompt {
  label: string;
  /** 복사할 프롬프트. 자리표시자 `[...]`는 최대 1개 */
  text: string;
  /** 분야별로 text를 통째로 바꾸는 문구 */
  domainVariants?: Partial<Record<Domain, string>>;
}

export interface PracticeMission {
  videoId: string;
  title: string; // ≤ 30자
  goal: string; // ≤ 60자
  steps: string[]; // 2~4개
  prompts: PracticePrompt[]; // 1~3개
  success: string; // ≤ 60자, "이렇게 되면 성공"
  caution?: string;
  needsTool?: PracticeTool;
}

export const PRACTICE_LIMITS = {
  title: 30,
  goal: 60,
  success: 60,
  promptText: 350,
  stepsMin: 2,
  stepsMax: 4,
  promptsMin: 1,
  promptsMax: 3,
} as const;

export const PRACTICE_TOOL_LABELS: Record<PracticeTool, string> = {
  chat: "아무 AI 챗봇",
  coding: "코딩 환경·코딩 AI",
  automation: "자동화·에이전트 도구",
};

/** 자리표시자 `[여기에 ...]` (대괄호 한 쌍) */
export const PLACEHOLDER_RE = /\[[^[\]\n]+\]/g;

/** 문자 수 (한글·이모지를 1자로 센다) */
export const charLength = (s: string): number => [...s].length;

/** 텍스트 안 자리표시자 목록 */
export function placeholdersOf(text: string): string[] {
  return text.match(PLACEHOLDER_RE) ?? [];
}

export function practiceById(missions: readonly PracticeMission[]): Map<string, PracticeMission> {
  const map = new Map<string, PracticeMission>();
  for (const m of missions) if (!map.has(m.videoId)) map.set(m.videoId, m);
  return map;
}

export function missionForVideo(
  videoId: string,
  byId: ReadonlyMap<string, PracticeMission>,
): PracticeMission | undefined {
  return byId.get(videoId);
}

/** 사용자의 분야 중 (진단 순서상) 처음으로 맞는 domainVariant, 없으면 기본 text */
export function resolvePrompt(
  prompt: PracticePrompt,
  diagnosis: Pick<DiagnosisResult, "domains">,
): string {
  const variants = prompt.domainVariants;
  if (variants) {
    for (const d of diagnosis.domains) {
      const v = variants[d];
      if (v) return v;
    }
  }
  return prompt.text;
}

export interface WeeklyMission {
  video: Video;
  mission: PracticeMission;
}

export function weeklyMission(
  diagnosis: Pick<DiagnosisResult, "level" | "goals">,
  roadmapVideos: readonly Video[],
  byId: ReadonlyMap<string, PracticeMission>,
  practiceStepVideoIds?: Iterable<string>,
): WeeklyMission | undefined {
  const seen = new Set<string>();
  const candidates: WeeklyMission[] = [];
  for (const video of roadmapVideos) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    const mission = byId.get(video.id);
    if (mission) candidates.push({ video, mission });
  }
  if (candidates.length === 0) return undefined;

  const practiceIds = practiceStepVideoIds ? new Set(practiceStepVideoIds) : undefined;
  const isPractice = (v: Video) => (practiceIds ? practiceIds.has(v.id) : v.levels.includes(diagnosis.level));
  const primary = diagnosis.goals[0];
  const matchesPrimary = (v: Video) => primary !== undefined && v.goals.includes(primary);
  const matchesAny = (v: Video) => v.goals.some((g) => diagnosis.goals.includes(g));

  const tiers: ((c: WeeklyMission) => boolean)[] = [
    (c) => isPractice(c.video) && matchesPrimary(c.video),
    (c) => matchesPrimary(c.video),
    (c) => isPractice(c.video) && matchesAny(c.video),
    (c) => matchesAny(c.video),
  ];
  for (const t of tiers) {
    const hit = candidates.find(t);
    if (hit) return hit;
  }
  return candidates[0];
}
