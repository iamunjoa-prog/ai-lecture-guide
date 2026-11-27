import type { DiagnosisResult, Goal, Level } from "@/types";

export type AffiliateLabel = "책" | "유료 강의" | "도구";

export interface AffiliateItem {
  id: string;
  title: string;
  description: string;
  /** https 링크(제휴 추적 URL) */
  url: string;
  label: AffiliateLabel;
  merchant: string;
  levels?: Level[];
  goals?: Goal[];
  /** 제휴 프로그램이 요구하는 고지 문구가 있으면 기본 문구에 더해 표시한다 */
  disclosure?: string;
}

export const AFFILIATE_DEFAULT_DISCLOSURE =
  "이 영역의 링크로 구매하시면 운영자가 일정액의 수수료를 받을 수 있으며, 구매 가격에는 영향이 없습니다.";

/**
 * 진단 결과에 맞는 제휴 항목을 최대 max개 고른다.
 * 점수: 수준 일치 2 + 목표 일치(고른 목표 중 하나라도) 1. levels/goals를 비우면 "누구에게나" 해당(점수 0).
 * 수준·목표를 지정했는데 둘 다 맞지 않으면 제외한다. 동점이면 목록 순서를 지킨다.
 */
export function selectAffiliate(diagnosis: DiagnosisResult, items: readonly AffiliateItem[], max = 2): AffiliateItem[] {
  const scored: { item: AffiliateItem; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    const hasLevels = !!item.levels && item.levels.length > 0;
    const hasGoals = !!item.goals && item.goals.length > 0;
    const levelHit = hasLevels && item.levels!.includes(diagnosis.level);
    const goalHit = hasGoals && diagnosis.goals.some((g) => item.goals!.includes(g));
    if ((hasLevels || hasGoals) && !levelHit && !goalHit) return;
    scored.push({ item, score: (levelHit ? 2 : 0) + (goalHit ? 1 : 0), index });
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, Math.max(0, max)).map((s) => s.item);
}
