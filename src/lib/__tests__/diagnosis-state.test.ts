import { describe, expect, it } from "vitest";
import { decodeDiagnosis, diagnosisHref, encodeDiagnosis, toSearchParams } from "../diagnosis-state";
import type { DiagnosisResult } from "../../types";

const d: DiagnosisResult = { level: "user", domains: ["marketing", "coding"], goals: ["use_tools"], preferKorean: true };

describe("encode/decode", () => {
  it("왕복 변환이 같은 값을 돌려준다", () => {
    expect(decodeDiagnosis(encodeDiagnosis(d))).toEqual(d);
    expect(decodeDiagnosis(toSearchParams(d))).toEqual(d);
    const d2: DiagnosisResult = { level: "developer", domains: ["startup"], goals: ["build_products"], preferKorean: false };
    expect(decodeDiagnosis(encodeDiagnosis(d2))).toEqual(d2);
  });
  it("이미지·영상 제작(creative) 분야: d=creative 왕복, 다른 분야와 함께, 예전 링크는 그대로", () => {
    const c: DiagnosisResult = { level: "beginner", domains: ["creative"], goals: ["use_tools"], preferKorean: true };
    expect(toSearchParams(c).get("d")).toBe("creative");
    expect(decodeDiagnosis(encodeDiagnosis(c))).toEqual(c);
    expect(decodeDiagnosis("l=user&d=marketing,creative&g=use_tools,build_products&ko=0")?.domains).toEqual(["marketing", "creative"]);
    expect(decodeDiagnosis("l=user&d=creative,marketing,data,coding&g=use_tools")).toBeNull(); // 4개
    expect(decodeDiagnosis("l=user&d=marketing,coding&g=use_tools&ko=1")).toEqual(d); // 예전 링크
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
      level: "user", domains: ["data"], goals: ["understand"], preferKorean: false,
    });
  });
  it("분야 미정(빈 배열)은 d= 로 왕복된다", () => {
    const none: DiagnosisResult = { level: "beginner", domains: [], goals: ["understand"], preferKorean: true };
    expect(encodeDiagnosis(none)).toBe("l=beginner&d=&g=understand&ko=1");
    expect(decodeDiagnosis(encodeDiagnosis(none))).toEqual(none);
    expect(decodeDiagnosis("?l=beginner&d=&g=understand&ko=1")).toEqual(none);
    expect(decodeDiagnosis({ l: "beginner", d: "", g: "understand", ko: "1" })).toEqual(none);
  });
  it("목표 여러 개: 쉼표 목록, 순서(우선순위) 유지, 왕복", () => {
    const multi: DiagnosisResult = { level: "practitioner", domains: ["automation"], goals: ["build_agents", "use_tools", "understand"], preferKorean: false };
    expect(toSearchParams(multi).get("g")).toBe("build_agents,use_tools,understand");
    expect(decodeDiagnosis(encodeDiagnosis(multi))).toEqual(multi);
    expect(decodeDiagnosis("l=user&d=data&g=use_tools,build_agents&ko=0")?.goals).toEqual(["use_tools", "build_agents"]);
    expect(decodeDiagnosis("l=user&d=data&g=build_agents%2Cuse_tools&ko=0")?.goals).toEqual(["build_agents", "use_tools"]);
    const four = "l=user&d=data&g=understand,use_tools,build_agents,build_products";
    expect(decodeDiagnosis(four)?.goals).toHaveLength(4);
  });
  it("예전 단일 목표 링크도 그대로 읽힌다 (하위 호환)", () => {
    expect(decodeDiagnosis("l=developer&d=coding&g=build_agents&ko=0")).toEqual({
      level: "developer", domains: ["coding"], goals: ["build_agents"], preferKorean: false,
    });
  });
  it("중복 목표는 처음 것만 남긴다", () => {
    expect(decodeDiagnosis("l=user&d=data&g=use_tools,understand,use_tools")?.goals).toEqual(["use_tools", "understand"]);
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
    ["l=user&d=marketing&g=", "빈 목표"],
    ["l=user&d=marketing&g=use_tools,", "목표 끝에 쉼표"],
    ["l=user&d=marketing&g=use_tools,get_rich", "모르는 목표 섞임"],
    ["l=user&d=marketing&g=unsure", "unsure는 URL 값이 아님"],
    ["l=user&d=marketing&g=use_tools&ko=yes", "잘못된 ko"],
  ])("잘못된 입력 → null: %s (%s)", (q) => {
    expect(decodeDiagnosis(q)).toBeNull();
  });
  it("null/undefined → null", () => {
    expect(decodeDiagnosis(null)).toBeNull();
    expect(decodeDiagnosis(undefined)).toBeNull();
  });
});
