import { Button } from "./Button";
import { IconArrowUpRight, IconCheck, IconClock, IconGlobe, IconPlay, IconSubtitles } from "./icons";
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
  className?: string;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span aria-hidden="true" className="flex text-fg-subtle">
        {icon}
      </span>
      {children}
    </li>
  );
}

/** 추천 강의 카드 — 강사가 가장 먼저 보인다 (프레젠테이션 전용) */
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
  className,
}: LectureCardProps) {
  return (
    <article className={cn("rounded-xl border border-border bg-surface p-5", className)}>
      {/* 강사 */}
      <header>
        {instructorBadge && <p className="eyebrow-ko text-accent-ink">{instructorBadge}</p>}
        <p className={cn("text-[19px] font-bold leading-snug tracking-[-0.02em] text-fg", instructorBadge && "mt-1.5")}>
          {instructorName}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{instructorTitle}</p>
      </header>

      {/* 썸네일 */}
      {thumbnailUrl && (
        <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-md bg-stage" aria-hidden="true">
          {/* 배경 이미지: 로드 실패 시 어두운 면 + 재생 아이콘이 보인다 */}
          <span className="absolute inset-0 flex items-center justify-center text-stage-muted">
            <IconPlay size={32} strokeWidth={1.25} />
          </span>
          <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${thumbnailUrl}")` }} />
          <span className="absolute right-2 bottom-2 rounded-[6px] bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">
            {formatDuration(durationMin)}
          </span>
        </div>
      )}

      {/* 주요 강의 */}
      <div className="mt-5">
        <p className="eyebrow-ko text-fg-muted">{kind === "playlist" ? "재생목록" : "주요 강의"}</p>
        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.015em] text-fg">{videoTitle}</h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-fg-muted" aria-label="강의 정보">
          <Meta icon={<IconClock size={15} />}>{formatDuration(durationMin)}</Meta>
          <Meta icon={<IconGlobe size={15} />}>{language === "ko" ? "한국어" : "영어"}</Meta>
          {language === "en" && (
            <Meta icon={<IconSubtitles size={15} />}>{hasKoreanSubtitle ? "한국어 자막" : "자막 없음"}</Meta>
          )}
        </ul>
      </div>

      {/* 추천 사유 */}
      <div className="mt-5 rounded-md bg-accent-soft px-4 py-3.5">
        <p className="text-[13px] font-semibold text-accent-soft-fg">추천 이유</p>
        <p className="mt-1 text-[15px] leading-relaxed text-accent-soft-fg">{reason}</p>
      </div>

      {/* 얻을 수 있는 것 */}
      <div className="mt-5">
        <p className="text-[13px] font-semibold text-fg">이 강의로 얻을 수 있는 것</p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {takeaways.slice(0, 3).map((t, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-fg">
              <span aria-hidden="true" className="mt-[4px] flex shrink-0 text-accent-ink">
                <IconCheck size={16} strokeWidth={2} />
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
        className="mt-6"
        aria-label={`유튜브에서 보기: ${videoTitle} (새 탭)`}
        leadingIcon={<IconPlay size={16} />}
        trailingIcon={<IconArrowUpRight size={16} className="text-fg-muted" />}
      >
        유튜브에서 보기
      </Button>
    </article>
  );
}
