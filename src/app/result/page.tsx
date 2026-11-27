import type { Metadata } from "next";
import Link from "next/link";
import { AppShell, cn, IconArrowRight, LectureCard, ResultHero, Slide, type ResultHeroChipGroup } from "@/components/ui";
import { AdSlot } from "@/components/ads/AdSlot";
import { AffiliateBlock } from "@/components/AffiliateBlock";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { ResultHeroActions } from "@/components/ResultHeroActions";
import { LearningJourney } from "@/components/LearningJourney";
import { MissionItem, WeeklyMissionHighlight } from "@/components/PracticeMissions";
import { ResultEmptyState } from "@/components/ResultEmptyState";
import { StarterTerms } from "@/components/StarterTerms";
import { ResultTabs, type ResultTab } from "@/components/ResultTabs";
import { TheorySection } from "@/components/TheorySection";
import { credentialBadge, glossary, instructors, practice, skills, theory, thumbnailFor, videos } from "@/components/catalog";
import { resolvePrompts } from "@/components/PracticeMissionBlock";
import { SkillsSection } from "@/components/SkillsSection";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { LectureDoneToggle, SaveToggle } from "@/components/saved/SaveToggle";
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
import { theoryHref } from "@/lib/glossary-tabs";
import { journeyInputs, missionAnchorId, STEP_SUMMARIES, stepAnchorId, summaryLine } from "@/lib/journey";

export const metadata: Metadata = {
  title: "맞춤 학습 로드맵",
  // 진단 결과마다 주소가 달라 검색에 노출할 필요가 없다
  robots: { index: false, follow: true },
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

  // 이번 주 실습 미션 · 단계별 실습
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
  const hasPrep = starterTerms.length > 0 || theoryConcepts.length > 0;

  // 내 학습 여정: 1단계 용어 = 준비 탭에서 처음 보이는 시작 전 용어
  const journeySteps = journeyInputs(
    roadmap.steps,
    new Set(missionsById.keys()),
    starterTerms.slice(0, INITIAL_TERMS).map((t) => t.id),
  );

  const lecturesPanel = (
    <Slide tone="light" id="roadmap" className="scroll-mt-16" innerClassName="pb-10">
      {roadmap.steps.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border p-6 text-center text-fg-muted">
          아직 꼭 맞는 강의를 찾지 못했습니다. 다른 분야나 목표로 다시 진단해 보세요.
        </p>
      ) : (
        <>
          <LearningJourney level={diagnosis.level} steps={journeySteps} />
          <ol aria-label="단계별 강의" data-testid="roadmap-steps">
            {roadmap.steps.map((step, i) => (
              <li
                key={step.label}
                id={stepAnchorId(i + 1)}
                aria-labelledby={`step-title-${i + 1}`}
                className={cn("scroll-mt-20 pt-7", i > 0 && "mt-5 border-t border-border")}
                data-testid="roadmap-step"
              >
                <h2 id={`step-title-${i + 1}`} className="text-[19px] font-bold tracking-[-0.02em] text-fg">
                  {i + 1}단계 · {step.label}
                </h2>
                {STEP_SUMMARIES[step.label] && (
                  <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">{STEP_SUMMARIES[step.label]}</p>
                )}
                <div className="mt-4 flex flex-col gap-4">
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
                          actions={
                            <>
                              <LectureDoneToggle videoId={video.id} title={video.title} />
                              {mission && (
                                <a
                                  href={`#${missionAnchorId(video.id)}`}
                                  aria-label={`실습하기: ${mission.title}`}
                                  className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[14px] font-semibold text-accent-ink"
                                  data-testid="lecture-practice-link"
                                >
                                  실습하기
                                  <IconArrowRight size={15} strokeWidth={2} />
                                </a>
                              )}
                            </>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
          {/* 광고·제휴는 마지막 강의 카드 아래, 선별 기준 안내 위에만 둔다 */}
          <AdSlot placement="result-bottom" />
          <AffiliateBlock items={affiliateItems} />
        </>
      )}

      <section className="mt-8 rounded-xl bg-surface-2 px-6 py-6">
        <p className="eyebrow text-fg-muted">Selection</p>
        <p className="mt-2 text-[15px] leading-relaxed text-fg">
          AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널의 유튜브 강의만 선별했습니다. 모든 링크는 직접 확인했습니다.
        </p>
        <CriteriaSheet className="mt-2" />
      </section>
      <p className="mt-6 flex flex-wrap gap-x-5 text-[13px] text-fg-muted">
        <Link href={`/practice?l=${diagnosis.level}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
          실습 모음
        </Link>
        <Link href="/glossary" className="inline-flex min-h-11 items-center underline underline-offset-4">
          용어집
        </Link>
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

  // 실습 탭: 이번 주 미션 → 단계별 미션 (강의 탭과 같은 순서)
  const missionGroups = roadmap.steps
    .map((step, i) => ({
      number: i + 1,
      label: step.label,
      items: step.items.flatMap(({ video }) => {
        const mission = missionsById.get(video.id);
        return mission ? [{ mission, video }] : [];
      }),
    }))
    .filter((g) => g.items.length > 0);

  const practicePanel = (
    <Slide tone="light" innerClassName="pt-6 pb-12">
      {weekly && (
        <WeeklyMissionHighlight
          mission={weekly.mission}
          lecture={{ id: weekly.video.id, title: weekly.video.title }}
          stepLabel={weeklyStepIndex >= 0 ? `${weeklyStepIndex + 1}단계` : undefined}
        />
      )}
      {missionGroups.length === 0 ? (
        <p className="mt-6 text-[15px] leading-relaxed text-fg-muted">이 로드맵에는 아직 실습 미션이 없어요. 강의부터 시작해 보세요.</p>
      ) : (
        <>
          <h2 className="mt-8 text-[19px] font-bold tracking-[-0.02em] text-fg">직접 해보기</h2>
          <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">
            강의를 본 뒤 직접 해 보면 오래 남아요. 완료하면 학습 여정에 표시돼요.
          </p>
          {missionGroups.map((g) => (
            <section key={g.label} aria-labelledby={`practice-step-${g.number}`} className="mt-6" data-testid="practice-step">
              <h3 id={`practice-step-${g.number}`} className="text-[15px] font-semibold text-fg-muted">
                {g.number}단계 · {g.label}
              </h3>
              <div className="mt-2.5 flex flex-col gap-3">
                {g.items.map(({ mission, video }) => (
                  <MissionItem
                    key={video.id}
                    mission={mission}
                    prompts={resolvePrompts(mission, diagnosis.domains)}
                    lecture={{ id: video.id, title: video.title }}
                    weekly={weekly?.video.id === video.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
      <div className="mt-8 border-t border-border pt-4">
        <p className="text-[14px] leading-relaxed text-fg-muted">로드맵 밖의 실습도 수준·목표·도구별로 골라 해 볼 수 있어요.</p>
        <Link
          href={`/practice?l=${diagnosis.level}`}
          className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-semibold text-accent-ink"
          data-testid="practice-all-link"
        >
          실습 전체 모음 보기
          <IconArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </Slide>
  );

  const tabs: ResultTab[] = [
    { id: "lectures", label: "강의", content: lecturesPanel },
    { id: "practice", label: "실습", content: practicePanel },
    {
      id: "prep",
      label: "준비",
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
            theoryHref={theoryHref({ level: diagnosis.level })}
          />
          {!hasPrep && (
            <Slide tone="light" innerClassName="py-12">
              <p className="text-[15px] leading-relaxed text-fg-muted">이 진단에는 미리 볼 용어와 개념이 따로 없어요. 강의부터 시작해 보세요.</p>
            </Slide>
          )}
        </>
      ),
    },
  ];
  if (showSkills) {
    tabs.push({
      id: "skills",
      label: "스킬",
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
              <span className="text-accent">{levelLabel}</span> 맞춤 학습 로드맵
            </>
          }
          conclusion={conclusion}
          summary={summaryLine(
            levelLabel,
            diagnosis.domains.map((d) => DOMAIN_LABELS[d]),
            diagnosis.goals.length,
          )}
          chipGroups={chipGroups}
          actions={<ResultHeroActions />}
        />
      </Slide>

      <ResultTabs tabs={tabs} label="결과 보기" />
    </main>
  );
}
