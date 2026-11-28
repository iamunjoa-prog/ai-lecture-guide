/**
 * 선호 공부 방법(StudyStyle)에 따라 결과 화면을 바꾸는 순수 함수 모음 (SPEC.md §1 "공부 방법별 결과").
 *
 * | 공부 방법 | 탭 순서(첫 탭 = 기본 탭) | 내 학습 여정 진행에 세는 것 | 추천 조정 |
 * |---|---|---|---|
 * | lectures 강의부터 | 강의 · 실습 · 준비 | 강의 '다 봤어요' | 없음 |
 * | practice 실습 위주 | 실습 · 강의 · 준비 | 실습 '완료' (실습이 없는 단계만 강의) | 동점이면 챗봇만으로 되는 실습이 있는 강의 먼저 |
 * | theory 개념 위주 | 개념 · 강의 · 실습 | 강의 '다 봤어요' + 1단계에 3분 이론 '읽었어요' | 기초에 개념 이해 강의 우선 · 3분 이론 4개 |
 * | practice_theory 실습+개념 | 실습 · 개념 · 강의 | 실습 '완료'(없으면 강의) + 1단계에 3분 이론 '읽었어요' | 동점이면 챗봇 실습 강의 먼저 |
 * | all 골고루 (예전 링크) | 강의 · 실습 · 준비 | 강의 + 실습 (예전과 같음) | 없음 |
 *
 * 스킬 탭은 늘 마지막이고, 입문자에게는 없다. 주소 해시(#practice 등)가 있으면 해시가 이긴다.
 */
import type { StudyStyle } from "../types";

/** 결과 화면 탭 (주소 해시와 같은 값) */
export type ResultTabKey = "lectures" | "practice" | "prep" | "skills";

const ORDER: Record<StudyStyle, readonly ResultTabKey[]> = {
  lectures: ["lectures", "practice", "prep"],
  practice: ["practice", "lectures", "prep"],
  theory: ["prep", "lectures", "practice"],
  practice_theory: ["practice", "prep", "lectures"],
  all: ["lectures", "practice", "prep"],
};

/** 탭 순서. 스킬은 `withSkills`일 때만 맨 뒤에 붙는다 (입문자는 false) */
export function tabOrder(style: StudyStyle, withSkills: boolean): ResultTabKey[] {
  return withSkills ? [...ORDER[style], "skills"] : [...ORDER[style]];
}

/** 해시가 없을 때 열리는 탭 = 첫 탭 */
export function defaultTab(style: StudyStyle): ResultTabKey {
  return ORDER[style][0];
}

/** 개념이 주인공인 공부 방법 (준비 탭 이름이 '개념', 3분 이론이 용어보다 먼저, '이번 주 개념') */
export function isTheoryStyle(style: StudyStyle): boolean {
  return style === "theory" || style === "practice_theory";
}

/** 실습이 주인공인 공부 방법 (이번 주 실습 미션을 크게, 여정 진행은 실습 기준) */
export function isPracticeStyle(style: StudyStyle): boolean {
  return style === "practice" || style === "practice_theory";
}

/**
 * 준비 탭 이름. 개념이 주인공인 사람에게 이 탭은 '강의 전 준비'가 아니라 본 내용이라
 * 고른 말("개념부터 알고 싶어요")과 같은 '개념'으로 부른다. 해시는 그대로 #prep.
 */
export function prepTabLabel(style: StudyStyle): string {
  return isTheoryStyle(style) ? "개념" : "준비";
}

/** 결과 화면 '3분 이론' 개념 수 (개념 위주면 하나 더) */
export function theoryCountFor(style: StudyStyle): number {
  return style === "theory" ? 4 : 3;
}

/** 진행에 무엇을 세는가 */
export interface ProgressRule {
  /** always: 늘 셈 · fallback: 그 단계에 실습이 없을 때만 셈 */
  lectures: "always" | "fallback";
  missions: boolean;
  /** 1단계에 3분 이론 '읽었어요'를 셈 */
  concepts: boolean;
}

const RULES: Record<StudyStyle, ProgressRule> = {
  lectures: { lectures: "always", missions: false, concepts: false },
  practice: { lectures: "fallback", missions: true, concepts: false },
  theory: { lectures: "always", missions: false, concepts: true },
  practice_theory: { lectures: "fallback", missions: true, concepts: true },
  all: { lectures: "always", missions: true, concepts: false },
};

export function progressRule(style: StudyStyle): ProgressRule {
  return RULES[style];
}

/** 진행이 0일 때 여정 아래 안내 (무엇을 누르면 진행되는지) */
export const PROGRESS_HINTS: Record<StudyStyle, string> = {
  lectures: "강의를 보면 ‘다 봤어요’를 눌러 표시해 보세요. 실습은 하고 싶을 때만 해도 돼요.",
  practice: "실습을 마치면 ‘완료했어요’를 눌러 표시해 보세요. 강의는 필요할 때만 봐도 돼요.",
  theory: "3분 이론을 읽으면 ‘읽었어요’, 강의를 보면 ‘다 봤어요’를 눌러 표시해 보세요.",
  practice_theory: "실습은 ‘완료했어요’, 3분 이론은 ‘읽었어요’를 눌러 표시해 보세요.",
  all: "강의를 보면 ‘다 봤어요’, 실습을 마치면 ‘완료했어요’를 눌러 표시해 보세요.",
};

/** 결과 히어로의 한 줄 (공부 방법에 맞춰 어디서 시작할지) */
export const STYLE_LINES: Record<StudyStyle, string> = {
  lectures: "강의 위주로 짰어요. 1단계 강의부터 차례로 보세요.",
  practice: "실습 위주로 짰어요. 실습 탭의 이번 주 미션부터 해 보세요.",
  theory: "개념 위주로 짰어요. 개념 탭의 3분 이론부터 읽어 보세요.",
  practice_theory: "실습과 개념을 함께 짰어요. 실습부터 하고, 막히면 개념 탭을 보세요.",
  all: "강의·실습·개념을 골고루 담았어요. 강의부터 차근차근 보세요.",
};

export function styleLine(style: StudyStyle): string {
  return STYLE_LINES[style];
}

/** 여정 노드 상세의 '이 단계 … 보기' 대상: 실습 위주면 실습 탭의 그 단계 */
export function journeyTarget(style: StudyStyle): "lectures" | "practice" {
  return isPracticeStyle(style) ? "practice" : "lectures";
}
