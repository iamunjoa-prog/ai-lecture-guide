"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "./Button";
import {
  IconArrowUpRight,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconGlobe,
  IconPlay,
  IconSubtitles,
} from "./icons";
import { cn } from "./cn";

export interface LectureCardProps {
  instructorName: string;
  /** 이력 한 줄 */
  instructorTitle: string;
  /** 강사 위 작은 라벨. 예: "창업자 · 핵심 연구자" */
  instructorBadge?: string;
  /** 추천 사유 */
  reason: string;
  videoTitle: string;
  durationMin: number;
  language: "ko" | "en";
  hasKoreanSubtitle: boolean;
  /** 얻을 수 있는 것 3가지 */
  takeaways: readonly string[];
  /** 유튜브 URL */
  url: string;
  /** 예: https://i.ytimg.com/vi/{id}/hqdefault.jpg */
  thumbnailUrl?: string;
  /** 플레이리스트면 "재생목록" 표시 */
  kind?: "video" | "playlist";
  /** 핵심 용어 (최대 3개). 태그를 누르면 짧은 설명과 용어집 링크가 열린다 */
  terms?: { id: string; term: string; short: string; action?: ReactNode }[];
  /** true면 추천 이유 전체를 박스로, false면 첫 문장만 흐린 글씨로 보여 준다 */
  fullReason?: boolean;
  /** 로드맵에서 가장 먼저 볼 강의 표시 */
  startHere?: boolean;
  /** 카드 오른쪽 위 동작(예: 저장 버튼). 44px 정사각형을 권장 */
  headerAction?: ReactNode;
  /** "자세히 보기" 안 맨 아래에 붙는 내용(예: 강의 보고 해보기) */
  extra?: ReactNode;
  /** 자세히 보기를 펼친 채로 시작 */
  defaultOpen?: boolean;
  className?: string;
}

/** 첫 문장만 (문장부호 뒤 공백 기준) */
export function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : text;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function Meta({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className="flex text-fg-subtle">
        {icon}
      </span>
      {children}
    </li>
  );
}

/** 추천 강의 카드 — 강사가 가장 먼저 보이고, 세부 내용은 "자세히 보기"로 접어 둔다 */
export function LectureCard({
  instructorName,
  instructorTitle,
  instructorBadge,
  reason,
  videoTitle,
  durationMin,
  language,
  hasKoreanSubtitle,
  takeaways,
  url,
  thumbnailUrl,
  kind = "video",
  terms = [],
  fullReason = true,
  startHere = false,
  headerAction,
  extra,
  defaultOpen = false,
  className,
}: LectureCardProps) {
  const uid = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [termId, setTermId] = useState<string | null>(null);
  const [thumbOk, setThumbOk] = useState(true);
  const selected = terms.find((t) => t.id === termId);

  return (
    <article
      className={cn(
        "relative rounded-xl border border-border bg-surface p-5",
        className,
      )}
    >
      {headerAction && <div className="absolute top-2.5 right-2.5">{headerAction}</div>}
      {startHere && (
        <p className="mb-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-[13px] font-bold text-accent-fg">
          여기서 먼저 시작하세요
        </p>
      )}
      {/* 강사 */}
      <header>
        {instructorBadge && (
          <p className={cn("eyebrow-ko text-accent-ink", Boolean(headerAction) && "pr-10")}>{instructorBadge}</p>
        )}
        <p
          className={cn(
            "text-[19px] font-bold leading-snug tracking-[-0.02em] text-fg",
            instructorBadge && "mt-1.5",
            Boolean(headerAction) && "pr-10",
          )}
        >
          {instructorName}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">
          {instructorTitle}
        </p>
      </header>

      {/* 주요 강의 (+ 작은 썸네일) */}
      <div className="mt-4 flex items-start gap-3.5">
        <div className="min-w-0 flex-1">
          <p className="eyebrow-ko text-fg-muted">
            {kind === "playlist" ? "재생목록" : "주요 강의"}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold leading-snug tracking-[-0.015em] text-fg">
            {videoTitle}
          </h3>
          <ul
            className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] text-fg-muted"
            aria-label="강의 정보"
          >
            <Meta icon={<IconClock size={15} />}>
              {formatDuration(durationMin)}
            </Meta>
            <Meta icon={<IconGlobe size={15} />}>
              <span className="font-medium text-fg">
                {language === "ko" ? "한국어 강의" : "영어 강의"}
              </span>
            </Meta>
            {language === "en" && (
              <Meta icon={<IconSubtitles size={15} />}>
                {hasKoreanSubtitle ? "한국어 자막 있음" : "한국어 자막 없음"}
              </Meta>
            )}
          </ul>
        </div>
        {thumbnailUrl && thumbOk && (
          <div
            className="relative mt-1 hidden aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-stage min-[360px]:block"
            aria-hidden="true"
          >
            <span className="absolute inset-0 flex items-center justify-center text-stage-muted">
              <IconPlay size={20} strokeWidth={1.25} />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt=""
              width={96}
              height={54}
              loading="lazy"
              decoding="async"
              onError={() => setThumbOk(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* 추천 사유: 단계의 첫 카드는 전체, 나머지는 첫 문장만 */}
      {fullReason ? (
        <div className="mt-4 rounded-md bg-accent-soft px-4 py-3.5">
          <p className="text-[13px] font-semibold text-accent-soft-fg">
            추천 이유
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-accent-soft-fg">
            {reason}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[14px] leading-relaxed text-fg-muted">
          {firstSentence(reason)}
        </p>
      )}

      <Button
        href={url}
        external
        variant="secondary"
        fullWidth
        className="mt-5"
        aria-label={`유튜브에서 보기: ${videoTitle} (새 탭)`}
        leadingIcon={<IconPlay size={16} />}
        trailingIcon={<IconArrowUpRight size={16} className="text-fg-muted" />}
      >
        유튜브에서 보기
      </Button>

      {/* 자세히 보기 */}
      <div className="mt-4 border-t border-border pt-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-more`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between rounded-md text-[15px] font-medium text-fg"
        >
          <span>{open ? "접기" : "자세히 보기"}</span>
          <span
            aria-hidden="true"
            className={cn(
              "flex text-fg-muted transition-transform duration-300",
              open && "rotate-180",
            )}
          >
            <IconChevronDown size={18} />
          </span>
        </button>
      </div>

      <div id={`${uid}-more`} hidden={!open} className="mt-3">
        <p className="text-[14px] font-semibold text-fg">
          이 강의로 얻을 수 있는 것
        </p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {takeaways.slice(0, 3).map((t, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-[15px] leading-relaxed text-fg"
            >
              <span
                aria-hidden="true"
                className="mt-[4px] flex shrink-0 text-accent-ink"
              >
                <IconCheck size={16} strokeWidth={2} />
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>

        {terms.length > 0 && (
          <div className="mt-5">
            <p className="text-[13px] font-semibold text-fg">핵심 용어</p>
            <ul className="mt-2.5 flex flex-wrap gap-2" data-testid="card-terms">
              {terms.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-pressed={termId === t.id}
                    aria-controls={`${uid}-term`}
                    onClick={() =>
                      setTermId((cur) => (cur === t.id ? null : t.id))
                    }
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                      termId === t.id
                        ? "border-fg bg-surface-2 text-fg"
                        : "border-border-strong text-fg-muted hover:text-fg",
                    )}
                  >
                    {t.term}
                  </button>
                </li>
              ))}
            </ul>
            <div
              id={`${uid}-term`}
              hidden={!selected}
              className="mt-3 rounded-md bg-surface-2 px-4 py-3.5"
            >
              {selected && (
                <>
                  <p className="text-[15px] leading-relaxed text-fg">
                    {selected.short}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <Link
                      href={`/glossary#${selected.id}`}
                      className="inline-flex min-h-11 items-center gap-1 rounded-full text-sm font-medium text-accent-ink"
                    >
                      자세히 보기
                      <IconArrowUpRight size={14} />
                    </Link>
                    {selected.action}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {extra}
      </div>
    </article>
  );
}
