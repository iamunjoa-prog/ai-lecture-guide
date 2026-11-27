/**
 * 용어집 (G 담당). 순수 함수만 있고 I/O는 없다. 데이터는 `data/glossary.json`.
 *
 * 결과 화면 "시작 전에 알아두면 좋은 용어"는 `selectStarterTerms`로 고른다.
 *
 * 고르는 규칙
 *  - 후보: 사용자 수준과 한 단계 아래 수준의 용어 (입문자는 입문 용어만)
 *  - 점수: 고른 목표 중 하나라도 일치 3점
 *        + 로드맵 강의 `terms`에 나온 횟수 × 1점 (최대 2점)
 *        + 현재 수준 용어 2점
 *        + 꼭 알아야 할 안전 용어(ESSENTIAL_TERM_IDS) 3점
 *  - 점수 순으로 STARTER_BASE(6)개를 고르되 아래 수준 용어는 STARTER_BELOW_MAX(2)개까지,
 *    그다음 다음 수준 용어 중 목표가 맞고 로드맵 강의에 나온 것을 최대 STARTER_NEXT_MAX(2)개 더한다.
 *    → 전체 5~8개 (후보가 부족하면 아래 수준·다음 수준에서 채워 최소 STARTER_MIN을 맞춘다)
 *  - 최종 순서: 수준 낮은 순 → 점수 높은 순 → glossary.json 순서 (그룹으로 묶어 보여 주기 좋게)
 */
import type { DiagnosisResult, GlossaryTerm, Level, Video } from "../types";
import { LEVELS } from "./questions";

export const STARTER_MIN = 5;
export const STARTER_BASE = 6;
export const STARTER_BELOW_MAX = 2;
export const STARTER_NEXT_MAX = 2;
export const STARTER_MAX = STARTER_BASE + STARTER_NEXT_MAX; // 8

/** 강의 카드에 보여 줄 용어 태그 최대 개수 */
export const VIDEO_TERMS_MAX = 3;

export const STARTER_WEIGHTS = {
  goal: 3,
  roadmap: 1,
  roadmapCap: 2,
  currentLevel: 2,
  essential: 3,
} as const;

/** 수준·목표와 상관없이 먼저 알려 주고 싶은 안전 관련 용어 (입문·활용 단계에서 후보가 됨) */
export const ESSENTIAL_TERM_IDS: readonly string[] = ["hallucination", "privacy-security"];

export const GLOSSARY_LEVEL_TITLES: Record<Level, string> = {
  beginner: "입문 용어",
  user: "활용 용어",
  practitioner: "실무 용어",
  developer: "개발 용어",
};

export type GlossaryById = Record<string, GlossaryTerm>;

export function glossaryById(glossary: readonly GlossaryTerm[]): GlossaryById {
  const out: GlossaryById = {};
  for (const t of glossary) out[t.id] = t;
  return out;
}

/** 강의의 핵심 용어 (없는 id는 건너뛰고 최대 3개) */
export function termsForVideo(video: Pick<Video, "terms">, byId: GlossaryById): GlossaryTerm[] {
  const out: GlossaryTerm[] = [];
  for (const id of video.terms ?? []) {
    const t = byId[id];
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= VIDEO_TERMS_MAX) break;
  }
  return out;
}

export interface GlossaryGroup {
  level: Level;
  title: string;
  terms: GlossaryTerm[];
}

/** 입문 → 개발 순서로 묶는다. 그룹 안은 glossary.json 순서. 빈 그룹은 뺀다. */
export function groupByLevel(glossary: readonly GlossaryTerm[]): GlossaryGroup[] {
  return LEVELS.map((level) => ({
    level,
    title: GLOSSARY_LEVEL_TITLES[level],
    terms: glossary.filter((t) => t.level === level),
  })).filter((g) => g.terms.length > 0);
}

const levelIndex = (l: Level) => LEVELS.indexOf(l);

/** 로드맵 강의들의 terms에서 용어 id별 등장 횟수 */
function roadmapCounts(videos: readonly Video[] | undefined): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of videos ?? []) {
    for (const id of new Set(v.terms ?? [])) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export function starterScore(
  term: GlossaryTerm,
  diagnosis: DiagnosisResult,
  counts: Map<string, number> = new Map(),
): number {
  const W = STARTER_WEIGHTS;
  let s = 0;
  if (diagnosis.goals.some((g) => term.goals.includes(g))) s += W.goal;
  s += W.roadmap * Math.min(counts.get(term.id) ?? 0, W.roadmapCap);
  if (term.level === diagnosis.level) s += W.currentLevel;
  if (ESSENTIAL_TERM_IDS.includes(term.id)) s += W.essential;
  return s;
}

/** 시작 전에 알아두면 좋은 용어 5~8개 */
export function selectStarterTerms(
  diagnosis: DiagnosisResult,
  glossary: readonly GlossaryTerm[],
  roadmapVideos?: readonly Video[],
): GlossaryTerm[] {
  const counts = roadmapCounts(roadmapVideos);
  const cur = levelIndex(diagnosis.level);
  const minLevel = Math.max(0, cur - 1);

  type Scored = { term: GlossaryTerm; score: number; idx: number };
  const scored: Scored[] = glossary.map((term, idx) => ({ term, score: starterScore(term, diagnosis, counts), idx }));
  const byScore = (a: Scored, b: Scored) => b.score - a.score || a.idx - b.idx;

  const base: Scored[] = [];
  let below = 0;
  for (const s of scored.filter((x) => {
    const li = levelIndex(x.term.level);
    return li >= minLevel && li <= cur;
  }).sort(byScore)) {
    if (base.length >= STARTER_BASE) break;
    const isBelow = levelIndex(s.term.level) < cur;
    if (isBelow && below >= STARTER_BELOW_MAX) continue;
    if (isBelow) below++;
    base.push(s);
  }
  // 현재 수준 용어가 모자라 자리가 남으면 아래 수준 용어로 채운다
  if (base.length < STARTER_BASE) {
    const taken = new Set(base.map((s) => s.term.id));
    base.push(
      ...scored
        .filter((x) => !taken.has(x.term.id) && levelIndex(x.term.level) === minLevel && minLevel < cur)
        .sort(byScore)
        .slice(0, STARTER_BASE - base.length),
    );
  }

  const next = scored
    .filter(
      (s) =>
        levelIndex(s.term.level) === cur + 1 &&
        (counts.get(s.term.id) ?? 0) > 0 &&
        diagnosis.goals.some((g) => s.term.goals.includes(g)),
    )
    .sort(byScore)
    .slice(0, STARTER_NEXT_MAX);

  const picked = [...base, ...next];

  // 후보가 모자라면(작은 용어집) 더 아래 수준 → 다음 수준 순으로 채운다
  if (picked.length < STARTER_MIN) {
    const taken = new Set(picked.map((s) => s.term.id));
    const fill = scored
      .filter((s) => !taken.has(s.term.id) && levelIndex(s.term.level) <= cur + 1)
      .sort((a, b) => {
        const da = levelIndex(a.term.level) > cur ? 1 : 0;
        const db = levelIndex(b.term.level) > cur ? 1 : 0;
        return da - db || byScore(a, b);
      });
    picked.push(...fill.slice(0, STARTER_MIN - picked.length));
  }

  return picked
    .sort((a, b) => levelIndex(a.term.level) - levelIndex(b.term.level) || byScore(a, b))
    .map((s) => s.term);
}
