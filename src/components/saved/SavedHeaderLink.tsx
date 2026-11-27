"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { cn } from "@/components/ui";
import type { KnownIdLists } from "@/components/catalog";
import { countSaved, pruneSaved, type KnownIds } from "@/lib/saved";
import { getSavedStore, useSaved } from "./use-saved";

export function toKnownIds(lists: KnownIdLists): KnownIds {
  return {
    lectures: new Set(lists.lectures),
    missions: new Set(lists.missions),
    skills: new Set(lists.skills),
    terms: new Set(lists.terms),
    theory: new Set(lists.theory),
  };
}

/** 저장된 항목 중 데이터에서 사라진 id를 정리한다 (바뀐 게 있을 때만 쓴다) */
export function useSavedPrune(known: KnownIdLists | undefined) {
  const sets = useMemo(() => (known ? toKnownIds(known) : null), [known]);
  const { ready, available, state } = useSaved();
  useEffect(() => {
    if (!sets || !ready || !available) return;
    if (pruneSaved(state, sets) !== state) getSavedStore().update((s) => pruneSaved(s, sets));
  }, [sets, ready, available, state]);
}

/** 상단 '내 학습함' 링크 + 저장 개수 배지 (배지는 브라우저에서만, 위치 고정이라 화면이 밀리지 않는다) */
export function SavedHeaderLink({
  known,
  onStage = true,
  current = false,
  className,
}: {
  known?: KnownIdLists;
  onStage?: boolean;
  /** 지금 내 학습함을 보고 있으면 true (aria-current) */
  current?: boolean;
  className?: string;
}) {
  useSavedPrune(known);
  const { state, ready, available } = useSaved();
  const count = ready && available ? countSaved(state) : 0;
  return (
    <Link
      href="/saved"
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative",
        // className을 넘기면 기본 크기·여백 대신 그것을 쓴다 (cn은 클래스를 합치기만 해서 겹치면 어느 쪽이 이길지 모른다)
        className ?? "inline-flex min-h-11 items-center rounded-full pr-4 pl-2 text-[15px] font-medium transition-colors duration-200",
        onStage ? (current ? "text-stage-fg" : "text-stage-muted hover:text-stage-fg") : current ? "text-fg" : "text-fg-muted hover:text-fg",
      )}
      data-testid="saved-link"
    >
      내 학습함
      {count > 0 && (
        <>
          <span
            aria-hidden="true"
            data-testid="saved-count"
            className="absolute top-0.5 -right-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-fg tabular-nums"
          >
            {count > 99 ? "99+" : count}
          </span>
          <span className="sr-only"> (저장 {count}개)</span>
        </>
      )}
    </Link>
  );
}
