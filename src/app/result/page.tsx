import type { Metadata } from "next";
import Link from "next/link";
import { AppShell, LectureCard, ResultHero, RoadmapStep, Slide, type ResultHeroChip } from "@/components/ui";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { ResultActions } from "@/components/ResultActions";
import { ResultEmptyState } from "@/components/ResultEmptyState";
import { StarterTerms } from "@/components/StarterTerms";
import { credentialBadge, glossary, instructors, thumbnailFor, videos } from "@/components/catalog";
import { decodeDiagnosis, type SearchParamsRecord } from "@/lib/diagnosis-state";
import { DOMAIN_LABELS, GOAL_LABELS, LEVEL_DESCRIPTIONS, LEVEL_LABELS } from "@/lib/questions";
import { glossaryById, selectStarterTerms, termsForVideo } from "@/lib/glossary";
import { buildRoadmap, STEP_LABELS } from "@/lib/recommend";

export const metadata: Metadata = {
  title: "맞춤 학습 로드맵",
  // 진단 결과마다 주소가 달라 검색에 노출할 필요가 없다
  robots: { index: false, follow: true },
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  [STEP_LABELS.foundation]: "먼저 기본기를 채워 두면 다음 단계가 훨씬 수월합니다.",
  [STEP_LABELS.practice]: "지금 수준에서 바로 활용할 수 있는 강의입니다.",
  [STEP_LABELS.next]: "익숙해지면 한 단계 더 나아가 보세요.",
};

export default async function ResultPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const diagnosis = decodeDiagnosis(await searchParams);

  if (!diagnosis) {
    return (
      <AppShell>
        <ResultEmptyState />
      </AppShell>
    );
  }

  const roadmap = buildRoadmap(diagnosis, videos, instructors);
  const lectureCount = roadmap.steps.reduce((n, s) => n + s.items.length, 0);
  const levelLabel = LEVEL_LABELS[diagnosis.level];
  const byId = glossaryById(glossary);
  const roadmapVideos = roadmap.steps.flatMap((st) => st.items.map((it) => it.video));
  const starterTerms = selectStarterTerms(diagnosis, glossary, roadmapVideos);

  const chips: ResultHeroChip[] = [
    { label: levelLabel },
    ...(diagnosis.domains.length > 0
      ? diagnosis.domains.map((d): ResultHeroChip => ({ label: DOMAIN_LABELS[d] }))
      : [{ label: "분야 미정" } satisfies ResultHeroChip]),
    { label: GOAL_LABELS[diagnosis.goal] },
  ];
  if (diagnosis.preferKorean) chips.push({ label: "한국어 우선" });

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      {/* 키노트 히어로 */}
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center">
          <Link
            href="/"
            aria-label="처음 화면으로"
            className="-ml-1 inline-flex min-h-11 items-center rounded-full px-1 text-[15px] font-semibold tracking-[-0.01em] text-stage-fg"
          >
            AI 강의 길잡이
          </Link>
        </div>
        <ResultHero
          eyebrow="진단 완료"
          title={
            <>
              <span className="text-accent">{levelLabel}</span> 맞춤{" "}
              <br />
              학습 로드맵
            </>
          }
          description={
            lectureCount > 0
              ? `${LEVEL_DESCRIPTIONS[diagnosis.level]} 선별된 유튜브 강의 ${lectureCount}개로 구성했어요.`
              : LEVEL_DESCRIPTIONS[diagnosis.level]
          }
          chips={chips}
          jump={{ href: "#roadmap", label: "추천 강의 바로 보기" }}
        />
      </Slide>

      {/* 시작 전에 알아두면 좋은 용어 */}
      <StarterTerms terms={starterTerms} byId={byId} glossaryHref={`/glossary?l=${diagnosis.level}`} />

      {/* 로드맵 */}
      <Slide tone="light" aria-labelledby="roadmap-title" id="roadmap" className="scroll-mt-2" innerClassName="pt-12 pb-10">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-fg-muted">Roadmap</p>
            <h2 id="roadmap-title" className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-fg">
              추천 로드맵
            </h2>
            {lectureCount > 0 && (
              <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">
                1단계부터 순서대로 보세요. 첫 강의부터 시작하면 됩니다.
              </p>
            )}
          </div>
          {lectureCount > 0 && (
            <p className="shrink-0 pb-1 text-[14px] font-medium text-fg-muted tabular-nums">
              {roadmap.steps.length}단계 · 강의 {lectureCount}개
            </p>
          )}
        </div>

        {roadmap.steps.length === 0 ? (
          <p className="rounded-xl border border-border p-6 text-center text-fg-muted">
            아직 꼭 맞는 강의를 찾지 못했습니다. 다른 분야나 목표로 다시 진단해 보세요.
          </p>
        ) : (
          <ol>
            {roadmap.steps.map((step, i) => (
              <RoadmapStep
                key={step.label}
                step={i + 1}
                label={step.label}
                description={STEP_DESCRIPTIONS[step.label]}
                isFirst={i === 0}
                isLast={i === roadmap.steps.length - 1}
              >
                {step.items.map(({ video, instructor, reason }, idx) => (
                  <LectureCard
                    key={video.id}
                    instructorName={instructor.name}
                    instructorTitle={instructor.title}
                    instructorBadge={credentialBadge(instructor)}
                    reason={reason}
                    videoTitle={video.title}
                    durationMin={video.durationMin}
                    language={video.language}
                    hasKoreanSubtitle={video.hasKoreanSubtitle}
                    takeaways={video.takeaways}
                    url={video.url}
                    thumbnailUrl={thumbnailFor(video)}
                    kind={video.kind}
                    fullReason={idx === 0}
                    startHere={i === 0 && idx === 0}
                    terms={termsForVideo(video, byId).map(({ id, term, short }) => ({ id, term, short }))}
                  />
                ))}
              </RoadmapStep>
            ))}
          </ol>
        )}

        <section className="mt-4 rounded-xl bg-surface-2 px-6 py-6">
          <p className="eyebrow text-fg-muted">Selection</p>
          <p className="mt-2 text-[15px] leading-relaxed text-fg">
            AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널의 유튜브 강의만 선별했습니다. 모든 링크는 직접
            확인했습니다.
          </p>
          <CriteriaSheet className="mt-2" />
        </section>
      </Slide>

      <ResultActions />
    </main>
  );
}
