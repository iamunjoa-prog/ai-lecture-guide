import { describe, expect, it } from "vitest";
import realInstructors from "../../../data/instructors.json";
import realPractice from "../../../data/practice.json";
import realTheory from "../../../data/theory.json";
import realVideos from "../../../data/videos.json";
import {
  defaultTab,
  isPracticeStyle,
  isTheoryStyle,
  journeyTarget,
  prepTabLabel,
  PROGRESS_HINTS,
  progressRule,
  styleLine,
  tabOrder,
  theoryCountFor,
} from "../study-style";
import { buildJourney, journeyInputs, stepDetailLine, type JourneyStepInput } from "../journey";
import { buildRoadmap, MAX_PER_INSTRUCTOR, MIN_TOTAL, STEP_LABELS } from "../recommend";
import { emptySaved, setLectureStatus, setMissionStatus, toggleRef } from "../saved";
import { selectTheory } from "../theory";
import { GOALS, LEVELS, STUDY_STYLES } from "../questions";
import { diag, instructors, makeVideo } from "./fixtures";
import type { Instructor, StudyStyle, TheoryConcept, Video } from "../../types";

const NOW = "2026-11-28T00:00:00.000Z";

describe("탭 순서 · 기본 탭", () => {
  it("공부 방법별 첫 탭(기본 탭)", () => {
    expect(defaultTab("lectures")).toBe("lectures");
    expect(defaultTab("all")).toBe("lectures");
    expect(defaultTab("practice")).toBe("practice");
    expect(defaultTab("theory")).toBe("prep");
    expect(defaultTab("practice_theory")).toBe("practice");
  });
  it("실습+개념은 실습 → 개념 → 강의", () => {
    expect(tabOrder("practice_theory", false)).toEqual(["practice", "prep", "lectures"]);
    expect(tabOrder("theory", false)).toEqual(["prep", "lectures", "practice"]);
  });
  it("스킬은 늘 마지막, 없으면(입문자) 탭 3개. 모든 탭이 한 번씩", () => {
    for (const st of STUDY_STYLES) {
      const withSkills = tabOrder(st, true);
      expect(withSkills.at(-1)).toBe("skills");
      expect(new Set(withSkills).size).toBe(4);
      expect(tabOrder(st, false)).toHaveLength(3);
      expect(tabOrder(st, false)).not.toContain("skills");
      expect(tabOrder(st, false)[0]).toBe(defaultTab(st));
    }
  });
  it("개념이 주인공이면 준비 탭 이름이 '개념'", () => {
    expect(prepTabLabel("theory")).toBe("개념");
    expect(prepTabLabel("practice_theory")).toBe("개념");
    for (const st of ["lectures", "practice", "all"] as const) expect(prepTabLabel(st)).toBe("준비");
  });
});

describe("문구", () => {
  it("공부 방법마다 히어로 한 줄과 진행 안내가 있다 (짧게)", () => {
    for (const st of STUDY_STYLES) {
      expect([...styleLine(st)].length, st).toBeLessThanOrEqual(40);
      expect(PROGRESS_HINTS[st]).toBeTruthy();
    }
    expect(styleLine("practice")).toContain("실습");
    expect(styleLine("theory")).toContain("개념");
  });
  it("분류 함수", () => {
    expect(STUDY_STYLES.filter(isPracticeStyle)).toEqual(["practice", "practice_theory"]);
    expect(STUDY_STYLES.filter(isTheoryStyle)).toEqual(["theory", "practice_theory"]);
    expect(journeyTarget("practice")).toBe("practice");
    expect(journeyTarget("theory")).toBe("lectures");
    expect(theoryCountFor("theory")).toBe(4);
    expect(theoryCountFor("all")).toBe(3);
  });
});

/** 1단계: 강의 a·b(미션 a) + 개념 c1·c2 · 2단계: 강의 c(미션 없음) */
const STEPS: JourneyStepInput[] = [
  { label: "기초 다지기", lectureIds: ["a", "b"], missionIds: ["a"], termIds: [], conceptIds: ["c1", "c2"] },
  { label: "실전 활용", lectureIds: ["c"], missionIds: [], termIds: [] },
];

describe("내 학습 여정 — 공부 방법별 진행 규칙", () => {
  it("진행 규칙 표", () => {
    expect(progressRule("all")).toEqual({ lectures: "always", missions: true, concepts: false });
    expect(progressRule("lectures")).toEqual({ lectures: "always", missions: false, concepts: false });
    expect(progressRule("practice")).toEqual({ lectures: "fallback", missions: true, concepts: false });
    expect(progressRule("theory")).toEqual({ lectures: "always", missions: false, concepts: true });
    expect(progressRule("practice_theory")).toEqual({ lectures: "fallback", missions: true, concepts: true });
  });
  const totals = (st: StudyStyle) => buildJourney("user", STEPS, null, st).steps.map((s) => s.total);
  it("단계별로 세는 개수", () => {
    expect(totals("all")).toEqual([3, 1]); // 강의 2 + 실습 1 · 강의 1
    expect(totals("lectures")).toEqual([2, 1]); // 강의만
    expect(totals("practice")).toEqual([1, 1]); // 실습만, 실습 없는 단계는 강의
    expect(totals("theory")).toEqual([4, 1]); // 강의 2 + 개념 2
    expect(totals("practice_theory")).toEqual([3, 1]); // 실습 1 + 개념 2 · 강의 1
    // 기본값은 all (예전 동작)
    expect(buildJourney("user", STEPS, null).steps.map((s) => s.total)).toEqual([3, 1]);
  });
  it("실습 위주: 실습만 끝내도 단계 완료 (강의는 선택)", () => {
    const s = setMissionStatus(emptySaved(), "a", "done", NOW);
    const j = buildJourney("user", STEPS, s, "practice");
    expect(j.steps[0].complete).toBe(true);
    expect(j.activeIndex).toBe(1);
    expect(buildJourney("user", STEPS, s, "all").steps[0].complete).toBe(false);
    expect(stepDetailLine(j.steps[0])).toBe("강의 2(선택) · 실습 1 · 완료 1/1");
  });
  it("강의부터: 실습은 선택", () => {
    let s = setLectureStatus(emptySaved(), "a", "done", NOW);
    s = setLectureStatus(s, "b", "done", NOW);
    const j = buildJourney("user", STEPS, s, "lectures");
    expect(j.steps[0].complete).toBe(true);
    expect(stepDetailLine(j.steps[0])).toBe("강의 2 · 실습 1(선택) · 완료 2/2");
  });
  it("개념 위주: 3분 이론 '읽었어요'가 1단계 진행에 들어간다 (저장만으로는 아님)", () => {
    let s = toggleRef(emptySaved(), "theory", "c1", NOW); // 저장
    expect(buildJourney("user", STEPS, s, "theory").steps[0].done).toBe(0);
    s = toggleRef(s, "theoryRead", "c1", NOW);
    s = toggleRef(s, "theoryRead", "c2", NOW);
    const j = buildJourney("user", STEPS, s, "theory");
    expect(j.steps[0]).toMatchObject({ concepts: 2, conceptsRead: 2, done: 2, total: 4, complete: false });
    expect(stepDetailLine(j.steps[0])).toBe("강의 2 · 개념 2 · 실습 1(선택) · 완료 2/4");
    // 골고루(all)에서는 개념을 세지 않는다
    expect(buildJourney("user", STEPS, s, "all").steps[0].done).toBe(0);
  });
  it("실습+개념: 실습과 개념을 다 하면 1단계 완료", () => {
    let s = setMissionStatus(emptySaved(), "a", "done", NOW);
    s = toggleRef(toggleRef(s, "theoryRead", "c1", NOW), "theoryRead", "c2", NOW);
    expect(buildJourney("user", STEPS, s, "practice_theory").steps[0].complete).toBe(true);
  });
  it("journeyInputs: 개념은 1단계에만 붙는다", () => {
    const steps = [
      { label: "기초 다지기", items: [{ video: { id: "a" } }] },
      { label: "실전 활용", items: [{ video: { id: "b" } }] },
    ];
    const inputs = journeyInputs(steps, new Set(), [], ["c1"]);
    expect(inputs[0].conceptIds).toEqual(["c1"]);
    expect(inputs[1].conceptIds).toBeUndefined();
    expect(journeyInputs(steps, new Set(), [])[0].conceptIds).toBeUndefined();
  });
});

const videos = realVideos as unknown as Video[];
const realInst = realInstructors as unknown as Instructor[];
const easyPracticeIds = new Set(
  (realPractice as { videoId: string; needsTool?: string }[]).filter((m) => !m.needsTool || m.needsTool === "chat").map((m) => m.videoId),
);

describe("추천 조정 (공부 방법)", () => {
  it("실습 위주: 동점이면 챗봇 실습이 있는 강의 먼저 (작은 데이터)", () => {
    const vs = [
      makeVideo({ id: "X1", instructorId: "inst-a", levels: ["user"], domains: ["marketing"], goals: ["use_tools"], durationMin: 10 }),
      makeVideo({ id: "X2", instructorId: "inst-b", levels: ["user"], domains: ["marketing"], goals: ["use_tools"], durationMin: 50 }),
    ];
    const easy = new Set(["X2"]);
    const ids = (st: StudyStyle) =>
      buildRoadmap(diag({ studyStyle: st }), vs, instructors, { easyPracticeIds: easy }).steps.flatMap((s) => s.items.map((i) => i.video.id));
    expect(ids("all")).toEqual(["X1", "X2"]); // 짧은 강의 먼저
    expect(ids("practice")).toEqual(["X2", "X1"]); // 챗봇 실습 먼저
    expect(ids("practice_theory")).toEqual(["X2", "X1"]);
    expect(ids("lectures")).toEqual(["X1", "X2"]);
  });
  it("개념 위주: 동점이면 개념 이해 강의 먼저", () => {
    const vs = [
      makeVideo({ id: "Y1", instructorId: "inst-a", levels: ["user"], domains: ["marketing"], goals: ["use_tools"], durationMin: 10 }),
      makeVideo({ id: "Y2", instructorId: "inst-b", levels: ["user"], domains: ["marketing"], goals: ["use_tools", "understand"], durationMin: 50 }),
    ];
    const order = (st: StudyStyle) =>
      buildRoadmap(diag({ studyStyle: st, goals: ["build_agents"] }), vs, instructors).steps.flatMap((s) => s.items.map((i) => i.video.id));
    expect(order("all")).toEqual(["Y1", "Y2"]);
    expect(order("theory")).toEqual(["Y2", "Y1"]);
  });
  it("실제 데이터: 모든 공부 방법에서 강사당 최대 2개 · 3개 이상 · 같은 강의 한 번", () => {
    for (const level of LEVELS)
      for (const goal of GOALS)
        for (const studyStyle of STUDY_STYLES) {
          const r = buildRoadmap(diag({ level, goals: [goal], domains: ["automation"], studyStyle }), videos, realInst, { easyPracticeIds });
          const items = r.steps.flatMap((s) => s.items);
          expect(items.length, `${level}/${goal}/${studyStyle}`).toBeGreaterThanOrEqual(MIN_TOTAL);
          expect(new Set(items.map((i) => i.video.id)).size).toBe(items.length);
          const per = new Map<string, number>();
          for (const it of items) per.set(it.instructor.id, (per.get(it.instructor.id) ?? 0) + 1);
          expect(Math.max(...per.values())).toBeLessThanOrEqual(MAX_PER_INSTRUCTOR);
        }
  });
  it("실제 데이터: 실습 위주는 실전 단계에 챗봇 실습 강의가 골고루보다 같거나 많다", () => {
    let all = 0;
    let prac = 0;
    for (const level of LEVELS)
      for (const goal of GOALS) {
        const count = (studyStyle: StudyStyle) =>
          buildRoadmap(diag({ level, goals: [goal], domains: ["marketing"], studyStyle }), videos, realInst, { easyPracticeIds })
            .steps.flatMap((s) => s.items)
            .filter((i) => easyPracticeIds.has(i.video.id)).length;
        all += count("all");
        prac += count("practice");
      }
    expect(prac).toBeGreaterThanOrEqual(all);
  });
  it("실제 데이터: 개념 위주는 기초 다지기에 개념 이해 강의가 골고루보다 같거나 많다", () => {
    let all = 0;
    let th = 0;
    for (const level of LEVELS.slice(1))
      for (const goal of GOALS) {
        const count = (studyStyle: StudyStyle) =>
          (buildRoadmap(diag({ level, goals: [goal], domains: ["automation"], studyStyle }), videos, realInst).steps.find(
            (s) => s.label === STEP_LABELS.foundation,
          )?.items ?? []).filter((i) => i.video.goals.includes("understand")).length;
        all += count("all");
        th += count("theory");
      }
    expect(th).toBeGreaterThanOrEqual(all);
  });
  it("개념 위주는 3분 이론 4개 (같은 수준만)", () => {
    for (const level of LEVELS) {
      const picked = selectTheory({ level, goals: ["use_tools"] }, realTheory as TheoryConcept[], theoryCountFor("theory"));
      expect(picked).toHaveLength(4);
      expect(picked.every((c) => c.level === level)).toBe(true);
    }
  });
});
