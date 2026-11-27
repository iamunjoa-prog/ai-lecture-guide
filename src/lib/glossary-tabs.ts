/**
 * /glossary 탭(용어 | 3분 이론)과 주소 맞춤. 순수 함수만 있다.
 *
 * - 탭은 쿼리 `?tab=theory`로 정한다 (없으면 용어). 해시 `#terms`·`#theory`도 탭 이름으로 받는다.
 * - 3분 이론 개념의 앵커는 `theory-<개념 id>` (용어 id와 겹치는 개념이 있어서 접두어를 붙인다).
 * - 예전 /theory#<개념 id> 링크는 /glossary?tab=theory#<개념 id>로 넘어오므로,
 *   이론 탭에서는 접두어 없는 해시도 개념으로 읽는다. 탭이 정해지지 않았으면 용어를 먼저, 없으면 개념.
 */
export type GlossaryTab = "terms" | "theory";

export const GLOSSARY_TABS: readonly GlossaryTab[] = ["terms", "theory"];
export const THEORY_ANCHOR_PREFIX = "theory-";
export const theoryAnchorId = (conceptId: string) => `${THEORY_ANCHOR_PREFIX}${conceptId}`;
/** 수준 구역 앵커 (용어 탭 `level-<수준>`, 이론 탭 `theory-level-<수준>`) */
export const glossaryLevelAnchor = (tab: GlossaryTab, level: string) => (tab === "theory" ? `theory-level-${level}` : `level-${level}`);

/** 이론 탭 주소 (개념 id를 주면 그 개념으로) */
export const theoryHref = (opts: { level?: string; conceptId?: string } = {}) =>
  `/glossary?tab=theory${opts.level ? `&l=${opts.level}` : ""}${opts.conceptId ? `#${theoryAnchorId(opts.conceptId)}` : ""}`;

export function parseGlossaryTab(v: string | string[] | undefined | null): GlossaryTab {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "theory" ? "theory" : "terms";
}

export interface HashTarget {
  tab: GlossaryTab;
  /** 펼치고 스크롤할 요소 id (없으면 null) */
  target: string | null;
}

/** 주소 해시(# 포함 또는 제외) → 보여 줄 탭과 대상 요소 */
export function resolveGlossaryHash(
  rawHash: string,
  queryTab: GlossaryTab,
  termIds: ReadonlySet<string>,
  theoryIds: ReadonlySet<string>,
): HashTarget {
  let id = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  try {
    id = decodeURIComponent(id);
  } catch {
    // 잘못된 인코딩은 그대로 쓴다
  }
  if (!id) return { tab: queryTab, target: null };
  if (id === "terms" || id === "theory") return { tab: id, target: null };
  if (id.startsWith("theory-level-")) return { tab: "theory", target: id };
  if (id.startsWith("level-")) return { tab: "terms", target: id };
  if (id.startsWith(THEORY_ANCHOR_PREFIX) && theoryIds.has(id.slice(THEORY_ANCHOR_PREFIX.length))) return { tab: "theory", target: id };
  const isTerm = termIds.has(id);
  const isConcept = theoryIds.has(id);
  if (isConcept && (queryTab === "theory" || !isTerm)) return { tab: "theory", target: theoryAnchorId(id) };
  if (isTerm) return { tab: "terms", target: id };
  return { tab: queryTab, target: id };
}
