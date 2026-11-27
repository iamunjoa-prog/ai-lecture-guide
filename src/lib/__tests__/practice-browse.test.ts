import { describe, expect, it } from "vitest";
import realPractice from "../../../data/practice.json";
import realVideos from "../../../data/videos.json";
import type { PracticeMission } from "../practice";
import {
  DEFAULT_PRACTICE_FILTER,
  filterForHash,
  filterMissions,
  isChatOnly,
  isDefaultFilter,
  parsePracticeDomain,
  parsePracticeFilter,
  practiceQuery,
  sortMissions,
  toolOf,
} from "../practice-browse";
import { LEVELS } from "../questions";
import { makeVideo } from "./fixtures";
import type { Video } from "../../types";

const mission = (videoId: string, needsTool?: PracticeMission["needsTool"]): PracticeMission => ({
  videoId,
  title: `미션 ${videoId}`,
  goal: "목표",
  steps: ["하나", "둘"],
  prompts: [{ label: "프롬프트", text: "글" }],
  success: "성공",
  needsTool,
});

const vids = [
  makeVideo({ id: "a", instructorId: "inst-a", levels: ["practitioner"], domains: [], goals: ["build_agents"] }),
  makeVideo({ id: "b", instructorId: "inst-a", levels: ["beginner", "user"], domains: [], goals: ["understand"] }),
  makeVideo({ id: "c", instructorId: "inst-a", levels: ["beginner"], domains: [], goals: ["use_tools"] }),
  makeVideo({ id: "d", instructorId: "inst-a", levels: ["user", "developer"], domains: [], goals: ["use_tools", "build_products"] }),
];
const byId = new Map(vids.map((v) => [v.id, v]));
const missions = [mission("a"), mission("b", "coding"), mission("c", "chat"), mission("d", "automation"), mission("zz")];

describe("parsePracticeFilter / practiceQuery", () => {
  it("모르는 값·빈 값은 전체", () => {
    expect(parsePracticeFilter({})).toEqual(DEFAULT_PRACTICE_FILTER);
    expect(parsePracticeFilter({ l: "expert", g: "x", t: "robot" })).toEqual(DEFAULT_PRACTICE_FILTER);
  });
  it("값을 읽고 배열이면 첫 값", () => {
    expect(parsePracticeFilter({ l: ["user", "developer"], g: "use_tools", t: "coding" })).toEqual({
      level: "user",
      goal: "use_tools",
      tool: "coding",
    });
  });
  it("쿼리로 되돌리면 같은 필터 (왕복)", () => {
    const f = { level: "developer", goal: "build_agents", tool: "chat" } as const;
    const q = practiceQuery(f, "data");
    expect(q).toBe("?l=developer&g=build_agents&t=chat&d=data");
    const back = Object.fromEntries(new URLSearchParams(q));
    expect(parsePracticeFilter(back)).toEqual(f);
    expect(parsePracticeDomain(back.d)).toBe("data");
  });
  it("모두 전체면 빈 쿼리", () => {
    expect(practiceQuery(DEFAULT_PRACTICE_FILTER, null)).toBe("");
    expect(isDefaultFilter(DEFAULT_PRACTICE_FILTER)).toBe(true);
    expect(parsePracticeDomain("cooking")).toBeNull();
  });
});

describe("toolOf / isChatOnly", () => {
  it("needsTool이 없으면 챗봇", () => {
    expect(toolOf(mission("x"))).toBe("chat");
    expect(isChatOnly(mission("x"))).toBe(true);
    expect(isChatOnly(mission("x", "coding"))).toBe(false);
  });
});

describe("sortMissions", () => {
  it("낮은 수준 먼저 → 챗봇 먼저 → 데이터 순서, 강의가 없는 미션은 뺀다", () => {
    expect(sortMissions(missions, byId).map((it) => it.mission.videoId)).toEqual(["c", "b", "d", "a"]);
  });
});

describe("filterMissions", () => {
  const sorted = sortMissions(missions, byId);
  const ids = (f: Parameters<typeof filterMissions>[1]) => filterMissions(sorted, f).map((it) => it.mission.videoId);
  it("수준은 강의 수준 중 하나라도 맞으면", () => {
    expect(ids({ ...DEFAULT_PRACTICE_FILTER, level: "user" })).toEqual(["b", "d"]);
    expect(ids({ ...DEFAULT_PRACTICE_FILTER, level: "developer" })).toEqual(["d"]);
  });
  it("수준·목표·도구를 함께 쓸 수 있다", () => {
    expect(ids({ level: "user", goal: "use_tools", tool: "all" })).toEqual(["d"]);
    expect(ids({ level: "user", goal: "use_tools", tool: "chat" })).toEqual([]);
    expect(ids({ level: "beginner", goal: "all", tool: "chat" })).toEqual(["c"]);
  });
  it("해시가 걸러진 미션을 가리키면 필터를 푼다", () => {
    const f = { ...DEFAULT_PRACTICE_FILTER, tool: "coding" } as const;
    expect(filterForHash(sorted, f, "c")).toEqual(DEFAULT_PRACTICE_FILTER);
    expect(filterForHash(sorted, f, "b")).toBe(f);
    expect(filterForHash(sorted, f, "nope")).toBe(f);
    expect(filterForHash(sorted, f, null)).toBe(f);
  });
});

describe("실제 데이터", () => {
  const videos = realVideos as Video[];
  const all = sortMissions(realPractice as PracticeMission[], new Map(videos.map((v) => [v.id, v])));
  it("미션 70개 모두 강의와 짝이 맞는다", () => {
    expect(all).toHaveLength(70);
  });
  it("수준마다 미션이 하나 이상 있다", () => {
    for (const level of LEVELS) expect(filterMissions(all, { ...DEFAULT_PRACTICE_FILTER, level }).length, level).toBeGreaterThan(0);
  });
  it("첫 미션은 입문자용이고 챗봇만 있으면 된다", () => {
    expect(all[0].video.levels).toContain("beginner");
    expect(isChatOnly(all[0].mission)).toBe(true);
  });
});
