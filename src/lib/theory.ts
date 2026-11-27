/**
 * '3분 이론' (진단 후 짧은 개념 읽기). 순수 함수만 있고 I/O는 없다. 데이터는 `data/theory.json`.
 *
 * 고르는 규칙 (`selectTheory`)
 *  - 사용자 수준의 개념만 쓴다. 다른 수준 개념은 절대 섞지 않는다.
 *  - 1번: 그 수준의 core 개념
 *  - 2~3번: 고른 목표(goals)에 맞는 개념. 목표 우선순위 순서로 돌아가며(round-robin)
 *    목표마다 theory.json 순서상 다음 개념을 하나씩 담는다 (중복 제외)
 *  - 모자라면 같은 수준의 나머지 개념을 theory.json 순서대로 채운다
 *  → 데이터가 충분하면 항상 THEORY_COUNT(3)개, 결과는 결정적이다.
 *
 * 강의 연결 (`lecturesForConcept`)
 *  - 강의 `terms`와 개념 `termIds`가 겹치는 강의만 후보
 *  - 로드맵에 있는 강의 우선 (로드맵 순서), 그다음 전체 강의
 *    (겹치는 용어 수 많은 순 → 개념 수준에 맞는 강의 → videos.json 순서)
 */
import type { DiagnosisResult, Level, TheoryConcept, Video } from "../types";
import { LEVELS } from "./questions";

export const THEORY_COUNT = 3;
export const THEORY_LECTURES_MAX = 2;

export const THEORY_LEVEL_TITLES: Record<Level, string> = {
  beginner: "입문 이론",
  user: "활용 이론",
  practitioner: "실무 이론",
  developer: "개발 이론",
};

export function selectTheory(
  diagnosis: Pick<DiagnosisResult, "level" | "goals">,
  concepts: readonly TheoryConcept[],
  count: number = THEORY_COUNT,
): TheoryConcept[] {
  const same = concepts.filter((c) => c.level === diagnosis.level);
  const picked: TheoryConcept[] = [];
  const push = (c: TheoryConcept | undefined) => {
    if (c && picked.length < count && !picked.includes(c)) picked.push(c);
  };
  push(same.find((c) => c.core));
  const queues = diagnosis.goals.map((g) => same.filter((c) => !c.core && c.goals.includes(g)));
  for (let round = 0; picked.length < count && queues.some((q) => q.length > round); round++) {
    for (const q of queues) {
      // 이 목표의 다음 후보 중 아직 안 담긴 첫 개념
      push(q.slice(round).find((c) => !picked.includes(c)));
    }
  }
  for (const c of same) push(c);
  return picked;
}

export interface ConceptLecture {
  video: Video;
  /** 사용자의 로드맵에 있는 강의면 true (카드로 스크롤), 아니면 유튜브 새 탭 */
  inRoadmap: boolean;
}

export function lecturesForConcept(
  concept: Pick<TheoryConcept, "termIds" | "level">,
  roadmapVideos: readonly Video[],
  allVideos: readonly Video[],
  max: number = THEORY_LECTURES_MAX,
): ConceptLecture[] {
  const ids = new Set(concept.termIds);
  const overlap = (v: Video) => new Set((v.terms ?? []).filter((t) => ids.has(t))).size;
  const out: ConceptLecture[] = [];
  const seen = new Set<string>();

  for (const v of roadmapVideos) {
    if (out.length >= max) break;
    if (seen.has(v.id) || overlap(v) === 0) continue;
    seen.add(v.id);
    out.push({ video: v, inRoadmap: true });
  }
  if (out.length < max) {
    const rest = allVideos
      .map((v, idx) => ({ v, idx, n: overlap(v), lv: v.levels.includes(concept.level) ? 1 : 0 }))
      .filter((x) => x.n > 0 && !seen.has(x.v.id))
      .sort((a, b) => b.n - a.n || b.lv - a.lv || a.idx - b.idx);
    for (const x of rest) {
      if (out.length >= max) break;
      seen.add(x.v.id);
      out.push({ video: x.v, inRoadmap: false });
    }
  }
  return out;
}

export interface TheoryGroup {
  level: Level;
  title: string;
  concepts: TheoryConcept[];
}

/** 입문 → 개발 순서. 그룹 안은 core 먼저, 나머지는 theory.json 순서. 빈 그룹은 뺀다 */
export function groupTheoryByLevel(concepts: readonly TheoryConcept[]): TheoryGroup[] {
  return LEVELS.map((level) => {
    const list = concepts.filter((c) => c.level === level);
    return {
      level,
      title: THEORY_LEVEL_TITLES[level],
      concepts: [...list.filter((c) => c.core), ...list.filter((c) => !c.core)],
    };
  }).filter((g) => g.concepts.length > 0);
}

/** 로드맵 강의 카드의 앵커 id */
export function lectureAnchorId(videoId: string): string {
  return `lecture-${videoId}`;
}
