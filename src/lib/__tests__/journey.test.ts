import { describe, expect, it } from "vitest";
import {
  buildJourney,
  journeyInputs,
  missionAnchorId,
  NEXT_POSITION_LABELS,
  stepAccessibleName,
  stepAnchorId,
  stepDetailLine,
  summaryLine,
  type JourneyStepInput,
} from "../journey";
import { emptySaved, setLectureStatus, setMissionStatus, addRef, type SavedState } from "../saved";
import { LEVELS } from "../questions";

const NOW = "2026-11-27T00:00:00.000Z";

const STEPS: JourneyStepInput[] = [
  { label: "기초 다지기", lectureIds: ["a", "b"], missionIds: ["a", "b"], termIds: ["t1", "t2", "t3", "t4"] },
  { label: "실전 활용", lectureIds: ["c", "d", "e"], missionIds: ["c"], termIds: ["t5"] },
  { label: "한 단계 더", lectureIds: ["f"], missionIds: [], termIds: [] },
];

function withProgress(fn: (s: SavedState) => SavedState): SavedState {
  return fn(emptySaved());
}

describe("buildJourney", () => {
  it("저장 상태가 없으면(서버 렌더) 진행은 0, 지금 단계는 1단계", () => {
    const j = buildJourney("practitioner", STEPS, null);
    expect(j.currentLabel).toBe("실무자");
    expect(j.nextLabel).toBe("개발자");
    expect(j.steps.map((s) => [s.number, s.label, s.done, s.total])).toEqual([
      [1, "기초 다지기", 0, 4],
      [2, "실전 활용", 0, 4],
      [3, "한 단계 더", 0, 1],
    ]);
    expect(j.activeIndex).toBe(0);
    expect(j.allDone).toBe(false);
    expect([j.done, j.total]).toEqual([0, 9]);
  });

  it("다음 위치: 입문자→활용자, 활용자→실무자, 실무자→개발자, 개발자→AI 제품을 이끄는 단계", () => {
    expect(LEVELS.map((l) => buildJourney(l, STEPS, null).nextLabel)).toEqual(["활용자", "실무자", "개발자", "AI 제품을 이끄는 단계"]);
    for (const l of LEVELS) expect(NEXT_POSITION_LABELS[l]).toBeTruthy();
  });

  it("강의는 '다 봤어요'만, 실습은 '완료'만 센다 (보고 싶어요·보는 중·해볼 예정은 아님)", () => {
    const saved = withProgress((s) => {
      s = setLectureStatus(s, "a", "done", NOW);
      s = setLectureStatus(s, "b", "watching", NOW);
      s = setLectureStatus(s, "c", "want", NOW);
      s = setMissionStatus(s, "a", "done", NOW);
      s = setMissionStatus(s, "b", "todo", NOW);
      return s;
    });
    const j = buildJourney("user", STEPS, saved);
    expect(j.steps[0]).toMatchObject({ lecturesDone: 1, missionsDone: 1, done: 2, total: 4, complete: false });
    expect(j.steps[1].done).toBe(0);
    expect(j.activeIndex).toBe(0);
  });

  it("용어는 저장 개수만 정보로 보여 주고 완료에는 넣지 않는다", () => {
    const saved = withProgress((s) => addRef(addRef(s, "terms", "t1", NOW), "terms", "t2", NOW));
    const j = buildJourney("user", STEPS, saved);
    expect(j.steps[0]).toMatchObject({ terms: 4, termsSaved: 2, done: 0 });
  });

  it("단계를 끝내면 지금 단계가 다음으로 넘어가고, 모두 끝내면 allDone", () => {
    let s = emptySaved();
    for (const id of ["a", "b"]) s = setMissionStatus(setLectureStatus(s, id, "done", NOW), id, "done", NOW);
    let j = buildJourney("beginner", STEPS, s);
    expect(j.steps[0].complete).toBe(true);
    expect(j.activeIndex).toBe(1);

    for (const id of ["c", "d", "e", "f"]) s = setLectureStatus(s, id, "done", NOW);
    s = setMissionStatus(s, "c", "done", NOW);
    j = buildJourney("beginner", STEPS, s);
    expect(j.steps.every((st) => st.complete)).toBe(true);
    expect(j.activeIndex).toBe(3);
    expect(j.allDone).toBe(true);
    expect([j.done, j.total]).toEqual([9, 9]);
  });

  it("뒤 단계만 끝내도 지금 단계는 끝나지 않은 첫 단계", () => {
    const s = withProgress((x) => setLectureStatus(x, "f", "done", NOW));
    const j = buildJourney("user", STEPS, s);
    expect(j.steps[2].complete).toBe(true);
    expect(j.activeIndex).toBe(0);
  });

  it("중복 id는 한 번만 센다, 단계가 없으면 allDone이 아니다", () => {
    const j = buildJourney("user", [{ label: "실전 활용", lectureIds: ["a", "a"], missionIds: ["a", "a"], termIds: ["t", "t"] }], null);
    expect(j.steps[0]).toMatchObject({ lectures: 1, missions: 1, terms: 1, total: 2 });
    expect(buildJourney("user", [], null)).toMatchObject({ allDone: false, activeIndex: 0, total: 0 });
  });
});

describe("journeyInputs", () => {
  const steps = [
    { label: "기초 다지기", items: [{ video: { id: "a", terms: ["x", "y"] } }, { video: { id: "b" } }] },
    { label: "실전 활용", items: [{ video: { id: "c", terms: ["t1", "z"] } }, { video: { id: "d", terms: ["z"] } }] },
  ];
  it("1단계 용어 = 시작 전 용어, 2단계부터 = 카드 핵심 용어(앞에서 센 용어 제외), 실습은 미션 있는 강의만", () => {
    const inputs = journeyInputs(steps, new Set(["a", "d"]), ["t1", "t2"]);
    expect(inputs).toEqual([
      { label: "기초 다지기", lectureIds: ["a", "b"], missionIds: ["a"], termIds: ["t1", "t2"] },
      { label: "실전 활용", lectureIds: ["c", "d"], missionIds: ["d"], termIds: ["z"] },
    ]);
  });
});

describe("표시 문구", () => {
  it("단계 상세 한 줄과 접근 가능한 이름", () => {
    const j = buildJourney("user", STEPS, withProgress((s) => setLectureStatus(s, "a", "done", NOW)));
    expect(stepDetailLine(j.steps[0])).toBe("강의 2 · 용어 4 · 실습 2 · 완료 1/4");
    expect(stepDetailLine(j.steps[2])).toBe("강의 1 · 완료 0/1");
    expect(stepAccessibleName(j.steps[0], true)).toBe("1단계 기초 다지기, 4개 중 1개 완료, 지금 할 단계");
  });
  it("요약 한 줄", () => {
    expect(summaryLine("입문자", [], 1)).toBe("입문자 · 분야 미정 · 목표 1개");
    expect(summaryLine("실무자", ["업무 자동화"], 2)).toBe("실무자 · 업무 자동화 · 목표 2개");
    expect(summaryLine("개발자", ["코딩", "데이터 분석"], 3)).toBe("개발자 · 코딩 외 1 · 목표 3개");
  });
  it("앵커 id", () => {
    expect(stepAnchorId(2)).toBe("step-2");
    expect(missionAnchorId("abc")).toBe("mission-abc");
  });
});
