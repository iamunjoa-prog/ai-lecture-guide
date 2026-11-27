import { Button } from "./Button";
import { Tag } from "./Chip";
import { cn } from "./cn";

export interface LectureCardProps {
  instructorName: string;
  /** 이력 한 줄 */
  instructorTitle: string;
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
  /** 플레이리스트면 "재생목록" 배지 */
  kind?: "video" | "playlist";
  className?: string;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 추천 강의 카드 (프레젠테이션 전용) */
export function LectureCard({
  instructorName,
  instructorTitle,
  reason,
  videoTitle,
  durationMin,
  language,
  hasKoreanSubtitle,
  takeaways,
  url,
  thumbnailUrl,
  kind = "video",
  className,
}: LectureCardProps) {
  return (
    <article className={cn("overflow-hidden rounded-xl border border-border bg-surface shadow-md", className)}>
      {thumbnailUrl && (
        <div
          className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary-soft to-accent-soft"
          aria-hidden="true"
        >
          {/* 배경 이미지로 렌더링: 로드 실패 시 깨진 이미지 아이콘 대신 그라데이션 + 재생 아이콘이 보인다 */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface/90 text-xl text-primary shadow-md">▶</span>
          </span>
          <span
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${thumbnailUrl}")` }}
          />
          <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/75 px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
            {formatDuration(durationMin)}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-4 p-5">
        {/* 강사 */}
        <header className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-fg"
          >
            {instructorName.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="font-bold leading-snug text-fg">{instructorName}</p>
            <p className="text-sm leading-snug text-fg-muted">{instructorTitle}</p>
          </div>
        </header>

        {/* 추천 사유 */}
        <div className="rounded-md border-l-4 border-accent bg-accent-soft px-4 py-3">
          <p className="mb-0.5 text-xs font-bold text-accent-soft-fg">💡 이런 분께 추천해요</p>
          <p className="text-[15px] leading-relaxed text-fg">{reason}</p>
        </div>

        {/* 주요 강의 */}
        <div>
          <p className="mb-1 text-xs font-bold text-fg-subtle">주요 강의</p>
          <h3 className="text-[17px] font-bold leading-snug text-fg">{videoTitle}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Tag icon="⏱">{formatDuration(durationMin)}</Tag>
            {kind === "playlist" && <Tag tone="primary">재생목록</Tag>}
            <Tag tone={language === "ko" ? "primary" : "neutral"}>{language === "ko" ? "한국어" : "영어"}</Tag>
            {language === "en" && (
              <Tag tone={hasKoreanSubtitle ? "success" : "neutral"}>
                {hasKoreanSubtitle ? "한국어 자막" : "자막 없음"}
              </Tag>
            )}
          </div>
        </div>

        {/* 얻을 수 있는 것 */}
        <div>
          <p className="mb-2 text-xs font-bold text-fg-subtle">이 강의로 얻을 수 있는 것</p>
          <ul className="flex flex-col gap-2">
            {takeaways.slice(0, 3).map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-fg">
                <span className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-fg">
                  <Check />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          href={url}
          external
          variant="secondary"
          fullWidth
          aria-label={`유튜브에서 보기: ${videoTitle} (새 탭)`}
          leadingIcon={<span className="text-[#ff0033]">▶</span>}
        >
          유튜브에서 보기
        </Button>
      </div>
    </article>
  );
}
