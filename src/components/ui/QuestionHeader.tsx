import type { ReactNode } from "react";
import { IconArrowUpRight } from "./icons";
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

export function QuestionHeader({ stepLabel, title, helper, hints, hintsId, helperId, id, className }: QuestionHeaderProps) {
  return (
    <div className={cn("pt-8 pb-7", className)}>
      {stepLabel && <p className="eyebrow-ko mb-3 text-[13px] text-fg-muted">{stepLabel}</p>}
      <h1 id={id} className="display text-[30px] text-fg text-balance outline-none">
        {title}
      </h1>
      {helper && (
        <p id={helperId} className="mt-3 text-[15px] leading-relaxed text-fg-muted">
          {helper}
        </p>
      )}
      {hints && hints.length > 0 && (
        <div
          id={hintsId}
          data-testid="term-hints"
          className="mt-5 rounded-lg border border-border px-4 pt-3 pb-1"
        >
          <p className="eyebrow-ko text-[12px] text-accent-ink">용어 한 입</p>
          <ul className="mt-1.5 flex flex-col">
            {hints.map((h) => (
              <li key={h.term} className="pb-2 text-[14px] leading-relaxed text-fg-muted">
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
        </div>
      )}
    </div>
  );
}
