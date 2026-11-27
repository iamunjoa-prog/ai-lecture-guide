/**
 * 진단 결론 (결과 화면 상단의 짧은 두 줄). 순수 함수, 템플릿 기반.
 *
 *  1줄: 지금 수준에서 이미 할 수 있는 것 (수준별)
 *  2줄: 1순위 목표 기준으로 가장 쓸모 있는 다음 한 걸음 (수준 × 목표)
 *
 * 과장 없이, 쉬운 말로. 결과마다 같은 입력이면 같은 문장이 나온다.
 */
import type { DiagnosisResult, Goal, Level } from "../types";

export interface Conclusion {
  /** 지금 할 수 있는 것 */
  now: string;
  /** 다음 한 걸음 */
  next: string;
}

export const CONCLUSION_NOW: Record<Level, string> = {
  beginner: "AI와 이제 막 친해지는 단계예요. 지금은 편하게 물어보는 것만으로도 충분해요.",
  user: "AI에게 묻고, 글을 정리하고 다듬는 데는 이미 익숙하세요.",
  practitioner: "AI를 업무에 꾸준히 쓰고 계세요.",
  developer: "코드로 AI를 직접 불러 쓰고 만들 수 있는 단계예요.",
};

export const CONCLUSION_NEXT: Record<Level, Record<Goal, string>> = {
  beginner: {
    understand: "다음 단계는 AI가 어떻게 답을 만드는지, 왜 가끔 틀리는지 큰 그림을 잡는 거예요.",
    use_tools: "다음 단계는 요약이나 메일 쓰기처럼 자주 하는 일 하나를 AI에게 맡겨 보는 거예요.",
    build_agents: "다음 단계는 AI에게 역할과 조건을 분명히 알려 주는 요청법부터 익히는 거예요.",
    build_products: "다음 단계는 AI를 직접 써 보며 잘하는 일과 못 하는 일을 구분해 보는 거예요.",
  },
  user: {
    understand: "다음 단계는 AI가 한 번에 기억하는 범위와 그럴듯하게 틀리는 이유를 이해하는 거예요.",
    use_tools: "다음 단계는 잘 되는 요청을 양식으로 만들어 내 자료와 함께 다시 쓰는 거예요.",
    build_agents: "다음 단계는 지침과 자료를 담은 나만의 AI 비서를 하나 만들어 보는 거예요.",
    build_products: "다음 단계는 코딩 없이 쓸 수 있는 도구로 작은 AI 앱을 하나 만들어 보는 거예요.",
  },
  practitioner: {
    understand: "다음 단계는 AI가 문서를 찾아 답하는 방식과 다른 도구에 연결되는 원리를 이해하는 거예요.",
    use_tools: "다음 단계는 자주 하는 일을 AI에게 맡기는 흐름을 만들어 보는 거예요.",
    build_agents: "다음 단계는 AI에게 도구를 연결해 여러 단계 일을 맡기고, 사람이 확인할 지점을 정하는 거예요.",
    build_products: "다음 단계는 API로 AI를 내 서비스에 붙이고, 결과가 제대로 나오는지 평가하는 법을 익히는 거예요.",
  },
  developer: {
    understand: "다음 단계는 모델이 어떻게 학습하고 추론하는지 원리를 한 겹 더 깊이 이해하는 거예요.",
    use_tools: "다음 단계는 AI에게 넘길 정보를 골라 정리해서, 코딩 에이전트의 결과 품질을 높이는 거예요.",
    build_agents: "다음 단계는 도구 호출과 반복 실행 구조를 직접 설계해 에이전트를 만들어 보는 거예요.",
    build_products: "다음 단계는 비용·속도·품질을 재 가며 실제 사용자가 쓸 AI 기능을 다듬는 거예요.",
  },
};

export function buildConclusion(diagnosis: Pick<DiagnosisResult, "level" | "goals">): Conclusion {
  const primary: Goal = diagnosis.goals[0] ?? "understand";
  return { now: CONCLUSION_NOW[diagnosis.level], next: CONCLUSION_NEXT[diagnosis.level][primary] };
}
