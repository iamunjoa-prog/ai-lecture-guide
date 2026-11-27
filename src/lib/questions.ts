/**
 * 진단 질문지 (B 담당).
 *
 * UI는 `DIAGNOSIS_QUESTIONS`를 순서대로 한 화면에 하나씩 그리면 된다.
 * 모든 질문은 같은 모양(`Question`)이라 범용 컴포넌트 하나로 렌더링할 수 있다.
 * 답은 `DiagnosisAnswers`(질문 id → 선택한 옵션 id 배열)로 모아서
 * `buildDiagnosis(answers)`에 넘기면 `DiagnosisResult`가 나온다.
 */
import type { DiagnosisResult, Domain, Goal, Level } from "../types";

// ---------------------------------------------------------------------------
// 순서가 있는 상수 목록
// ---------------------------------------------------------------------------

/** 낮은 수준 → 높은 수준 순서. 로드맵 단계 계산에 쓰인다. */
export const LEVELS: readonly Level[] = ["beginner", "user", "practitioner", "developer"];
export const DOMAINS: readonly Domain[] = [
  "automation",
  "marketing",
  "coding",
  "data",
  "education",
  "startup",
];
export const GOALS: readonly Goal[] = ["understand", "use_tools", "build_agents", "build_products"];

/** 분야는 최대 3개까지 고를 수 있다. ("잘 모르겠어요"를 고르면 0개 = 분야 미정) */
export const MAX_DOMAINS = 3;

/** "잘 모르겠어요" 선택지 id (분야·목표 질문 공통) */
export const UNSURE_ID = "unsure";

export const isLevel = (v: unknown): v is Level =>
  typeof v === "string" && (LEVELS as readonly string[]).includes(v);
export const isDomain = (v: unknown): v is Domain =>
  typeof v === "string" && (DOMAINS as readonly string[]).includes(v);
export const isGoal = (v: unknown): v is Goal =>
  typeof v === "string" && (GOALS as readonly string[]).includes(v);

// ---------------------------------------------------------------------------
// 표시용 라벨 (UI에서 재사용)
// ---------------------------------------------------------------------------

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "입문자",
  user: "활용자",
  practitioner: "실무자",
  developer: "개발자",
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  beginner: "AI를 이제 막 알아가는 단계예요.",
  user: "AI를 가끔 쓰면서 감을 잡아가는 단계예요.",
  practitioner: "AI를 업무에 꾸준히 활용하는 단계예요.",
  developer: "코드와 API로 AI를 직접 다루는 단계예요.",
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  automation: "업무 자동화",
  marketing: "마케팅·콘텐츠",
  coding: "코딩",
  data: "데이터 분석",
  education: "교육",
  startup: "창업·비즈니스",
};

export const GOAL_LABELS: Record<Goal, string> = {
  understand: "개념 이해",
  use_tools: "업무 도구로 쓰기",
  build_agents: "나만의 에이전트 만들기",
  build_products: "AI 제품 만들기",
};

/** 한 번에 모아 쓰고 싶을 때 */
export const LABELS = {
  level: LEVEL_LABELS,
  domain: DOMAIN_LABELS,
  goal: GOAL_LABELS,
} as const;

// ---------------------------------------------------------------------------
// 질문/옵션 타입
// ---------------------------------------------------------------------------

/** 진단 3단계 + 부가 질문. 진행 바 구간 표시에 쓸 수 있다. */
export type QuestionStep = "level" | "domain" | "goal" | "language";

export interface QuestionOption<V extends string = string> {
  id: V;
  label: string;
  description?: string;
  /** true면 다른 선택지와 함께 고를 수 없다(다중 선택에서 "잘 모르겠어요" 등) */
  exclusive?: boolean;
}

/** 수준 질문 옵션: 점수와(선택) 신호 태그를 가진다. */
export interface LevelOption extends QuestionOption {
  points: number;
  /** "api" + "code" 신호가 모두 있으면 총점과 무관하게 developer로 판정 */
  signals?: LevelSignal[];
}

export type LevelSignal = "api" | "code";

interface BaseQuestion<O extends QuestionOption> {
  id: string;
  step: QuestionStep;
  /** single: 하나만, multi: 여러 개(maxSelect까지) */
  type: "single" | "multi";
  title: string;
  subtitle?: string;
  /** multi일 때 최대 선택 수 */
  maxSelect?: number;
  options: O[];
}

export interface LevelQuestion extends BaseQuestion<LevelOption> {
  step: "level";
  type: "single";
}
export interface DomainQuestion extends BaseQuestion<QuestionOption<Domain | typeof UNSURE_ID>> {
  step: "domain";
  type: "multi";
  maxSelect: number;
}
export interface GoalQuestion extends BaseQuestion<QuestionOption<Goal | typeof UNSURE_ID>> {
  step: "goal";
  type: "single";
}
export interface LanguageQuestion extends BaseQuestion<QuestionOption<"yes" | "no">> {
  step: "language";
  type: "single";
}

export type Question = LevelQuestion | DomainQuestion | GoalQuestion | LanguageQuestion;

/** 질문 id → 선택한 옵션 id 목록 (single이면 길이 1) */
export type DiagnosisAnswers = Record<string, string[] | undefined>;

// ---------------------------------------------------------------------------
// ① 수준 질문
// ---------------------------------------------------------------------------

export const LEVEL_QUESTIONS: LevelQuestion[] = [
  {
    id: "lv_frequency",
    step: "level",
    type: "single",
    title: "ChatGPT나 Claude 같은 AI, 얼마나 자주 쓰세요?",
    subtitle: "정답은 없어요. 지금과 가장 가까운 것을 골라 주세요.",
    options: [
      { id: "never", label: "아직 거의 안 써봤어요", points: 0 },
      { id: "sometimes", label: "가끔 궁금할 때 써요", points: 1 },
      { id: "weekly", label: "일주일에 몇 번은 써요", points: 2 },
      { id: "daily", label: "거의 매일 써요", points: 3 },
    ],
  },
  {
    id: "lv_prompt",
    step: "level",
    type: "single",
    title: "AI에게 질문할 때 어떻게 하세요?",
    subtitle: "AI에게 하는 질문이나 지시를 '프롬프트'라고 불러요.",
    options: [
      { id: "simple", label: "그냥 궁금한 걸 바로 물어봐요", points: 0 },
      {
        id: "structured",
        label: "역할이나 예시를 넣어서 물어봐요",
        description: "\"너는 마케터야\"처럼요",
        points: 1,
      },
      {
        id: "template",
        label: "자주 쓰는 질문(프롬프트)을 양식으로 만들어 둬요",
        points: 2,
      },
    ],
  },
  {
    id: "lv_work",
    step: "level",
    type: "single",
    title: "업무나 공부에 AI를 어떻게 쓰고 있나요?",
    options: [
      { id: "none", label: "아직 써본 적 없어요", points: 0 },
      { id: "basic", label: "요약이나 글 다듬기에 써요", points: 1 },
      {
        id: "advanced",
        label: "여러 AI 도구를 상황에 맞게 골라 써요",
        description: "예: 글쓰기는 ChatGPT, 이미지는 다른 도구처럼요",
        points: 2,
      },
    ],
  },
  {
    id: "lv_automation",
    step: "level",
    type: "single",
    title: "API나 자동화 도구를 써본 적 있나요?",
    subtitle: "API는 프로그램끼리 기능을 주고받는 통로예요. 코딩 없이 쓰는 자동화 서비스(Zapier, Make)도 포함이에요.",
    options: [
      { id: "none", label: "처음 들어봐요", points: 0 },
      { id: "heard", label: "들어는 봤는데 써본 적은 없어요", points: 1 },
      {
        id: "nocode",
        label: "Zapier나 Make로 자동화를 만들어 봤어요",
        points: 2,
      },
      {
        id: "api",
        label: "AI API를 직접 호출해 봤어요",
        description: "코드로 ChatGPT·Claude 같은 AI를 불러와 쓰는 것이에요",
        points: 4,
        signals: ["api"],
      },
    ],
  },
  {
    id: "lv_coding",
    step: "level",
    type: "single",
    title: "코딩은 어느 정도 하세요?",
    options: [
      { id: "none", label: "전혀 못 해요", points: 0 },
      { id: "read", label: "코드를 조금 읽을 수 있어요", points: 1 },
      {
        id: "script",
        label: "간단한 프로그램은 직접 짤 수 있어요",
        points: 3,
        signals: ["code"],
      },
      {
        id: "pro",
        label: "개발이 제 일이에요",
        points: 5,
        signals: ["code"],
      },
    ],
  },
];

/**
 * 총점 → 수준 기준 (최대 16점).
 *  - 0~2점   beginner
 *  - 3~6점   user
 *  - 7~10점  practitioner
 *  - 11점 이상 developer
 * 추가 규칙: "API 직접 호출"(api) + "코드 작성 가능"(code) 신호를 모두 고르면
 * 총점과 관계없이 developer로 판정한다.
 */
export const LEVEL_THRESHOLDS: { level: Level; min: number }[] = [
  { level: "developer", min: 11 },
  { level: "practitioner", min: 7 },
  { level: "user", min: 3 },
  { level: "beginner", min: 0 },
];

/** 수준 질문 답을 질문 id → 옵션 id(단일 문자열)로 받는다. 배열 형태(DiagnosisAnswers)도 허용. */
export type LevelAnswers = Record<string, string | string[] | undefined>;

function pickLevelOptions(answers: LevelAnswers): LevelOption[] {
  const picked: LevelOption[] = [];
  for (const q of LEVEL_QUESTIONS) {
    const raw = answers[q.id];
    const optionId = Array.isArray(raw) ? raw[0] : raw;
    const opt = q.options.find((o) => o.id === optionId);
    if (opt) picked.push(opt);
  }
  return picked;
}

/** 수준 질문 총점. 모르는 질문/옵션은 0점으로 처리한다. */
export function levelScore(answers: LevelAnswers): number {
  return pickLevelOptions(answers).reduce((sum, o) => sum + o.points, 0);
}

export function scoreToLevel(answers: LevelAnswers): Level {
  const picked = pickLevelOptions(answers);
  const signals = new Set(picked.flatMap((o) => o.signals ?? []));
  if (signals.has("api") && signals.has("code")) return "developer";
  const total = picked.reduce((sum, o) => sum + o.points, 0);
  return LEVEL_THRESHOLDS.find((t) => total >= t.min)!.level;
}

// ---------------------------------------------------------------------------
// ② 분야 / ③ 목표 / 부가: 한국어 선호
// ---------------------------------------------------------------------------

export const DOMAIN_OPTIONS: QuestionOption<Domain | typeof UNSURE_ID>[] = [
  {
    id: "automation",
    label: DOMAIN_LABELS.automation,
    description: "반복 업무를 AI에게 맡기고 싶어요",
  },
  {
    id: "marketing",
    label: DOMAIN_LABELS.marketing,
    description: "글, 이미지, 광고 문구를 더 빨리 만들고 싶어요",
  },
  {
    id: "coding",
    label: DOMAIN_LABELS.coding,
    description: "AI와 함께 코드를 짜고 싶어요",
  },
  {
    id: "data",
    label: DOMAIN_LABELS.data,
    description: "엑셀, 리포트, 인사이트를 쉽게 뽑고 싶어요",
  },
  {
    id: "education",
    label: DOMAIN_LABELS.education,
    description: "가르치거나 배우는 데 AI를 쓰고 싶어요",
  },
  {
    id: "startup",
    label: DOMAIN_LABELS.startup,
    description: "AI로 사업 기회를 찾고 싶어요",
  },
  {
    id: UNSURE_ID,
    label: "잘 모르겠어요",
    description: "분야는 정하지 않고 폭넓게 추천받을게요",
    exclusive: true,
  },
];

export const GOAL_OPTIONS: QuestionOption<Goal | typeof UNSURE_ID>[] = [
  {
    id: "understand",
    label: GOAL_LABELS.understand,
    description: "AI가 어떻게 동작하는지 제대로 알고 싶어요",
  },
  {
    id: "use_tools",
    label: GOAL_LABELS.use_tools,
    description: "당장 업무에 써먹고 싶어요",
  },
  {
    id: "build_agents",
    label: GOAL_LABELS.build_agents,
    description: "내 일을 알아서 처리하는 AI 비서를 만들고 싶어요",
  },
  {
    id: "build_products",
    label: GOAL_LABELS.build_products,
    description: "AI로 서비스나 앱을 만들고 싶어요",
  },
  {
    id: UNSURE_ID,
    label: "아직 잘 모르겠어요",
    description: "AI가 뭔지부터 천천히 알아볼게요",
  },
];

export const DOMAIN_QUESTION: DomainQuestion = {
  id: "domains",
  step: "domain",
  type: "multi",
  maxSelect: MAX_DOMAINS,
  title: "어떤 분야에 AI를 쓰고 싶으세요?",
  subtitle: "관심 있는 분야를 최대 3개까지 골라 주세요. 아직 정하지 못했다면 '잘 모르겠어요'를 골라도 괜찮아요.",
  options: DOMAIN_OPTIONS,
};

export const GOAL_QUESTION: GoalQuestion = {
  id: "goal",
  step: "goal",
  type: "single",
  title: "AI로 이루고 싶은 목표는 무엇인가요?",
  subtitle: "가장 가까운 하나만 골라 주세요. 아직 잘 모르겠다면 '아직 잘 모르겠어요'를 골라 보세요.",
  options: GOAL_OPTIONS,
};

export const PREFER_KOREAN_QUESTION: LanguageQuestion = {
  id: "preferKorean",
  step: "language",
  type: "single",
  title: "한국어로 들을 수 있는 강의가 좋으세요?",
  subtitle: "한국어 강의나 한국어 자막이 있는 강의를 먼저 보여 드려요.",
  options: [
    { id: "yes", label: "네, 한국어가 편해요" },
    { id: "no", label: "영어 강의도 괜찮아요" },
  ],
};

/** 화면 순서대로 정렬된 전체 질문 목록 */
export const DIAGNOSIS_QUESTIONS: Question[] = [
  ...LEVEL_QUESTIONS,
  DOMAIN_QUESTION,
  GOAL_QUESTION,
  PREFER_KOREAN_QUESTION,
];

/**
 * 모든 답을 `DiagnosisResult`로 변환한다.
 * 수준 질문은 빠져도 0점으로 계산하지만, 분야·목표·한국어 선호가
 * 없거나 잘못되면 null을 돌려준다.
 *  - 분야: 1~3개, 또는 "잘 모르겠어요"(unsure) 단독 → `domains: []` (분야 미정).
 *    아무것도 고르지 않은 것(빈 배열·없음)은 "아직 답하지 않음"이라 null.
 *    "잘 모르겠어요"와 다른 분야를 함께 보내면 잘못된 입력으로 보고 null.
 *  - 목표: "잘 모르겠어요"(unsure)는 `understand`(개념 이해)로 매핑한다.
 */
export function buildDiagnosis(answers: DiagnosisAnswers): DiagnosisResult | null {
  const rawDomains = [...new Set(answers[DOMAIN_QUESTION.id] ?? [])];
  let domains: Domain[];
  if (rawDomains.length === 1 && rawDomains[0] === UNSURE_ID) {
    domains = [];
  } else {
    if (rawDomains.length < 1 || rawDomains.length > MAX_DOMAINS || !rawDomains.every(isDomain)) return null;
    domains = rawDomains as Domain[];
  }

  const rawGoal = answers[GOAL_QUESTION.id]?.[0];
  const goal = rawGoal === UNSURE_ID ? "understand" : rawGoal;
  if (!isGoal(goal)) return null;

  const ko = answers[PREFER_KOREAN_QUESTION.id]?.[0];
  if (ko !== "yes" && ko !== "no") return null;

  return {
    level: scoreToLevel(answers),
    domains,
    goal,
    preferKorean: ko === "yes",
  };
}
