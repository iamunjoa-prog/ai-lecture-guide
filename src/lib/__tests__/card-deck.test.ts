import { describe, expect, it } from "vitest";
import {
  clampDeckIndex,
  conceptsFirst,
  countDoneToday,
  DECK_MAX_POSITIONS,
  deckKey,
  deckPositionLabel,
  deckViewOf,
  emptyDeckMemory,
  firstOpenIndex,
  forgetPosition,
  indexForHash,
  keyToMove,
  missionDeckOrder,
  moveIndex,
  parseDeckMemory,
  pinnedWeeklyId,
  positionAt,
  prepDeckOrder,
  rememberPosition,
  resolveDeckStart,
  serializeDeckMemory,
  setDeckView,
  swipeAxis,
  swipeMove,
} from "../card-deck";
import { STUDY_STYLES } from "../questions";

const AT = "2026-11-28T03:00:00.000Z";

describe("실습 덱 순서", () => {
  const steps = [
    { label: "기초 다지기", items: [{ video: { id: "a" } }, { video: { id: "b" } }] },
    { label: "실전 활용", items: [{ video: { id: "c" } }, { video: { id: "a" } }, { video: { id: "d" } }] },
    { label: "한 단계 더", items: [{ video: { id: "e" } }] },
  ];
  it("1단계부터, 단계 안에서는 강의 순서. 미션 없는 강의와 중복은 건너뛴다", () => {
    const has = (id: string) => id !== "b";
    expect(missionDeckOrder(steps, has)).toEqual([
      { videoId: "a", stepNumber: 1, stepLabel: "기초 다지기" },
      { videoId: "c", stepNumber: 2, stepLabel: "실전 활용" },
      { videoId: "d", stepNumber: 2, stepLabel: "실전 활용" },
      { videoId: "e", stepNumber: 3, stepLabel: "한 단계 더" },
    ]);
  });
  it("이번 주 실습 미션은 덱 순서에서 끝내지 않은 첫 미션 (1단계 먼저)", () => {
    const ids = missionDeckOrder(steps, () => true).map((e) => e.videoId);
    expect(pinnedWeeklyId(ids, () => false)).toBe("a");
    expect(pinnedWeeklyId(ids, (id) => id === "a")).toBe("b");
    // 모두 끝냈으면 첫 미션
    expect(pinnedWeeklyId(ids, () => true)).toBe("a");
    expect(pinnedWeeklyId([], () => false)).toBeUndefined();
  });
});

describe("준비/개념 덱 순서", () => {
  it("개념이 주인공이면 개념 먼저, 아니면 용어(몸풀기) 먼저. 용어는 처음 n개만", () => {
    const concepts = ["c1", "c2", "c3"];
    const terms = ["t1", "t2", "t3", "t4", "t5", "t6"];
    expect(prepDeckOrder("theory", concepts, terms, 4).map((e) => e.id)).toEqual(["c1", "c2", "c3", "t1", "t2", "t3", "t4"]);
    expect(prepDeckOrder("practice_theory", concepts, terms, 4)[0]).toEqual({ kind: "concept", id: "c1" });
    for (const st of ["lectures", "practice", "all"] as const) {
      const order = prepDeckOrder(st, concepts, terms, 4);
      expect(order.map((e) => e.kind)).toEqual(["term", "term", "term", "term", "concept", "concept", "concept"]);
    }
  });
  it("공부 방법마다 정해져 있다", () => {
    for (const st of STUDY_STYLES) expect(typeof conceptsFirst(st)).toBe("boolean");
    expect(conceptsFirst("theory")).toBe(true);
    expect(conceptsFirst("lectures")).toBe(false);
  });
  it("빈 목록·중복도 안전", () => {
    expect(prepDeckOrder("all", [], [], 4)).toEqual([]);
    expect(prepDeckOrder("all", ["c", "c"], ["t", "t"], 4)).toEqual([
      { kind: "term", id: "t" },
      { kind: "concept", id: "c" },
    ]);
  });
});

describe("시작 위치", () => {
  const ids = ["a", "b", "c"];
  it("저장이 없으면 끝내지 않은 첫 카드, 모두 끝냈으면 끝 카드", () => {
    expect(resolveDeckStart(ids, undefined, () => false)).toEqual({ index: 0, resumed: false });
    expect(resolveDeckStart(ids, undefined, (id) => id === "a")).toEqual({ index: 1, resumed: false });
    expect(resolveDeckStart(ids, undefined, () => true)).toEqual({ index: 3, resumed: false });
    expect(firstOpenIndex([], () => false)).toBe(0);
  });
  it("저장된 id가 있으면 그 카드(이어서 보기), 끝 카드(null)도 기억한다", () => {
    expect(resolveDeckStart(ids, { id: "c", index: 2, at: AT }, () => false)).toEqual({ index: 2, resumed: true });
    expect(resolveDeckStart(ids, { id: null, index: 3, at: AT }, () => false)).toEqual({ index: 3, resumed: true });
    // 저장된 카드가 끝내지 않은 첫 카드와 같으면 '이어서'라고 따로 말하지 않는다
    expect(resolveDeckStart(ids, { id: "b", index: 1, at: AT }, (id) => id === "a")).toEqual({ index: 1, resumed: false });
    expect(resolveDeckStart(ids, { id: "a", index: 0, at: AT }, () => false).resumed).toBe(false);
  });
  it("저장된 카드가 데이터에서 사라졌으면 번호를 덱 안으로", () => {
    expect(resolveDeckStart(ids, { id: "zzz", index: 9, at: AT }, () => false).index).toBe(3);
    expect(resolveDeckStart(ids, { id: "zzz", index: 1, at: AT }, () => false).index).toBe(1);
  });
  it("저장할 위치: 끝 카드는 id null", () => {
    expect(positionAt(ids, 1, AT)).toEqual({ id: "b", index: 1, at: AT });
    expect(positionAt(ids, 3, AT)).toEqual({ id: null, index: 3, at: AT });
    expect(positionAt(ids, 99, AT)).toEqual({ id: null, index: 3, at: AT });
  });
});

describe("이동 · 키 · 해시", () => {
  it("앞뒤로 움직이되 0..끝 카드 안에서", () => {
    expect(moveIndex(0, "prev", 3)).toBe(0);
    expect(moveIndex(0, "next", 3)).toBe(1);
    expect(moveIndex(3, "next", 3)).toBe(3);
    expect(clampDeckIndex(Number.NaN, 3)).toBe(0);
    expect(clampDeckIndex(-2, 3)).toBe(0);
  });
  it("←/→만 덱을 넘긴다", () => {
    expect(keyToMove("ArrowRight")).toBe("next");
    expect(keyToMove("ArrowLeft")).toBe("prev");
    expect(keyToMove("ArrowDown")).toBeNull();
    expect(keyToMove("Enter")).toBeNull();
  });
  it("해시가 가리키는 카드 (별칭 포함, 인코딩 해제)", () => {
    const anchors = [["mission-a", "practice-group-1"], ["mission-b"], ["mission-c", "practice-group-2"]];
    expect(indexForHash("#mission-b", anchors)).toBe(1);
    expect(indexForHash("#practice-group-2", anchors)).toBe(2);
    expect(indexForHash("mission-a", anchors)).toBe(0);
    expect(indexForHash("#practice", anchors)).toBe(-1);
    expect(indexForHash("", anchors)).toBe(-1);
    expect(indexForHash("#%E0%A4%A", anchors)).toBe(-1);
  });
  it("진행 문구", () => {
    expect(deckPositionLabel(0, 7)).toBe("7개 중 1번째");
  });
});

describe("밀어서 넘기기", () => {
  it("가로가 세로의 1.5배 이상일 때만 가로로 본다", () => {
    expect(swipeAxis(4, 2)).toBeNull();
    expect(swipeAxis(30, 10)).toBe("x");
    expect(swipeAxis(30, 25)).toBe("y");
    expect(swipeAxis(2, 40)).toBe("y");
  });
  it("왼쪽으로 충분히 밀면 다음, 오른쪽이면 이전. 짧으면 빠르게 튕길 때만", () => {
    expect(swipeMove(-80, 5, 400)).toBe("next");
    expect(swipeMove(80, 5, 400)).toBe("prev");
    expect(swipeMove(-40, 5, 400)).toBeNull();
    expect(swipeMove(-40, 5, 150)).toBe("next");
    expect(swipeMove(-20, 2, 100)).toBeNull();
    // 세로 스크롤은 넘기지 않는다
    expect(swipeMove(-70, 200, 300)).toBeNull();
  });
});

describe("저장 형식", () => {
  it("왕복 · 덱 종류별 보기 선택", () => {
    let m = emptyDeckMemory();
    const key = deckKey("practice", "/result?l=user&d=marketing&g=use_tools&ko=1&s=practice");
    expect(key).toBe("practice:l=user&d=marketing&g=use_tools&ko=1&s=practice");
    m = rememberPosition(m, key, { id: "abc", index: 2, at: AT });
    m = setDeckView(m, "prep", "list");
    const back = parseDeckMemory(serializeDeckMemory(m));
    expect(back.positions[key]).toEqual({ id: "abc", index: 2, at: AT });
    expect(deckViewOf(back, "prep")).toBe("list");
    expect(deckViewOf(back, "practice")).toBe("deck");
    expect(deckViewOf(null, "practice")).toBe("deck");
    expect(forgetPosition(back, key).positions[key]).toBeUndefined();
  });
  it("망가진 값·틀린 항목은 버리고 나머지는 살린다", () => {
    expect(parseDeckMemory("{not json")).toEqual(emptyDeckMemory());
    expect(parseDeckMemory({ version: 2 })).toEqual(emptyDeckMemory());
    const m = parseDeckMemory({
      version: 1,
      positions: {
        "practice:l=user": { id: "ok", index: 1, at: AT },
        "prep:l=user": { id: "<script>", index: 1, at: AT },
        "other:l=user": { id: "ok", index: 1, at: AT },
        "prep:l=dev": { id: null, index: -1, at: AT },
        "prep:l=x": { id: null, index: 2, at: "nope" },
      },
      views: { practice: "list", prep: "grid" },
    });
    expect(Object.keys(m.positions)).toEqual(["practice:l=user"]);
    expect(m.views).toEqual({ practice: "list" });
  });
  it(`최근 ${DECK_MAX_POSITIONS}개만 남긴다`, () => {
    let m = emptyDeckMemory();
    for (let i = 0; i < DECK_MAX_POSITIONS + 5; i++) {
      m = rememberPosition(m, `practice:l=${i}`, { id: "a", index: 0, at: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString() });
    }
    expect(Object.keys(m.positions)).toHaveLength(DECK_MAX_POSITIONS);
    expect(m.positions["practice:l=0"]).toBeUndefined();
    expect(m.positions[`practice:l=${DECK_MAX_POSITIONS + 4}`]).toBeDefined();
  });
});

describe("오늘 해낸 수", () => {
  it("덱 카드 중 오늘(이 기기 시간대) 끝낸 것만 센다", () => {
    const now = new Date(2026, 10, 28, 15, 0);
    const today = new Date(2026, 10, 28, 9, 0).toISOString();
    const yesterday = new Date(2026, 10, 27, 23, 0).toISOString();
    expect(
      countDoneToday(
        ["a", "b", "c"],
        [
          { id: "a", at: today },
          { id: "b", at: yesterday },
          { id: "z", at: today },
          { id: "a", at: today },
        ],
        now,
      ),
    ).toBe(1);
    expect(countDoneToday(["a"], [{ id: "a", at: "bad" }], now)).toBe(0);
  });
});
