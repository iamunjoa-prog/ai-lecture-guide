"use client";

import { useSyncExternalStore } from "react";

/** pushState/replaceState로 해시를 바꿨을 때 알리는 이벤트 (브라우저는 이때 hashchange를 보내지 않는다) */
export const HASH_EVENT = "aig:hash";

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  window.addEventListener(HASH_EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener(HASH_EVENT, cb);
  };
}

/**
 * 지금 주소의 해시("#prep" 등). 서버와 하이드레이션 중에는 ""이라 서버 HTML과 어긋나지 않고,
 * 하이드레이션이 끝나면 실제 해시로 다시 그린다.
 */
export function useLocationHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => "",
  );
}

/** 해시를 바꾼다. 기본은 방문 기록에 남겨 뒤로 가기로 돌아올 수 있게 한다 (스크롤은 하지 않는다) */
export function setLocationHash(hash: string, { replace = false }: { replace?: boolean } = {}) {
  const url = `${window.location.pathname}${window.location.search}${hash}`;
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(HASH_EVENT));
}
