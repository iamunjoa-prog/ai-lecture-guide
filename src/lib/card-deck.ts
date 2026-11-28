/**
 * 결과 화면 '한 장씩 보기' 카드 덱 (순수 함수). 화면은 `src/components/CardDeck.tsx`.
 *
 * 덱 순서
 *  - 실습 덱: 로드맵 단계 순서(1단계 먼저) → 단계 안에서는 강의 순서. 미션이 없는 강의는 건너뛴다
 *    (`missionDeckOrder`). 실습 탭 목록 보기의 단계별 순서와 같다.
 *  - 준비/개념 덱 (`prepDeckOrder`):
 *      개념이 주인공(theory · practice_theory) → 3분 이론 개념 먼저, 그다음 용어 (고른 것이 개념이라서)
 *      그 밖(lectures · practice · all)       → 용어 먼저(한 줄짜리라 가벼운 몸풀기), 그다음 개념
 *    용어 카드는 시작 전 용어 중 처음 `INITIAL_TERMS`(4)개만 (내 학습 여정 1단계가 세는 용어와 같다).
 *    나머지 용어는 목록 보기·용어집에 있다.
 *
 * 어디서 시작하나 (`resolveDeckStart`)
 *  1) 주소 해시가 덱의 카드를 가리키면 그 카드 (#mission-… · #theory-… · #term-… · #practice-group-n)
 *  2) 이 진단에서 마지막으로 보던 카드 (브라우저 저장, '이어서 보기')
 *  3) 아직 끝내지 않은 첫 카드 (실습 '완료' · 개념 '읽었어요'. 용어는 끝낼 수 없어 늘 '아직')
 *     → 실습 위주 공부 방법의 '이번 주 실습 미션'도 같은 규칙(`firstOpenIndex`)이라 덱·여정·목록이 어긋나지 않는다
 *  4) 모두 끝냈으면 끝 카드
 *  서버·하이드레이션 중에는 늘 첫 카드(0)로 그리고, 브라우저 저장을 읽은 뒤 옮긴다.
 *
 * 저장 형식 (localStorage `aig:deck:v1`, 내 학습함과 따로 — 내보내기·배지와 상관없는 화면 편의 정보)
 *  { version: 1, positions: { [진단별 덱 키]: { id | null(끝 카드), index, at } }, views: { practice?, prep? } }
 *  - 진단별 덱 키 = "{덱 종류}:{결과 주소 쿼리}". 최근 DECK_MAX_POSITIONS개만 남긴다.
 *  - views = '전체 목록 보기' / '한 장씩 보기' 선택 (덱 종류마다, 진단과 상관없이 기억)
 *  - 읽을 때 항상 검증(틀린 항목만 버림). 저장소가 막혀 있어도 덱은 그대로 동작한다(기억만 못 한다).
 */
import type { StudyStyle } from "../types";
import { isTheoryStyle } from "./study-style";

export const DECK_STORAGE_KEY = "aig:deck:v1";
export const DECK_MAX_POSITIONS = 40;

export type DeckKind = "practice" | "prep";
export type DeckView = "deck" | "list";
export const DEFAULT_DECK_VIEW: DeckView = "deck";

export interface DeckPosition {
  /** 보던 카드 id. null이면 끝 카드 */
  id: string | null;
  index: number;
  at: string;
}

export interface DeckMemory {
  version: 1;
  positions: Record<string, DeckPosition>;
  views: Partial<Record<DeckKind, DeckView>>;
}

export function emptyDeckMemory(): DeckMemory {
  return { version: 1, positions: {}, views: {} };
}

const KEY_RE = /^(practice|prep):[A-Za-z0-9_=&%,.\-/?]{1,300}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,120}$/;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** 진단별 덱 키. 예: deckKey("practice", "/result?l=user&d=marketing") → "practice:l=user&d=marketing" */
export function deckKey(kind: DeckKind, diagnosisHref: string): string {
  const q = diagnosisHref.includes("?") ? diagnosisHref.slice(diagnosisHref.indexOf("?") + 1) : diagnosisHref;
  return `${kind}:${q.slice(0, 300) || "-"}`;
}

/** 어떤 값이든 받아 올바른 DeckMemory로 (JSON 문자열이면 먼저 파싱). 틀린 항목은 버린다 */
export function parseDeckMemory(input: unknown): DeckMemory {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return emptyDeckMemory();
    }
  }
  if (!isRecord(raw) || raw.version !== 1) return emptyDeckMemory();
  const out = emptyDeckMemory();
  if (isRecord(raw.positions)) {
    for (const [k, v] of Object.entries(raw.positions)) {
      if (!KEY_RE.test(k) || !isRecord(v)) continue;
      const id = v.id === null ? null : typeof v.id === "string" && ID_RE.test(v.id) ? v.id : undefined;
      const index =
        typeof v.index === "number" && Number.isInteger(v.index) && v.index >= 0 && v.index < 1000 ? v.index : undefined;
      const at = typeof v.at === "string" && v.at.length <= 40 && !Number.isNaN(Date.parse(v.at)) ? v.at : undefined;
      if (id === undefined || index === undefined || at === undefined) continue;
      out.positions[k] = { id, index, at };
    }
    out.positions = trimPositions(out.positions);
  }
  if (isRecord(raw.views)) {
    for (const kind of ["practice", "prep"] as const) {
      const v = raw.views[kind];
      if (v === "deck" || v === "list") out.views[kind] = v;
    }
  }
  return out;
}

export function serializeDeckMemory(m: DeckMemory): string {
  return JSON.stringify(m);
}

function trimPositions(p: Record<string, DeckPosition>): Record<string, DeckPosition> {
  const entries = Object.entries(p);
  if (entries.length <= DECK_MAX_POSITIONS) return p;
  entries.sort((a, b) => Date.parse(b[1].at) - Date.parse(a[1].at));
  return Object.fromEntries(entries.slice(0, DECK_MAX_POSITIONS));
}

export function rememberPosition(m: DeckMemory, key: string, pos: DeckPosition): DeckMemory {
  return { ...m, positions: trimPositions({ ...m.positions, [key]: pos }) };
}

export function forgetPosition(m: DeckMemory, key: string): DeckMemory {
  if (!(key in m.positions)) return m;
  const positions = { ...m.positions };
  delete positions[key];
  return { ...m, positions };
}

export function setDeckView(m: DeckMemory, kind: DeckKind, view: DeckView): DeckMemory {
  return { ...m, views: { ...m.views, [kind]: view } };
}

export function deckViewOf(m: DeckMemory | null, kind: DeckKind): DeckView {
  return m?.views[kind] ?? DEFAULT_DECK_VIEW;
}

// ---------------------------------------------------------------------------
// 순서
// ---------------------------------------------------------------------------

export interface MissionDeckEntry {
  videoId: string;
  /** 1부터 (로드맵 단계 번호) */
  stepNumber: number;
  stepLabel: string;
}

/** 실습 덱 순서: 1단계 먼저, 단계 안에서는 강의 순서. 같은 강의가 두 번 나오면 처음 것만 */
export function missionDeckOrder(
  steps: readonly { label: string; items: readonly { video: { id: string } }[] }[],
  hasMission: (videoId: string) => boolean,
): MissionDeckEntry[] {
  const seen = new Set<string>();
  const out: MissionDeckEntry[] = [];
  steps.forEach((st, i) => {
    for (const { video } of st.items) {
      if (seen.has(video.id) || !hasMission(video.id)) continue;
      seen.add(video.id);
      out.push({ videoId: video.id, stepNumber: i + 1, stepLabel: st.label });
    }
  });
  return out;
}

export type PrepDeckEntry = { kind: "concept"; id: string } | { kind: "term"; id: string };

/** 개념이 먼저인지 (개념이 주인공인 공부 방법) */
export function conceptsFirst(style: StudyStyle): boolean {
  return isTheoryStyle(style);
}

/** 준비/개념 덱 순서 (위 규칙). 용어는 처음 `termLimit`개만 */
export function prepDeckOrder(
  style: StudyStyle,
  conceptIds: readonly string[],
  termIds: readonly string[],
  termLimit: number,
): PrepDeckEntry[] {
  const concepts = [...new Set(conceptIds)].map((id) => ({ kind: "concept" as const, id }));
  const terms = [...new Set(termIds)].slice(0, Math.max(0, termLimit)).map((id) => ({ kind: "term" as const, id }));
  return conceptsFirst(style) ? [...concepts, ...terms] : [...terms, ...concepts];
}

// ---------------------------------------------------------------------------
// 시작 위치 · 이동
// ---------------------------------------------------------------------------

/** 아직 끝내지 않은 첫 카드. 모두 끝냈으면 ids.length(끝 카드), 덱이 비었으면 0 */
export function firstOpenIndex(ids: readonly string[], isDone: (id: string) => boolean): number {
  if (ids.length === 0) return 0;
  const i = ids.findIndex((id) => !isDone(id));
  return i < 0 ? ids.length : i;
}

/** 이번 주 실습 미션(실습 위주 공부 방법): 덱 순서에서 아직 끝내지 않은 첫 미션, 모두 끝냈으면 첫 미션 */
export function pinnedWeeklyId(ids: readonly string[], isDone: (id: string) => boolean): string | undefined {
  const i = firstOpenIndex(ids, isDone);
  return ids[i] ?? ids[0];
}

/** 0..total (total = 끝 카드) 안으로 */
export function clampDeckIndex(i: number, total: number): number {
  if (!Number.isFinite(i)) return 0;
  return Math.max(0, Math.min(Math.trunc(i), Math.max(0, total)));
}

export interface DeckStart {
  index: number;
  /** 저장된 위치에서 이어서 보는 중 (처음 카드가 아닐 때만 true) */
  resumed: boolean;
}

/** 저장된 위치 → 시작 카드 (id가 덱에 있으면 그 카드, 없어졌으면 저장된 번호를 덱 안으로), 없으면 끝내지 않은 첫 카드 */
export function resolveDeckStart(
  ids: readonly string[],
  saved: DeckPosition | undefined,
  isDone: (id: string) => boolean,
): DeckStart {
  const open = firstOpenIndex(ids, isDone);
  if (!saved) return { index: open, resumed: false };
  let index: number;
  if (saved.id === null) index = ids.length;
  else {
    const at = ids.indexOf(saved.id);
    index = at >= 0 ? at : clampDeckIndex(saved.index, ids.length);
  }
  return { index, resumed: index > 0 && index !== open };
}

/** 저장할 위치 */
export function positionAt(ids: readonly string[], index: number, at: string): DeckPosition {
  const i = clampDeckIndex(index, ids.length);
  return { id: i >= ids.length ? null : ids[i], index: i, at };
}

/** 해시(#mission-…)가 가리키는 카드 번호. 없으면 -1 */
export function indexForHash(hash: string, anchors: readonly (readonly string[])[]): number {
  let id = hash.startsWith("#") ? hash.slice(1) : hash;
  try {
    id = decodeURIComponent(id);
  } catch {
    /* 잘못된 인코딩은 그대로 */
  }
  if (!id) return -1;
  return anchors.findIndex((list) => list.includes(id));
}

export type DeckMove = "next" | "prev";

/** 덱에 초점이 있을 때 키 → 이동 (←/→만. 위·아래는 스크롤로 남겨 둔다) */
export function keyToMove(key: string): DeckMove | null {
  if (key === "ArrowRight") return "next";
  if (key === "ArrowLeft") return "prev";
  return null;
}

export function moveIndex(index: number, move: DeckMove, total: number): number {
  return clampDeckIndex(index + (move === "next" ? 1 : -1), total);
}

// ---------------------------------------------------------------------------
// 밀어서 넘기기 (터치)
// ---------------------------------------------------------------------------

/** 이만큼 움직이면 가로·세로 중 어느 쪽인지 정한다 */
export const SWIPE_LOCK_PX = 10;
/** 이만큼 가로로 밀면 넘긴다 */
export const SWIPE_MIN_PX = 60;
/** 빠르게 튕기면 이 거리만으로도 넘긴다 */
export const SWIPE_FLICK_PX = 30;
export const SWIPE_FLICK_MS = 250;

/** 손가락이 움직인 방향: 가로(x)는 세로의 1.5배 이상일 때만. 아직 모르면 null */
export function swipeAxis(dx: number, dy: number): "x" | "y" | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < SWIPE_LOCK_PX) return null;
  return ax >= ay * 1.5 ? "x" : "y";
}

/** 손을 뗐을 때: 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전 */
export function swipeMove(dx: number, dy: number, ms: number): DeckMove | null {
  if (swipeAxis(dx, dy) !== "x") return null;
  const ax = Math.abs(dx);
  if (ax < SWIPE_MIN_PX && !(ax >= SWIPE_FLICK_PX && ms <= SWIPE_FLICK_MS)) return null;
  return dx < 0 ? "next" : "prev";
}

// ---------------------------------------------------------------------------
// 끝 카드
// ---------------------------------------------------------------------------

/** 같은 날(이 기기 시간대) */
export function isSameLocalDay(iso: string, now: Date): boolean {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return false;
  return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth() && t.getDate() === now.getDate();
}

/** 덱 카드 중 오늘 끝낸 수 ('오늘 n개 해냈어요') */
export function countDoneToday(ids: readonly string[], done: readonly { id: string; at: string }[], now: Date): number {
  const set = new Set(ids);
  return new Set(done.filter((d) => set.has(d.id) && isSameLocalDay(d.at, now)).map((d) => d.id)).size;
}

/** 접근 가능한 진행 문구. 예: "7개 중 1번째" */
export function deckPositionLabel(index: number, total: number): string {
  return `${total}개 중 ${index + 1}번째`;
}
