import { describe, expect, it } from "vitest";
import { buildReason, buildRoadmap, josa, MAX_PER_INSTRUCTOR, scoreBreakdown, scoreVideo, STEP_LABELS } from "../recommend";

import { diag, instructors, makeVideo, videos } from "./fixtures";
import realVideos from "../../../data/videos.json";
import realInstructors from "../../../data/instructors.json";
import mockVideos from "../../../data/videos.mock.json";
import mockInstructors from "../../../data/instructors.mock.json";
import type { Instructor, Roadmap, Video } from "../../types";

const ids = (r: Roadmap) => r.steps.map((s) => s.items.map((i) => i.video.id));
const labels = (r: Roadmap) => r.steps.map((s) => s.label);
const all = (r: Roadmap) => r.steps.flatMap((s) => s.items);

function checkInvariants(r: Roadmap) {
  const items = all(r);
  expect(new Set(items.map((i) => i.video.id)).size).toBe(items.length);
  const per = new Map<string, number>();
  items.forEach((i) => per.set(i.instructor.id, (per.get(i.instructor.id) ?? 0) + 1));
  per.forEach((n) => expect(n).toBeLessThanOrEqual(MAX_PER_INSTRUCTOR));
  r.steps.forEach((s) => {
    expect(s.items.length).toBeGreaterThanOrEqual(1);
    expect(s.items.length).toBeLessThanOrEqual(3);
  });
  items.forEach((i) => {
    expect(i.reason.length).toBeGreaterThan(0);
    expect(i.instructor.id).toBe(i.video.instructorId);
  });
}

describe("점수", () => {
  const v = makeVideo({
    id: "S1", instructorId: "inst-a", levels: ["user"], domains: ["marketing", "data", "coding"],
    goals: ["use_tools"], language: "en", hasKoreanSubtitle: true,
  });
  it("모든 요소가 맞으면 4 + 2·2 + 3 + 1 = 12", () => {
    expect(scoreVideo(diag({ domains: ["marketing", "data"], preferKorean: true }), v)).toBe(12);
  });
  it("요소별 가중치", () => {
    expect(scoreVideo(diag({ level: "developer", domains: ["startup"], goal: "understand" }), v)).toBe(0);
    expect(scoreVideo(diag({ domains: ["startup"], goal: "understand" }), v)).toBe(4); // 수준
    expect(scoreVideo(diag({ level: "developer", domains: ["marketing", "data", "coding"], goal: "understand" }), v)).toBe(4); // 분야 3개: 2 + 1 + 1
    expect(scoreVideo(diag({ level: "developer", domains: ["startup"] }), v)).toBe(4); // 목표
  });
  it("한국어 가점: 선호할 때만, ko 강의 또는 한국어 자막", () => {
    const d = diag({ level: "developer", domains: ["startup"], goal: "understand", preferKorean: true });
    expect(scoreVideo(d, v)).toBe(1);
    expect(scoreVideo({ ...d, preferKorean: false }, v)).toBe(0);
    expect(scoreVideo(d, { ...v, hasKoreanSubtitle: false })).toBe(0);
    expect(scoreVideo(d, { ...v, hasKoreanSubtitle: false, language: "ko" })).toBe(1);
  });
  it("분야 미정이면 분야 점수는 0 (수준 4 + 목표 4 + 한국어 1)", () => {
    expect(scoreVideo(diag({ domains: [] }), v)).toBe(8);
    expect(scoreVideo(diag({ domains: [], preferKorean: true }), v)).toBe(9);
    expect(scoreBreakdown(diag({ domains: [] }), v).matchedDomains).toEqual([]);
  });
  it("breakdown이 맞은 분야를 돌려준다", () => {
    expect(scoreBreakdown(diag({ domains: ["data", "startup"] }), v).matchedDomains).toEqual(["data"]);
  });
});

describe("buildRoadmap — 수준별 단계", () => {
  const d = (level: "beginner" | "user" | "practitioner" | "developer") =>
    diag({ level, domains: ["marketing", "data"], preferKorean: true });

  it("입문자: 기초(beginner) → 실전(user), 한 단계 더 없음", () => {
    const r = buildRoadmap(d("beginner"), videos, instructors);
    checkInvariants(r);
    expect(labels(r)).toEqual([STEP_LABELS.foundation, STEP_LABELS.practice]);
    r.steps[0].items.forEach((i) => expect(i.video.levels).toContain("beginner"));
    r.steps[1].items.forEach((i) => expect(i.video.levels).toContain("user"));
    expect(ids(r)[0]).toEqual(["B3", "B2", "B1"]);
  });

  it("활용자: 기초 → 실전 → 한 단계 더, 동점은 짧은 강의 우선", () => {
    const r = buildRoadmap(d("user"), videos, instructors);
    checkInvariants(r);
    expect(labels(r)).toEqual([STEP_LABELS.foundation, STEP_LABELS.practice, STEP_LABELS.next]);
    // 기초는 현재 수준(user)이 섞이지 않은 강의만
    r.steps[0].items.forEach((i) => expect(i.video.levels).not.toContain("user"));
    // U1(25분)과 B3(45분)은 둘 다 10점 → U1이 먼저
    expect(ids(r)[1]).toEqual(["U1", "B3", "U2"]);
    expect(r.steps[1].items.map((i) => i.score)).toEqual([11, 11, 10]);
    r.steps[2].items.forEach((i) => expect(i.video.levels).toContain("practitioner"));
  });

  it("실무자: 세 단계, 기초에는 practitioner 강의 없음", () => {
    const r = buildRoadmap(d("practitioner"), videos, instructors);
    checkInvariants(r);
    expect(labels(r)).toEqual([STEP_LABELS.foundation, STEP_LABELS.practice, STEP_LABELS.next]);
    r.steps[0].items.forEach((i) => expect(i.video.levels).not.toContain("practitioner"));
    r.steps[1].items.forEach((i) => expect(i.video.levels).toContain("practitioner"));
    r.steps[2].items.forEach((i) => expect(i.video.levels).toContain("developer"));
    expect(ids(r)[1][0]).toBe("P2");
  });

  it("개발자: 한 단계 더 없음", () => {
    const r = buildRoadmap(d("developer"), videos, instructors);
    checkInvariants(r);
    expect(labels(r)).toEqual([STEP_LABELS.foundation, STEP_LABELS.practice]);
    r.steps[1].items.forEach((i) => expect(i.video.levels).toContain("developer"));
  });

  it("점수는 단계 안에서 내림차순", () => {
    for (const lv of ["beginner", "user", "practitioner", "developer"] as const) {
      buildRoadmap(d(lv), videos, instructors).steps.forEach((s) => {
        const scores = s.items.map((i) => i.score);
        expect([...scores].sort((a, b) => b - a)).toEqual(scores);
      });
    }
  });

  it("diagnosis를 그대로 담는다", () => {
    expect(buildRoadmap(d("user"), videos, instructors).diagnosis).toEqual(d("user"));
  });
});

describe("buildRoadmap — 제약", () => {
  it("한 강사당 최대 2개 (로드맵 전체)", () => {
    const same = Array.from({ length: 6 }, (_, i) =>
      makeVideo({ id: `X${i}`, instructorId: "inst-a", levels: ["beginner", "user", "practitioner"], domains: ["marketing"], goals: ["use_tools"], durationMin: 10 + i }),
    );
    const other = makeVideo({ id: "Y1", instructorId: "inst-b", levels: ["user"], domains: ["coding"], goals: ["understand"], durationMin: 99 });
    const r = buildRoadmap(diag(), [...same, other], instructors);
    checkInvariants(r);
    expect(all(r).filter((i) => i.instructor.id === "inst-a")).toHaveLength(2);
    expect(all(r).map((i) => i.video.id)).toContain("Y1");
  });

  it("같은 강의는 한 번만 (입력에 중복이 있어도)", () => {
    const r = buildRoadmap(diag(), [...videos, ...videos], instructors);
    checkInvariants(r);
  });

  it("아래 수준 전용 강의가 없으면 기초에 현재 수준 포함 강의도 허용", () => {
    const vs = [
      makeVideo({ id: "U1", instructorId: "inst-a", levels: ["user"], domains: ["marketing"], goals: ["use_tools"] }),
      makeVideo({ id: "U2", instructorId: "inst-b", levels: ["user"], domains: ["marketing"], goals: ["use_tools"] }),
      makeVideo({ id: "U3", instructorId: "inst-c", levels: ["user"], domains: ["marketing"], goals: ["use_tools"] }),
      makeVideo({ id: "M1", instructorId: "inst-d", levels: ["beginner", "user"], domains: ["coding"], goals: ["understand"] }),
    ];
    const r = buildRoadmap(diag(), vs, instructors);
    expect(labels(r)).toEqual([STEP_LABELS.foundation, STEP_LABELS.practice]);
    expect(ids(r)).toEqual([["M1"], ["U1", "U2", "U3"]]);
  });
});

describe("buildRoadmap — 빈/희소 데이터", () => {
  it("강의가 없으면 단계도 없다", () => {
    expect(buildRoadmap(diag(), [], instructors).steps).toEqual([]);
  });
  it("강사 정보가 없는 강의는 뺀다", () => {
    expect(buildRoadmap(diag(), videos, []).steps).toEqual([]);
  });
  it("목업 1개로도 동작한다", () => {
    const r = buildRoadmap(diag(), mockVideos as Video[], mockInstructors as Instructor[]);
    expect(all(r)).toHaveLength(1);
    expect(r.steps[0].label).toBe(STEP_LABELS.practice);
  });
  it("수준이 안 맞아도 3개가 되도록 남은 강의로 채운다", () => {
    const beginnerOnly = videos.filter((v) => v.id.startsWith("B"));
    const r = buildRoadmap(diag({ level: "developer" }), beginnerOnly, instructors);
    checkInvariants(r);
    expect(all(r)).toHaveLength(3);
    expect(labels(r)).toEqual([STEP_LABELS.foundation, STEP_LABELS.practice]);
  });
  it("다음 수준 강의가 없으면 한 단계 더 단계를 뺀다", () => {
    const noPractitioner = videos.filter((v) => !v.levels.includes("practitioner"));
    const r = buildRoadmap(diag({ level: "user" }), noPractitioner, instructors);
    expect(labels(r)).not.toContain(STEP_LABELS.next);
  });
});

describe("buildRoadmap — 분야 미정", () => {
  for (const level of ["beginner", "user", "practitioner", "developer"] as const) {
    it(`${level}: 분야가 비어도 3개 이상, 불변식 유지`, () => {
      const r = buildRoadmap(diag({ level, domains: [], goal: "understand" }), videos, instructors);
      checkInvariants(r);
      expect(all(r).length).toBeGreaterThanOrEqual(3);
      all(r).forEach((i) => expect(i.reason).not.toContain("에 AI를 적용하려는"));
    });
  }
  it("실제 데이터로 모든 수준·목표에서 3개 이상 나온다", () => {
    for (const level of ["beginner", "user", "practitioner", "developer"] as const) {
      for (const goal of ["understand", "use_tools", "build_agents", "build_products"] as const) {
        const r = buildRoadmap(diag({ level, domains: [], goal }), realVideos as Video[], realInstructors as Instructor[]);
        checkInvariants(r);
        expect(all(r).length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("추천 사유", () => {
  it("분야 + 수준 + 목표 효용", () => {
    const v = videos.find((x) => x.id === "U1")!;
    expect(buildReason(diag(), v)).toBe("마케팅·콘텐츠에 AI를 적용하려는 활용자에게 딱 맞는 강의예요. 바로 업무에 써먹을 수 있어요.");
  });
  it("분야 여러 개는 조사까지 맞춰 잇는다", () => {
    const v = videos.find((x) => x.id === "P2")!;
    const r = buildReason(diag({ level: "practitioner", domains: ["marketing", "data"] }), v);
    expect(r.startsWith("마케팅·콘텐츠와 데이터 분석에 AI를 적용하려는 실무자에게")).toBe(true);
  });
  it("분야가 안 맞고 목표만 맞으면 목표 문장", () => {
    const v = videos.find((x) => x.id === "U2")!;
    expect(buildReason(diag({ domains: ["startup"] }), v)).toBe("AI를 업무 도구로 쓰고 싶은 활용자에게 추천하는 강의예요.");
  });
  it("분야 미정이면 분야 문구 없이 목표·수준으로 쓴다", () => {
    const v = videos.find((x) => x.id === "U2")!;
    const r = buildReason(diag({ domains: [] }), v);
    expect(r).toBe("AI를 업무 도구로 쓰고 싶은 활용자에게 추천하는 강의예요.");
    expect(r).not.toContain("에 AI를 적용하려는");
    const foundation = buildReason(diag({ domains: [] }), videos.find((x) => x.id === "B1")!, "foundation");
    expect(foundation).toBe("본격적으로 시작하기 전에 기본기를 채워 주는 강의예요.");
    expect(buildReason(diag({ domains: [], level: "beginner", goal: "understand" }), videos.find((x) => x.id === "B1")!)).toContain("AI 개념을 제대로 이해하고 싶은 입문자에게");
  });
  it("한국어 강의 / 한국어 자막 문장", () => {
    const ko = videos.find((x) => x.id === "U1")!;
    const sub = videos.find((x) => x.id === "B3")!;
    expect(buildReason(diag({ preferKorean: true }), ko)).toContain("한국어 강의라");
    expect(buildReason(diag({ preferKorean: true }), sub)).toContain("한국어 자막이 있어");
    expect(buildReason(diag({ preferKorean: false }), ko)).not.toContain("한국어");
  });
  it("단계별 문구가 다르다", () => {
    const v = videos.find((x) => x.id === "B1")!;
    expect(buildReason(diag(), v, "foundation")).toContain("기초를 탄탄히");
    expect(buildReason(diag({ level: "beginner" }), videos.find((x) => x.id === "P2")!, "next")).toContain("한 단계 더 성장");
  });
  it("josa", () => {
    expect(josa("입문자", "이", "가")).toBe("입문자가");
    expect(josa("코딩", "과", "와")).toBe("코딩과");
    expect(josa("AI", "이", "가")).toBe("AI가");
  });
});
