/** 진단 중간 상태(답변·현재 질문 위치) sessionStorage 저장 */
import type { DiagnosisAnswers } from "@/lib/questions";
import { DIAGNOSIS_STORAGE_KEY } from "@/lib/diagnosis-state";

export const PROGRESS_STORAGE_KEY = "ai-lecture-guide:progress";

export interface DiagnosisProgress {
  index: number;
  answers: DiagnosisAnswers;
}

export function loadProgress(): DiagnosisProgress | null {
  try {
    const raw = window.sessionStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { index, answers } = parsed as Partial<DiagnosisProgress>;
    if (typeof index !== "number" || !answers || typeof answers !== "object") return null;
    const clean: DiagnosisAnswers = {};
    for (const [k, v] of Object.entries(answers)) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) clean[k] = v;
    }
    return { index, answers: clean };
  } catch {
    return null;
  }
}

export function saveProgress(p: DiagnosisProgress): void {
  try {
    window.sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* 저장이 막혀 있으면 무시 */
  }
}

/** 진단 중간 상태와 최종 결과를 모두 지운다 (다시 진단하기) */
export function clearAllDiagnosisStorage(): void {
  try {
    window.sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
    window.sessionStorage.removeItem(DIAGNOSIS_STORAGE_KEY);
  } catch {
    /* noop */
  }
}
