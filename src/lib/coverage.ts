/**
 * 콘텐츠 빈칸 찾기 (순수 함수).
 * 사용자가 고른 분야 × 목표 조합 가운데, 사용자 수준에 맞는 강의가 카탈로그 전체에 하나도 없는 조합을 돌려준다.
 * 추천 순위 때문에 빠진 게 아니라 '아직 공식 강의를 찾지 못한' 진짜 빈칸만 잡는다.
 * 결과 화면 비고와 data/CURATION.md 보강 목록에 쓴다.
 */
import type { DiagnosisResult, Domain, Goal, Video } from "../types";

export interface CoverageGap {
  domain: Domain;
  goal: Goal;
}

export function findCoverageGaps(
  diagnosis: Pick<DiagnosisResult, "level" | "domains" | "goals">,
  videos: readonly Video[],
): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  for (const domain of diagnosis.domains) {
    for (const goal of diagnosis.goals) {
      const covered = videos.some(
        (v) => v.levels.includes(diagnosis.level) && v.domains.includes(domain) && v.goals.includes(goal),
      );
      if (!covered) gaps.push({ domain, goal });
    }
  }
  return gaps;
}
