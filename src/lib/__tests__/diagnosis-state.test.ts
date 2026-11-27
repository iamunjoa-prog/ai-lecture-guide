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
  it("분야 미정(빈 배열)은 d= 로 왕복된다", () => {
    const none: DiagnosisResult = { level: "beginner", domains: [], goal: "understand", preferKorean: true };
    expect(encodeDiagnosis(none)).toBe("l=beginner&d=&g=understand&ko=1");
    expect(decodeDiagnosis(encodeDiagnosis(none))).toEqual(none);
    expect(decodeDiagnosis("?l=beginner&d=&g=understand&ko=1")).toEqual(none);
    expect(decodeDiagnosis({ l: "beginner", d: "", g: "understand", ko: "1" })).toEqual(none);
  });
  it("diagnosisHref", () => {
    expect(diagnosisHref(d)).toBe(`/result?${encodeDiagnosis(d)}`);
  });
  it.each([
    ["", "빈 문자열"],
    ["l=expert&d=marketing&g=use_tools&ko=1", "잘못된 수준"],
    ["d=marketing&g=use_tools&ko=1", "수준 없음"],
    ["l=user&g=use_tools&ko=1", "분야 없음"],
    ["l=user&g=use_tools&ko=1", "분야 파라미터 없음"],
    ["l=user&d=,&g=use_tools", "쉼표만 있는 분야"],
    ["l=user&d=coding,&g=use_tools", "끝에 쉼표"],
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
