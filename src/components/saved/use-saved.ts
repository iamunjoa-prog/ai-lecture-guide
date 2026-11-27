"use client";

import { useSyncExternalStore } from "react";
import {
  createSavedStore,
  SAVED_STORAGE_KEY,
  SERVER_SNAPSHOT,
  type SavedSnapshot,
  type SavedState,
  type SavedStore,
} from "@/lib/saved";

let store: SavedStore | null = null;

/** 브라우저에서 한 번만 만드는 스토어. 다른 탭에서 바꾸면 `storage` 이벤트로 다시 읽는다 */
export function getSavedStore(): SavedStore {
  if (store) return store;
  const s = createSavedStore(() => window.localStorage);
  store = s;
  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key === SAVED_STORAGE_KEY) s.refresh();
  });
  return s;
}

const subscribe = (l: () => void) => getSavedStore().subscribe(l);
const getSnapshot = () => getSavedStore().getSnapshot();
const getServerSnapshot = () => SERVER_SNAPSHOT;

/**
 * 내 학습함 상태. 서버 렌더와 하이드레이션 중에는 빈 상태(`ready=false`)를 돌려주고,
 * 하이드레이션 직후 저장된 내용으로 다시 그린다 → 하이드레이션 불일치가 없다.
 */
export function useSaved(): SavedSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 변경 적용. 저장에 실패하면 false */
export function updateSaved(fn: (s: SavedState) => SavedState): boolean {
  return getSavedStore().update(fn);
}

export const nowIso = () => new Date().toISOString();
