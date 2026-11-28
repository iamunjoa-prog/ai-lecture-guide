"use client";

import Link from "next/link";
import { IconArrowRight, IconCheck } from "@/components/ui";

/** 카드 덱 둘레 조각 (실습 덱 · 준비/개념 덱이 함께 쓴다) */

export interface DeckLink {
  href: string;
  label: string;
}

/** 끝낸 카드 표시 + 되돌리기 */
export function DoneLine({ text, undo, onUndo }: { text: string; undo: string; onUndo: () => void }) {
  return (
    <p
      className="mt-2 flex flex-wrap items-center gap-x-2 text-[14px] font-semibold text-accent-ink"
      data-testid="deck-done-line"
    >
      <IconCheck size={16} strokeWidth={2.25} />
      {text}
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex min-h-11 items-center px-1 text-[13px] font-medium text-fg-muted underline underline-offset-4"
      >
        {undo}
      </button>
    </p>
  );
}

export const END_ROW =
  "flex min-h-12 w-full items-center gap-2 border-b border-border py-2 text-left text-[15px] font-medium text-fg";

/** 끝 카드 '다음에 해 볼 것' 한 줄 (같은 화면 해시 링크 또는 다른 페이지 링크) */
export function EndLinkItems({ links }: { links: DeckLink[] }) {
  return (
    <>
      {links.map((l) => (
        <li key={l.href}>
          {l.href.startsWith("#") ? (
            <a href={l.href} className={END_ROW}>
              <span className="min-w-0 flex-1">{l.label}</span>
              <IconArrowRight size={16} strokeWidth={2} className="shrink-0 text-accent-ink" />
            </a>
          ) : (
            <Link href={l.href} className={END_ROW}>
              <span className="min-w-0 flex-1">{l.label}</span>
              <IconArrowRight size={16} strokeWidth={2} className="shrink-0 text-accent-ink" />
            </Link>
          )}
        </li>
      ))}
    </>
  );
}
