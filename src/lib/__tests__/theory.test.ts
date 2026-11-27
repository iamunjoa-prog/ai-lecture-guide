import { describe, expect, it } from "vitest";
import realTheory from "../../../data/theory.json";
import realGlossary from "../../../data/glossary.json";
import realVideos from "../../../data/videos.json";
import realInstructors from "../../../data/instructors.json";
import { groupTheoryByLevel, lectureAnchorId, lecturesForConcept, selectTheory, THEORY_COUNT } from "../theory";
import { buildRoadmap } from "../recommend";
import { GOALS, LEVELS } from "../questions";
import { makeVideo } from "./fixtures";
import type { DiagnosisResult, Goal, GlossaryTerm, Instructor, Level, TheoryConcept, Video } from "../../types";

const theory = realTheory as TheoryConcept[];
const glossary = realGlossary as GlossaryTerm[];
const videos = realVideos as Video[];
const instructors = realInstructors as Instructor[];

function concept(id: string, level: Level, goals: Goal[], core = false, termIds: string[] = []): TheoryConcept {
  return { id, level, core, goals, title: id, summary: id, body: [id], analogy: id, termIds, sources: [] };
}

describe("data/theory.json 무결성", () => {
  const ids = theory.map((c) => c.id);
  const termIds = new Set(glossary.map((t) => t.id));

  it("개념 23개, id는 중복 없고 kebab-case", () => {
    expect(theory.length).toBe(23);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("수준마다 core 개념이 정확히 1개이고, 수준마다 3개 이상", () => {
    for (const l of LEVELS) {
      const list = theory.filter((c) => c.level === l);
      expect(list.length).toBeGreaterThanOrEqual(THEORY_COUNT);
      expect(list.filter((c) => c.core)).toHaveLength(1);
    }
  });

  it("필드 형식: 요약 50자 이하, 본문 3~4문단(400~600자), 비유·제목 있음", () => {
    for (const c of theory) {
      expect(LEVELS, c.id).toContain(c.level);
      expect(c.goals.length, c.id).toBeGreaterThan(0);
      for (const g of c.goals) expect(GOALS, c.id).toContain(g);
      expect(c.title.trim(), c.id).not.toBe("");
      expect([...c.summary].length, c.id).toBeLessThanOrEqual(50);
      expect(c.body.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.body.length, c.id).toBeLessThanOrEqual(4);
      for (const p of c.body) expect(p.trim(), c.id).not.toBe("");
      const total = [...c.body.join("")].length;
      expect(total, c.id).toBeGreaterThanOrEqual(400);
      expect(total, c.id).toBeLessThanOrEqual(600);
      expect(c.analogy.trim(), c.id).not.toBe("");
      if (c.tryIt !== undefined) expect(c.tryIt.trim(), c.id).not.toBe("");
    }
  });

  it("termIds는 2~3개이고 모두 용어집에 있다", () => {
    for (const c of theory) {
      expect(c.termIds.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.termIds.length, c.id).toBeLessThanOrEqual(3);
      expect(new Set(c.termIds).size, c.id).toBe(c.termIds.length);
      for (const t of c.termIds) expect(termIds.has(t), `${c.id} → ${t}`).toBe(true);
    }
  });

  it("출처는 2개 이상, https URL, 출판처·제목 있음, 개념 안에서 중복 없음", () => {
    for (const c of theory) {
      expect(c.sources.length, c.id).toBeGreaterThanOrEqual(2);
      for (const s of c.sources) {
        expect(s.url, c.id).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//);
        expect(s.title.trim(), c.id).not.toBe("");
        expect(s.publisher.trim(), c.id).not.toBe("");
      }
      expect(new Set(c.sources.map((s) => s.url)).size, c.id).toBe(c.sources.length);
    }
  });

  it("본문에 이모지가 없다", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    for (const c of theory) {
      for (const text of [c.title, c.summary, c.analogy, c.tryIt ?? "", ...c.body]) expect(emoji.test(text), c.id).toBe(false);
    }
  });

  it("모든 개념이 강의 1개 이상과 연결된다", () => {
    for (const c of theory) expect(lecturesForConcept(c, [], videos).length, c.id).toBeGreaterThan(0);
  });
});

describe("selectTheory (실제 데이터)", () => {
  for (const level of LEVELS) {
    for (const goal of GOALS) {
      it(`${level} × ${goal}: 같은 수준 3개, core 먼저, 서로 다름`, () => {
        const picked = selectTheory({ level, goals: [goal] }, theory);
        expect(picked).toHaveLength(3);
        expect(picked[0].core).toBe(true);
        expect(new Set(picked.map((c) => c.id)).size).toBe(3);
        for (const c of picked) expect(c.level).toBe(level);
        // 목표가 맞는 개념이 있으면 2·3번에 먼저 온다
        const goalMatches = theory.filter((c) => c.level === level && !c.core && c.goals.includes(goal)).length;
        const matchedInPick = picked.slice(1).filter((c) => c.goals.includes(goal)).length;
        expect(matchedInPick).toBe(Math.min(2, goalMatches));
      });
    }
  }

  it("입문자 안전 개념: 업무 도구는 '개인정보', 그 외 목표는 '할루시네이션'을 본다", () => {
    for (const goal of GOALS) {
      const ids = selectTheory({ level: "beginner", goals: [goal] }, theory).map((c) => c.id);
      expect(ids).toContain(goal === "use_tools" ? "do-not-share-sensitive-info" : "ai-can-be-wrong");
    }
  });

  it("실무자 에이전트 목표는 '가드레일과 사람 검토'를 본다", () => {
    expect(selectTheory({ level: "practitioner", goals: ["build_agents"] }, theory).map((c) => c.id)).toContain(
      "guardrails-and-human-review",
    );
  });

  it("목표 여러 개: core + 목표 우선순위 순서로 돌아가며, 항상 같은 수준 3개", () => {
    const combos = [["use_tools", "build_agents"], ["build_agents", "use_tools"], ["understand", "build_products"], [...GOALS]] as Goal[][];
    for (const level of LEVELS) {
      for (const goals of combos) {
        const picked = selectTheory({ level, goals }, theory);
        expect(picked).toHaveLength(3);
        expect(picked[0].core).toBe(true);
        expect(new Set(picked.map((c) => c.id)).size).toBe(3);
        for (const c of picked) expect(c.level).toBe(level);
        // 1순위 목표에 맞는 개념이 있으면 2번은 그 개념
        const firstMatch = theory.find((c) => c.level === level && !c.core && c.goals.includes(goals[0]));
        if (firstMatch) expect(picked[1].id, `${level}/${goals}`).toBe(firstMatch.id);
      }
    }
  });

  it("결과가 결정적이다 (같은 입력 → 같은 출력)", () => {
    const a = selectTheory({ level: "user", goals: ["understand"] }, theory).map((c) => c.id);
    const b = selectTheory({ level: "user", goals: ["understand"] }, theory).map((c) => c.id);
    expect(a).toEqual(b);
  });
});

describe("selectTheory (작은 데이터)", () => {
  const data = [
    concept("b-other", "beginner", ["understand"]),
    concept("b-core", "beginner", ["understand"], true),
    concept("b-tools-1", "beginner", ["use_tools"]),
    concept("b-tools-2", "beginner", ["use_tools"]),
    concept("b-tools-3", "beginner", ["use_tools"]),
    concept("u-core", "user", ["use_tools"], true),
    concept("u-tools", "user", ["use_tools"]),
  ];

  it("core 먼저, 목표 일치는 목록 순서, 최대 3개", () => {
    expect(selectTheory({ level: "beginner", goals: ["use_tools"] }, data).map((c) => c.id)).toEqual([
      "b-core",
      "b-tools-1",
      "b-tools-2",
    ]);
  });

  it("목표 일치가 모자라면 같은 수준으로 목록 순서대로 채운다", () => {
    expect(selectTheory({ level: "beginner", goals: ["build_agents"] }, data).map((c) => c.id)).toEqual([
      "b-core",
      "b-other",
      "b-tools-1",
    ]);
  });

  it("목표 여러 개는 돌아가며 하나씩 (1순위 → 2순위), 중복 없이", () => {
    const mixed = [
      concept("b-core", "beginner", ["understand"], true),
      concept("b-tools-1", "beginner", ["use_tools"]),
      concept("b-tools-2", "beginner", ["use_tools"]),
      concept("b-both", "beginner", ["use_tools", "build_agents"]),
      concept("b-agents", "beginner", ["build_agents"]),
    ];
    expect(selectTheory({ level: "beginner", goals: ["build_agents", "use_tools"] }, mixed).map((c) => c.id)).toEqual([
      "b-core",
      "b-both",
      "b-tools-1",
    ]);
    expect(selectTheory({ level: "beginner", goals: ["use_tools", "build_agents"] }, mixed).map((c) => c.id)).toEqual([
      "b-core",
      "b-tools-1",
      "b-both",
    ]);
  });

  it("다른 수준 개념은 섞지 않는다 (데이터가 모자라면 3개 미만)", () => {
    expect(selectTheory({ level: "user", goals: ["understand"] }, data).map((c) => c.id)).toEqual(["u-core", "u-tools"]);
    expect(selectTheory({ level: "developer", goals: ["understand"] }, data)).toEqual([]);
  });
});

describe("lecturesForConcept", () => {
  const c = concept("x", "user", ["use_tools"], false, ["prompt", "few-shot"]);
  const base = { instructorId: "inst-a", domains: ["coding"] as Video["domains"], goals: ["use_tools"] as Video["goals"] };
  const v1 = makeVideo({ ...base, id: "aaaaaaaaaa1", terms: ["prompt"], levels: ["developer"] });
  const v2 = makeVideo({ ...base, id: "aaaaaaaaaa2", terms: ["prompt", "few-shot"], levels: ["developer"] });
  const v3 = makeVideo({ ...base, id: "aaaaaaaaaa3", terms: ["prompt"], levels: ["user"] });
  const v4 = makeVideo({ ...base, id: "aaaaaaaaaa4", terms: ["rag"], levels: ["user"] });
  const all = [v1, v2, v3, v4];

  it("로드맵 강의가 먼저, 로드맵 순서대로", () => {
    const r = lecturesForConcept(c, [v3, v4, v1], all);
    expect(r.map((x) => [x.video.id, x.inRoadmap])).toEqual([
      ["aaaaaaaaaa3", true],
      ["aaaaaaaaaa1", true],
    ]);
  });

  it("로드맵에 없으면 겹치는 용어 수 → 수준 일치 → 데이터 순서", () => {
    expect(lecturesForConcept(c, [], all).map((x) => x.video.id)).toEqual(["aaaaaaaaaa2", "aaaaaaaaaa3"]);
    expect(lecturesForConcept(c, [v1], all).map((x) => [x.video.id, x.inRoadmap])).toEqual([
      ["aaaaaaaaaa1", true],
      ["aaaaaaaaaa2", false],
    ]);
  });

  it("겹치는 강의가 없으면 빈 목록, max를 지킨다", () => {
    expect(lecturesForConcept(concept("y", "user", [], false, ["a2a-none"]), [], all)).toEqual([]);
    expect(lecturesForConcept(c, [], all, 1)).toHaveLength(1);
  });

  it("실제 로드맵: 로드맵에 있는 강의는 inRoadmap=true", () => {
    const diagnosis: DiagnosisResult = { level: "developer", domains: ["coding"], goals: ["build_agents"], preferKorean: false };
    const roadmap = buildRoadmap(diagnosis, videos, instructors);
    const rv = roadmap.steps.flatMap((s) => s.items.map((i) => i.video));
    const rvIds = new Set(rv.map((v) => v.id));
    for (const cc of selectTheory(diagnosis, theory)) {
      for (const l of lecturesForConcept(cc, rv, videos)) expect(l.inRoadmap).toBe(rvIds.has(l.video.id));
    }
  });
});

describe("groupTheoryByLevel · lectureAnchorId", () => {
  it("4개 수준 순서대로, core가 맨 앞", () => {
    const groups = groupTheoryByLevel(theory);
    expect(groups.map((g) => g.level)).toEqual([...LEVELS]);
    for (const g of groups) expect(g.concepts[0].core).toBe(true);
    expect(groups.reduce((n, g) => n + g.concepts.length, 0)).toBe(theory.length);
  });

  it("앵커 id", () => {
    expect(lectureAnchorId("abc_DEF-123")).toBe("lecture-abc_DEF-123");
  });
});
