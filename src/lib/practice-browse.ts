/**
 * /practice '실습 모음' — 진단 없이 고르는 실습 목록. 순수 함수만 있고 I/O는 없다.
 *
 * - 미션의 수준·목표는 연결된 강의(video.levels, video.goals)에서 가져온다.
 * - 필요한 도구는 미션의 needsTool (없으면 chat = 챗봇만 있으면 됨).
 * - 필터는 주소 쿼리와 맞춘다: `?l=<level>&g=<goal>&t=<tool>&d=<domain>` (모두 선택, 함께 쓸 수 있음)
 * - 기본 순서: 가장 낮은 수준 → 챗봇만 있으면 되는 미션 먼저 → 데이터 순서
 */
import type { Domain, Goal, Level, Video } from "../types";
import type { PracticeMission, PracticeTool } from "./practice";
import { DOMAINS, GOALS, LEVELS } from "./questions";

export const PRACTICE_TOOLS: readonly PracticeTool[] = ["chat", "coding", "automation"];

export interface PracticeFilter {
  level: Level | "all";
  goal: Goal | "all";
  tool: PracticeTool | "all";
}

export const DEFAULT_PRACTICE_FILTER: PracticeFilter = { level: "all", goal: "all", tool: "all" };

/** 필터 이름 → 주소 쿼리 키 */
export const PRACTICE_QUERY_KEYS = { level: "l", goal: "g", tool: "t", domain: "d" } as const;

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);
const oneOf = <T extends string>(list: readonly T[], v: Param): T | undefined => {
  const s = first(v);
  return s !== undefined && (list as readonly string[]).includes(s) ? (s as T) : undefined;
};

/** 주소 쿼리 → 필터 (모르는 값은 전체) */
export function parsePracticeFilter(params: Record<string, Param>): PracticeFilter {
  return {
    level: oneOf(LEVELS, params[PRACTICE_QUERY_KEYS.level]) ?? "all",
    goal: oneOf(GOALS, params[PRACTICE_QUERY_KEYS.goal]) ?? "all",
    tool: oneOf(PRACTICE_TOOLS, params[PRACTICE_QUERY_KEYS.tool]) ?? "all",
  };
}

/** 주소 쿼리 → 프롬프트 분야 (없거나 모르는 값이면 null = 기본 문구) */
export function parsePracticeDomain(v: Param): Domain | null {
  return oneOf(DOMAINS, v) ?? null;
}

/** 필터·분야 → 쿼리 문자열 ("?l=user&t=chat", 모두 전체면 "") */
export function practiceQuery(filter: PracticeFilter, domain: Domain | null): string {
  const q = new URLSearchParams();
  if (filter.level !== "all") q.set(PRACTICE_QUERY_KEYS.level, filter.level);
  if (filter.goal !== "all") q.set(PRACTICE_QUERY_KEYS.goal, filter.goal);
  if (filter.tool !== "all") q.set(PRACTICE_QUERY_KEYS.tool, filter.tool);
  if (domain) q.set(PRACTICE_QUERY_KEYS.domain, domain);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const isDefaultFilter = (f: PracticeFilter) => f.level === "all" && f.goal === "all" && f.tool === "all";

/** 미션에 필요한 도구 (적혀 있지 않으면 챗봇) */
export const toolOf = (m: Pick<PracticeMission, "needsTool">): PracticeTool => m.needsTool ?? "chat";

/** 강의 없이 챗봇만으로 바로 해 볼 수 있는 미션인지 */
export const isChatOnly = (m: Pick<PracticeMission, "needsTool">) => toolOf(m) === "chat";

export interface BrowseMission {
  mission: PracticeMission;
  video: Video;
}

/** 필터에 필요한 것만 (화면에 넘길 때 강의 전체를 싣지 않아도 되게) */
export interface Browsable {
  mission: Pick<PracticeMission, "videoId" | "needsTool">;
  video: Pick<Video, "levels" | "goals">;
}

const levelRank = (v: Video) => Math.min(...v.levels.map((l) => LEVELS.indexOf(l)).filter((i) => i >= 0), LEVELS.length);

export function matchesFilter({ mission, video }: Browsable, f: PracticeFilter): boolean {
  if (f.level !== "all" && !video.levels.includes(f.level)) return false;
  if (f.goal !== "all" && !video.goals.includes(f.goal)) return false;
  if (f.tool !== "all" && toolOf(mission) !== f.tool) return false;
  return true;
}

/**
 * 미션과 강의를 짝지어 기본 순서로 정렬한다 (강의가 없는 미션은 뺀다).
 * 가장 낮은 수준 오름차순 → 도구(챗봇 → 코딩 → 자동화) → 원래 데이터 순서.
 */
export function sortMissions(missions: readonly PracticeMission[], videosById: ReadonlyMap<string, Video>): BrowseMission[] {
  const items: (BrowseMission & { i: number })[] = [];
  missions.forEach((mission, i) => {
    const video = videosById.get(mission.videoId);
    if (video) items.push({ mission, video, i });
  });
  items.sort(
    (a, b) =>
      levelRank(a.video) - levelRank(b.video) ||
      PRACTICE_TOOLS.indexOf(toolOf(a.mission)) - PRACTICE_TOOLS.indexOf(toolOf(b.mission)) ||
      a.i - b.i,
  );
  return items.map(({ mission, video }) => ({ mission, video }));
}

export function filterMissions<T extends Browsable>(items: readonly T[], f: PracticeFilter): T[] {
  return items.filter((it) => matchesFilter(it, f));
}

/** 해시가 가리키는 미션이 필터에 걸러졌다면 필터를 풀어 그 미션이 보이게 한다 */
export function filterForHash(items: readonly Browsable[], f: PracticeFilter, missionId: string | null): PracticeFilter {
  if (!missionId) return f;
  const hit = items.find((it) => it.mission.videoId === missionId);
  return hit && !matchesFilter(hit, f) ? DEFAULT_PRACTICE_FILTER : f;
}
