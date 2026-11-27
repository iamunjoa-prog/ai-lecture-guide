/**
 * 진단 질문지 (B 담당).
 *
 * UI는 `DIAGNOSIS_QUESTIONS`를 순서대로 한 화면에 하나씩 그리면 된다.
 * 모든 질문은 같은 모양(`Question`)이라 범용 컴포넌트 하나로 렌더링할 수 있다.
 * 답은 `DiagnosisAnswers`(질문 id → 선택한 옵션 id 배열)로 모아서
 * `buildDiagnosis(answers)`에 넘기면 `DiagnosisResult`가 나온다.
 *
 * 진단 v2
 *  - 수준 질문 6개: 사용 빈도 → 요청(프롬프트) 방식 → 활용 깊이 → 연결·API → 코딩 → AI 코딩.
 *    선택지는 "~해 봤어요" 같은 구체적인 행동이고, 위에서 아래로 갈수록 더 깊은 경험이다.
 *  - 질문마다 '용어 한 입'(hints) 1~2개: 진단하면서 용어를 하나씩 배운다.
 *  - 목표는 최대 4개 다중 선택, 고른 순서 = 우선순위. "아직 잘 모르겠어요"는 단독 선택.
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
  "creative",
  "coding",
  "data",
  "education",
  "startup",
];
export const GOALS: readonly Goal[] = ["understand", "use_tools", "build_agents", "build_products"];

/** 분야는 최대 3개까지 고를 수 있다. ("잘 모르겠어요"를 고르면 0개 = 분야 미정) */
export const MAX_DOMAINS = 3;
/** 목표는 최대 4개(전부)까지 고를 수 있다. 고른 순서가 우선순위다. */
export const MAX_GOALS = 4;

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
  creative: "이미지·영상 제작",
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

/** '용어 한 입': 질문 아래에 보여 주는 짧은 용어 설명 (60자 이내) */
export interface TermHint {
  /** 굵게 보여 줄 용어. 예: "API" */
  term: string;
  /** 한 줄 설명. 예: "프로그램끼리 정보와 기능을 주고받는 약속된 통로예요." */
  text: string;
  /** data/glossary.json의 id. 있으면 "더 알아보기"(새 탭)로 용어집에 연결한다 */
  glossaryId?: string;
}

/** 용어 한 입 설명의 최대 길이(글자 수) */
export const HINT_MAX_CHARS = 60;

export interface QuestionOption<V extends string = string> {
  id: V;
  label: string;
  description?: string;
  /** 선택지 안의 낯선 용어를 풀어 주는 한 줄 (60자 이내). 선택지 카드 안에 작게 보인다 */
  hint?: string;
  /** true면 다른 선택지와 함께 고를 수 없다(다중 선택에서 "잘 모르겠어요" 등) */
  exclusive?: boolean;
}

/**
 * 수준 판정 신호
 *  - api  : AI API를 코드로 직접 불러 봤다
 *  - code : 직접 프로그램을 만들 수 있다 (만들기·배포·직업)
 *  - ship : 만든 것을 배포했거나 개발이 직업이다
 */
export type LevelSignal = "api" | "code" | "ship";

/** 수준 질문 옵션: 점수와(선택) 신호 태그를 가진다. */
export interface LevelOption extends QuestionOption {
  points: number;
  signals?: LevelSignal[];
}

interface BaseQuestion<O extends QuestionOption> {
  id: string;
  step: QuestionStep;
  /** single: 하나만, multi: 여러 개(maxSelect까지) */
  type: "single" | "multi";
  title: string;
  subtitle?: string;
  /** '용어 한 입' 1~2개 */
  hints?: TermHint[];
  /** multi일 때 최대 선택 수 */
  maxSelect?: number;
  /** multi일 때 고른 순서를 우선순위로 쓰는지 (선택지에 1·2·3 순번을 보여 준다) */
  ordered?: boolean;
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
  type: "multi";
  maxSelect: number;
}
export interface LanguageQuestion extends BaseQuestion<QuestionOption<"yes" | "no">> {
  step: "language";
  type: "single";
}

export type Question = LevelQuestion | DomainQuestion | GoalQuestion | LanguageQuestion;

/** 질문 id → 선택한 옵션 id 목록 (single이면 길이 1) */
export type DiagnosisAnswers = Record<string, string[] | undefined>;

// ---------------------------------------------------------------------------
// ① 수준 질문 (6개)
// ---------------------------------------------------------------------------

/** 위로 갈수록 가벼운 경험, 아래로 갈수록 깊은 경험이라는 안내 (경험 깊이를 묻는 질문 공통) */
const PICK_DEEPEST = "해 본 것이 여러 개라면 가장 아래쪽 것을 골라 주세요.";

export const LEVEL_QUESTIONS: LevelQuestion[] = [
  {
    id: "lv_frequency",
    step: "level",
    type: "single",
    title: "AI 챗봇, 얼마나 자주 쓰세요?",
    subtitle: "정답은 없어요. 지금과 가장 가까운 것을 골라 주세요.",
    hints: [
      { term: "챗봇", text: "대화하듯 묻고 답을 받는 AI 서비스예요. 예: ChatGPT, Claude, Gemini", glossaryId: "chatbot" },
    ],
    options: [
      { id: "never", label: "아직 거의 안 써 봤어요", points: 0 },
      { id: "sometimes", label: "가끔 궁금할 때 써요", points: 1 },
      { id: "weekly", label: "일주일에 몇 번은 써요", points: 2 },
      { id: "daily", label: "거의 매일 써요", points: 3 },
    ],
  },
  {
    id: "lv_prompt",
    step: "level",
    type: "single",
    title: "AI에게 무언가를 부탁할 때 어떻게 말하세요?",
    subtitle: "평소 습관과 가장 가까운 것을 골라 주세요.",
    hints: [
      { term: "프롬프트", text: "AI에게 건네는 질문이나 지시문이에요.", glossaryId: "prompt" },
      { term: "역할 지정", text: "AI에게 전문가 같은 입장을 맡겨 답하게 하는 방법이에요.", glossaryId: "role-prompting" },
    ],
    options: [
      { id: "simple", label: "궁금한 걸 바로 물어봐요", points: 0 },
      {
        id: "detailed",
        label: "상황과 조건을 자세히 덧붙여요",
        description: "예: 누구에게 보낼 글인지, 분량은 얼마인지",
        points: 1,
      },
      {
        id: "structured",
        label: "역할이나 예시를 주고 원하는 형식으로 받아요",
        description: "예: \"너는 마케터야\", \"표로 정리해 줘\"",
        points: 2,
      },
      {
        id: "saved",
        label: "잘 되는 요청을 저장해 두고 다시 써요",
        description: "지침을 넣은 나만의 AI 비서를 만들어 둔 것도 포함이에요",
        hint: "맞춤 AI 비서: 지침과 자료를 담아 특정 일만 하게 만든 AI예요.",
        points: 3,
      },
    ],
  },
  {
    id: "lv_work",
    step: "level",
    type: "single",
    title: "업무나 공부에 AI를 어디까지 써 봤나요?",
    subtitle: PICK_DEEPEST,
    hints: [
      { term: "AI 에이전트", text: "목표를 주면 스스로 계획하고 도구를 써서 일을 끝내는 AI예요.", glossaryId: "ai-agent" },
      { term: "워크플로 자동화", text: "어떤 일이 생기면 정해 둔 작업이 저절로 이어지게 묶는 거예요.", glossaryId: "workflow-automation" },
    ],
    options: [
      { id: "none", label: "아직 써 본 적 없어요", points: 0 },
      { id: "basic", label: "요약·번역·글 다듬기에 써요", points: 1 },
      {
        id: "files",
        label: "내 자료를 올려 분석이나 정리를 맡겨요",
        description: "예: PDF 보고서 요약, 엑셀 표 정리",
        points: 2,
      },
      {
        id: "multi",
        label: "일에 맞게 여러 AI 도구를 골라 써요",
        description: "예: 글은 챗봇, 이미지와 회의록은 각각 다른 도구",
        points: 3,
      },
      {
        id: "agent",
        label: "AI 에이전트에게 여러 단계짜리 일을 맡겨 봤어요",
        description: "예: 자료 조사부터 보고서 초안까지 한 번에",
        points: 4,
      },
      {
        id: "workflow",
        label: "반복 업무를 AI로 자동화해 두고 써요",
        description: "예: 메일이 오면 AI가 요약해 메신저로 보내기",
        points: 5,
      },
    ],
  },
  {
    id: "lv_connect",
    step: "level",
    type: "single",
    title: "AI를 다른 앱이나 프로그램과 연결해 본 적 있나요?",
    subtitle: PICK_DEEPEST,
    hints: [
      { term: "API", text: "프로그램끼리 정보와 기능을 주고받는 약속된 통로예요.", glossaryId: "api" },
      { term: "노코드 자동화", text: "코딩 없이 클릭과 말로 반복 업무를 자동화하는 거예요.", glossaryId: "no-code-automation" },
    ],
    options: [
      { id: "none", label: "아직 없어요", points: 0 },
      {
        id: "app",
        label: "챗봇에 캘린더·메일 같은 앱을 연결해 써 봤어요",
        hint: "도구 사용: AI가 검색·앱 조작 같은 바깥 기능을 불러 쓰는 거예요.",
        points: 1,
      },
      {
        id: "nocode",
        label: "자동화 서비스로 AI와 다른 앱을 이어 봤어요",
        description: "예: Zapier, Make, n8n 같은 노코드 도구",
        points: 3,
      },
      {
        id: "api",
        label: "AI API를 코드로 직접 불러 써 봤어요",
        description: "API 키를 받아 내 프로그램에서 AI를 호출하는 거예요",
        points: 5,
        signals: ["api"],
      },
    ],
  },
  {
    id: "lv_coding",
    step: "level",
    type: "single",
    title: "코딩은 어디까지 해 봤나요?",
    subtitle: PICK_DEEPEST,
    hints: [
      { term: "배포", text: "만든 프로그램을 인터넷에 올려 다른 사람도 쓸 수 있게 하는 일이에요." },
    ],
    options: [
      { id: "none", label: "전혀 안 해요", points: 0 },
      {
        id: "ai_run",
        label: "AI와 함께 간단한 코드를 짜서 실행해 봤어요",
        description: "AI가 써 준 코드를 그대로 돌려 본 것도 괜찮아요",
        points: 1,
      },
      { id: "read", label: "코드를 조금 읽고 고쳐 쓸 수 있어요", points: 2 },
      { id: "build", label: "직접 프로그램을 만들 수 있어요", points: 4, signals: ["code"] },
      {
        id: "deploy",
        label: "만든 것을 배포해서 다른 사람이 쓰게 해 봤어요",
        points: 6,
        signals: ["code", "ship"],
      },
      { id: "pro", label: "개발이 직업이에요", points: 7, signals: ["code", "ship"] },
    ],
  },
  {
    id: "lv_ai_coding",
    step: "level",
    type: "single",
    title: "코드를 만들 때 AI의 도움을 받아 봤나요?",
    subtitle: "코딩을 안 한다면 첫 번째를 골라 주세요.",
    hints: [
      { term: "AI 코딩 도구", text: "코드를 쓰는 화면에서 AI가 다음 코드를 제안해 줘요. 예: GitHub Copilot, Cursor" },
      { term: "코딩 에이전트", text: "코드를 읽고 고치고 실행까지 하는 AI예요. 예: Claude Code, Codex", glossaryId: "coding-agent" },
    ],
    options: [
      { id: "none", label: "안 써 봤어요", points: 0 },
      { id: "paste", label: "챗봇에게 코드를 받아 붙여 넣어 봤어요", points: 1 },
      {
        id: "assistant",
        label: "AI 코딩 도구로 작업해 봤어요",
        description: "자동완성이나 AI 편집기처럼 코드 화면 안에서 돕는 도구",
        points: 2,
      },
      {
        id: "agent",
        label: "코딩 에이전트에게 작업을 통째로 맡겨 봤어요",
        description: "예: 기능 하나를 말로 설명하면 AI가 여러 파일을 고쳐요",
        points: 3,
      },
    ],
  },
];

/**
 * 수준 판정 (SPEC.md §1 "수준 판정" 참고). 총점 최대 26점.
 *
 *  1. developer : `code` 신호 + (총점 ≥ 15 또는 `api` 신호)
 *                 → 직접 만들 수 있고(만들기·배포·직업), AI를 깊이 쓰거나 API를 불러 본 사람
 *  2. practitioner : 총점 ≥ 10, 또는 `ship` 신호(배포 경험·현업 개발자)
 *                 → 코딩 없이도 자동화·에이전트·연결 경험으로 도달할 수 있다
 *  3. user      : 총점 ≥ 3
 *  4. beginner  : 그 외
 *
 * 코딩 신호 없이는 developer가 될 수 없다(노코드 파워 유저의 상한은 practitioner).
 */
export const LEVEL_THRESHOLDS = {
  developer: 15,
  practitioner: 10,
  user: 3,
} as const;

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

/** 고른 선택지의 신호 모음 */
export function levelSignals(answers: LevelAnswers): Set<LevelSignal> {
  return new Set(pickLevelOptions(answers).flatMap((o) => o.signals ?? []));
}

export function scoreToLevel(answers: LevelAnswers): Level {
  const total = levelScore(answers);
  const signals = levelSignals(answers);
  const T = LEVEL_THRESHOLDS;
  if (signals.has("code") && (total >= T.developer || signals.has("api"))) return "developer";
  if (total >= T.practitioner || signals.has("ship")) return "practitioner";
  if (total >= T.user) return "user";
  return "beginner";
}

/** 수준 질문 최대 총점 */
export const LEVEL_MAX_SCORE = LEVEL_QUESTIONS.reduce((n, q) => n + Math.max(...q.options.map((o) => o.points)), 0);

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
    id: "creative",
    label: DOMAIN_LABELS.creative,
    description: "그림, 썸네일, 짧은 영상을 AI로 만들고 싶어요",
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
    exclusive: true,
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
  type: "multi",
  maxSelect: MAX_GOALS,
  ordered: true,
  title: "AI로 이루고 싶은 목표는 무엇인가요?",
  subtitle: "여러 개를 골라도 좋아요. 먼저 고른 목표부터 챙겨서, 기본기부터 순서대로 담아 드려요.",
  hints: [
    { term: "에이전트", text: "목표를 주면 알아서 계획하고 도구를 써서 일을 끝내는 AI예요.", glossaryId: "ai-agent" },
  ],
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

/** 전체 질문 수 (랜딩 "질문 N개") */
export const QUESTION_COUNT = DIAGNOSIS_QUESTIONS.length;
/** 질문 하나에 드는 시간 어림값(초). 선택지 읽기 + 용어 한 입 */
export const SECONDS_PER_QUESTION = 10;
/** 예상 소요 시간(분, 반올림, 최소 1). 랜딩 "약 N분"·"N분 진단" */
export const DIAGNOSIS_MINUTES = Math.max(1, Math.round((QUESTION_COUNT * SECONDS_PER_QUESTION) / 60));

/**
 * 목표 답 → `Goal[]` (우선순위 순). 잘못되면 null.
 *  - "아직 잘 모르겠어요"(unsure) 단독 → ["understand"]
 *  - unsure를 다른 목표와 섞거나, 모르는 값, 0개 → null
 *  - 중복은 처음 나온 것만 남긴다 (순서 유지)
 */
export function parseGoals(raw: readonly string[] | undefined): Goal[] | null {
  const uniq = [...new Set(raw ?? [])];
  if (uniq.length === 1 && uniq[0] === UNSURE_ID) return ["understand"];
  if (uniq.length < 1 || uniq.length > MAX_GOALS || !uniq.every(isGoal)) return null;
  return uniq as Goal[];
}

/**
 * 모든 답을 `DiagnosisResult`로 변환한다.
 * 수준 질문은 빠져도 0점으로 계산하지만, 분야·목표·한국어 선호가
 * 없거나 잘못되면 null을 돌려준다.
 *  - 분야: 1~3개, 또는 "잘 모르겠어요"(unsure) 단독 → `domains: []` (분야 미정).
 *    아무것도 고르지 않은 것(빈 배열·없음)은 "아직 답하지 않음"이라 null.
 *    "잘 모르겠어요"와 다른 분야를 함께 보내면 잘못된 입력으로 보고 null.
 *  - 목표: 1~4개(고른 순서 = 우선순위). "잘 모르겠어요" 단독 → ["understand"].
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

  const goals = parseGoals(answers[GOAL_QUESTION.id]);
  if (!goals) return null;

  const ko = answers[PREFER_KOREAN_QUESTION.id]?.[0];
  if (ko !== "yes" && ko !== "no") return null;

  return {
    level: scoreToLevel(answers),
    domains,
    goals,
    preferKorean: ko === "yes",
  };
}
