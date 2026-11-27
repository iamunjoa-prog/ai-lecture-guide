import { describe, expect, it } from "vitest";
import {
  countSaved,
  createSavedStore,
  EMPTY_SAVED,
  emptySaved,
  exportSaved,
  isResultHref,
  mergeSaved,
  parseSaved,
  pruneSaved,
  SAVED_STORAGE_KEY,
  setLastDiagnosis,
  setLectureStatus,
  setMissionStatus,
  skillProgress,
  summarizeSaved,
  toggleLecture,
  toggleMission,
  toggleRef,
  type KnownIds,
  type StorageLike,
} from "../saved";

const T0 = "2026-11-01T00:00:00.000Z";
const T1 = "2026-11-02T00:00:00.000Z";
const T2 = "2026-11-03T00:00:00.000Z";

function memoryStorage(init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...init };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const known: KnownIds = {
  lectures: new Set(["v1", "v2", "v3"]),
  missions: new Set(["v1", "v2"]),
  skills: new Set(["s1"]),
  terms: new Set(["llm"]),
  theory: new Set(["c1"]),
};

describe("변경: 강의·실습·참조", () => {
  it("강의 저장 토글은 '보고 싶어요'로 저장하고 다시 누르면 지운다", () => {
    let s = toggleLecture(emptySaved(), "v1", T0);
    expect(s.lectures).toEqual([{ id: "v1", status: "want", savedAt: T0, updatedAt: T0 }]);
    s = toggleLecture(s, "v1", T1);
    expect(s.lectures).toEqual([]);
  });

  it("상태 전환: want → watching → done, updatedAt만 바뀌고 savedAt은 유지", () => {
    let s = setLectureStatus(emptySaved(), "v1", "want", T0);
    s = setLectureStatus(s, "v1", "watching", T1);
    s = setLectureStatus(s, "v1", "done", T2);
    expect(s.lectures[0]).toEqual({ id: "v1", status: "done", savedAt: T0, updatedAt: T2 });
    // 같은 상태면 같은 객체 (불필요한 저장 없음)
    expect(setLectureStatus(s, "v1", "done", T2)).toBe(s);
    expect(summarizeSaved(s)).toEqual({ lectures: 1, lecturesDone: 1, missions: 0, missionsDone: 0 });
  });

  it("실습: 토글은 '해볼 예정', 완료로 바꾸면 저장되지 않았어도 저장된다", () => {
    let s = setMissionStatus(emptySaved(), "v2", "done", T0);
    expect(s.missions).toEqual([{ videoId: "v2", status: "done", savedAt: T0, updatedAt: T0 }]);
    s = toggleMission(s, "v2", T1);
    expect(s.missions).toEqual([]);
    s = toggleMission(s, "v1", T1);
    expect(s.missions[0].status).toBe("todo");
  });

  it("스킬·용어·이론 토글, 잘못된 id는 무시", () => {
    let s = toggleRef(emptySaved(), "skills", "s1", T0);
    s = toggleRef(s, "terms", "llm", T0);
    s = toggleRef(s, "theory", "c1", T0);
    expect(countSaved(s)).toBe(3);
    expect(toggleRef(s, "terms", "bad id!", T0)).toBe(s);
    expect(toggleRef(s, "terms", "llm", T1).terms).toEqual([]);
  });

  it("최근 진단은 결과 주소만 받는다", () => {
    const s = setLastDiagnosis(emptySaved(), "/result?l=user&d=marketing&g=use_tools&ko=1", T0);
    expect(s.lastDiagnosis?.href).toContain("/result?");
    expect(setLastDiagnosis(s, "https://evil.example/", T1)).toBe(s);
    expect(setLastDiagnosis(s, "javascript:alert(1)", T1)).toBe(s);
    expect(isResultHref("/result?l=user&d=&g=use_tools&ko=0")).toBe(true);
    expect(isResultHref("/result?<script>")).toBe(false);
  });

  it("스킬 진행도: 다 본 강의 수 / 데이터에 있는 강의 수", () => {
    let s = setLectureStatus(emptySaved(), "v1", "done", T0);
    s = setLectureStatus(s, "v2", "watching", T0);
    expect(skillProgress(s, ["v1", "v2", "gone"], known.lectures)).toEqual({ done: 1, total: 2 });
    expect(skillProgress(s, ["v1", "v1"])).toEqual({ done: 1, total: 1 });
  });
});

describe("검증·이전 형식", () => {
  it("망가진 JSON·배열·다른 버전은 빈 상태", () => {
    expect(parseSaved("{not json")).toEqual(emptySaved());
    expect(parseSaved("[]")).toEqual(emptySaved());
    expect(parseSaved(null)).toEqual(emptySaved());
    expect(parseSaved({ version: 2, lectures: [{ id: "v1" }] })).toEqual(emptySaved());
  });

  it("틀린 항목만 버리고 나머지는 살린다 (부분 복구)", () => {
    const s = parseSaved(
      JSON.stringify({
        version: 1,
        lectures: [
          { id: "v1", status: "done", savedAt: T0, updatedAt: T1 },
          { id: "v1", status: "want", savedAt: T0 }, // 중복
          { id: "<b>", status: "want" }, // 잘못된 id
          { id: "v2", status: "???", savedAt: "어제" }, // 모르는 상태·시각 → 기본값
          "문자열",
        ],
        missions: [{ videoId: "v1", status: "done", savedAt: T0 }, { id: "v2" }],
        skills: [{ id: "s1", savedAt: T0 }, { id: 3 }],
        terms: "llm",
        theory: [{ id: "c1" }],
        lastDiagnosis: { href: "https://evil.example", savedAt: T0 },
      }),
      T2,
    );
    expect(s.lectures).toEqual([
      { id: "v1", status: "done", savedAt: T0, updatedAt: T1 },
      { id: "v2", status: "want", savedAt: T2, updatedAt: T2 },
    ]);
    expect(s.missions).toEqual([{ videoId: "v1", status: "done", savedAt: T0, updatedAt: T0 }]);
    expect(s.skills).toEqual([{ id: "s1", savedAt: T0 }]);
    expect(s.terms).toEqual([]);
    expect(s.theory).toEqual([{ id: "c1", savedAt: T2 }]);
    expect(s.lastDiagnosis).toBeUndefined();
  });

  it("version이 없는 객체는 v1로 읽는다", () => {
    expect(parseSaved({ skills: [{ id: "s1", savedAt: T0 }] }).skills).toHaveLength(1);
  });

  it("데이터에서 사라진 id를 정리하고, 바뀐 게 없으면 같은 객체", () => {
    let s = setLectureStatus(emptySaved(), "v1", "want", T0);
    s = setLectureStatus(s, "removed-video", "done", T0);
    s = setMissionStatus(s, "v3", "todo", T0); // 미션 없는 강의
    s = toggleRef(s, "terms", "old-term", T0);
    const pruned = pruneSaved(s, known);
    expect(pruned.lectures.map((l) => l.id)).toEqual(["v1"]);
    expect(pruned.missions).toEqual([]);
    expect(pruned.terms).toEqual([]);
    expect(pruneSaved(pruned, known)).toBe(pruned);
  });
});

describe("내보내기·가져오기 병합", () => {
  it("내보낸 파일을 다시 읽으면 같은 상태 (왕복)", () => {
    let s = setLectureStatus(emptySaved(), "v1", "done", T0);
    s = setMissionStatus(s, "v1", "todo", T0);
    s = toggleRef(s, "skills", "s1", T0);
    s = setLastDiagnosis(s, "/result?l=user&d=&g=understand&ko=0", T0);
    const file = exportSaved(s, T1);
    expect(JSON.parse(file).app).toBe("ai-lecture-guide");
    expect(parseSaved(file)).toEqual(s);
  });

  it("새 항목은 더하고, 같은 강의는 더 최근에 바꾼 상태를 쓴다", () => {
    let base = setLectureStatus(emptySaved(), "v1", "want", T0);
    base = toggleRef(base, "terms", "llm", T1);
    let inc = setLectureStatus(emptySaved(), "v1", "done", T2);
    inc = setLectureStatus(inc, "v2", "watching", T0);
    inc = toggleRef(inc, "terms", "llm", T0);
    inc = setLastDiagnosis(inc, "/result?l=developer&d=coding&g=build_agents&ko=0", T2);
    const { state, added, updated } = mergeSaved(base, inc);
    expect(added).toBe(1);
    expect(updated).toBe(1);
    expect(state.lectures).toEqual([
      { id: "v1", status: "done", savedAt: T0, updatedAt: T2 },
      { id: "v2", status: "watching", savedAt: T0, updatedAt: T0 },
    ]);
    expect(state.terms).toEqual([{ id: "llm", savedAt: T0 }]); // 더 이른 저장 시각
    expect(state.lastDiagnosis?.href).toContain("developer");
  });

  it("오래된 파일을 가져와도 내가 나중에 바꾼 상태는 지켜진다", () => {
    const base = setLectureStatus(emptySaved(), "v1", "done", T2);
    const inc = setLectureStatus(emptySaved(), "v1", "want", T0);
    const r = mergeSaved(base, inc);
    expect(r.state.lectures[0].status).toBe("done");
    expect(r.added + r.updated).toBe(0);
  });
});

describe("저장소 어댑터", () => {
  it("읽기·쓰기, 같은 원문이면 같은 스냅샷 (useSyncExternalStore 안정성)", () => {
    const mem = memoryStorage();
    const store = createSavedStore(() => mem, { now: () => T0 });
    const a = store.getSnapshot();
    expect(a).toEqual({ state: EMPTY_SAVED, available: true, ready: true });
    expect(store.getSnapshot()).toBe(a);
    let calls = 0;
    store.subscribe(() => calls++);
    expect(store.update((s) => toggleLecture(s, "v1", T0))).toBe(true);
    expect(calls).toBe(1);
    expect(JSON.parse(mem.data[SAVED_STORAGE_KEY]).lectures[0].id).toBe("v1");
    const b = store.getSnapshot();
    expect(b).not.toBe(a);
    expect(store.getSnapshot()).toBe(b);
  });

  it("다른 탭이 바꾼 원문을 다시 읽는다", () => {
    const mem = memoryStorage();
    const store = createSavedStore(() => mem);
    store.getSnapshot();
    mem.setItem(SAVED_STORAGE_KEY, JSON.stringify({ version: 1, skills: [{ id: "s1", savedAt: T0 }] }));
    expect(store.getSnapshot().state.skills).toHaveLength(1);
  });

  it("망가진 저장값이 있어도 앱은 빈 상태로 동작하고 다음 저장에서 고쳐진다", () => {
    const mem = memoryStorage({ [SAVED_STORAGE_KEY]: "{{{" });
    const store = createSavedStore(() => mem);
    expect(store.getSnapshot().state).toEqual(emptySaved());
    store.update((s) => toggleRef(s, "terms", "llm", T0));
    expect(parseSaved(mem.data[SAVED_STORAGE_KEY]).terms).toHaveLength(1);
  });

  it("저장소 접근이 막히면(throw) available=false, 쓰기는 false", () => {
    const store = createSavedStore(() => {
      throw new Error("SecurityError");
    });
    const snap = store.getSnapshot();
    expect(snap.available).toBe(false);
    expect(store.getSnapshot()).toBe(snap);
    expect(store.update((s) => toggleLecture(s, "v1", T0))).toBe(false);
  });

  it("읽기는 되지만 쓰기가 실패하면(용량 초과 등) false, 상태는 그대로", () => {
    const mem = memoryStorage();
    mem.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    const store = createSavedStore(() => mem);
    expect(store.update((s) => toggleLecture(s, "v1", T0))).toBe(false);
    expect(store.getSnapshot().state.lectures).toEqual([]);
  });

  it("getItem이 throw해도 막힌 것으로 본다", () => {
    const mem: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(createSavedStore(() => mem).getSnapshot().available).toBe(false);
  });
});
