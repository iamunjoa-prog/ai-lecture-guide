/**
 * 진단 결과 ↔ URL 쿼리 변환 (B 담당).
 *
 * 형식: `l=user&d=marketing,coding&g=use_tools,build_agents&ko=1`
 *  - l  : Level (필수)
 *  - d  : Domain 0~3개, 쉼표 구분 (중복은 하나로 합침).
 *         분야 미정이면 빈 값 `d=`로 쓴다. 파라미터 자체가 없으면 잘못된 링크로 본다.
 *  - g  : Goal 1~4개, 쉼표 구분, 앞쪽이 우선순위 (필수). 중복은 처음 것만 남긴다.
 *         예전 단일 목표 링크(`g=use_tools`)도 그대로 읽힌다.
 *  - ko : "1" | "0" (없으면 false)
 * 하나라도 잘못되면 decode 결과는 null.
 */
import type { DiagnosisResult, Domain, Goal } from "../types";
import { isDomain, isGoal, isLevel, MAX_DOMAINS, MAX_GOALS } from "./questions";

export const PARAM_KEYS = { level: "l", domains: "d", goals: "g", preferKorean: "ko" } as const;

/** sessionStorage 키 */
export const DIAGNOSIS_STORAGE_KEY = "ai-lecture-guide:diagnosis";

/** Next.js 페이지의 `searchParams` 객체 형태 */
export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function toSearchParams(d: DiagnosisResult): URLSearchParams {
  const p = new URLSearchParams();
  p.set(PARAM_KEYS.level, d.level);
  p.set(PARAM_KEYS.domains, d.domains.join(","));
  p.set(PARAM_KEYS.goals, d.goals.join(","));
  p.set(PARAM_KEYS.preferKorean, d.preferKorean ? "1" : "0");
  return p;
}

/** "l=user&d=marketing%2Ccoding&g=use_tools%2Cbuild_agents&ko=1" (앞의 "?" 없음) */
export function encodeDiagnosis(d: DiagnosisResult): string {
  return toSearchParams(d).toString();
}

/** 결과 페이지 경로까지 만들어 준다. 예: diagnosisHref(d) → "/result?l=..." */
export function diagnosisHref(d: DiagnosisResult, path = "/result"): string {
  return `${path}?${encodeDiagnosis(d)}`;
}

function first(v: string | string[] | null | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

/**
 * URLSearchParams, 쿼리 문자열("?l=..." 또는 "l=..."), Next.js searchParams 객체를 받는다.
 * 유효하지 않으면 null.
 */
export function decodeDiagnosis(
  input: URLSearchParams | string | SearchParamsRecord | null | undefined,
): DiagnosisResult | null {
  if (input == null) return null;
  let get: (key: string) => string | undefined;
  if (typeof input === "string") {
    const p = new URLSearchParams(input.startsWith("?") ? input.slice(1) : input);
    get = (k) => p.get(k) ?? undefined;
  } else if (input instanceof URLSearchParams) {
    get = (k) => input.get(k) ?? undefined;
  } else {
    get = (k) => first(input[k]);
  }

  const level = get(PARAM_KEYS.level);
  if (!isLevel(level)) return null;

  const rawGoals = get(PARAM_KEYS.goals);
  if (rawGoals === undefined) return null;
  const goalParts = rawGoals.split(",").map((s) => s.trim());
  if (!goalParts.every(isGoal)) return null; // 빈 값·끝 쉼표·모르는 목표
  const goals = [...new Set(goalParts)] as Goal[];
  if (goals.length < 1 || goals.length > MAX_GOALS) return null;

  const rawDomains = get(PARAM_KEYS.domains);
  if (rawDomains === undefined) return null; // d 자체가 없음(빈 값 `d=`과 구분)
  let domains: Domain[] = [];
  if (rawDomains.trim() !== "") {
    const parts = rawDomains.split(",").map((s) => s.trim());
    if (!parts.every(isDomain)) return null;
    domains = [...new Set(parts)] as Domain[];
    if (domains.length > MAX_DOMAINS) return null;
  }

  const ko = get(PARAM_KEYS.preferKorean);
  if (ko !== undefined && ko !== "0" && ko !== "1") return null;

  return { level, domains, goals, preferKorean: ko === "1" };
}

/** sessionStorage에 저장 (브라우저가 아니거나 저장이 막혀 있으면 조용히 무시) */
export function saveDiagnosisToSession(d: DiagnosisResult): void {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(DIAGNOSIS_STORAGE_KEY, encodeDiagnosis(d));
  } catch {
    /* noop */
  }
}

/** sessionStorage에서 읽기 (없거나 잘못되면 null) */
export function loadDiagnosisFromSession(): DiagnosisResult | null {
  try {
    if (typeof window === "undefined") return null;
    return decodeDiagnosis(window.sessionStorage.getItem(DIAGNOSIS_STORAGE_KEY));
  } catch {
    return null;
  }
}
