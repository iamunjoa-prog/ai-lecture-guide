/**
 * 내 학습함 (로그인 없이 이 브라우저에만 저장). 순수 함수 코어 + 얇은 저장소 어댑터.
 *
 * 저장 형식 (localStorage `aig:saved:v1` — 키 이름은 예전 그대로, 형식은 v2)
 * {
 *   version: 2,
 *   lectures: { id, status: "want" | "watching" | "done", savedAt, updatedAt }[],
 *   missions: { videoId, status: "todo" | "done", savedAt, updatedAt }[],
 *   skills:   { id, savedAt }[],
 *   terms:    { id, savedAt }[],
 *   theory:   { id, savedAt }[],
 *   theoryRead: { id, savedAt }[],   // v2: 3분 이론 '읽었어요' (저장과 따로, 배지 개수에는 넣지 않는다)
 *   lastDiagnosis?: { href, savedAt }
 * }
 *  - v1(또는 version 없음)은 그대로 읽고 `theoryRead: []`로 올린다(마이그레이션). 그보다 새 버전은 빈 상태.
 *  - 시각은 ISO 문자열. 배열 순서 = 저장한 순서(오래된 것이 앞).
 *  - 읽을 때 항상 검증한다: 형식이 틀린 항목·중복 id는 버리고, 나머지는 살린다(부분 복구).
 *  - 데이터(강의·용어 등)가 바뀌어 없어진 id는 `pruneSaved`로 조용히 정리한다.
 *  - 저장소 접근은 모두 try/catch. 사생활 보호 모드 등으로 막혀 있으면 `available=false`이고 앱은 그대로 동작한다.
 */

export const SAVED_STORAGE_KEY = "aig:saved:v1";
export const SAVED_VERSION = 2;
/** 읽을 수 있는 예전 형식 버전 */
export const SAVED_LEGACY_VERSIONS: readonly number[] = [1];
/** 종류별 최대 보관 개수 (가져오기로 지나치게 큰 파일이 들어오는 것 방지) */
export const SAVED_MAX_PER_KIND = 500;

export type LectureStatus = "want" | "watching" | "done";
export type MissionStatus = "todo" | "done";
export const LECTURE_STATUSES: readonly LectureStatus[] = ["want", "watching", "done"];
export const MISSION_STATUSES: readonly MissionStatus[] = ["todo", "done"];

export const LECTURE_STATUS_LABELS: Record<LectureStatus, string> = {
  want: "보고 싶어요",
  watching: "보는 중",
  done: "다 봤어요",
};
export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  todo: "해볼 예정",
  done: "완료",
};

export interface SavedLecture {
  id: string;
  status: LectureStatus;
  savedAt: string;
  updatedAt: string;
}
export interface SavedMission {
  videoId: string;
  status: MissionStatus;
  savedAt: string;
  updatedAt: string;
}
export interface SavedRef {
  id: string;
  savedAt: string;
}
export interface SavedState {
  version: typeof SAVED_VERSION;
  lectures: SavedLecture[];
  missions: SavedMission[];
  skills: SavedRef[];
  terms: SavedRef[];
  theory: SavedRef[];
  /** 3분 이론 '읽었어요' (v2) */
  theoryRead: SavedRef[];
  lastDiagnosis?: { href: string; savedAt: string };
}

/** id 하나만 있는 저장 종류 */
export type RefKind = "skills" | "terms" | "theory" | "theoryRead";
export type SavedKind = "lectures" | "missions" | RefKind;

export const EMPTY_SAVED: SavedState = Object.freeze({
  version: SAVED_VERSION,
  lectures: [],
  missions: [],
  skills: [],
  terms: [],
  theory: [],
  theoryRead: [],
}) as SavedState;

export function emptySaved(): SavedState {
  return { version: SAVED_VERSION, lectures: [], missions: [], skills: [], terms: [], theory: [], theoryRead: [] };
}

// ---------------------------------------------------------------------------
// 검증
// ---------------------------------------------------------------------------

const ID_RE = /^[A-Za-z0-9_-]{1,100}$/;
export const isSavedId = (v: unknown): v is string => typeof v === "string" && ID_RE.test(v);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function isoOr(v: unknown, fallback: string): string {
  if (typeof v !== "string" || v.length > 40) return fallback;
  const t = Date.parse(v);
  return Number.isNaN(t) ? fallback : new Date(t).toISOString();
}

/** 결과 화면 주소만 기억한다 (다른 사이트·스크립트 주소 차단) */
export function isResultHref(v: unknown): v is string {
  return typeof v === "string" && v.length <= 300 && /^\/result\?[A-Za-z0-9_=&%,.-]*$/.test(v);
}

function uniqBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out.slice(0, SAVED_MAX_PER_KIND);
}

function parseList<T>(raw: unknown, parse: (item: Record<string, unknown>) => T | null, key: (t: T) => string): T[] {
  if (!Array.isArray(raw)) return [];
  const out: T[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const parsed = parse(item);
    if (parsed) out.push(parsed);
  }
  return uniqBy(out, key);
}

/**
 * 어떤 값이든 받아 올바른 SavedState로 만든다 (JSON 문자열이면 먼저 파싱).
 * 망가진 JSON·다른 버전은 빈 상태, 일부만 틀린 항목은 그 항목만 버린다.
 * `version`이 없는 객체는 v1로 보고 읽는다(초기 형식·손으로 만든 파일 호환).
 */
export function parseSaved(input: unknown, now: string = new Date(0).toISOString()): SavedState {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return emptySaved();
    }
  }
  if (!isRecord(raw)) return emptySaved();
  if (raw.version !== undefined && raw.version !== SAVED_VERSION && !SAVED_LEGACY_VERSIONS.includes(raw.version as number)) {
    return emptySaved();
  }

  const lectures = parseList<SavedLecture>(
    raw.lectures,
    (it) => {
      if (!isSavedId(it.id)) return null;
      const status = LECTURE_STATUSES.includes(it.status as LectureStatus) ? (it.status as LectureStatus) : "want";
      const savedAt = isoOr(it.savedAt, now);
      return { id: it.id, status, savedAt, updatedAt: isoOr(it.updatedAt, savedAt) };
    },
    (l) => l.id,
  );
  const missions = parseList<SavedMission>(
    raw.missions,
    (it) => {
      if (!isSavedId(it.videoId)) return null;
      const status = MISSION_STATUSES.includes(it.status as MissionStatus) ? (it.status as MissionStatus) : "todo";
      const savedAt = isoOr(it.savedAt, now);
      return { videoId: it.videoId, status, savedAt, updatedAt: isoOr(it.updatedAt, savedAt) };
    },
    (m) => m.videoId,
  );
  const ref = (list: unknown) =>
    parseList<SavedRef>(
      list,
      (it) => (isSavedId(it.id) ? { id: it.id, savedAt: isoOr(it.savedAt, now) } : null),
      (r) => r.id,
    );

  const state: SavedState = {
    version: SAVED_VERSION,
    lectures,
    missions,
    skills: ref(raw.skills),
    terms: ref(raw.terms),
    theory: ref(raw.theory),
    theoryRead: ref(raw.theoryRead), // v1에는 없다 → []
  };
  const ld = raw.lastDiagnosis;
  if (isRecord(ld) && isResultHref(ld.href)) state.lastDiagnosis = { href: ld.href, savedAt: isoOr(ld.savedAt, now) };
  return state;
}

export function serializeSaved(state: SavedState): string {
  return JSON.stringify(state);
}

// ---------------------------------------------------------------------------
// 조회
// ---------------------------------------------------------------------------

export function lectureOf(state: SavedState, id: string): SavedLecture | undefined {
  return state.lectures.find((l) => l.id === id);
}
export function missionOf(state: SavedState, videoId: string): SavedMission | undefined {
  return state.missions.find((m) => m.videoId === videoId);
}
export function hasRef(state: SavedState, kind: RefKind, id: string): boolean {
  return state[kind].some((r) => r.id === id);
}

/** 헤더 배지에 쓰는 전체 저장 개수 (최근 진단은 세지 않는다) */
export function countSaved(state: SavedState): number {
  return state.lectures.length + state.missions.length + state.skills.length + state.terms.length + state.theory.length;
}

export interface SavedSummary {
  lectures: number;
  lecturesDone: number;
  missions: number;
  missionsDone: number;
}
export function summarizeSaved(state: SavedState): SavedSummary {
  return {
    lectures: state.lectures.length,
    lecturesDone: state.lectures.filter((l) => l.status === "done").length,
    missions: state.missions.length,
    missionsDone: state.missions.filter((m) => m.status === "done").length,
  };
}

/** 스킬 진행도: 스킬 강의 중 '다 봤어요'인 강의 수 (없는 강의 id는 분모에서 뺀다) */
export function skillProgress(
  state: SavedState,
  lectureIds: readonly string[],
  knownLectureIds?: ReadonlySet<string>,
): { done: number; total: number } {
  const ids = [...new Set(lectureIds)].filter((id) => !knownLectureIds || knownLectureIds.has(id));
  const done = ids.filter((id) => lectureOf(state, id)?.status === "done").length;
  return { done, total: ids.length };
}

// ---------------------------------------------------------------------------
// 변경 (항상 새 객체를 돌려준다)
// ---------------------------------------------------------------------------

export function setLectureStatus(state: SavedState, id: string, status: LectureStatus, now: string): SavedState {
  if (!isSavedId(id)) return state;
  const cur = lectureOf(state, id);
  if (cur) {
    if (cur.status === status) return state;
    return { ...state, lectures: state.lectures.map((l) => (l.id === id ? { ...l, status, updatedAt: now } : l)) };
  }
  return { ...state, lectures: [...state.lectures, { id, status, savedAt: now, updatedAt: now }] };
}

export function removeLecture(state: SavedState, id: string): SavedState {
  if (!lectureOf(state, id)) return state;
  return { ...state, lectures: state.lectures.filter((l) => l.id !== id) };
}

/** 저장 토글: 없으면 '보고 싶어요'로 저장, 있으면 지운다 */
export function toggleLecture(state: SavedState, id: string, now: string): SavedState {
  return lectureOf(state, id) ? removeLecture(state, id) : setLectureStatus(state, id, "want", now);
}

export function setMissionStatus(state: SavedState, videoId: string, status: MissionStatus, now: string): SavedState {
  if (!isSavedId(videoId)) return state;
  const cur = missionOf(state, videoId);
  if (cur) {
    if (cur.status === status) return state;
    return { ...state, missions: state.missions.map((m) => (m.videoId === videoId ? { ...m, status, updatedAt: now } : m)) };
  }
  return { ...state, missions: [...state.missions, { videoId, status, savedAt: now, updatedAt: now }] };
}

export function removeMission(state: SavedState, videoId: string): SavedState {
  if (!missionOf(state, videoId)) return state;
  return { ...state, missions: state.missions.filter((m) => m.videoId !== videoId) };
}

export function toggleMission(state: SavedState, videoId: string, now: string): SavedState {
  return missionOf(state, videoId) ? removeMission(state, videoId) : setMissionStatus(state, videoId, "todo", now);
}

export function addRef(state: SavedState, kind: RefKind, id: string, now: string): SavedState {
  if (!isSavedId(id) || hasRef(state, kind, id)) return state;
  return { ...state, [kind]: [...state[kind], { id, savedAt: now }] };
}
export function removeRef(state: SavedState, kind: RefKind, id: string): SavedState {
  if (!hasRef(state, kind, id)) return state;
  return { ...state, [kind]: state[kind].filter((r) => r.id !== id) };
}
export function toggleRef(state: SavedState, kind: RefKind, id: string, now: string): SavedState {
  return hasRef(state, kind, id) ? removeRef(state, kind, id) : addRef(state, kind, id, now);
}

export function setLastDiagnosis(state: SavedState, href: string, now: string): SavedState {
  if (!isResultHref(href)) return state;
  if (state.lastDiagnosis?.href === href) return state;
  return { ...state, lastDiagnosis: { href, savedAt: now } };
}

// ---------------------------------------------------------------------------
// 정리 · 병합
// ---------------------------------------------------------------------------

export interface KnownIds {
  lectures: ReadonlySet<string>;
  missions: ReadonlySet<string>;
  skills: ReadonlySet<string>;
  terms: ReadonlySet<string>;
  theory: ReadonlySet<string>;
}

/** 데이터에서 사라진 id를 뺀다. 바뀐 것이 없으면 같은 객체를 돌려준다 */
export function pruneSaved(state: SavedState, known: KnownIds): SavedState {
  const lectures = state.lectures.filter((l) => known.lectures.has(l.id));
  const missions = state.missions.filter((m) => known.missions.has(m.videoId));
  const skills = state.skills.filter((r) => known.skills.has(r.id));
  const terms = state.terms.filter((r) => known.terms.has(r.id));
  const theory = state.theory.filter((r) => known.theory.has(r.id));
  const theoryRead = state.theoryRead.filter((r) => known.theory.has(r.id));
  const same =
    lectures.length === state.lectures.length &&
    missions.length === state.missions.length &&
    skills.length === state.skills.length &&
    terms.length === state.terms.length &&
    theory.length === state.theory.length &&
    theoryRead.length === state.theoryRead.length;
  return same ? state : { ...state, lectures, missions, skills, terms, theory, theoryRead };
}

/**
 * 가져온 상태(incoming)를 현재 상태(base)에 합친다.
 *  - 새 항목은 뒤에 붙인다.
 *  - 강의·실습이 양쪽에 있으면 updatedAt이 더 늦은 쪽 상태를 쓴다 (savedAt은 더 이른 쪽).
 *  - 최근 진단은 더 늦게 저장한 쪽.
 * `added`는 새로 생긴 항목 수, `updated`는 상태가 바뀐 기존 항목 수.
 */
export function mergeSaved(base: SavedState, incoming: SavedState): { state: SavedState; added: number; updated: number } {
  let added = 0;
  let updated = 0;
  const earlier = (a: string, b: string) => (Date.parse(a) <= Date.parse(b) ? a : b);

  const mergeStatus = <T extends { status: string; savedAt: string; updatedAt: string }>(
    cur: T[],
    inc: T[],
    key: (t: T) => string,
  ): T[] => {
    const out = [...cur];
    for (const item of inc) {
      const i = out.findIndex((x) => key(x) === key(item));
      if (i < 0) {
        out.push(item);
        added++;
        continue;
      }
      const mine = out[i];
      const theirsNewer = Date.parse(item.updatedAt) > Date.parse(mine.updatedAt);
      const next = theirsNewer ? { ...mine, status: item.status, updatedAt: item.updatedAt } : mine;
      const savedAt = earlier(mine.savedAt, item.savedAt);
      if (next.status !== mine.status) updated++;
      out[i] = savedAt === next.savedAt ? next : { ...next, savedAt };
    }
    return out.slice(0, SAVED_MAX_PER_KIND);
  };
  const mergeRefs = (cur: SavedRef[], inc: SavedRef[]): SavedRef[] => {
    const out = [...cur];
    for (const r of inc) {
      const i = out.findIndex((x) => x.id === r.id);
      if (i < 0) {
        out.push(r);
        added++;
      } else {
        out[i] = { ...out[i], savedAt: earlier(out[i].savedAt, r.savedAt) };
      }
    }
    return out.slice(0, SAVED_MAX_PER_KIND);
  };

  const state: SavedState = {
    version: SAVED_VERSION,
    lectures: mergeStatus(base.lectures, incoming.lectures, (l) => l.id),
    missions: mergeStatus(base.missions, incoming.missions, (m) => m.videoId),
    skills: mergeRefs(base.skills, incoming.skills),
    terms: mergeRefs(base.terms, incoming.terms),
    theory: mergeRefs(base.theory, incoming.theory),
    theoryRead: mergeRefs(base.theoryRead, incoming.theoryRead),
  };
  const a = base.lastDiagnosis;
  const b = incoming.lastDiagnosis;
  const last = a && b ? (Date.parse(b.savedAt) > Date.parse(a.savedAt) ? b : a) : (a ?? b);
  if (last) state.lastDiagnosis = last;
  return { state, added, updated };
}

/** 내보내기 파일 내용 (가져오기는 `parseSaved`가 그대로 읽는다) */
export function exportSaved(state: SavedState, now: string): string {
  return JSON.stringify({ app: "ai-lecture-guide", exportedAt: now, ...state }, null, 2);
}

export function exportFileName(now: string): string {
  return `ai-lecture-guide-saved-${now.slice(0, 10)}.json`;
}

// ---------------------------------------------------------------------------
// 저장소 어댑터 (useSyncExternalStore용)
// ---------------------------------------------------------------------------

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface SavedSnapshot {
  state: SavedState;
  /** 저장소를 쓸 수 있는가 (막혀 있으면 false) */
  available: boolean;
  /** 브라우저 저장소를 읽은 뒤인가 (서버 렌더·하이드레이션 중에는 false) */
  ready: boolean;
}

export const SERVER_SNAPSHOT: SavedSnapshot = Object.freeze({ state: EMPTY_SAVED, available: true, ready: false });

const UNAVAILABLE: SavedSnapshot = Object.freeze({ state: EMPTY_SAVED, available: false, ready: true });

export interface SavedStore {
  getSnapshot(): SavedSnapshot;
  subscribe(listener: () => void): () => void;
  /** 변경을 적용하고 저장. 저장에 실패하면 false (상태는 바뀌지 않는다) */
  update(fn: (s: SavedState) => SavedState): boolean;
  /** 다른 탭이 바꿨을 때 등 저장소를 다시 읽는다 */
  refresh(): void;
}

/**
 * 저장소 하나를 감싼 스토어. `getStorage`가 throw하거나 null이면 '저장 불가'로 동작한다.
 * 스냅샷은 저장된 원문이 바뀔 때만 새 객체가 된다(useSyncExternalStore 무한 렌더 방지).
 */
export function createSavedStore(
  getStorage: () => StorageLike | null,
  opts: { now?: () => string; key?: string } = {},
): SavedStore {
  const key = opts.key ?? SAVED_STORAGE_KEY;
  const now = opts.now ?? (() => new Date().toISOString());
  const listeners = new Set<() => void>();
  let snapshot: SavedSnapshot | null = null;
  let lastRaw: string | null | undefined;

  const storage = (): StorageLike | null => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };

  const read = (): SavedSnapshot => {
    const s = storage();
    let raw: string | null;
    try {
      if (!s) throw new Error("no storage");
      raw = s.getItem(key);
    } catch {
      lastRaw = undefined;
      snapshot = UNAVAILABLE;
      return snapshot;
    }
    if (snapshot && snapshot.available && raw === lastRaw) return snapshot;
    lastRaw = raw;
    snapshot = { state: raw ? parseSaved(raw, now()) : EMPTY_SAVED, available: true, ready: true };
    return snapshot;
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    getSnapshot: read,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update(fn) {
      const cur = read();
      if (!cur.available) return false;
      const next = fn(cur.state);
      if (next === cur.state) return true;
      const s = storage();
      if (!s) return false;
      try {
        s.setItem(key, serializeSaved(next));
      } catch {
        return false;
      }
      emit();
      return true;
    },
    refresh() {
      emit();
    },
  };
}
