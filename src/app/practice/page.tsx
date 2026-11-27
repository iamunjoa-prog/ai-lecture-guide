import type { Metadata } from "next";
import Link from "next/link";
import { PracticeBrowser, type PracticeBrowserItem } from "@/components/PracticeBrowser";
import { SiteFooterLinks } from "@/components/SiteFooterLinks";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { instructors, practice, videos } from "@/components/catalog";
import { Slide } from "@/components/ui";
import { isChatOnly, parsePracticeDomain, parsePracticeFilter, sortMissions } from "@/lib/practice-browse";
import { DIAGNOSIS_MINUTES } from "@/lib/questions";

export const metadata: Metadata = {
  title: "실습 모음",
  description: "강의를 보지 않아도 바로 해볼 수 있는 AI 실습을 수준·목표·도구별로 모았습니다. 내 AI에 프롬프트를 붙여 넣어 보세요.",
};

export default async function PracticePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const sorted = sortMissions(practice, new Map(videos.map((v) => [v.id, v])));
  const instructorName = new Map(instructors.map((i) => [i.id, i.name]));
  // 화면에 필요한 강의 정보만 넘긴다 (요약·핵심 내용 등은 싣지 않는다)
  const items: PracticeBrowserItem[] = sorted.map(({ mission, video }) => ({
    mission,
    video: { id: video.id, title: video.title, url: video.url, levels: video.levels, goals: video.goals },
    instructorName: instructorName.get(video.instructorId) ?? "",
  }));
  const chatCount = sorted.filter((it) => isChatOnly(it.mission)).length;

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar current="practice" />
        <div className="animate-fade-in pt-12 pb-12">
          <p className="eyebrow text-stage-muted">Hands-on practice</p>
          <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg">실습 모음</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            강의를 보지 않아도 바로 해볼 수 있는 AI 실습이에요. 내 AI(ChatGPT, Claude, Gemini 등)에 프롬프트를 붙여 넣어 보세요.
          </p>
          <p className="mt-3 text-[14px] text-stage-muted tabular-nums">
            실습 {sorted.length}개 · 챗봇만 있으면 되는 실습 {chatCount}개
          </p>
        </div>
      </Slide>

      <Slide tone="light" aria-labelledby="practice-list-title" innerClassName="pt-8 pb-12">
        <h2 id="practice-list-title" className="sr-only">
          실습 목록
        </h2>
        <PracticeBrowser items={items} initialFilter={parsePracticeFilter(params)} initialDomain={parsePracticeDomain(params.d)} />
      </Slide>

      <Slide tone="light" as="footer" className="border-t border-border" innerClassName="py-12 pb-[max(48px,env(safe-area-inset-bottom))]">
        <p className="text-[15px] leading-relaxed text-fg-muted">
          내 수준에 맞는 강의와 실습 순서가 궁금하다면 {DIAGNOSIS_MINUTES}분 진단을 받아 보세요.
        </p>
        <Link
          href="/diagnosis"
          className="mt-3 inline-flex min-h-11 items-center rounded-full text-[15px] font-medium text-accent-ink underline underline-offset-4"
        >
          {DIAGNOSIS_MINUTES}분 진단 시작하기
        </Link>
        <SiteFooterLinks exclude={["practice"]} className="mt-2" />
      </Slide>
    </main>
  );
}
