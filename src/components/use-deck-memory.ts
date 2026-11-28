"use client";

import { useSyncExternalStore } from "react";
import { DECK_STORAGE_KEY, emptyDeckMemory, parseDeckMemory, serializeDeckMemory, type DeckMemory } from "@/lib/card-deck";

/**
 * 카드 덱 기억(보던 카드 · 목록/한 장씩 선택). localStorage `aig:deck:v1`.
 * 서버·하이드레이션 중에는 null(→ 첫 카드, 한 장씩 보기)이고, 하이드레이션 직후 저장된 값으로 다시 그린다.
 * 저장소가 막혀 있으면 이 탭 안에서만 기억한다(앱은 그대로 동작).
 */
let memory: DeckMemory | null = null;
const listeners = new Set<() => void>();

function load(): DeckMemory {
  try {
    return parseDeckMemory(window.localStorage.getItem(DECK_STORAGE_KEY));
  } catch {
    return emptyDeckMemory();
  }
}

function snapshot(): DeckMemory {
  if (!memory) memory = load();
  return memory;
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === DECK_STORAGE_KEY) {
      memory = load();
      listeners.forEach((fn) => fn());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDeckMemory(): DeckMemory | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export function updateDeckMemory(fn: (m: DeckMemory) => DeckMemory): void {
  const next = fn(snapshot());
  if (next === memory) return;
  memory = next;
  try {
    window.localStorage.setItem(DECK_STORAGE_KEY, serializeDeckMemory(next));
  } catch {
    /* 저장이 막혀 있으면 이 탭 안에서만 기억한다 */
  }
  listeners.forEach((fn) => fn());
}
