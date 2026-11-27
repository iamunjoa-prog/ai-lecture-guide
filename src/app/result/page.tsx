import type { Metadata } from "next";
import { AppShell, Button, LectureCard, ResultHero, RoadmapStep, type ResultHeroChip } from "@/components/ui";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { ResultActions } from "@/components/ResultActions";
import { ResultEmptyState } from "@/components/ResultEmptyState";
import { instructors, thumbnailFor, videos } from "@/components/catalog";
import { decodeDiagnosis, type SearchParamsRecord } from "@/lib/diagnosis-state";
import { DOMAIN_LABELS, GOAL_LABELS, LEVEL_DESCRIPTIONS, LEVEL_EMOJIS, LEVEL_LABELS } from "@/lib/questions";
import { buildRoadmap, STEP_LABELS } from "@/lib/recommend";

export const metadata: Metadata = {
  title: "맞춤 학습 플랜",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  [STEP_LABELS.foundation]: "먼저 기본기를 채워 두면 뒤가 훨씬 쉬워요",
  [STEP_LABELS.practice]: "지금 수준에서 바로 써먹을 수 있는 강의예요",
  [STEP_LABELS.next]: "익숙해지면 한 단계 더 도전해 보세요",
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

  const chips: ResultHeroChip[] = [
    { label: levelLabel, icon: LEVEL_EMOJIS[diagnosis.level], tone: "primary" },
    ...diagnosis.domains.map((d): ResultHeroChip => ({ label: DOMAIN_LABELS[d], tone: "accent" })),
    { label: GOAL_LABELS[diagnosis.goal], icon: "🎯", tone: "success" },
  ];
  if (diagnosis.preferKorean) chips.push({ label: "한국어 우선", icon: "🇰🇷", tone: "neutral" });

  return (
    <AppShell>
      <header className="flex h-14 items-center justify-between">
        <Button href="/" variant="ghost" size="sm" className="-ml-3 text-fg" aria-label="처음 화면으로">
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <span aria-hidden="true">🧭</span>
            AI 강의 길잡이
          </span>
        </Button>
      </header>

      <ResultHero
        className="mt-2"
        emoji={LEVEL_EMOJIS[diagnosis.level]}
        eyebrow="진단 완료"
        title={`${levelLabel} 맞춤 AI 학습 플랜이 준비됐어요`}
        description={`${LEVEL_DESCRIPTIONS[diagnosis.level]} 아래 순서대로 들어 보세요.`}
        chips={chips}
      />

      <section aria-labelledby="roadmap-title" className="pt-10">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 id="roadmap-title" className="text-xl font-bold text-fg">
            추천 로드맵
          </h2>
          {lectureCount > 0 && (
            <p className="shrink-0 text-sm font-semibold text-fg-muted">
              {roadmap.steps.length}단계 · 강의 {lectureCount}개
            </p>
          )}
        </div>

        {roadmap.steps.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong bg-surface p-6 text-center text-fg-muted">
            아직 딱 맞는 강의를 찾지 못했어요. 다른 분야나 목표로 다시 진단해 보세요.
          </p>
        ) : (
          <ol>
            {roadmap.steps.map((step, i) => (
              <RoadmapStep
                key={step.label}
                step={i + 1}
                label={step.label}
                description={STEP_DESCRIPTIONS[step.label]}
                isLast={i === roadmap.steps.length - 1}
              >
                {step.items.map(({ video, instructor, reason }) => (
                  <LectureCard
                    key={video.id}
                    instructorName={instructor.name}
                    instructorTitle={instructor.title}
                    reason={reason}
                    videoTitle={video.title}
                    durationMin={video.durationMin}
                    language={video.language}
                    hasKoreanSubtitle={video.hasKoreanSubtitle}
                    takeaways={video.takeaways}
                    url={video.url}
                    thumbnailUrl={thumbnailFor(video)}
                    kind={video.kind}
                  />
                ))}
              </RoadmapStep>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8 rounded-lg bg-surface-2 px-5 py-4 text-center">
        <p className="text-[15px] leading-relaxed text-fg-muted">
          AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널의 강의만 골랐어요.
        </p>
        <CriteriaSheet className="mt-1" />
      </section>

      <ResultActions />
    </AppShell>
  );
}
