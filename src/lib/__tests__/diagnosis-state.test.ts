import { describe, expect, it } from "vitest";
import { decodeDiagnosis, diagnosisHref, encodeDiagnosis, toSearchParams } from "../diagnosis-state";
import type { DiagnosisResult } from "../../types";

const d: DiagnosisResult = { level: "user", domains: ["marketing", "coding"], goal: "use_tools", preferKorean: true };

describe("encode/decode", () => {
  it("왕복 변환이 같은 값을 돌려준다", () => {
    expect(decodeDiagnosis(encodeDiagnosis(d))).toEqual(d);
    expect(decodeDiagnosis(toSearchParams(d))).toEqual(d);
    const d2: DiagnosisResult = { level: "developer", domains: ["startup"], goal: "build_products", preferKorean: false };
    expect(decodeDiagnosis(encodeDiagnosis(d2))).toEqual(d2);
  });
  it("예시 형식을 그대로 읽는다 (? 포함, 쉼표 인코딩 안 된 형태)", () => {
    expect(decodeDiagnosis("?l=user&d=marketing,coding&g=use_tools&ko=1")).toEqual(d);
  });
  it("Next.js searchParams 객체를 받는다", () => {
    expect(decodeDiagnosis({ l: "user", d: "marketing,coding", g: "use_tools", ko: "1" })).toEqual(d);
    expect(decodeDiagnosis({ l: ["user"], d: ["marketing,coding"], g: "use_tools", ko: "1" })).toEqual(d);
  });
  it("ko가 없으면 false, 중복 분야는 합친다", () => {
    expect(decodeDiagnosis("l=user&d=data,data&g=understand")).toEqual({
      level: "user", domains: ["data"], goal: "understand", preferKorean: false,
    });
  });
  it("diagnosisHref", () => {
    expect(diagnosisHref(d)).toBe(`/result?${encodeDiagnosis(d)}`);
  });
  it.each([
    ["", "빈 문자열"],
    ["l=expert&d=marketing&g=use_tools&ko=1", "잘못된 수준"],
    ["d=marketing&g=use_tools&ko=1", "수준 없음"],
    ["l=user&g=use_tools&ko=1", "분야 없음"],
    ["l=user&d=&g=use_tools", "빈 분야"],
    ["l=user&d=marketing,cooking&g=use_tools", "모르는 분야"],
    ["l=user&d=marketing,coding,data,startup&g=use_tools", "분야 4개"],
    ["l=user&d=marketing&g=get_rich", "잘못된 목표"],
    ["l=user&d=marketing", "목표 없음"],
    ["l=user&d=marketing&g=use_tools&ko=yes", "잘못된 ko"],
  ])("잘못된 입력 → null: %s (%s)", (q) => {
    expect(decodeDiagnosis(q)).toBeNull();
  });
  it("null/undefined → null", () => {
    expect(decodeDiagnosis(null)).toBeNull();
    expect(decodeDiagnosis(undefined)).toBeNull();
  });
});
