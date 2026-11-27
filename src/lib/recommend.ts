/**
 * 규칙 기반 추천 (SPEC.md §4). 순수 함수만 있고 I/O는 없다.
 *
 * score = 4·[level ∈ video.levels]
 *       + 분야: 첫 일치 2 + 이후 일치마다 1
 *       + 목표: 1순위 목표 일치 4, (1순위는 아니고) 다른 고른 목표 일치 3,
 *               고른 목표 2개 이상 일치 시 +1 (최대 +1)
 *       + 1·[preferKorean && (language=ko || hasKoreanSubtitle)]
 *
 * 로드맵 구성 규칙
 *  - 단계: "기초 다지기"(현재 수준보다 낮은 수준) → "실전 활용"(현재 수준) → "한 단계 더"(다음 수준)
 *  - 입문자(beginner)는 아래 수준이 없으므로 예외로 처리한다:
 *      "기초 다지기" = beginner 강의, "실전 활용" = user 강의. ("한 단계 더"는 두지 않는다.)
 *  - developer는 다음 수준이 없으므로 "한 단계 더"를 두지 않는다.
 *  - 단계당 최대 개수: 기초 2(입문자는 3) · 실전 3(목표 3개 이상이면 4) · 한 단계 더 2. 빈 단계는 뺀다.
 *  - 고르는 순서: 실전 → 기초 → 한 단계 더 (입문자는 기초 → 실전).
 *    앞 단계에서 고른 강의는 뒤 단계에서 다시 쓰지 않는다.
 *  - 기초 다지기: 고른 목표 중 하나라도 맞는 기초 강의를 먼저, 모자라면 나머지 기초 강의.
 *  - 실전 활용: 고른 목표마다 그 목표에 맞는 강의가 하나 이상 들어가도록 우선순위 순서로
 *    돌아가며(round-robin) 먼저 채우고, 남은 자리는 점수 순. 단계 안은 점수 순으로 다시 정렬한다.
 *  - 전체가 MIN_TOTAL(3)개 미만이면 남은 강의 중 점수 높은 순으로 "실전 활용"에 채운다.
 *  - 정렬: 점수 내림차순 → 짧은 강의 우선 → id (결정적 결과를 위해)
 *  - 한 강사당 로드맵 전체에서 최대 2개, 같은 강의는 한 번만.
 */
import type {
  DiagnosisResult,
  Domain,
  Goal,
  Instructor,
  Level,
  Recommendation,
  Roadmap,
  Video,
} from "../types";
import { DOMAIN_LABELS, GOAL_LABELS, LEVEL_LABELS, LEVELS } from "./questions";

/**
 * 분야는 첫 일치 2점, 그 다음부터 일치마다 1점. 분야를 여러 개 고른 사람에게
 * 범용 강의가 목표에 맞는 강의를 이기지 않도록 목표(4점)보다 커지기 어렵게 한다.
 */
export const WEIGHTS = {
  level: 4,
  domain: 2,
  domainExtra: 1,
  /** 1순위 목표 일치 */
  goal: 4,
  /** 1순위가 아닌 다른 고른 목표 일치 */
  goalSecondary: 3,
  /** 고른 목표 2개 이상 일치 보너스 (최대 1번) */
  goalExtra: 1,
  korean: 1,
} as const;
export const MAX_PER_INSTRUCTOR = 2;
export const MIN_TOTAL = 3;

export type StepKind = "foundation" | "practice" | "next";

export const STEP_LABELS: Record<StepKind, string> = {
  foundation: "기초 다지기",
  practice: "실전 활용",
  next: "한 단계 더",
};

export const STEP_LIMITS: Record<StepKind, number> = {
  foundation: 2,
  practice: 3,
  next: 2,
};

/** 목표를 이만큼 이상 고르면 실전 활용 단계를 1칸 늘린다 (목표마다 강의 하나씩 담기 위해) */
export const MANY_GOALS = 3;
export const PRACTICE_LIMIT_MANY_GOALS = 4;

const STEP_ORDER: StepKind[] = ["foundation", "practice", "next"];

// ---------------------------------------------------------------------------
// 점수
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  total: number;
  levelMatch: boolean;
  matchedDomains: Domain[];
  /** 고른 목표 중 하나라도 맞음 */
  goalMatch: boolean;
  /** 1순위 목표가 맞음 */
  primaryGoalMatch: boolean;
  /** 맞은 목표 (우선순위 순) */
  matchedGoals: Goal[];
  koreanMatch: boolean;
}

export function isKoreanFriendly(video: Video): boolean {
  return video.language === "ko" || video.hasKoreanSubtitle;
}

export function scoreBreakdown(diagnosis: DiagnosisResult, video: Video): ScoreBreakdown {
  const levelMatch = video.levels.includes(diagnosis.level);
  const matchedDomains = diagnosis.domains.filter((d) => video.domains.includes(d));
  const matchedGoals = diagnosis.goals.filter((g) => video.goals.includes(g));
  const goalMatch = matchedGoals.length > 0;
  const primaryGoalMatch = diagnosis.goals.length > 0 && video.goals.includes(diagnosis.goals[0]);
  const koreanMatch = diagnosis.preferKorean && isKoreanFriendly(video);
  const goalPoints = !goalMatch
    ? 0
    : (primaryGoalMatch ? WEIGHTS.goal : WEIGHTS.goalSecondary) + (matchedGoals.length >= 2 ? WEIGHTS.goalExtra : 0);
  const total =
    (levelMatch ? WEIGHTS.level : 0) +
    (matchedDomains.length > 0 ? WEIGHTS.domain + WEIGHTS.domainExtra * (matchedDomains.length - 1) : 0) +
    goalPoints +
    (koreanMatch ? WEIGHTS.korean : 0);
  return { total, levelMatch, matchedDomains, goalMatch, primaryGoalMatch, matchedGoals, koreanMatch };
}

export function scoreVideo(diagnosis: DiagnosisResult, video: Video): number {
  return scoreBreakdown(diagnosis, video).total;
}

/** 점수 내림차순 → 짧은 강의 → id 순 비교 함수 */
function compareScored(a: Scored, b: Scored): number {
  return (
    b.score.total - a.score.total ||
    a.video.durationMin - b.video.durationMin ||
    (a.video.id < b.video.id ? -1 : a.video.id > b.video.id ? 1 : 0)
  );
}

// ---------------------------------------------------------------------------
// 추천 사유
// ---------------------------------------------------------------------------

/** 마지막 글자에 받침이 있는지 (한글이 아니면 false) */
function hasBatchim(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** 받침에 따라 조사 선택: josa("입문자", "이", "가") → "입문자가" */
export function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}

function joinDomains(domains: Domain[]): string {
  const labels = domains.map((d) => DOMAIN_LABELS[d]);
  if (labels.length <= 1) return labels[0] ?? "";
  const head = labels.slice(0, -1).map((l, i, arr) => (i === arr.length - 1 ? josa(l, "과", "와") : l));
  // 3개일 때: "A, B와 C"
  return `${head.join(", ")} ${labels[labels.length - 1]}`;
}

/** "'업무 도구로 쓰기'와 '나만의 에이전트 만들기'", 3개면 "'A', 'B'와 'C'" */
function joinGoals(goals: Goal[]): string {
  const labels = goals.map((g) => GOAL_LABELS[g]);
  const q = (l: string) => `'${l}'`;
  if (labels.length <= 1) return labels.map(q).join("");
  const last = labels[labels.length - 1];
  const head = labels.slice(0, -1).map((l, i, arr) => (i === arr.length - 1 ? q(l) + (hasBatchim(l) ? "과" : "와") : q(l)));
  return `${head.join(", ")} ${q(last)}`;
}

/** "~하고 싶은" 형태의 목표 수식어 */
const GOAL_PHRASES: Record<Goal, string> = {
  understand: "AI 개념을 제대로 이해하고 싶은",
  use_tools: "AI를 업무 도구로 쓰고 싶은",
  build_agents: "나만의 에이전트를 만들고 싶은",
  build_products: "AI로 제품을 만들고 싶은",
};

/** 목표가 맞았을 때 붙이는 두 번째 문장 */
const GOAL_BENEFITS: Record<Goal, string> = {
  understand: "개념 이해에 도움이 돼요.",
  use_tools: "바로 업무에 써먹을 수 있어요.",
  build_agents: "에이전트를 만드는 감을 잡을 수 있어요.",
  build_products: "AI 제품을 만드는 데 큰 힘이 돼요.",
};

/**
 * 진단 결과와 강의를 연결하는 한국어 추천 사유.
 * 맞은 요소(분야·목표·한국어)와 단계에 따라 문장을 바꾼다.
 */
export function buildReason(
  diagnosis: DiagnosisResult,
  video: Video,
  step: StepKind = "practice",
): string {
  const s = scoreBreakdown(diagnosis, video);
  const level = LEVEL_LABELS[diagnosis.level];
  const sentences: string[] = [];
  // 맞은 목표 중 우선순위가 가장 높은 것
  const topGoal = s.matchedGoals[0];

  // 첫 문장: 단계 + 분야/목표
  const domainPart = s.matchedDomains.length > 0 ? `${joinDomains(s.matchedDomains)}에 AI를 적용하려는` : "";
  if (step === "foundation") {
    if (domainPart) sentences.push(`${domainPart} ${josa(level, "이", "가")} 기초를 탄탄히 다지기 좋은 강의예요.`);
    else if (s.goalMatch) sentences.push(`${GOAL_PHRASES[topGoal]} ${josa(level, "이", "가")} 먼저 들어 두면 좋은 강의예요.`);
    else sentences.push("본격적으로 시작하기 전에 기본기를 채워 주는 강의예요.");
  } else if (step === "next") {
    if (domainPart) sentences.push(`${domainPart} ${josa(level, "이", "가")} 한 단계 더 성장하기 좋은 강의예요.`);
    else if (s.goalMatch) sentences.push(`${GOAL_PHRASES[topGoal]} ${josa(level, "이", "가")} 다음으로 도전해 볼 만한 강의예요.`);
    else sentences.push("조금 더 깊이 들어가고 싶을 때 도전해 볼 만한 강의예요.");
  } else {
    if (domainPart) sentences.push(`${domainPart} ${level}에게 딱 맞는 강의예요.`);
    else if (s.goalMatch) sentences.push(`${GOAL_PHRASES[topGoal]} ${level}에게 추천하는 강의예요.`);
    else if (s.levelMatch) sentences.push(`지금 ${level} 단계에서 듣기 좋은 강의예요.`);
    else sentences.push("AI를 넓게 이해하는 데 도움이 되는 강의예요.");
  }

  // 두 번째 문장: 고른 목표 여러 개에 맞으면 그 목표들을, 하나만 맞고 첫 문장에 목표를 쓰지 않았으면 효용을 덧붙인다
  if (s.matchedGoals.length >= 2) sentences.push(`고르신 목표 중 ${joinGoals(s.matchedGoals)}에 함께 도움이 돼요.`);
  else if (s.goalMatch && domainPart) sentences.push(GOAL_BENEFITS[topGoal]);

  // 세 번째 문장: 한국어 선호
  if (s.koreanMatch) {
    sentences.push(
      video.language === "ko"
        ? "한국어 강의라 편하게 들을 수 있어요."
        : "한국어 자막이 있어 부담 없이 볼 수 있어요.",
    );
  }

  return sentences.join(" ");
}

// ---------------------------------------------------------------------------
// 로드맵
// ---------------------------------------------------------------------------

interface Scored {
  video: Video;
  instructor: Instructor;
  score: ScoreBreakdown;
}

/** 각 단계가 받을 수 있는 수준 목록 */
function stepLevels(level: Level): Partial<Record<StepKind, { strict: Level[]; loose?: Level[] }>> {
  const idx = LEVELS.indexOf(level);
  if (idx === 0) {
    // 입문자 예외: 기초 = beginner, 실전 = user
    return {
      foundation: { strict: ["beginner"] },
      practice: { strict: [LEVELS[1]] },
    };
  }
  const below = LEVELS.slice(0, idx);
  const plan: Partial<Record<StepKind, { strict: Level[]; loose?: Level[] }>> = {
    // 기초: 현재 수준 강의는 빼되, 그런 강의가 없으면 현재 수준 강의도 허용
    foundation: { strict: below, loose: [...below, level] },
    practice: { strict: [level] },
  };
  if (idx < LEVELS.length - 1) plan.next = { strict: [LEVELS[idx + 1]] };
  return plan;
}

export function buildRoadmap(
  diagnosis: DiagnosisResult,
  videos: Video[],
  instructors: Instructor[],
): Roadmap {
  const byId = new Map(instructors.map((i) => [i.id, i]));
  const seenVideo = new Set<string>();
  const pool: Scored[] = [];
  for (const video of videos) {
    const instructor = byId.get(video.instructorId);
    if (!instructor || seenVideo.has(video.id)) continue; // 강사 없는 강의·중복 강의 제외
    seenVideo.add(video.id);
    pool.push({ video, instructor, score: scoreBreakdown(diagnosis, video) });
  }
  pool.sort(compareScored);

  const used = new Set<string>();
  const perInstructor = new Map<string, number>();
  const canUse = (s: Scored) =>
    !used.has(s.video.id) && (perInstructor.get(s.instructor.id) ?? 0) < MAX_PER_INSTRUCTOR;
  const take = (s: Scored) => {
    used.add(s.video.id);
    perInstructor.set(s.instructor.id, (perInstructor.get(s.instructor.id) ?? 0) + 1);
  };
  const pick = (filter: (s: Scored) => boolean, limit: number): Scored[] => {
    const out: Scored[] = [];
    for (const s of pool) {
      if (out.length >= limit) break;
      if (canUse(s) && filter(s)) {
        take(s);
        out.push(s);
      }
    }
    return out;
  };

  const plan = stepLevels(diagnosis.level);
  const isBeginner = diagnosis.level === "beginner";
  const hasAny = (levels: Level[]) => (s: Scored) => s.video.levels.some((l) => levels.includes(l));
  const picked: Record<StepKind, Scored[]> = { foundation: [], practice: [], next: [] };
  // 입문자에게는 기초(beginner)가 핵심 단계라 3개까지 허용한다.
  // 목표를 3개 이상 고르면 목표마다 하나씩 담을 수 있게 실전 활용을 4개까지 허용한다.
  const limitOf = (k: StepKind) => {
    if (k === "foundation" && isBeginner) return 3;
    if (k === "practice" && diagnosis.goals.length >= MANY_GOALS) return PRACTICE_LIMIT_MANY_GOALS;
    return STEP_LIMITS[k];
  };

  // 기초·심화 단계는 분야가 하나라도 맞는 강의를 우선한다. 목표만 맞는 강의는
  // 분야 일치 강의가 하나도 없을 때만 쓴다 (예: 개발자 기초에 비개발자용 강의가 끼는 것 방지).
  const domainMatch = (s: Scored) => s.video.domains.some((d) => diagnosis.domains.includes(d));
  const pickRelevant = (filter: (s: Scored) => boolean, limit: number): Scored[] => {
    const first = pick((s) => filter(s) && domainMatch(s), limit);
    return first.length > 0 ? first : pick(filter, limit);
  };

  // 기초 다지기: 고른 목표 중 하나라도 맞는 기초 강의를 먼저 담고, 모자라면 나머지 기초 강의로 채운다.
  const goalRelated = (s: Scored) => s.score.goalMatch;
  const pickFoundationFrom = (filter: (s: Scored) => boolean, relevant: typeof pick): Scored[] => {
    const limit = limitOf("foundation");
    const first = relevant((s) => filter(s) && goalRelated(s), limit);
    if (first.length >= limit) return first;
    return [...first, ...relevant(filter, limit - first.length)].sort(compareScored);
  };

  const pickFoundation = () => {
    if (!plan.foundation) return;
    const { strict, loose } = plan.foundation;
    if (isBeginner) {
      picked.foundation = pickFoundationFrom(hasAny(strict), pick);
      return;
    }
    // 현재 수준이 섞이지 않은 강의(아래 수준 전용) 우선, 없으면 현재 수준 포함 강의도 허용
    picked.foundation = pickFoundationFrom((s) => s.video.levels.every((l) => strict.includes(l)), pickRelevant);
    if (picked.foundation.length === 0 && loose) {
      picked.foundation = pickFoundationFrom(hasAny(loose), pickRelevant);
    }
  };

  // 실전 활용: 고른 목표마다 하나씩(우선순위 순서로 돌아가며) 먼저 담고, 남은 자리는 점수 순
  const pickPractice = () => {
    if (!plan.practice) return;
    const inLevel = hasAny(plan.practice.strict);
    const limit = limitOf("practice");
    const out: Scored[] = [];
    for (const g of diagnosis.goals) {
      if (out.length >= limit) break;
      if (out.some((s) => s.video.goals.includes(g))) continue; // 이미 담긴 강의가 이 목표도 다룬다
      out.push(...pick((s) => inLevel(s) && s.video.goals.includes(g), 1));
    }
    out.push(...pick(inLevel, limit - out.length));
    picked.practice = out.sort(compareScored);
  };

  // 고르는 순서 = 중요도 순서. 입문자는 기초가, 나머지는 실전이 가장 중요하다.
  if (isBeginner) {
    pickFoundation();
    pickPractice();
  } else {
    pickPractice();
    pickFoundation();
  }
  if (plan.next) picked.next = pickRelevant(hasAny(plan.next.strict), limitOf("next"));

  // 전체가 MIN_TOTAL 미만이면 남은 강의 중 점수 높은 순으로 "실전 활용"에 채운다.
  // (전체가 3개 미만이면 실전 단계에는 항상 자리가 있다.)
  const total = () => STEP_ORDER.reduce((n, k) => n + picked[k].length, 0);
  for (const s of pool) {
    if (total() >= MIN_TOTAL) break;
    if (!canUse(s)) continue;
    take(s);
    picked.practice.push(s);
  }

  const steps = STEP_ORDER.filter((k) => picked[k].length > 0).map((k) => ({
    label: STEP_LABELS[k],
    items: picked[k].map(
      (s): Recommendation => ({
        video: s.video,
        instructor: s.instructor,
        score: s.score.total,
        reason: buildReason(diagnosis, s.video, k),
      }),
    ),
  }));

  return { diagnosis, steps };
}
