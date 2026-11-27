/**
 * '요즘 주목받는 AI 스킬' (AI를 써 본 사람에게 다음에 익힐 실전 스킬을 추천).
 * 순수 함수만 있고 I/O는 없다. 데이터는 `data/skills.json`, 근거 기록은 `data/SKILLS_RESEARCH.md`.
 *
 * 고르는 규칙 (`selectSkills`)
 *  - 입문자(beginner)는 빈 배열: 기본기부터 익히도록 한다.
 *  - 정렬 기준 (앞이 우선):
 *    1) 사용자 수준이 스킬 levels에 들어 있는가
 *    2) 목표 점수: 1순위 목표(goals[0])가 맞으면 +2, 나머지 고른 목표가 하나 맞을 때마다 +1
 *    3) 분야 겹침 수
 *    4) skills.json 순서 (안정 정렬 → 결과는 결정적)
 */
import type { DiagnosisResult, Domain, Goal, Level, Video } from "../types";

export interface SkillSource {
  title: string;
  url: string;
  publisher: string;
  /** 원문 확인: 원문을 직접 내려받아 읽음 · 검색 확인: 웹 검색 결과로만 확인 */
  checked: "원문 확인" | "검색 확인";
}

export interface TrendingSkill {
  id: string; // kebab-case
  name: string; // ≤ 20자
  tagline: string; // ≤ 45자
  whyNow: string; // 2~3문장, 출처가 있는 '왜 지금' 설명
  whatYouCanDo: string[]; // 구체적 결과 3개 ("~할 수 있어요")
  levels: Level[]; // user/practitioner/developer 중 일부 (beginner 제외)
  goals: Goal[];
  domains?: Domain[];
  lectureIds: string[]; // data/videos.json의 강의 id 1~4개
  termIds: string[]; // data/glossary.json의 용어 id 1~3개
  theoryIds?: string[]; // data/theory.json의 개념 id
  firstStep: { label: string; prompt: string }; // 어떤 AI 챗봇에도 붙여 넣을 수 있는 시작 프롬프트 (≤ 350자)
  sources: SkillSource[]; // 2개 이상
  asOf: string; // "YYYY-MM"
}

export const SKILLS_MAX = 3;
export const SKILL_NAME_MAX = 20;
export const SKILL_TAGLINE_MAX = 45;
export const SKILL_PROMPT_MAX = 350;
export const SKILL_LECTURES_MAX = 4;
export const SKILL_TERMS_MAX = 3;
export const SKILL_LEVELS: readonly Level[] = ["user", "practitioner", "developer"];

/** 글자 수 (서로게이트 쌍을 한 글자로) */
export const charCount = (s: string) => [...s].length;

function goalScore(skill: Pick<TrendingSkill, "goals">, goals: readonly Goal[]): number {
  let score = 0;
  goals.forEach((g, i) => {
    if (skill.goals.includes(g)) score += i === 0 ? 2 : 1;
  });
  return score;
}

export function selectSkills(
  diagnosis: Pick<DiagnosisResult, "level" | "goals" | "domains">,
  skills: readonly TrendingSkill[],
  max: number = SKILLS_MAX,
): TrendingSkill[] {
  if (diagnosis.level === "beginner" || max <= 0) return [];
  const goals = diagnosis.goals ?? [];
  const domains = new Set(diagnosis.domains ?? []);
  return skills
    .map((s, idx) => ({
      s,
      idx,
      lv: s.levels.includes(diagnosis.level) ? 1 : 0,
      goal: goalScore(s, goals),
      dom: (s.domains ?? []).filter((d) => domains.has(d)).length,
    }))
    .sort((a, b) => b.lv - a.lv || b.goal - a.goal || b.dom - a.dom || a.idx - b.idx)
    .slice(0, max)
    .map((x) => x.s);
}

/** id → 강의 색인 */
export function indexVideos(videos: readonly Video[]): ReadonlyMap<string, Video> {
  return new Map(videos.map((v) => [v.id, v]));
}

/** 스킬에 연결된 강의 (lectureIds 순서, 없는 id는 건너뜀) */
export function lecturesForSkill(
  skill: Pick<TrendingSkill, "lectureIds">,
  videosById: ReadonlyMap<string, Video>,
): Video[] {
  const out: Video[] = [];
  for (const id of skill.lectureIds) {
    const v = videosById.get(id);
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}
