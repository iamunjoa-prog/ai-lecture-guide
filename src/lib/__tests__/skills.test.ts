import { describe, expect, it } from "vitest";
import realSkills from "../../../data/skills.json";
import realVideos from "../../../data/videos.json";
import realGlossary from "../../../data/glossary.json";
import realTheory from "../../../data/theory.json";
import {
  charCount,
  indexVideos,
  lecturesForSkill,
  selectSkills,
  SKILL_LECTURES_MAX,
  SKILL_LEVELS,
  SKILL_NAME_MAX,
  SKILL_PROMPT_MAX,
  SKILL_TAGLINE_MAX,
  SKILL_TERMS_MAX,
  SKILLS_MAX,
  type TrendingSkill,
} from "../skills";
import type { DiagnosisResult, Domain, Goal, GlossaryTerm, Level, TheoryConcept, Video } from "../../types";

const skills = realSkills as TrendingSkill[];
const videos = realVideos as Video[];
const glossary = realGlossary as GlossaryTerm[];
const theory = realTheory as TheoryConcept[];

const GOALS: Goal[] = ["understand", "use_tools", "build_agents", "build_products"];
const DOMAINS: Domain[] = ["automation", "marketing", "creative", "coding", "data", "education", "startup"];

function diag(level: Level, goals: Goal[], domains: Domain[] = []): Pick<DiagnosisResult, "level" | "goals" | "domains"> {
  return { level, goals, domains };
}

function skill(id: string, levels: Level[], goals: Goal[], domains?: Domain[]): TrendingSkill {
  return {
    id,
    name: id,
    tagline: id,
    whyNow: id,
    whatYouCanDo: [id, id, id],
    levels,
    goals,
    domains,
    lectureIds: [],
    termIds: [],
    firstStep: { label: id, prompt: id },
    sources: [],
    asOf: "2026-11",
  };
}

describe("data/skills.json 무결성", () => {
  const videoIds = new Set(videos.map((v) => v.id));
  const termIds = new Set(glossary.map((t) => t.id));
  const theoryIds = new Set(theory.map((c) => c.id));

  it("스킬 8~12개, id는 중복 없고 kebab-case", () => {
    expect(skills.length).toBeGreaterThanOrEqual(8);
    expect(skills.length).toBeLessThanOrEqual(12);
    const ids = skills.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(skills.map((s) => [s.id, s] as const))("%s: 필드 길이·형식", (_id, s) => {
    expect(charCount(s.name)).toBeGreaterThan(0);
    expect(charCount(s.name)).toBeLessThanOrEqual(SKILL_NAME_MAX);
    expect(charCount(s.tagline)).toBeGreaterThan(0);
    expect(charCount(s.tagline)).toBeLessThanOrEqual(SKILL_TAGLINE_MAX);
    const sentences = s.whyNow.split(/(?<=[.?!])\s+/).filter(Boolean);
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(sentences.length).toBeLessThanOrEqual(3);
    expect(s.whatYouCanDo).toHaveLength(3);
    for (const w of s.whatYouCanDo) expect(w).toMatch(/수 있어요$/);
    expect(s.firstStep.label.trim()).not.toBe("");
    expect(charCount(s.firstStep.prompt)).toBeLessThanOrEqual(SKILL_PROMPT_MAX);
    expect(s.firstStep.prompt).not.toMatch(/sk-|api[_ -]?key|password|비밀번호:/i);
    expect(s.asOf).toMatch(/^\d{4}-\d{2}$/);
  });

  it.each(skills.map((s) => [s.id, s] as const))("%s: levels·goals·domains enum (입문자 제외)", (_id, s) => {
    expect(s.levels.length).toBeGreaterThan(0);
    expect(s.levels).not.toContain("beginner");
    for (const l of s.levels) expect(SKILL_LEVELS).toContain(l);
    expect(new Set(s.levels).size).toBe(s.levels.length);
    expect(s.goals.length).toBeGreaterThan(0);
    for (const g of s.goals) expect(GOALS).toContain(g);
    for (const d of s.domains ?? []) expect(DOMAINS).toContain(d);
  });

  it.each(skills.map((s) => [s.id, s] as const))("%s: 강의·용어·이론 참조가 실제로 있음", (_id, s) => {
    expect(s.lectureIds.length).toBeGreaterThanOrEqual(1);
    expect(s.lectureIds.length).toBeLessThanOrEqual(SKILL_LECTURES_MAX);
    expect(new Set(s.lectureIds).size).toBe(s.lectureIds.length);
    for (const id of s.lectureIds) expect(videoIds.has(id), `lecture ${id}`).toBe(true);
    expect(s.termIds.length).toBeGreaterThanOrEqual(1);
    expect(s.termIds.length).toBeLessThanOrEqual(SKILL_TERMS_MAX);
    for (const id of s.termIds) expect(termIds.has(id), `term ${id}`).toBe(true);
    for (const id of s.theoryIds ?? []) expect(theoryIds.has(id), `theory ${id}`).toBe(true);
  });

  it.each(skills.map((s) => [s.id, s] as const))("%s: 출처 2개 이상, https, 중복 없음", (_id, s) => {
    expect(s.sources.length).toBeGreaterThanOrEqual(2);
    const urls = s.sources.map((x) => x.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const src of s.sources) {
      expect(src.title.trim()).not.toBe("");
      expect(src.publisher.trim()).not.toBe("");
      expect(["원문 확인", "검색 확인"]).toContain(src.checked);
      expect(new URL(src.url).protocol).toBe("https:");
    }
    // 원문을 직접 읽은 출처가 최소 1개
    expect(s.sources.some((x) => x.checked === "원문 확인")).toBe(true);
  });

  it("모든 스킬 수준(user/practitioner/developer)에 스킬이 3개 이상", () => {
    for (const l of SKILL_LEVELS) expect(skills.filter((s) => s.levels.includes(l)).length).toBeGreaterThanOrEqual(3);
  });
});

describe("selectSkills", () => {
  it("입문자는 항상 빈 배열", () => {
    for (const g of GOALS) expect(selectSkills(diag("beginner", [g]), skills)).toEqual([]);
    expect(selectSkills(diag("beginner", GOALS, DOMAINS), skills)).toEqual([]);
  });

  it.each(SKILL_LEVELS.flatMap((l) => GOALS.map((g) => [l, g] as const)))(
    "%s / %s: 최대 3개, 모두 그 수준에 맞음, 결정적",
    (level, goal) => {
      const a = selectSkills(diag(level, [goal]), skills);
      expect(a.length).toBe(SKILLS_MAX);
      for (const s of a) expect(s.levels).toContain(level);
      expect(new Set(a.map((s) => s.id)).size).toBe(a.length);
      expect(selectSkills(diag(level, [goal]), skills).map((s) => s.id)).toEqual(a.map((s) => s.id));
    },
  );

  it("수준이 맞는 스킬이 목표보다 우선", () => {
    const pool = [skill("dev-only", ["developer"], ["use_tools"]), skill("user-other", ["user"], ["understand"])];
    expect(selectSkills(diag("user", ["use_tools"]), pool, 1).map((s) => s.id)).toEqual(["user-other"]);
  });

  it("수준 맞는 스킬이 모자라면 다른 수준 스킬로 채운다", () => {
    const pool = [skill("dev", ["developer"], ["use_tools"]), skill("user", ["user"], ["understand"])];
    expect(selectSkills(diag("user", ["use_tools"]), pool, 2).map((s) => s.id)).toEqual(["user", "dev"]);
  });

  it("1순위 목표가 다른 목표보다 무겁다", () => {
    const pool = [
      skill("second", ["user"], ["build_products"]),
      skill("primary", ["user"], ["use_tools"]),
      skill("none", ["user"], ["understand"]),
    ];
    expect(selectSkills(diag("user", ["use_tools", "build_products"]), pool).map((s) => s.id)).toEqual([
      "primary",
      "second",
      "none",
    ]);
  });

  it("여러 목표가 맞을수록 앞선다 (1순위+2순위 > 1순위만)", () => {
    const pool = [
      skill("primary-only", ["practitioner"], ["build_agents"]),
      skill("both", ["practitioner"], ["build_agents", "use_tools"]),
    ];
    expect(selectSkills(diag("practitioner", ["build_agents", "use_tools"]), pool).map((s) => s.id)).toEqual([
      "both",
      "primary-only",
    ]);
  });

  it("2순위 목표 두 개가 맞으면 1순위 하나와 같은 점수 → 분야로 가린다", () => {
    const pool = [
      skill("primary", ["user"], ["use_tools"]),
      skill("two-secondary", ["user"], ["build_agents", "build_products"], ["data"]),
    ];
    const ids = selectSkills(diag("user", ["use_tools", "build_agents", "build_products"], ["data"]), pool).map((s) => s.id);
    expect(ids).toEqual(["two-secondary", "primary"]);
  });

  it("목표가 같으면 분야 겹침 수, 그다음 데이터 순서", () => {
    const pool = [
      skill("a", ["developer"], ["build_agents"], ["marketing"]),
      skill("b", ["developer"], ["build_agents"], ["coding", "data"]),
      skill("c", ["developer"], ["build_agents"], ["coding"]),
      skill("d", ["developer"], ["build_agents"]),
    ];
    expect(selectSkills(diag("developer", ["build_agents"], ["coding", "data"]), pool, 4).map((s) => s.id)).toEqual([
      "b",
      "c",
      "a",
      "d",
    ]);
  });

  it("max를 지키고, 0이면 빈 배열", () => {
    expect(selectSkills(diag("developer", ["build_agents"]), skills, 1)).toHaveLength(1);
    expect(selectSkills(diag("developer", ["build_agents"]), skills, 0)).toEqual([]);
  });

  it("실제 데이터: 수준별 대표 사례", () => {
    const ids = (d: ReturnType<typeof diag>) => selectSkills(d, skills).map((s) => s.id);
    // 사용자 + 도구로 쓰기 → 일 맡기기가 먼저
    expect(ids(diag("user", ["use_tools"]))[0]).toBe("delegate-to-agents");
    // 사용자 + 제품 만들기 → 바이브 코딩이 먼저
    expect(ids(diag("user", ["build_products"]))[0]).toBe("vibe-coding");
    // 사용자에게 개발자 전용 스킬은 나오지 않음
    expect(ids(diag("user", ["build_agents", "build_products"]))).not.toContain("coding-agents");
    // 개발자 + 제품 만들기 + 코딩 → 코딩 에이전트 포함
    expect(ids(diag("developer", ["build_products"], ["coding"]))).toContain("coding-agents");
    // 실무자 + 에이전트 + 다중 목표
    const multi = ids(diag("practitioner", ["build_agents", "build_products"], ["coding"]));
    expect(multi).toContain("agent-design");
    expect(multi).toContain("context-engineering");
  });
});

describe("lecturesForSkill", () => {
  const byId = indexVideos(videos);

  it("lectureIds 순서대로 실제 강의를 돌려준다", () => {
    for (const s of skills) {
      const vs = lecturesForSkill(s, byId);
      expect(vs.map((v) => v.id)).toEqual(s.lectureIds);
    }
  });

  it("없는 id와 중복은 건너뛴다", () => {
    const first = videos[0];
    const vs = lecturesForSkill({ lectureIds: ["nope", first.id, first.id] }, byId);
    expect(vs.map((v) => v.id)).toEqual([first.id]);
  });
});
