import { describe, expect, it } from "vitest";
import realGlossary from "../../../data/glossary.json";
import {
  buildDiagnosis,
  DIAGNOSIS_MINUTES,
  DIAGNOSIS_QUESTIONS,
  DOMAIN_LABELS,
  DOMAIN_OPTIONS,
  DOMAINS,
  GOAL_LABELS,
  GOAL_OPTIONS,
  GOAL_QUESTION,
  GOALS,
  HINT_MAX_CHARS,
  isDomain,
  LEVEL_LABELS,
  LEVEL_MAX_SCORE,
  LEVEL_QUESTIONS,
  LEVEL_THRESHOLDS,
  LEVELS,
  levelScore,
  MAX_GOALS,
  parseGoals,
  QUESTION_COUNT,
  scoreToLevel,
  UNSURE_ID,
} from "../questions";
import type { GlossaryTerm, Level } from "../../types";

const glossaryIds = new Set((realGlossary as GlossaryTerm[]).map((t) => t.id));
const len = (s: string) => [...s].length;

/** 수준 질문 6개의 답을 순서대로 받는다 (빈도, 요청, 활용 깊이, 연결·API, 코딩, AI 코딩) */
const A = (freq: string, prompt: string, work: string, connect: string, coding: string, aiCoding: string) => ({
  lv_frequency: freq,
  lv_prompt: prompt,
  lv_work: work,
  lv_connect: connect,
  lv_coding: coding,
  lv_ai_coding: aiCoding,
});
const base = A("never", "simple", "none", "none", "none", "none");

describe("질문지 구조", () => {
  it("수준 질문은 6개 이하, 질문당 선택지 6개 이하, 옵션 id는 질문 안에서 고유", () => {
    expect(LEVEL_QUESTIONS.length).toBeGreaterThanOrEqual(4);
    expect(LEVEL_QUESTIONS.length).toBeLessThanOrEqual(6);
    for (const q of LEVEL_QUESTIONS) {
      expect(q.options.length, q.id).toBeLessThanOrEqual(6);
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("수준 선택지는 위에서 아래로 점수가 커진다 (순서가 분명함), 첫 선택지는 0점", () => {
    for (const q of LEVEL_QUESTIONS) {
      const pts = q.options.map((o) => o.points);
      expect(pts[0], q.id).toBe(0);
      for (let i = 1; i < pts.length; i++) expect(pts[i], `${q.id}/${q.options[i].id}`).toBeGreaterThan(pts[i - 1]);
    }
  });
  it("수준 질문 순서: 빈도 → 요청 → 활용 깊이 → 연결·API → 코딩 → AI 코딩", () => {
    expect(LEVEL_QUESTIONS.map((q) => q.id)).toEqual(["lv_frequency", "lv_prompt", "lv_work", "lv_connect", "lv_coding", "lv_ai_coding"]);
    expect(LEVEL_MAX_SCORE).toBe(26);
  });
  it("선택지는 자기 평가가 아니라 행동 문장이다 ('잘해요'·'능숙' 같은 말을 쓰지 않는다)", () => {
    for (const q of LEVEL_QUESTIONS) for (const o of q.options) expect(o.label).not.toMatch(/잘해요|능숙|전문가 수준|고수/);
  });
  it("분야 7개 · 이미지·영상 제작(creative)은 마케팅·콘텐츠 바로 뒤", () => {
    expect(DOMAINS).toHaveLength(7);
    expect(DOMAIN_OPTIONS.map((o) => o.id)).toEqual(["automation", "marketing", "creative", "coding", "data", "education", "startup", UNSURE_ID]);
    expect(DOMAIN_LABELS.creative).toBe("이미지·영상 제작");
    expect(DOMAIN_OPTIONS.find((o) => o.id === "creative")?.description).toMatch(/그림|썸네일|영상/);
    expect(isDomain("creative")).toBe(true);
  });
  it("분야 7개·목표 4개 + 각각 '잘 모르겠어요' 하나, 모두 라벨/설명이 있다", () => {
    expect(DOMAIN_OPTIONS.map((o) => o.id).sort()).toEqual([...DOMAINS, UNSURE_ID].sort());
    expect(GOAL_OPTIONS.map((o) => o.id).sort()).toEqual([...GOALS, UNSURE_ID].sort());
    for (const o of [...DOMAIN_OPTIONS, ...GOAL_OPTIONS]) {
      expect(o.label && o.description).toBeTruthy();
    }
  });
  it("'잘 모르겠어요'는 마지막 선택지이고, 분야·목표 모두 배타(exclusive)다", () => {
    expect(DOMAIN_OPTIONS.at(-1)).toMatchObject({ id: UNSURE_ID, exclusive: true });
    expect(DOMAIN_OPTIONS.filter((o) => o.exclusive)).toHaveLength(1);
    expect(GOAL_OPTIONS.at(-1)).toMatchObject({ id: UNSURE_ID, exclusive: true });
    expect(GOAL_OPTIONS.filter((o) => o.exclusive)).toHaveLength(1);
    // 목표의 두 선택지(개념 이해 / 아직 잘 모르겠어요)는 서로 다른 문구
    const u = GOAL_OPTIONS.find((o) => o.id === "understand")!;
    const s = GOAL_OPTIONS.find((o) => o.id === UNSURE_ID)!;
    expect(u.label).not.toBe(s.label);
    expect(u.description).not.toBe(s.description);
  });
  it("목표는 최대 4개 다중 선택, 고른 순서가 우선순위", () => {
    expect(GOAL_QUESTION).toMatchObject({ type: "multi", maxSelect: MAX_GOALS, ordered: true });
    expect(MAX_GOALS).toBe(4);
  });
  it("라벨 맵이 모든 값을 덮는다", () => {
    LEVELS.forEach((l) => expect(LEVEL_LABELS[l]).toBeTruthy());
    DOMAINS.forEach((d) => expect(DOMAIN_LABELS[d]).toBeTruthy());
    GOALS.forEach((g) => expect(GOAL_LABELS[g]).toBeTruthy());
  });
  it("질문 id가 전체에서 고유하다", () => {
    const ids = DIAGNOSIS_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("질문 수·예상 시간은 데이터에서 계산한다 (1~2분)", () => {
    expect(QUESTION_COUNT).toBe(DIAGNOSIS_QUESTIONS.length);
    expect(DIAGNOSIS_MINUTES).toBeGreaterThanOrEqual(1);
    expect(DIAGNOSIS_MINUTES).toBeLessThanOrEqual(2);
  });
});

describe("용어 한 입", () => {
  it("수준 질문마다 1~2개", () => {
    for (const q of LEVEL_QUESTIONS) {
      expect(q.hints?.length ?? 0, q.id).toBeGreaterThanOrEqual(1);
      expect(q.hints!.length, q.id).toBeLessThanOrEqual(2);
    }
  });
  it(`설명은 ${HINT_MAX_CHARS}자 이내, 용어·설명이 비어 있지 않고 질문 안에서 용어가 겹치지 않는다`, () => {
    for (const q of DIAGNOSIS_QUESTIONS) {
      const terms = (q.hints ?? []).map((h) => h.term);
      expect(new Set(terms).size, q.id).toBe(terms.length);
      for (const h of q.hints ?? []) {
        expect(h.term.trim(), q.id).not.toBe("");
        expect(len(h.text), `${q.id}/${h.term}: ${h.text}`).toBeLessThanOrEqual(HINT_MAX_CHARS);
        expect(h.text).toMatch(/[.요]$|[A-Za-z]$/);
      }
      for (const o of q.options) if (o.hint) expect(len(o.hint), `${q.id}/${o.id}`).toBeLessThanOrEqual(HINT_MAX_CHARS);
    }
  });
  it("glossaryId는 모두 data/glossary.json에 있다", () => {
    let linked = 0;
    for (const q of DIAGNOSIS_QUESTIONS) {
      for (const h of q.hints ?? []) {
        if (h.glossaryId === undefined) continue;
        linked++;
        expect(glossaryIds.has(h.glossaryId), `${q.id}/${h.term} → ${h.glossaryId}`).toBe(true);
      }
    }
    expect(linked).toBeGreaterThanOrEqual(6);
  });
  it("이모지를 쓰지 않는다", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    for (const q of DIAGNOSIS_QUESTIONS) {
      for (const t of [q.title, q.subtitle ?? "", ...(q.hints ?? []).flatMap((h) => [h.term, h.text]), ...q.options.flatMap((o) => [o.label, o.description ?? "", o.hint ?? ""])]) {
        expect(emoji.test(t), t).toBe(false);
      }
    }
  });
});

describe("scoreToLevel — 경계값", () => {
  it("전부 최저 → beginner (0점)", () => {
    expect(levelScore(base)).toBe(0);
    expect(scoreToLevel(base)).toBe("beginner");
  });
  it("빈 답/모르는 옵션은 0점", () => {
    expect(scoreToLevel({})).toBe("beginner");
    expect(levelScore({ lv_frequency: "???" })).toBe(0);
  });
  it("2점 beginner, 3점 user", () => {
    const two = { ...base, lv_frequency: "weekly" };
    expect(levelScore(two)).toBe(2);
    expect(scoreToLevel(two)).toBe("beginner");
    const three = { ...base, lv_frequency: "daily" };
    expect(levelScore(three)).toBe(LEVEL_THRESHOLDS.user);
    expect(scoreToLevel(three)).toBe("user");
  });
  it("9점 user, 10점 practitioner (코딩 없이도)", () => {
    const nine = A("daily", "saved", "multi", "none", "none", "none");
    expect(levelScore(nine)).toBe(9);
    expect(scoreToLevel(nine)).toBe("user");
    const ten = A("daily", "saved", "multi", "app", "none", "none");
    expect(levelScore(ten)).toBe(LEVEL_THRESHOLDS.practitioner);
    expect(scoreToLevel(ten)).toBe("practitioner");
  });
  it("코딩 신호가 있어도 14점이면 practitioner, 15점이면 developer", () => {
    const fourteen = A("daily", "saved", "multi", "app", "build", "none");
    expect(levelScore(fourteen)).toBe(14);
    expect(scoreToLevel(fourteen)).toBe("practitioner");
    const fifteen = { ...fourteen, lv_ai_coding: "paste" };
    expect(levelScore(fifteen)).toBe(LEVEL_THRESHOLDS.developer);
    expect(scoreToLevel(fifteen)).toBe("developer");
  });
  it("코딩 신호 없이는 최고점이어도 developer가 아니다 (노코드 상한 = practitioner)", () => {
    const max = A("daily", "saved", "workflow", "api", "read", "agent");
    expect(levelScore(max)).toBe(21);
    expect(scoreToLevel(max)).toBe("practitioner");
  });
  it("API 직접 호출 + 코드 작성 → 총점과 무관하게 developer", () => {
    const a = { ...base, lv_connect: "api", lv_coding: "build" };
    expect(levelScore(a)).toBe(9);
    expect(scoreToLevel(a)).toBe("developer");
  });
  it("API만 있으면 override 없음, 배포·현업 개발은 최소 practitioner", () => {
    expect(scoreToLevel({ ...base, lv_connect: "api" })).toBe("user"); // 5
    expect(scoreToLevel({ ...base, lv_coding: "build" })).toBe("user"); // 4
    expect(scoreToLevel({ ...base, lv_coding: "deploy" })).toBe("practitioner"); // 6, ship
    expect(scoreToLevel({ ...base, lv_coding: "pro" })).toBe("practitioner"); // 7, ship
  });
  it("배열 형태 답도 받는다", () => {
    expect(scoreToLevel({ lv_connect: ["api"], lv_coding: ["pro"] })).toBe("developer");
  });
});

/**
 * 페르소나 표: 현실적인 사람들이 맞는 수준에 도착하는지.
 * (근거는 SPEC.md §1 "수준 판정"에도 같은 표로 적어 두었다)
 */
const PERSONAS: { name: string; answers: ReturnType<typeof A>; score: number; level: Level }[] = [
  { name: "처음 써 보는 직장인", answers: A("never", "simple", "none", "none", "none", "none"), score: 0, level: "beginner" },
  { name: "가끔 궁금한 것만 물어보는 대학생", answers: A("sometimes", "simple", "basic", "none", "none", "none"), score: 2, level: "beginner" },
  { name: "주 몇 번 요약·번역에 쓰는 사무직", answers: A("weekly", "detailed", "basic", "none", "none", "none"), score: 4, level: "user" },
  { name: "매일 챗봇으로 문서 쓰는 마케터", answers: A("daily", "structured", "files", "none", "none", "none"), score: 7, level: "user" },
  { name: "요청 양식·여러 도구를 쓰지만 연결·자동화는 안 해 본 파워 유저", answers: A("daily", "saved", "multi", "none", "none", "none"), score: 9, level: "user" },
  { name: "워크플로 자동화를 만든 기획자 (코딩 없음)", answers: A("weekly", "detailed", "workflow", "nocode", "none", "none"), score: 11, level: "practitioner" },
  { name: "에이전트에게 조사·보고서를 맡기는 컨설턴트", answers: A("daily", "structured", "agent", "app", "none", "none"), score: 10, level: "practitioner" },
  { name: "AI로 간단한 코드를 짜서 돌려 본 비개발자", answers: A("weekly", "detailed", "files", "none", "ai_run", "paste"), score: 7, level: "user" },
  { name: "코딩 에이전트로 앱을 만들어 보는 비개발자 (배포 전)", answers: A("daily", "structured", "multi", "app", "ai_run", "agent"), score: 13, level: "practitioner" },
  { name: "노코드 자동화·에이전트를 다 써 본 비개발자", answers: A("daily", "saved", "workflow", "nocode", "read", "agent"), score: 19, level: "practitioner" },
  { name: "배포까지 해 본 사이드 프로젝트러", answers: A("weekly", "structured", "multi", "app", "deploy", "assistant"), score: 16, level: "developer" },
  { name: "배포는 해 봤지만 AI는 가볍게 쓰는 사람", answers: A("sometimes", "simple", "basic", "none", "deploy", "paste"), score: 9, level: "practitioner" },
  { name: "AI를 거의 안 쓰는 현업 개발자", answers: A("sometimes", "simple", "basic", "none", "pro", "none"), score: 9, level: "practitioner" },
  { name: "코딩 에이전트를 쓰는 현업 개발자", answers: A("daily", "structured", "multi", "none", "pro", "agent"), score: 18, level: "developer" },
  { name: "AI API를 불러 본 코딩하는 학생", answers: A("weekly", "detailed", "basic", "api", "build", "paste"), score: 14, level: "developer" },
  { name: "코딩은 하지만 AI는 가끔 쓰는 학생", answers: A("sometimes", "simple", "basic", "none", "build", "paste"), score: 7, level: "user" },
  { name: "튜토리얼 따라 API를 불러 본 비개발 기획자", answers: A("weekly", "structured", "multi", "api", "ai_run", "paste"), score: 14, level: "practitioner" },
];

describe("페르소나 표", () => {
  it(`페르소나 ${PERSONAS.length}명, 네 수준이 모두 나온다`, () => {
    expect(PERSONAS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(PERSONAS.map((p) => p.level))).toEqual(new Set(LEVELS));
  });
  it.each(PERSONAS.map((p) => [p.name, p] as const))("%s", (_name, p) => {
    expect(levelScore(p.answers)).toBe(p.score);
    expect(scoreToLevel(p.answers)).toBe(p.level);
  });
});

describe("parseGoals", () => {
  it("순서를 지키고 중복은 처음 것만", () => {
    expect(parseGoals(["build_agents", "use_tools"])).toEqual(["build_agents", "use_tools"]);
    expect(parseGoals(["use_tools", "use_tools", "understand"])).toEqual(["use_tools", "understand"]);
    expect(parseGoals([...GOALS])).toEqual([...GOALS]);
  });
  it("'아직 잘 모르겠어요' 단독 → ['understand']", () => {
    expect(parseGoals([UNSURE_ID])).toEqual(["understand"]);
  });
  it("비었거나, unsure를 섞거나, 모르는 값 → null", () => {
    expect(parseGoals(undefined)).toBeNull();
    expect(parseGoals([])).toBeNull();
    expect(parseGoals([UNSURE_ID, "use_tools"])).toBeNull();
    expect(parseGoals(["get_rich"])).toBeNull();
  });
});

describe("buildDiagnosis", () => {
  it("정상 답 → DiagnosisResult (목표 여러 개, 고른 순서 유지)", () => {
    expect(
      buildDiagnosis({ lv_frequency: ["daily"], domains: ["marketing", "data"], goal: ["build_agents", "use_tools"], preferKorean: ["yes"] }),
    ).toEqual({ level: "user", domains: ["marketing", "data"], goals: ["build_agents", "use_tools"], preferKorean: true });
  });
  it("분야 이미지·영상 제작을 다른 분야와 함께 고를 수 있다", () => {
    const ok = { goal: ["use_tools"], preferKorean: ["no"] };
    expect(buildDiagnosis({ ...ok, domains: ["creative"] })?.domains).toEqual(["creative"]);
    expect(buildDiagnosis({ ...ok, domains: ["marketing", "creative", "education"] })?.domains).toEqual(["marketing", "creative", "education"]);
    expect(buildDiagnosis({ ...ok, domains: ["creative", UNSURE_ID] })).toBeNull();
  });
  it("분야 '잘 모르겠어요' → domains []", () => {
    expect(buildDiagnosis({ domains: ["unsure"], goal: ["use_tools"], preferKorean: ["no"] })).toEqual({
      level: "beginner", domains: [], goals: ["use_tools"], preferKorean: false,
    });
  });
  it("분야 '잘 모르겠어요'를 다른 분야와 섞거나, 아예 안 고르면 null", () => {
    const ok = { goal: ["use_tools"], preferKorean: ["no"] };
    expect(buildDiagnosis({ ...ok, domains: ["unsure", "coding"] })).toBeNull();
    expect(buildDiagnosis({ ...ok, domains: undefined })).toBeNull();
  });
  it("목표 '아직 잘 모르겠어요' → ['understand']", () => {
    expect(buildDiagnosis({ domains: ["coding"], goal: ["unsure"], preferKorean: ["yes"] })).toEqual({
      level: "beginner", domains: ["coding"], goals: ["understand"], preferKorean: true,
    });
    expect(buildDiagnosis({ domains: ["unsure"], goal: ["unsure"], preferKorean: ["yes"] })).toMatchObject({
      domains: [], goals: ["understand"],
    });
  });
  it("분야 0개/4개/모르는 값, 목표 누락·섞임, 한국어 누락 → null", () => {
    const ok = { domains: ["marketing"], goal: ["understand"], preferKorean: ["no"] };
    expect(buildDiagnosis(ok)).not.toBeNull();
    expect(buildDiagnosis({ ...ok, domains: [] })).toBeNull();
    expect(buildDiagnosis({ ...ok, domains: ["marketing", "data", "coding", "startup"] })).toBeNull();
    expect(buildDiagnosis({ ...ok, domains: ["cooking"] })).toBeNull();
    expect(buildDiagnosis({ ...ok, goal: undefined })).toBeNull();
    expect(buildDiagnosis({ ...ok, goal: [] })).toBeNull();
    expect(buildDiagnosis({ ...ok, goal: ["unsure", "use_tools"] })).toBeNull();
    expect(buildDiagnosis({ ...ok, preferKorean: ["maybe"] })).toBeNull();
  });
  it("수준은 6개 질문 답으로 정한다", () => {
    const answers = Object.fromEntries(Object.entries(A("daily", "structured", "multi", "none", "pro", "agent")).map(([k, v]) => [k, [v]]));
    expect(buildDiagnosis({ ...answers, domains: ["coding"], goal: ["build_agents"], preferKorean: ["no"] })?.level).toBe("developer");
  });
});
