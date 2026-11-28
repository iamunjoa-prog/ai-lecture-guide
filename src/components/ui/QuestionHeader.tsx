"use client";

import { useState, type ReactNode } from "react";
import { IconArrowUpRight, IconChevronDown } from "./icons";
import { cn } from "./cn";

export interface QuestionHint {
  term: string;
  text: string;
  /** 있으면 "더 알아보기"로 용어집(/glossary#id)을 새 탭에서 연다 */
  glossaryId?: string;
}

export interface QuestionHeaderProps {
  /** 작은 단계 라벨. 예: "AI 활용 수준 · 1/6" */
  stepLabel?: ReactNode;
  /** 큰 질문 제목 */
  title: ReactNode;
  /** 보조 설명 */
  helper?: ReactNode;
  /** '용어 한 입' 1~2개 */
  hints?: QuestionHint[];
  /** 용어 한 입 상자의 id (선택지 묶음 aria-describedby 연결용) */
  hintsId?: string;
  /** 보조 설명의 id (선택지 묶음 aria-describedby 연결용) */
  helperId?: string;
  /** 제목 h1의 id (OptionGroup labelledBy 연결용) */
  id?: string;
  className?: string;
}

/** 처음에 보이는 용어 한 입 수. 나머지는 '용어 더 보기'로 펼친다 (한 화면에 선택지가 다 들어가도록) */
export const VISIBLE_HINTS = 1;

/**
 * 진단 질문 머리: 단계 라벨 · 제목(2줄 이내) · 보조 설명(한 줄) · 용어 한 입(1개 + 용어 더 보기).
 * 390×844에서 단일 선택 질문의 선택지와 안내 문구가 스크롤 없이 들어가도록 여백을 줄였다.
 */
export function QuestionHeader({ stepLabel, title, helper, hints, hintsId, helperId, id, className }: QuestionHeaderProps) {
  const [more, setMore] = useState(false);
  const all = hints ?? [];
  const shown = more ? all : all.slice(0, VISIBLE_HINTS);
  const hidden = all.length - VISIBLE_HINTS;
  const listId = hintsId ? `${hintsId}-list` : undefined;
  return (
    <div className={cn("pt-4 pb-4", className)}>
      {stepLabel && <p className="eyebrow-ko mb-1.5 text-[13px] text-fg-muted">{stepLabel}</p>}
      <h1 id={id} className="display text-[26px] text-fg text-balance outline-none">
        {title}
      </h1>
      {helper && (
        <p id={helperId} className="mt-1.5 text-[15px] leading-snug text-fg-muted">
          {helper}
        </p>
      )}
      {all.length > 0 && (
        <div id={hintsId} data-testid="term-hints" className="mt-3 rounded-lg border border-border px-3.5 py-2">
          <p className="sr-only">용어 한 입</p>
          <ul id={listId} className="flex flex-col gap-1">
            {shown.map((h, i) => (
              <li key={h.term} className="text-[14px] leading-snug text-fg-muted">
                {i === 0 && (
                  <span aria-hidden="true" className="eyebrow-ko mr-1.5 text-[12px] text-accent-ink">
                    용어 한 입
                  </span>
                )}
                <strong className="font-semibold text-fg">{h.term}</strong>
                <span aria-hidden="true"> · </span>
                <span className="sr-only">: </span>
                {h.text}
                {h.glossaryId && (
                  <>
                    {" "}
                    <a
                      href={`/glossary#${h.glossaryId}`}
                      target="_blank"
                      rel="noopener"
                      className="-my-3 inline-flex min-h-11 items-center gap-0.5 align-middle text-[13px] font-semibold whitespace-nowrap text-fg underline decoration-border-strong underline-offset-4 hover:decoration-fg"
                    >
                      더 알아보기
                      <span className="sr-only">: {h.term} 용어집 (새 탭)</span>
                      <IconArrowUpRight size={12} strokeWidth={2} />
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <button
              type="button"
              aria-expanded={more}
              aria-controls={listId}
              onClick={() => setMore((v) => !v)}
              className="-my-1 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-fg-muted hover:text-fg"
              data-testid="term-hints-more"
            >
              {more ? "용어 접기" : `용어 더 보기 (${hidden})`}
              <span aria-hidden="true" className={cn("flex transition-transform duration-200", more && "rotate-180")}>
                <IconChevronDown size={14} />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
