import Link from "next/link";
import type { Instructor, TheoryConcept, Video } from "@/types";
import { IconArrowRight, IconChevronDown, Slide } from "@/components/ui";
import { lectureAnchorId, lecturesForConcept } from "@/lib/theory";
import { TheoryConceptCard, type TheoryLectureLink } from "./TheoryConceptCard";

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

/** 결과 화면: 강의 보기 전 3분 이론 (개념 3개, 첫 개념은 펼쳐 둔다) */
export function TheorySection({
  concepts,
  roadmapVideos,
  allVideos,
  instructors,
  levelLabel,
  theoryHref,
  roadmapHref = "#roadmap",
}: {
  concepts: TheoryConcept[];
  roadmapVideos: readonly Video[];
  allVideos: readonly Video[];
  instructors: readonly Instructor[];
  levelLabel: string;
  theoryHref: string;
  roadmapHref?: string;
}) {
  if (concepts.length === 0) return null;
  return (
    <Slide tone="light" aria-labelledby="theory-title" className="border-b border-border" innerClassName="pt-12 pb-10">
      <p className="eyebrow text-fg-muted">3-minute theory</p>
      <h2 id="theory-title" className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-fg">
        강의 보기 전 3분 이론
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
            lectures={theoryLectureLinks(c, roadmapVideos, allVideos, instructors)}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-col items-start gap-1">
        <Link href={theoryHref} className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-medium text-accent-ink">
          이론 전체 보기
          <IconArrowRight size={16} strokeWidth={2} />
        </Link>
        <a
          href={roadmapHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-semibold text-fg underline underline-offset-4"
        >
          이론은 나중에, 추천 강의 바로 보기
          <IconChevronDown size={16} />
        </a>
      </div>
    </Slide>
  );
}
