import { describe, expect, it } from "vitest";
import realGlossary from "../../../data/glossary.json";
import realVideos from "../../../data/videos.json";
import realInstructors from "../../../data/instructors.json";
import {
  ESSENTIAL_TERM_IDS,
  GLOSSARY_LEVEL_TITLES,
  glossaryById,
  groupByLevel,
  selectStarterTerms,
  STARTER_BELOW_MAX,
  STARTER_MAX,
  STARTER_MIN,
  termsForVideo,
} from "../glossary";
import { buildRoadmap } from "../recommend";
import { GOALS, LEVELS } from "../questions";
import { makeVideo } from "./fixtures";
import type { DiagnosisResult, Goal, GlossaryTerm, Instructor, Level, Video } from "../../types";

const glossary = realGlossary as GlossaryTerm[];
const videos = realVideos as Video[];
const instructors = realInstructors as Instructor[];

const lvl = (l: Level) => LEVELS.indexOf(l);
const diag = (level: Level, goal: Goal, domains: DiagnosisResult["domains"] = ["automation"]): DiagnosisResult => ({
  level,
  goal,
  domains,
  preferKorean: false,
});

function term(id: string, level: Level, goals: Goal[]): GlossaryTerm {
  return { id, term: id, level, goals, short: id, detail: id };
}

describe("실제 데이터 참조 무결성", () => {
  const ids = glossary.map((t) => t.id);
  const idSet = new Set(ids);

  it("용어 id는 중복 없고 kebab-case", () => {
    expect(idSet.size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("용어 수 45~65개, 수준마다 10개 이상", () => {
    expect(glossary.length).toBeGreaterThanOrEqual(45);
    expect(glossary.length).toBeLessThanOrEqual(65);
    for (const l of LEVELS) expect(glossary.filter((t) => t.level === l).length).toBeGreaterThanOrEqual(10);
  });

  it("필드 값이 올바르다", () => {
    for (const t of glossary) {
      expect(LEVELS).toContain(t.level);
      expect(t.goals.length).toBeGreaterThan(0);
      for (const g of t.goals) expect(GOALS).toContain(g);
      expect(t.term.trim()).not.toBe("");
      expect([...t.short].length).toBeLessThanOrEqual(45);
      expect(t.detail.trim()).not.toBe("");
    }
  });

  it("related는 모두 존재하는 다른 용어", () => {
    for (const t of glossary) {
      for (const r of t.related ?? []) {
        expect(r, `${t.id} → ${r}`).not.toBe(t.id);
        expect(idSet.has(r), `${t.id} → ${r}`).toBe(true);
      }
    }
  });

  it("모든 강의에 2~3개의 존재하는 terms가 있다", () => {
    for (const v of videos) {
      expect(v.terms, v.id).toBeDefined();
      expect(v.terms!.length, v.id).toBeGreaterThanOrEqual(2);
      expect(v.terms!.length, v.id).toBeLessThanOrEqual(3);
      expect(new Set(v.terms).size, v.id).toBe(v.terms!.length);
      for (const id of v.terms!) expect(idSet.has(id), `${v.id} → ${id}`).toBe(true);
    }
  });

  it("모든 수준·목표에 해당하는 용어가 있다", () => {
    for (const l of LEVELS) for (const g of GOALS) {
      expect(glossary.some((t) => t.level === l && t.goals.includes(g)), `${l}/${g}`).toBe(true);
    }
  });
});

describe("glossaryById / termsForVideo / groupByLevel", () => {
  const byId = glossaryById(glossary);

  it("id로 찾는다", () => {
    expect(byId["prompt"].term).toBe("프롬프트");
    expect(Object.keys(byId).length).toBe(glossary.length);
  });

  it("강의 용어를 순서대로, 없는 id는 건너뛰고 최대 3개", () => {
    const v = makeVideo({ id: "X", instructorId: "a", levels: ["user"], domains: ["data"], goals: ["use_tools"], terms: ["prompt", "nope", "llm", "token", "rag"] });
    expect(termsForVideo(v, byId).map((t) => t.id)).toEqual(["prompt", "llm", "token"]);
    expect(termsForVideo({ terms: undefined }, byId)).toEqual([]);
  });

  it("입문 → 개발 순서로 묶고 제목을 붙인다", () => {
    const groups = groupByLevel(glossary);
    expect(groups.map((g) => g.level)).toEqual([...LEVELS]);
    expect(groups.map((g) => g.title)).toEqual(LEVELS.map((l) => GLOSSARY_LEVEL_TITLES[l]));
    expect(groups.reduce((n, g) => n + g.terms.length, 0)).toBe(glossary.length);
    for (const g of groups) for (const t of g.terms) expect(t.level).toBe(g.level);
  });

  it("빈 수준은 뺀다", () => {
    expect(groupByLevel([term("a", "user", ["understand"])]).map((g) => g.level)).toEqual(["user"]);
  });
});

describe("selectStarterTerms", () => {
  it.each(LEVELS.flatMap((l) => GOALS.map((g) => [l, g] as const)))(
    "%s/%s: 5~8개, 중복 없음, 수준 범위 지킴 (로드맵 포함)",
    (level, goal) => {
      const d = diag(level, goal, ["automation", "coding"]);
      const roadmap = buildRoadmap(d, videos, instructors);
      const rv = roadmap.steps.flatMap((s) => s.items.map((i) => i.video));
      for (const picked of [selectStarterTerms(d, glossary), selectStarterTerms(d, glossary, rv)]) {
        expect(picked.length).toBeGreaterThanOrEqual(STARTER_MIN);
        expect(picked.length).toBeLessThanOrEqual(STARTER_MAX);
        expect(new Set(picked.map((t) => t.id)).size).toBe(picked.length);
        const cur = lvl(level);
        for (const t of picked) {
          expect(lvl(t.level)).toBeGreaterThanOrEqual(Math.max(0, cur - 1));
          expect(lvl(t.level)).toBeLessThanOrEqual(cur + 1);
        }
        expect(picked.filter((t) => lvl(t.level) < cur).length).toBeLessThanOrEqual(STARTER_BELOW_MAX);
        // 그룹으로 보여 주기 좋게 수준 낮은 순
        const order = picked.map((t) => lvl(t.level));
        expect(order).toEqual([...order].sort((a, b) => a - b));
      }
    },
  );

  it("입문자는 (로드맵 없으면) 입문 용어만, 안전 용어를 꼭 포함", () => {
    const picked = selectStarterTerms(diag("beginner", "build_products"), glossary);
    for (const t of picked) expect(t.level).toBe("beginner");
    for (const id of ESSENTIAL_TERM_IDS) expect(picked.map((t) => t.id)).toContain(id);
  });

  it("로드맵 없이 다음 수준 용어는 넣지 않는다", () => {
    for (const l of LEVELS) {
      const picked = selectStarterTerms(diag(l, "build_agents"), glossary);
      for (const t of picked) expect(lvl(t.level)).toBeLessThanOrEqual(lvl(l));
    }
  });

  it("결과가 결정적이다", () => {
    const d = diag("practitioner", "build_agents");
    expect(selectStarterTerms(d, glossary).map((t) => t.id)).toEqual(selectStarterTerms(d, glossary).map((t) => t.id));
  });

  describe("작은 용어집으로 규칙 확인", () => {
    const g: GlossaryTerm[] = [
      term("u-understand", "user", ["understand"]),
      term("u-agents-1", "user", ["build_agents"]),
      term("u-agents-2", "user", ["build_agents"]),
      term("u-tools-1", "user", ["use_tools"]),
      term("u-tools-2", "user", ["use_tools"]),
      term("u-tools-3", "user", ["use_tools"]),
      term("u-tools-4", "user", ["use_tools"]),
      term("u-tools-5", "user", ["use_tools"]),
      term("b-1", "beginner", ["use_tools"]),
      term("b-2", "beginner", ["use_tools"]),
      term("b-3", "beginner", ["use_tools"]),
      term("p-agents", "practitioner", ["build_agents"]),
      term("p-tools", "practitioner", ["use_tools"]),
      term("d-agents", "developer", ["build_agents"]),
    ];
    const ids = (d: DiagnosisResult, rv?: Video[]) => selectStarterTerms(d, g, rv).map((t) => t.id);
    const rvWith = (...terms: string[]) =>
      [makeVideo({ id: "R1", instructorId: "a", levels: ["user"], domains: ["data"], goals: ["build_agents"], terms })];

    it("분야 미정이어도 용어 선택이 같은 범위(5~8개)로 동작한다", () => {
      const out = selectStarterTerms(diag("user", "understand", []), g);
      expect(out.length).toBeGreaterThanOrEqual(STARTER_MIN);
      expect(out.length).toBeLessThanOrEqual(STARTER_MAX);
      expect(out.map((t) => t.id)).toEqual(selectStarterTerms(diag("user", "understand", ["coding", "data"]), g).map((t) => t.id));
    });

    it("목표가 맞는 용어가 먼저 뽑힌다", () => {
      const out = ids(diag("user", "build_agents"));
      expect(out).toContain("u-agents-1");
      expect(out).toContain("u-agents-2");
      expect(out).not.toContain("p-agents");
      expect(out).not.toContain("d-agents");
    });

    it("로드맵에 나온 용어가 점수를 받아 밀려나지 않는다", () => {
      expect(ids(diag("user", "use_tools"))).not.toContain("u-understand");
      expect(ids(diag("user", "use_tools"), rvWith("u-understand", "u-agents-1"))).toContain("u-understand");
    });

    it("다음 수준 용어는 로드맵에 나오고 목표가 맞을 때만, 최대 2개", () => {
      expect(ids(diag("user", "build_agents"), rvWith("p-agents", "p-tools"))).toContain("p-agents");
      expect(ids(diag("user", "build_agents"), rvWith("p-agents", "p-tools"))).not.toContain("p-tools");
      // 두 단계 위(developer)는 로드맵에 있어도 넣지 않는다
      expect(ids(diag("user", "build_agents"), rvWith("d-agents"))).not.toContain("d-agents");
    });

    it("아래 수준 용어는 최대 STARTER_BELOW_MAX개", () => {
      const out = selectStarterTerms(diag("user", "use_tools"), g);
      expect(out.filter((t) => t.level === "beginner").length).toBeLessThanOrEqual(STARTER_BELOW_MAX);
      expect(out.length).toBe(6);
    });

    it("후보가 모자라면 최소 개수를 채운다", () => {
      const tiny = [term("b-a", "beginner", ["understand"]), term("b-b", "beginner", ["understand"]), term("u-a", "user", ["understand"]), term("u-b", "user", ["understand"]), term("u-c", "user", ["understand"])];
      expect(selectStarterTerms(diag("beginner", "understand"), tiny).length).toBe(STARTER_MIN);
    });
  });
});
