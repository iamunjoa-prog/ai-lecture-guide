"use client";

import { useEffect } from "react";
import { setLastDiagnosis } from "@/lib/saved";
import { getSavedStore, nowIso } from "./use-saved";

/** 결과 화면을 볼 때 '최근 진단 결과'로 기억한다 (저장이 막혀 있으면 조용히 넘어간다) */
export function RememberDiagnosis({ href }: { href: string }) {
  useEffect(() => {
    getSavedStore().update((s) => setLastDiagnosis(s, href, nowIso()));
  }, [href]);
  return null;
}
