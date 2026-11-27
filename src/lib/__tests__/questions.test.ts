import { describe, expect, it } from "vitest";
import {
  buildDiagnosis,
  DIAGNOSIS_QUESTIONS,
  DOMAIN_LABELS,
  DOMAIN_OPTIONS,
  DOMAINS,
  GOAL_LABELS,
  GOAL_OPTIONS,
  GOALS,
  LEVEL_LABELS,
  LEVEL_QUESTIONS,
  LEVELS,
  levelScore,
  scoreToLevel,
} from "../questions";

const base = { lv_frequency: "never", lv_prompt: "simple", lv_work: "none", lv_automation: "none", lv_coding: "none" };

describe("질문지 구조", () => {
  it("수준 질문은 4~5개, 옵션 id는 질문 안에서 고유", () => {
    expect(LEVEL_QUESTIONS.length).toBeGreaterThanOrEqual(4);
    expect(LEVEL_QUESTIONS.length).toBeLessThanOrEqual(5);
    for (const q of LEVEL_QUESTIONS) {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("분야 6개·목표 4개, 모두 라벨/설명/이모지가 있다", () => {
    expect(DOMAIN_OPTIONS.map((o) => o.id).sort()).toEqual([...DOMAINS].sort());
    expect(GOAL_OPTIONS.map((o) => o.id).sort()).toEqual([...GOALS].sort());
    for (const o of [...DOMAIN_OPTIONS, ...GOAL_OPTIONS]) {
      expect(o.label && o.description && o.emoji).toBeTruthy();
    }
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
});

describe("scoreToLevel", () => {
  it("전부 최저 → beginner (0점)", () => {
    expect(levelScore(base)).toBe(0);
    expect(scoreToLevel(base)).toBe("beginner");
  });
  it("빈 답/모르는 옵션은 0점", () => {
    expect(scoreToLevel({})).toBe("beginner");
    expect(levelScore({ lv_frequency: "???" })).toBe(0);
  });
  it("경계값: 2점 beginner, 3점 user", () => {
    expect(scoreToLevel({ ...base, lv_frequency: "weekly" })).toBe("beginner"); // 2
    expect(scoreToLevel({ ...base, lv_frequency: "daily" })).toBe("user"); // 3
  });
  it("경계값: 6점 user, 7점 practitioner", () => {
    const six = { ...base, lv_frequency: "daily", lv_prompt: "template", lv_work: "basic" };
    expect(levelScore(six)).toBe(6);
    expect(scoreToLevel(six)).toBe("user");
    const seven = { ...six, lv_work: "advanced" };
    expect(levelScore(seven)).toBe(7);
    expect(scoreToLevel(seven)).toBe("practitioner");
  });
  it("경계값: 10점 practitioner, 11점 developer", () => {
    const ten = { ...base, lv_frequency: "daily", lv_prompt: "template", lv_work: "advanced", lv_automation: "nocode", lv_coding: "read" };
    expect(levelScore(ten)).toBe(10);
    expect(scoreToLevel(ten)).toBe("practitioner");
    const eleven = { ...ten, lv_automation: "heard", lv_coding: "script" };
    expect(levelScore(eleven)).toBe(11);
    expect(scoreToLevel(eleven)).toBe("developer");
  });
  it("API 직접 호출 + 코드 작성 가능 → 총점과 무관하게 developer", () => {
    const a = { ...base, lv_automation: "api", lv_coding: "script" };
    expect(levelScore(a)).toBe(7);
    expect(scoreToLevel(a)).toBe("developer");
  });
  it("API만 있거나 코딩만 있으면 override 없음", () => {
    expect(scoreToLevel({ ...base, lv_automation: "api" })).toBe("user"); // 4
    expect(scoreToLevel({ ...base, lv_coding: "pro" })).toBe("user"); // 5
  });
  it("배열 형태 답도 받는다", () => {
    expect(scoreToLevel({ lv_automation: ["api"], lv_coding: ["pro"] })).toBe("developer");
  });
});

describe("buildDiagnosis", () => {
  it("정상 답 → DiagnosisResult", () => {
    expect(
      buildDiagnosis({ lv_frequency: ["daily"], domains: ["marketing", "data"], goal: ["use_tools"], preferKorean: ["yes"] }),
    ).toEqual({ level: "user", domains: ["marketing", "data"], goal: "use_tools", preferKorean: true });
  });
  it("분야 0개/4개/모르는 값, 목표·한국어 누락 → null", () => {
    const ok = { domains: ["marketing"], goal: ["understand"], preferKorean: ["no"] };
    expect(buildDiagnosis(ok)).not.toBeNull();
    expect(buildDiagnosis({ ...ok, domains: [] })).toBeNull();
    expect(buildDiagnosis({ ...ok, domains: ["marketing", "data", "coding", "startup"] })).toBeNull();
    expect(buildDiagnosis({ ...ok, domains: ["cooking"] })).toBeNull();
    expect(buildDiagnosis({ ...ok, goal: undefined })).toBeNull();
    expect(buildDiagnosis({ ...ok, preferKorean: ["maybe"] })).toBeNull();
  });
});
