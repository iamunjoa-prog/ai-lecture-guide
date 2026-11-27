import { describe, expect, it } from "vitest";
import affiliateJson from "../../../data/affiliate.json";
import { selectAffiliate, type AffiliateItem } from "../affiliate";
import type { DiagnosisResult } from "@/types";

const dx: DiagnosisResult = { level: "user", domains: [], goals: ["use_tools"], preferKorean: true };
const item = (id: string, extra: Partial<AffiliateItem> = {}): AffiliateItem => ({
  id,
  title: id,
  description: "d",
  url: `https://example.com/${id}`,
  label: "책",
  merchant: "m",
  ...extra,
});

describe("selectAffiliate", () => {
  it("빈 목록이면 빈 배열", () => {
    expect(selectAffiliate(dx, [])).toEqual([]);
  });
  it("수준 일치가 목표 일치보다 앞서고, 동점이면 목록 순서", () => {
    const items = [
      item("a"),
      item("goal", { goals: ["use_tools"] }),
      item("level", { levels: ["user"] }),
      item("both", { levels: ["user"], goals: ["use_tools"] }),
      item("b"),
    ];
    expect(selectAffiliate(dx, items, 5).map((i) => i.id)).toEqual(["both", "level", "goal", "a", "b"]);
  });
  it("수준·목표를 지정했는데 둘 다 안 맞으면 제외", () => {
    const items = [item("x", { levels: ["developer"], goals: ["build_agents"] }), item("y")];
    expect(selectAffiliate(dx, items).map((i) => i.id)).toEqual(["y"]);
  });
  it("고른 목표 중 하나라도 맞으면 목표 일치", () => {
    const items = [item("agents", { levels: ["developer"], goals: ["build_agents"] }), item("products", { levels: ["developer"], goals: ["build_products"] })];
    expect(selectAffiliate({ ...dx, goals: ["use_tools", "build_agents"] }, items).map((i) => i.id)).toEqual(["agents"]);
  });
  it("max 개수를 지키고 원본을 바꾸지 않는다", () => {
    const items = [item("1"), item("2"), item("3")];
    expect(selectAffiliate(dx, items).map((i) => i.id)).toEqual(["1", "2"]);
    expect(selectAffiliate(dx, items, 1)).toHaveLength(1);
    expect(selectAffiliate(dx, items, 0)).toEqual([]);
    expect(items.map((i) => i.id)).toEqual(["1", "2", "3"]);
  });
});

describe("data/affiliate.json", () => {
  const items = affiliateJson as unknown as AffiliateItem[];
  it("배열이고, 항목은 https 링크와 고유한 id를 가진다", () => {
    expect(Array.isArray(items)).toBe(true);
    const ids = new Set<string>();
    for (const it of items) {
      expect(it.url.startsWith("https://")).toBe(true);
      expect(["책", "유료 강의", "도구"]).toContain(it.label);
      expect(it.title && it.description && it.merchant && it.id).toBeTruthy();
      expect(ids.has(it.id)).toBe(false);
      ids.add(it.id);
    }
  });
});
