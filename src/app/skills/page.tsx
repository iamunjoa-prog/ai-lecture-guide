import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { formatAsOf, latestAsOf, parseSkillFilter, skillLectureLinks, skillTerms } from "@/components/skill-links";
import { SkillsBrowser } from "@/components/SkillsBrowser";
import { glossary, instructors, skills, videos } from "@/components/catalog";
import { Slide } from "@/components/ui";
import { glossaryById } from "@/lib/glossary";
import { DIAGNOSIS_MINUTES } from "@/lib/questions";
import { indexVideos } from "@/lib/skills";

export const metadata: Metadata = {
  title: "요즘 주목받는 AI 스킬",
  description: "AI를 써 본 사람이 다음에 익히면 좋은 실전 스킬을 근거와 함께 정리했습니다.",
};

export default async function SkillsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = parseSkillFilter((await searchParams).l);
  const byId = glossaryById(glossary);
  const videosById = indexVideos(videos);
  const asOf = latestAsOf(skills);

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar current="skills" />
        <div className="animate-fade-in pt-14 pb-14">
          <p className="eyebrow text-stage-muted">Trending skills</p>
          <h1 className="display mt-4 text-[clamp(34px,10vw,50px)] text-stage-fg text-balance">요즘 주목받는 AI 스킬</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            AI를 써 본 분이 다음에 익히면 좋은 스킬 {skills.length}가지를 공개 자료를 근거로 골랐어요. 수준을 고르면 맞는 스킬만 볼 수 있어요.
          </p>
          {asOf && <p className="mt-3 text-[14px] text-stage-muted">{formatAsOf(asOf)}</p>}
        </div>
      </Slide>

      <Slide tone="light" aria-labelledby="skills-list-title" innerClassName="pt-10 pb-8">
        <h2 id="skills-list-title" className="sr-only">
          스킬 목록
        </h2>
        <SkillsBrowser
          initial={initial}
          items={skills.map((s) => ({
            skill: s,
            lectures: skillLectureLinks(s, videosById, instructors),
            terms: skillTerms(s, byId),
          }))}
        />
        <p className="mt-6 text-[13px] leading-relaxed text-fg-muted">
          각 스킬의 &lsquo;근거&rsquo;는 원문 또는 검색으로 확인한 공개 자료입니다. 서비스 이름과 기능은 바뀔 수 있어요.
        </p>
      </Slide>

      <Slide tone="light" as="footer" innerClassName="py-12 pb-[max(48px,env(safe-area-inset-bottom))]">
        <p className="text-[15px] leading-relaxed text-fg-muted">
          내 수준에 맞는 스킬과 강의 순서가 궁금하다면 {DIAGNOSIS_MINUTES}분 진단을 받아 보세요.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5">
          <Link href="/diagnosis" className="inline-flex min-h-11 items-center rounded-full text-[15px] font-medium text-accent-ink underline underline-offset-4">
            {DIAGNOSIS_MINUTES}분 진단 시작하기
          </Link>
          <Link href="/glossary" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            AI 용어집
          </Link>
          <Link href="/theory" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            3분 이론
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            처음 화면으로
          </Link>
        </div>
      </Slide>
    </main>
  );
}
