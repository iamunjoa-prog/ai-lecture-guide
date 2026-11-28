import type { TheoryConcept } from "@/types";
import { cn, IconArrowRight, IconArrowUpRight, IconChevronDown } from "@/components/ui";
import { SaveToggle, TheoryReadToggle } from "./saved/SaveToggle";

export interface TheoryLectureLink {
  videoId: string;
  title: string;
  instructorName: string;
  /** 로드맵 카드 앵커(#lecture-…) 또는 유튜브 URL */
  href: string;
  /** true면 유튜브 새 탭 */
  external: boolean;
}

export interface TheoryConceptCardProps {
  concept: TheoryConcept;
  lectures: TheoryLectureLink[];
  /** 앞에 붙는 번호 (1부터) */
  index: number;
  /** 처음부터 펼쳐 둘지 */
  defaultOpen?: boolean;
  /** 앵커 id (용어집 '3분 이론' 탭 전용, 예: theory-<개념 id>) */
  anchorId?: string;
  /** 저장 버튼 표시 (기본 true) */
  savable?: boolean;
}

/**
 * '3분 이론' 개념 하나 (네이티브 details → 키보드·스크린리더 기본 지원)
 * 접힘: 번호·제목·한 줄 요약 / 펼침: 본문 · 쉽게 말하면 · 바로 해보기 · 관련 강의 · 출처
 */
export function TheoryConceptCard({
  concept,
  lectures,
  index,
  defaultOpen = false,
  anchorId,
  savable = true,
}: TheoryConceptCardProps) {
  const num = String(index).padStart(2, "0");
  return (
    <div className="relative border-b border-border">
      <details
        id={anchorId}
        open={defaultOpen || undefined}
        className="group scroll-mt-24"
        data-testid="theory-concept"
      >
        <summary
          className={cn(
            "flex cursor-pointer list-none items-start gap-3 rounded-md py-5 select-none [&::-webkit-details-marker]:hidden",
          )}
        >
          <span
            aria-hidden="true"
            className="w-8 shrink-0 pt-0.5 text-[22px] leading-none font-extralight tracking-[-0.04em] text-fg tabular-nums"
          >
            {num}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-[18px] leading-snug font-semibold tracking-[-0.02em] text-fg", savable && "pr-10")}>
              {concept.title}
            </span>
            <span className="mt-1 block text-[15px] leading-relaxed text-fg-muted">{concept.summary}</span>
          </span>
          <span
            aria-hidden="true"
            className="mt-0.5 flex shrink-0 text-fg-muted transition-transform duration-300 group-open:rotate-180"
          >
            <IconChevronDown size={20} />
          </span>
        </summary>

        <div className="pb-7 min-[360px]:pl-11">
          <div className="space-y-3">
            {concept.body.map((p, i) => (
              <p key={i} className="text-[16px] leading-[1.75] text-fg">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-5 rounded-md bg-accent-soft px-4 py-3.5">
            <p className="text-[13px] font-semibold text-accent-soft-fg">쉽게 말하면</p>
            <p className="mt-1 text-[15px] leading-relaxed text-accent-soft-fg">{concept.analogy}</p>
          </div>

          {concept.tryIt && (
            <div className="mt-4 border-l-2 border-accent pl-3.5">
              <p className="text-[13px] font-semibold text-fg">바로 해보기</p>
              <p className="mt-0.5 text-[15px] leading-relaxed text-fg-muted">{concept.tryIt}</p>
            </div>
          )}

          {savable && <TheoryReadToggle conceptId={concept.id} title={concept.title} className="mt-4" />}

          {lectures.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow-ko text-fg-muted">이 개념이 나오는 강의</p>
              <ul className="mt-2 border-t border-border" data-testid="theory-lectures">
                {lectures.map((l) => (
                  <li key={l.videoId} className="border-b border-border">
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex min-h-11 items-start gap-3 py-3 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] leading-snug font-medium text-fg underline-offset-4 hover:underline">
                          {l.title}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-fg-muted">
                          {l.instructorName} · {l.external ? "유튜브에서 보기" : "내 로드맵에 있어요"}
                        </span>
                      </span>
                      <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-accent-ink">
                        {l.external ? (
                          <IconArrowUpRight size={16} strokeWidth={2} />
                        ) : (
                          <IconArrowRight size={16} strokeWidth={2} />
                        )}
                      </span>
                      {l.external && <span className="sr-only">(새 탭에서 열림)</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <p className="eyebrow-ko text-fg-muted">출처</p>
            <ul className="mt-2 space-y-1.5" data-testid="theory-sources">
              {concept.sources.map((s) => (
                <li key={s.url} className="text-[13px] leading-relaxed text-fg-muted">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words underline decoration-border-strong underline-offset-4 hover:text-fg"
                  >
                    {s.publisher} · {s.title}
                    <span className="sr-only"> (새 탭에서 열림)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
      {savable && (
        <SaveToggle kind="theory" id={concept.id} label={`이론 저장: ${concept.title}`} className="absolute top-2.5 right-8" />
      )}
    </div>
  );
}
