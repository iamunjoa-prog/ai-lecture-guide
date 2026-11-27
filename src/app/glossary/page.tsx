import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { GlossaryHashOpener } from "@/components/GlossaryHashOpener";
import { TermAccordion } from "@/components/TermAccordion";
import { glossary } from "@/components/catalog";
import { Slide } from "@/components/ui";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { glossaryById, groupByLevel } from "@/lib/glossary";
import { LEVEL_DESCRIPTIONS } from "@/lib/questions";

export const metadata: Metadata = {
  title: "용어집",
};

const NAV_LABELS = { beginner: "입문", user: "활용", practitioner: "실무", developer: "개발" } as const;

export default function GlossaryPage() {
  const groups = groupByLevel(glossary);
  const byId = glossaryById(glossary);

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <GlossaryHashOpener />
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar />
        <div className="animate-fade-in pt-14 pb-14">
          <p className="eyebrow text-stage-muted">Glossary</p>
          <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg">용어집</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            AI 강의를 듣기 전에 알아두면 좋은 용어를 수준별로 정리했습니다.
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
        <Slide
          key={g.level}
          tone="light"
          aria-labelledby={`title-${g.level}`}
          innerClassName="pt-12 pb-6"
        >
          <div id={`level-${g.level}`} className="scroll-mt-20">
            <p className="text-[13px] font-medium text-fg-muted tabular-nums">{g.terms.length}개</p>
            <h2 id={`title-${g.level}`} className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-fg">
              {g.title}
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{LEVEL_DESCRIPTIONS[g.level]}</p>
          </div>
          <div className="mt-6 border-t border-border">
            {g.terms.map((t) => (
              <TermAccordion key={t.id} term={t} byId={byId} anchor linkRelated />
            ))}
          </div>
        </Slide>
      ))}

      <Slide tone="light" innerClassName="pb-6">
        <AdSlot placement="glossary-bottom" className="mt-4" />
      </Slide>

      <Slide tone="light" as="footer" innerClassName="py-12 pb-[max(48px,env(safe-area-inset-bottom))]">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full text-[15px] font-medium text-accent-ink underline underline-offset-4">
          처음 화면으로
        </Link>
        <Link href="/theory" className="ml-5 inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
          3분 이론
        </Link>
        <Link href="/skills" className="ml-5 inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
          AI 스킬
        </Link>
        <Link href="/privacy" className="ml-5 inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
          개인정보 처리방침
        </Link>
      </Slide>
    </main>
  );
}
