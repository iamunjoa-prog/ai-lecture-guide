import { describe, expect, it } from "vitest";
import realGlossary from "../../../data/glossary.json";
import realTheory from "../../../data/theory.json";
import { glossaryLevelAnchor, parseGlossaryTab, resolveGlossaryHash, theoryAnchorId, theoryHref } from "../glossary-tabs";

const terms = new Set(["llm", "agent-loop", "prompt"]);
const theory = new Set(["agent-loop", "rag-search-then-answer"]);
const r = (h: string, tab: "terms" | "theory" = "terms") => resolveGlossaryHash(h, tab, terms, theory);

describe("parseGlossaryTab", () => {
  it("theory만 이론 탭, 나머지는 용어", () => {
    expect(parseGlossaryTab("theory")).toBe("theory");
    expect(parseGlossaryTab(["theory", "terms"])).toBe("theory");
    expect(parseGlossaryTab("x")).toBe("terms");
    expect(parseGlossaryTab(undefined)).toBe("terms");
  });
});

describe("resolveGlossaryHash", () => {
  it("빈 해시는 쿼리 탭", () => {
    expect(r("", "theory")).toEqual({ tab: "theory", target: null });
    expect(r("#")).toEqual({ tab: "terms", target: null });
  });
  it("탭 이름 해시", () => {
    expect(r("#theory")).toEqual({ tab: "theory", target: null });
    expect(r("#terms", "theory")).toEqual({ tab: "terms", target: null });
  });
  it("수준 구역", () => {
    expect(r("#level-user", "theory")).toEqual({ tab: "terms", target: "level-user" });
    expect(r("#theory-level-user")).toEqual({ tab: "theory", target: "theory-level-user" });
  });
  it("접두어가 붙은 개념 앵커", () => {
    expect(r("#theory-rag-search-then-answer")).toEqual({ tab: "theory", target: "theory-rag-search-then-answer" });
  });
  it("예전 /theory#<id>: 이론 탭이면 개념, 용어와 겹치지 않으면 어느 탭에서든 개념", () => {
    expect(r("#agent-loop", "theory")).toEqual({ tab: "theory", target: "theory-agent-loop" });
    expect(r("#rag-search-then-answer")).toEqual({ tab: "theory", target: "theory-rag-search-then-answer" });
  });
  it("용어 해시는 용어 탭 (겹치면 용어 탭이 먼저)", () => {
    expect(r("#llm", "theory")).toEqual({ tab: "terms", target: "llm" });
    expect(r("#agent-loop")).toEqual({ tab: "terms", target: "agent-loop" });
  });
  it("모르는 해시는 쿼리 탭 그대로", () => {
    expect(r("#nope", "theory")).toEqual({ tab: "theory", target: "nope" });
    expect(r("#%E0%A4%A")).toEqual({ tab: "terms", target: "%E0%A4%A" });
  });
});

describe("주소 만들기", () => {
  it("이론 탭 주소", () => {
    expect(theoryHref()).toBe("/glossary?tab=theory");
    expect(theoryHref({ level: "user" })).toBe("/glossary?tab=theory&l=user");
    expect(theoryHref({ conceptId: "agent-loop" })).toBe("/glossary?tab=theory#theory-agent-loop");
    expect(glossaryLevelAnchor("theory", "user")).toBe("theory-level-user");
    expect(glossaryLevelAnchor("terms", "user")).toBe("level-user");
  });
  it("실제 데이터: 개념 앵커가 어떤 용어 id와도 겹치지 않는다", () => {
    const termIds = new Set((realGlossary as { id: string }[]).map((t) => t.id));
    for (const c of realTheory as { id: string }[]) expect(termIds.has(theoryAnchorId(c.id)), c.id).toBe(false);
  });
});
