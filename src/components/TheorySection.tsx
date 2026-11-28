import Link from "next/link";
import type { Instructor, TheoryConcept, Video } from "@/types";
import { IconArrowRight, Slide } from "@/components/ui";
import { lectureAnchorId, lecturesForConcept } from "@/lib/theory";
import { TheoryConceptCard, type TheoryLectureLink } from "./TheoryConceptCard";
import { TheoryReadToggle } from "./saved/SaveToggle";

/** 결과 화면 개념 카드 앵커 (용어집 3분 이론 탭과 같은 규칙) */
export const conceptAnchorId = (conceptId: string) => `theory-${conceptId}`;

/** 개념과 연결된 강의 링크 (로드맵에 있으면 카드 앵커, 없으면 유튜브 새 탭) */
export function theoryLectureLinks(
  concept: TheoryConcept,
  roadmapVideos: readonly Video[],
  allVideos: readonly Video[],
  instructors: readonly Instructor[],
): TheoryLectureLink[] {
  return lecturesForConcept(concept, roadmapVideos, allVideos).map(({ video, inRoadmap }) => ({
    videoId: video.id,
    title: video.title,
    instructorName: instructors.find((i) => i.id === video.instructorId)?.name ?? "",
    href: inRoadmap ? `#${lectureAnchorId(video.id)}` : video.url,
    external: !inRoadmap,
  }));
}

/**
 * 결과 화면: 3분 이론 (개념 3~4개, 첫 개념은 펼쳐 둔다).
 * `leading`이면(개념이 주인공인 공부 방법) 제목을 "먼저 읽는 3분 이론"으로, '이론은 나중에' 링크는 뺀다.
 */
export function TheorySection({
  concepts,
  roadmapVideos,
  allVideos,
  instructors,
  levelLabel,
  theoryHref,
  roadmapHref = "#lectures",
  leading = false,
}: {
  concepts: TheoryConcept[];
  roadmapVideos: readonly Video[];
  allVideos: readonly Video[];
  instructors: readonly Instructor[];
  levelLabel: string;
  theoryHref: string;
  roadmapHref?: string;
  leading?: boolean;
}) {
  if (concepts.length === 0) return null;
  return (
    <Slide tone="light" aria-labelledby="theory-title" className="border-b border-border" innerClassName="pt-12 pb-10">
      <p className="eyebrow text-fg-muted">3-minute theory</p>
      <h2 id="theory-title" className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-fg">
        {leading ? "먼저 읽는 3분 이론" : "강의 보기 전 3분 이론"}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
        {levelLabel}에게 꼭 필요한 개념 {concepts.length}가지만 골랐어요. 하나에 1분이면 읽을 수 있습니다.
      </p>
      <div className="mt-6 border-t border-border" data-testid="theory-list">
        {concepts.map((c, i) => (
          <TheoryConceptCard
            key={c.id}
            concept={c}
            index={i + 1}
            defaultOpen={i === 0}
            anchorId={conceptAnchorId(c.id)}
            lectures={theoryLectureLinks(c, roadmapVideos, allVideos, instructors)}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-col items-start gap-1">
        <Link href={theoryHref} className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-medium text-accent-ink">
          이론 전체 보기
          <IconArrowRight size={16} strokeWidth={2} />
        </Link>
        {!leading && (
          <a
            href={roadmapHref}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-semibold text-fg underline underline-offset-4"
          >
            이론은 나중에, 강의 바로 보기
            <IconArrowRight size={16} strokeWidth={2} />
          </a>
        )}
      </div>
    </Slide>
  );
}

/** 개념 탭 맨 위 '이번 주 개념' (개념이 주인공인 공부 방법). 첫 3분 이론 개념 + 읽어 보기 · 읽었어요 */
export function WeeklyConceptHighlight({ concept }: { concept: TheoryConcept }) {
  return (
    <Slide tone="light" innerClassName="pt-6">
      <section
        aria-labelledby="weekly-concept-title"
        className="rounded-xl border-2 border-accent bg-surface-2 px-5 pt-4 pb-4"
        data-testid="weekly-concept"
      >
        <h2 id="weekly-concept-title" className="eyebrow-ko text-[13px] text-accent-ink">
          이번 주 개념
        </h2>
        <p className="mt-1.5 text-[19px] font-bold leading-snug tracking-[-0.02em] text-fg">{concept.title}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-fg">{concept.summary}</p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          <a
            href={`#${conceptAnchorId(concept.id)}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink px-5 text-[14px] font-semibold text-ink-fg transition-colors duration-200 hover:bg-ink-hover"
            data-testid="weekly-concept-open"
          >
            1분 읽어 보기
            <IconArrowRight size={16} strokeWidth={2} />
          </a>
          <TheoryReadToggle conceptId={concept.id} title={concept.title} />
        </div>
      </section>
    </Slide>
  );
}
