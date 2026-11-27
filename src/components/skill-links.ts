import type { GlossaryTerm, Instructor, Level, Video } from "@/types";
import { lecturesForSkill, type TrendingSkill } from "@/lib/skills";
import { lectureAnchorId } from "@/lib/theory";

export interface SkillLectureLink {
  videoId: string;
  title: string;
  instructorName: string;
  /** 로드맵 카드 앵커 또는 유튜브 URL */
  href: string;
  external: boolean;
}

/** "2026-11" → "2026년 11월 기준" */
export function formatAsOf(asOf: string): string {
  const m = asOf.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}년 ${Number(m[2])}월 기준` : `${asOf} 기준`;
}

/** 여러 스킬 중 가장 최근 기준 월 */
export function latestAsOf(skills: readonly Pick<TrendingSkill, "asOf">[]): string | undefined {
  return skills.map((s) => s.asOf).sort().at(-1);
}

/** 스킬 관련 강의 링크: 로드맵에 있으면 카드 앵커, 없으면 유튜브 새 탭 */
export function skillLectureLinks(
  skill: TrendingSkill,
  videosById: ReadonlyMap<string, Video>,
  instructors: readonly Instructor[],
  roadmapIds: ReadonlySet<string> = new Set(),
): SkillLectureLink[] {
  return lecturesForSkill(skill, videosById).map((v) => {
    const inRoadmap = roadmapIds.has(v.id);
    return {
      videoId: v.id,
      title: v.title,
      instructorName: instructors.find((i) => i.id === v.instructorId)?.name ?? "",
      href: inRoadmap ? `#${lectureAnchorId(v.id)}` : v.url,
      external: !inRoadmap,
    };
  });
}

/** 스킬에 연결된 용어 (데이터에 있는 것만) */
export function skillTerms(skill: TrendingSkill, byId: Record<string, GlossaryTerm>) {
  return skill.termIds.map((id) => byId[id]).filter(Boolean).map((t) => ({ id: t.id, term: t.term }));
}

export type SkillFilter = "all" | Exclude<Level, "beginner">;

export const SKILL_FILTERS: readonly { value: SkillFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "user", label: "활용자" },
  { value: "practitioner", label: "실무자" },
  { value: "developer", label: "개발자" },
];

/** `?l=` 값 → 필터 (입문자·모르는 값은 전체) */
export function parseSkillFilter(v: string | string[] | undefined): SkillFilter {
  const s = Array.isArray(v) ? v[0] : v;
  return SKILL_FILTERS.some((f) => f.value === s) ? (s as SkillFilter) : "all";
}
