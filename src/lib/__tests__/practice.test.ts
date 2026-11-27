import { describe, expect, it } from "vitest";
import realPractice from "../../../data/practice.json";
import realVideos from "../../../data/videos.json";
import {
  charLength,
  missionForVideo,
  placeholdersOf,
  PRACTICE_LIMITS,
  practiceById,
  resolvePrompt,
  weeklyMission,
  type PracticeMission,
  type PracticePrompt,
} from "../practice";
import { makeVideo } from "./fixtures";
import type { Domain, Video } from "../../types";

const missions = realPractice as PracticeMission[];
const videos = realVideos as Video[];
const DOMAINS: Domain[] = ["automation", "marketing", "creative", "coding", "data", "education", "startup"];
const TOOLS = ["chat", "coding", "automation"];

/** 비밀·인증 정보를 떠올리게 하는 말 */
const SECRET_RE = /API ?키|비밀 ?키|시크릿|액세스 ?토큰|토큰을|비밀번호|패스워드|password|secret|api[_ -]?key/i;
/** 그 말이 '넣지 말라'는 맥락에 있을 때만 허용 */
const PROHIBIT_RE = /금지|넣지|쓰지 ?마|쓰지 ?말|않|말고|붙여 넣지|빼고/;

const allTexts = (m: PracticeMission) =>
  m.prompts.flatMap((p) => [p.text, ...Object.values(p.domainVariants ?? {})]);

describe("data/practice.json 무결성", () => {
  it("강의마다 미션이 정확히 1개이고, 그 반대도 같다", () => {
    const videoIds = videos.map((v) => v.id);
    const missionIds = missions.map((m) => m.videoId);
    expect(new Set(missionIds).size).toBe(missionIds.length);
    expect([...missionIds].sort()).toEqual([...videoIds].sort());
    expect(missions).toHaveLength(80);
  });

  it("길이 제한: 제목 30자, 목표·성공 60자, 프롬프트 350자 이하", () => {
    for (const m of missions) {
      expect(charLength(m.title), m.videoId).toBeLessThanOrEqual(PRACTICE_LIMITS.title);
      expect(charLength(m.goal), m.videoId).toBeLessThanOrEqual(PRACTICE_LIMITS.goal);
      expect(charLength(m.success), m.videoId).toBeLessThanOrEqual(PRACTICE_LIMITS.success);
      for (const t of allTexts(m)) expect(charLength(t), m.videoId).toBeLessThanOrEqual(PRACTICE_LIMITS.promptText);
      for (const s of [m.title, m.goal, m.success, ...m.steps]) expect(s.trim().length, m.videoId).toBeGreaterThan(0);
      if (m.caution !== undefined) expect(m.caution.trim().length).toBeGreaterThan(0);
    }
  });

  it("단계 2~4개, 프롬프트 1~3개, 라벨은 미션 안에서 중복 없음", () => {
    for (const m of missions) {
      expect(m.steps.length, m.videoId).toBeGreaterThanOrEqual(PRACTICE_LIMITS.stepsMin);
      expect(m.steps.length, m.videoId).toBeLessThanOrEqual(PRACTICE_LIMITS.stepsMax);
      expect(m.prompts.length, m.videoId).toBeGreaterThanOrEqual(PRACTICE_LIMITS.promptsMin);
      expect(m.prompts.length, m.videoId).toBeLessThanOrEqual(PRACTICE_LIMITS.promptsMax);
      const labels = m.prompts.map((p) => p.label);
      expect(new Set(labels).size, m.videoId).toBe(labels.length);
      for (const l of labels) expect(l.trim().length).toBeGreaterThan(0);
    }
  });

  it("프롬프트마다 자리표시자는 최대 1개이고, 대괄호는 자리표시자에만 쓴다", () => {
    for (const m of missions) {
      for (const t of allTexts(m)) {
        expect(placeholdersOf(t).length, `${m.videoId}: ${t}`).toBeLessThanOrEqual(1);
        const stray = t.replace(/\[[^[\]\n]+\]/g, "");
        expect(/[[\]]/.test(stray), `${m.videoId}: 짝이 없는 대괄호`).toBe(false);
      }
    }
  });

  it("domainVariants 키는 유효한 분야이고 값은 비어 있지 않음", () => {
    for (const m of missions) {
      for (const p of m.prompts) {
        for (const [k, v] of Object.entries(p.domainVariants ?? {})) {
          expect(DOMAINS, m.videoId).toContain(k);
          expect(typeof v === "string" && v.trim().length > 0, m.videoId).toBe(true);
        }
      }
    }
  });

  it("needsTool은 chat / coding / automation 중 하나", () => {
    for (const m of missions) if (m.needsTool !== undefined) expect(TOOLS, m.videoId).toContain(m.needsTool);
  });

  it("프롬프트에 비밀·인증 정보 입력을 유도하는 말이 없음 (금지 맥락만 허용)", () => {
    for (const m of missions) {
      for (const t of allTexts(m)) {
        for (const sentence of t.split(/[.\n?!]/)) {
          if (SECRET_RE.test(sentence)) expect(PROHIBIT_RE.test(sentence), `${m.videoId}: ${sentence}`).toBe(true);
        }
        expect(/붙여 ?넣어|입력해|넣어/.test(t) && /API ?키|비밀번호|토큰/.test(t) && !PROHIBIT_RE.test(t), m.videoId).toBe(false);
      }
    }
  });

  it("강의 내용을 단정하는 표현이 없음 (영상을 시청해 만든 데이터가 아님)", () => {
    const CLAIM_RE = /강의에서 (알려준|소개한|말한|설명한|배운)|영상에서 (알려준|소개한|말한|설명한)/;
    for (const m of missions) {
      for (const s of [m.title, m.goal, m.success, m.caution ?? "", ...m.steps, ...allTexts(m)]) {
        expect(CLAIM_RE.test(s), `${m.videoId}: ${s}`).toBe(false);
      }
    }
  });

  it("코딩·자동화 미션은 단계에서 대안이나 준비 환경을 안내하고, 코딩 미션은 비밀 키 주의가 있거나 키가 필요 없다", () => {
    for (const m of missions.filter((x) => x.needsTool === "coding" || x.needsTool === "automation")) {
      expect(m.steps.join(" "), m.videoId).toMatch(/없다면|준비|환경/);
    }
  });

  it("자동화 미션에는 가짜 데이터로 먼저 시험하라는 주의가 있다", () => {
    for (const m of missions.filter((x) => x.needsTool === "automation")) {
      expect(m.caution ?? "", m.videoId).toMatch(/가짜/);
    }
  });
});

describe("practiceById / missionForVideo", () => {
  it("videoId로 찾고, 없으면 undefined", () => {
    const byId = practiceById(missions);
    expect(byId.size).toBe(80);
    expect(missionForVideo(videos[0].id, byId)?.videoId).toBe(videos[0].id);
    expect(missionForVideo("nope", byId)).toBeUndefined();
  });

  it("중복 id가 있으면 처음 것을 쓴다", () => {
    const a = { ...missions[0], title: "A" };
    const b = { ...missions[0], title: "B" };
    expect(practiceById([a, b]).get(a.videoId)?.title).toBe("A");
  });
});

describe("resolvePrompt", () => {
  const prompt: PracticePrompt = {
    label: "t",
    text: "기본 [여기에 x]",
    domainVariants: { marketing: "마케팅 [여기에 x]", data: "데이터 [여기에 x]" },
  };

  it("진단 분야 순서상 처음으로 맞는 변형을 고른다", () => {
    expect(resolvePrompt(prompt, { domains: ["coding", "data", "marketing"] })).toBe("데이터 [여기에 x]");
    expect(resolvePrompt(prompt, { domains: ["marketing", "data"] })).toBe("마케팅 [여기에 x]");
  });

  it("맞는 변형이 없거나 분야가 비어 있으면 기본 text", () => {
    expect(resolvePrompt(prompt, { domains: ["coding"] })).toBe("기본 [여기에 x]");
    expect(resolvePrompt(prompt, { domains: [] })).toBe("기본 [여기에 x]");
    expect(resolvePrompt({ label: "x", text: "only" }, { domains: ["data"] })).toBe("only");
  });

  it("실제 데이터: 모든 분야 조합에서 빈 문자열이 나오지 않는다", () => {
    for (const m of missions) for (const p of m.prompts) for (const d of DOMAINS) {
      expect(resolvePrompt(p, { domains: [d] }).length).toBeGreaterThan(0);
    }
  });
});

describe("weeklyMission", () => {
  const mk = (id: string, levels: Video["levels"], goals: Video["goals"]) =>
    makeVideo({ id, instructorId: "inst-a", levels, domains: ["data"], goals });
  const mission = (videoId: string): PracticeMission => ({
    videoId,
    title: videoId,
    goal: "g",
    steps: ["a", "b"],
    prompts: [{ label: "l", text: "t" }],
    success: "s",
  });
  const F1 = mk("F1", ["beginner"], ["use_tools"]); // 기초 단계
  const P1 = mk("P1", ["user"], ["understand"]); // 실전, 2순위 목표
  const P2 = mk("P2", ["user"], ["use_tools"]); // 실전, 1순위 목표
  const N1 = mk("N1", ["practitioner"], ["build_agents"]); // 심화
  const byId = practiceById([F1, P1, P2, N1].map((v) => mission(v.id)));
  const diag = { level: "user" as const, goals: ["use_tools" as const, "understand" as const] };

  it("실전 단계 강의 중 1순위 목표가 맞는 강의를 고른다 (로드맵 순서상 앞의 기초 강의보다 우선)", () => {
    expect(weeklyMission(diag, [F1, P1, P2, N1], byId)?.video.id).toBe("P2");
  });

  it("실전 단계 id를 넘기면 그 목록을 실전 단계로 본다", () => {
    expect(weeklyMission(diag, [F1, P1, P2, N1], byId, ["P1"])?.video.id).toBe("F1");
    expect(weeklyMission({ level: "user", goals: ["understand"] }, [F1, P1, P2], byId, ["P2", "P1"])?.video.id).toBe("P1");
  });

  it("1순위 목표가 실전 단계에 없으면 로드맵 전체에서 찾는다", () => {
    expect(weeklyMission({ level: "user", goals: ["build_agents"] }, [F1, P1, N1], byId)?.video.id).toBe("N1");
  });

  it("1순위 목표가 어디에도 없으면 다른 목표가 맞는 실전 강의 → 전체 → 첫 강의", () => {
    expect(weeklyMission({ level: "user", goals: ["build_products", "understand"] }, [F1, N1, P1], byId)?.video.id).toBe("P1");
    expect(weeklyMission({ level: "user", goals: ["build_products", "build_agents"] }, [F1, N1], byId)?.video.id).toBe("N1");
    expect(weeklyMission({ level: "user", goals: ["build_products"] }, [F1, N1], byId)?.video.id).toBe("F1");
  });

  it("미션이 없는 강의는 건너뛰고, 후보가 없으면 undefined", () => {
    const X = mk("X", ["user"], ["use_tools"]);
    expect(weeklyMission(diag, [X, P2], byId)?.video.id).toBe("P2");
    expect(weeklyMission(diag, [X], byId)).toBeUndefined();
    expect(weeklyMission(diag, [], byId)).toBeUndefined();
  });

  it("결정적이다: 같은 입력이면 같은 결과", () => {
    const a = weeklyMission(diag, [F1, P1, P2, N1], byId);
    const b = weeklyMission(diag, [F1, P1, P2, N1], byId);
    expect(a?.mission).toBe(b?.mission);
  });

  it("실제 데이터: 모든 강의 목록에서 항상 미션을 돌려준다", () => {
    const real = practiceById(missions);
    const r = weeklyMission({ level: "beginner", goals: ["use_tools"] }, videos, real);
    expect(r?.video.levels).toContain("beginner");
    expect(r?.video.goals).toContain("use_tools");
  });
});
