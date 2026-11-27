import type { Metadata } from "next";
import Link from "next/link";
import { AppShell, IconArrowRight, LectureCard, ResultHero, RoadmapStep, Slide, type ResultHeroChipGroup } from "@/components/ui";
import { AdSlot } from "@/components/ads/AdSlot";
import { AffiliateBlock } from "@/components/AffiliateBlock";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { ResultActions } from "@/components/ResultActions";
import { ResultEmptyState } from "@/components/ResultEmptyState";
import { StarterTerms } from "@/components/StarterTerms";
import { ResultTabs, type ResultTab } from "@/components/ResultTabs";
import { TheorySection } from "@/components/TheorySection";
import { credentialBadge, glossary, instructors, practice, skills, theory, thumbnailFor, videos } from "@/components/catalog";
import { PracticeMissionBlock, resolvePrompts } from "@/components/PracticeMissionBlock";
import { WeeklyMissionCard } from "@/components/WeeklyMissionCard";
import { SkillsSection } from "@/components/SkillsSection";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { SaveToggle } from "@/components/saved/SaveToggle";
import { RememberDiagnosis } from "@/components/saved/RememberDiagnosis";
import { decodeDiagnosis, diagnosisHref, type SearchParamsRecord } from "@/lib/diagnosis-state";
import { practiceById, weeklyMission } from "@/lib/practice";
import { indexVideos, selectSkills } from "@/lib/skills";
import { DOMAIN_LABELS, GOAL_LABELS, LEVEL_LABELS } from "@/lib/questions";
import { buildConclusion } from "@/lib/conclusion";
import { glossaryById, INITIAL_TERMS, selectStarterTerms, termsForVideo } from "@/lib/glossary";
import { selectAffiliate, type AffiliateItem } from "@/lib/affiliate";
import affiliateJson from "@data/affiliate.json";
import { buildRoadmap, STEP_LABELS } from "@/lib/recommend";
import { lectureAnchorId, selectTheory } from "@/lib/theory";

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
  const theoryConcepts = selectTheory(diagnosis, theory);

  const affiliateItems = selectAffiliate(diagnosis, affiliateJson as unknown as AffiliateItem[], 2);

  const chipGroups: ResultHeroChipGroup[] = [
    { label: "수준", chips: [{ label: levelLabel }] },
    {
      label: "분야",
      chips:
        diagnosis.domains.length > 0 ? diagnosis.domains.map((d) => ({ label: DOMAIN_LABELS[d] })) : [{ label: "분야 미정" }],
    },
    // 목표는 고른 순서(우선순위)대로 하나씩. 목표가 여럿이면 첫 목표에 '1순위'
    {
      label: "목표",
      chips: diagnosis.goals.map((g, i) => ({
        label: GOAL_LABELS[g],
        badge: i === 0 && diagnosis.goals.length > 1 ? "1순위" : undefined,
      })),
    },
  ];
  if (diagnosis.preferKorean) chipGroups.push({ label: "언어", chips: [{ label: "한국어 우선" }] });
  const conclusion = buildConclusion(diagnosis);

  // 강의 보고 해보기 · 이번 주 실습 미션
  const missionsById = practiceById(practice);
  const practiceStep = roadmap.steps.find((st) => st.label === STEP_LABELS.practice);
  const weekly = weeklyMission(
    diagnosis,
    roadmapVideos,
    missionsById,
    (practiceStep?.items ?? []).map((it) => it.video.id),
  );
  const weeklyStepIndex = weekly ? roadmap.steps.findIndex((st) => st.items.some((it) => it.video.id === weekly.video.id)) : -1;

  // 요즘 주목받는 AI 스킬: 입문자에게는 보여 주지 않는다 (기본 용어·개념·강의·실습에 집중)
  const isBeginner = diagnosis.level === "beginner";
  const pickedSkills = isBeginner ? [] : selectSkills(diagnosis, skills);
  const showSkills = pickedSkills.length > 0;
  const roadmapIds = new Set(roadmapVideos.map((v) => v.id));

  // 시작 전 준비 안내 한 줄 (처음 보이는 용어 수 · 개념 수)
  const prepParts = [
    starterTerms.length > 0 ? `용어 ${Math.min(INITIAL_TERMS, starterTerms.length)}개` : null,
    theoryConcepts.length > 0 ? `개념 ${theoryConcepts.length}개` : null,
  ].filter(Boolean);
  const hasPrep = prepParts.length > 0;

  const lecturesPanel = (
    <Slide tone="light" aria-labelledby="roadmap-title" id="roadmap" className="scroll-mt-16" innerClassName="pt-4 pb-10">
      {hasPrep && (
        <a
          href="#prep"
          className="flex min-h-11 items-center gap-2 border-b border-border py-2 text-[14px] leading-snug text-fg-muted transition-colors duration-200 hover:text-fg"
          data-testid="prep-hint"
        >
          <span className="min-w-0 flex-1">강의 전에 {prepParts.join("·")}를 훑어 보세요</span>
          <span aria-hidden="true" className="flex shrink-0 text-accent-ink">
            <IconArrowRight size={16} strokeWidth={2} />
          </span>
        </a>
      )}
      <div className="mt-8 mb-8 flex items-end justify-between gap-3">
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

      {weekly && (
        <WeeklyMissionCard
          mission={weekly.mission}
          prompts={resolvePrompts(weekly.mission, diagnosis.domains)}
          lecture={{
            title: weekly.video.title,
            instructorName: instructors.find((i) => i.id === weekly.video.instructorId)?.name ?? "",
            href: `#${lectureAnchorId(weekly.video.id)}`,
            stepLabel: weeklyStepIndex >= 0 ? `${weeklyStepIndex + 1}단계` : undefined,
          }}
        />
      )}

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
              {step.items.map(({ video, instructor, reason }, idx) => {
                const mission = missionsById.get(video.id);
                return (
                  <div key={video.id} id={lectureAnchorId(video.id)} className="scroll-mt-20">
                    <LectureCard
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
                      terms={termsForVideo(video, byId).map(({ id, term, short }) => ({
                        id,
                        term,
                        short,
                        action: <SaveToggle kind="term" id={id} label={`용어 저장: ${term}`} />,
                      }))}
                      headerAction={<SaveToggle kind="lecture" id={video.id} label={`강의 저장: ${video.title}`} />}
                      extra={
                        mission ? (
                          <PracticeMissionBlock mission={mission} prompts={resolvePrompts(mission, diagnosis.domains)} />
                        ) : undefined
                      }
                    />
                  </div>
                );
              })}
            </RoadmapStep>
          ))}
        </ol>
      )}

      {roadmap.steps.length > 0 && (
        <>
          {/* 광고·제휴는 마지막 강의 카드 아래, 선별 기준 안내 위에만 둔다 */}
          <AdSlot placement="result-bottom" />
          <AffiliateBlock items={affiliateItems} />
        </>
      )}

      <section className="mt-4 rounded-xl bg-surface-2 px-6 py-6">
        <p className="eyebrow text-fg-muted">Selection</p>
        <p className="mt-2 text-[15px] leading-relaxed text-fg">
          AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널의 유튜브 강의만 선별했습니다. 모든 링크는 직접 확인했습니다.
        </p>
        <CriteriaSheet className="mt-2" />
      </section>
      <p className="mt-6 flex flex-wrap gap-x-5 text-[13px] text-fg-muted">
        <Link href="/saved" className="inline-flex min-h-11 items-center underline underline-offset-4">
          내 학습함
        </Link>
        {showSkills && (
          <Link href={`/skills?l=${diagnosis.level}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
            요즘 주목받는 AI 스킬
          </Link>
        )}
        <Link href="/privacy" className="inline-flex min-h-11 items-center underline underline-offset-4">
          개인정보 처리방침
        </Link>
      </p>
    </Slide>
  );

  const tabs: ResultTab[] = [
    { id: "lectures", label: "추천 강의", content: lecturesPanel },
    {
      id: "prep",
      label: "시작 전 준비",
      content: (
        <>
          {/* 시작 전에 알아두면 좋은 용어 */}
          <StarterTerms terms={starterTerms} byId={byId} glossaryHref={`/glossary?l=${diagnosis.level}`} roadmapHref={null} />
          {/* 강의 보기 전 3분 이론 */}
          <TheorySection
            concepts={theoryConcepts}
            roadmapVideos={roadmapVideos}
            allVideos={videos}
            instructors={instructors}
            levelLabel={levelLabel}
            theoryHref={`/theory?l=${diagnosis.level}`}
          />
          {!hasPrep && (
            <Slide tone="light" innerClassName="py-12">
              <p className="text-[15px] leading-relaxed text-fg-muted">이 진단에는 미리 볼 용어와 개념이 따로 없어요. 추천 강의부터 시작해 보세요.</p>
            </Slide>
          )}
        </>
      ),
    },
  ];
  if (showSkills) {
    tabs.push({
      id: "skills",
      label: "다음 스킬",
      content: (
        <SkillsSection
          skills={pickedSkills}
          levelLabel={levelLabel}
          videosById={indexVideos(videos)}
          instructors={instructors}
          roadmapIds={roadmapIds}
          termsById={byId}
          level={diagnosis.level}
        />
      ),
    });
  }

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <RememberDiagnosis href={diagnosisHref(diagnosis)} />
      {/* 키노트 히어로 */}
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar showSkills={!isBeginner} />
        <ResultHero
          eyebrow="진단 완료"
          title={
            <>
              <span className="text-accent">{levelLabel}</span> 맞춤 <br />
              학습 로드맵
            </>
          }
          conclusion={conclusion}
          teaser={
            showSkills
              ? {
                  href: "#skills",
                  label: (
                    <>
                      다음에 익히면 좋은 스킬: <span className="font-semibold text-stage-fg">{pickedSkills[0].name}</span>
                      {pickedSkills.length > 1 && ` 외 ${pickedSkills.length - 1}개`}
                    </>
                  ),
                }
              : undefined
          }
          chipGroups={chipGroups}
          jump={{ href: "#roadmap", label: "추천 강의 바로 보기" }}
        />
      </Slide>

      <ResultTabs tabs={tabs} label="결과 보기" />

      <ResultActions />
    </main>
  );
}
