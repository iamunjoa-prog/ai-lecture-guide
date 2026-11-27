import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryHashOpener } from "@/components/GlossaryHashOpener";
import { TheoryConceptCard } from "@/components/TheoryConceptCard";
import { theoryLectureLinks } from "@/components/TheorySection";
import { instructors, theory, videos } from "@/components/catalog";
import { Slide } from "@/components/ui";
import { LEVEL_DESCRIPTIONS } from "@/lib/questions";
import { groupTheoryByLevel } from "@/lib/theory";
import { DIAGNOSIS_MINUTES } from "@/lib/questions";

export const metadata: Metadata = {
  title: "3분 이론",
  description: "AI 강의를 보기 전에 알아두면 좋은 개념을 수준별로 쉽게 정리했습니다.",
};

const NAV_LABELS = { beginner: "입문", user: "활용", practitioner: "실무", developer: "개발" } as const;

export default function TheoryPage() {
  const groups = groupTheoryByLevel(theory);

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <GlossaryHashOpener />
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
        <div className="animate-fade-in pt-14 pb-14">
          <p className="eyebrow text-stage-muted">3-minute theory</p>
          <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg">3분 이론</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            강의를 보기 전에 알아두면 좋은 개념을 수준별로 쉽게 정리했습니다. 궁금한 개념을 눌러 펼쳐 보세요.
          </p>
        </div>
      </Slide>

      <nav
        aria-label="수준별 바로가기"
        className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-xl backdrop-saturate-150"
      >
        <ul className="mx-auto flex max-w-content gap-2 px-5 py-3">
          {groups.map((g) => (
            <li key={g.level}>
              <a
                href={`#level-${g.level}`}
                className="inline-flex h-11 items-center rounded-full border border-border-strong px-4 text-sm font-medium text-fg transition-colors duration-200 hover:bg-surface-2"
              >
                {NAV_LABELS[g.level]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map((g) => (
        <Slide key={g.level} tone="light" aria-labelledby={`title-${g.level}`} innerClassName="pt-12 pb-6">
          <div id={`level-${g.level}`} className="scroll-mt-20">
            <p className="text-[13px] font-medium text-fg-muted tabular-nums">{g.concepts.length}개</p>
            <h2 id={`title-${g.level}`} className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-fg">
              {g.title}
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{LEVEL_DESCRIPTIONS[g.level]}</p>
          </div>
          <div className="mt-6 border-t border-border">
            {g.concepts.map((c, i) => (
              <TheoryConceptCard
                key={c.id}
                concept={c}
                index={i + 1}
                anchor
                lectures={theoryLectureLinks(c, [], videos, instructors)}
              />
            ))}
          </div>
        </Slide>
      ))}

      <Slide tone="light" as="footer" innerClassName="py-12 pb-[max(48px,env(safe-area-inset-bottom))]">
        <p className="text-[15px] leading-relaxed text-fg-muted">
          내 수준에 맞는 강의 순서가 궁금하다면 {DIAGNOSIS_MINUTES}분 진단을 받아 보세요.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5">
          <Link href="/diagnosis" className="inline-flex min-h-11 items-center rounded-full text-[15px] font-medium text-accent-ink underline underline-offset-4">
            {DIAGNOSIS_MINUTES}분 진단 시작하기
          </Link>
          <Link href="/glossary" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            AI 용어집
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            처음 화면으로
          </Link>
        </div>
      </Slide>
    </main>
  );
}
