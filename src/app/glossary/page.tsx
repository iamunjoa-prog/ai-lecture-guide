import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { GlossaryTabs } from "@/components/GlossaryTabs";
import { SiteFooterLinks } from "@/components/SiteFooterLinks";
import { TermAccordion } from "@/components/TermAccordion";
import { TheoryConceptCard } from "@/components/TheoryConceptCard";
import { theoryLectureLinks } from "@/components/TheorySection";
import { glossary, instructors, theory, videos } from "@/components/catalog";
import { Slide } from "@/components/ui";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { glossaryById, groupByLevel } from "@/lib/glossary";
import { glossaryLevelAnchor, parseGlossaryTab, theoryAnchorId, type GlossaryTab } from "@/lib/glossary-tabs";
import { LEVEL_DESCRIPTIONS } from "@/lib/questions";
import { groupTheoryByLevel } from "@/lib/theory";
import type { Level } from "@/types";

export const metadata: Metadata = {
  title: "용어집",
  description: "AI 강의를 듣기 전에 알아두면 좋은 용어와 3분 이론(핵심 개념)을 수준별로 쉽게 정리했습니다.",
};

const NAV_LABELS = { beginner: "입문", user: "활용", practitioner: "실무", developer: "개발" } as const;

/** 탭 안 맨 위 '수준별 바로가기' */
function LevelShortcuts({ tab, levels }: { tab: GlossaryTab; levels: Level[] }) {
  return (
    <nav aria-label={tab === "theory" ? "3분 이론 수준별 바로가기" : "용어 수준별 바로가기"} className="pt-6">
      <ul className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <li key={l}>
            <a
              href={`#${glossaryLevelAnchor(tab, l)}`}
              className="inline-flex h-11 items-center rounded-full border border-border-strong px-4 text-sm font-medium text-fg transition-colors duration-200 hover:bg-surface-2"
            >
              {NAV_LABELS[l]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** 수준 구역 머리 (개수 · 제목 · 설명) */
function LevelHeading({ tab, level, title, count }: { tab: GlossaryTab; level: Level; title: string; count: number }) {
  const anchor = glossaryLevelAnchor(tab, level);
  return (
    <div id={anchor} className="scroll-mt-20">
      <p className="text-[13px] font-medium text-fg-muted tabular-nums">{count}개</p>
      <h2 id={`${anchor}-title`} className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-fg">
        {title}
      </h2>
      <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">{LEVEL_DESCRIPTIONS[level]}</p>
    </div>
  );
}

export default async function GlossaryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initialTab = parseGlossaryTab((await searchParams).tab);
  const groups = groupByLevel(glossary);
  const theoryGroups = groupTheoryByLevel(theory);
  const byId = glossaryById(glossary);

  const termsPanel = (
    <>
      <Slide tone="light">
        <LevelShortcuts tab="terms" levels={groups.map((g) => g.level)} />
      </Slide>
      {groups.map((g) => (
        <Slide key={g.level} tone="light" aria-labelledby={`${glossaryLevelAnchor("terms", g.level)}-title`} innerClassName="pt-12 pb-6">
          <LevelHeading tab="terms" level={g.level} title={g.title} count={g.terms.length} />
          <div className="mt-6 border-t border-border">
            {g.terms.map((t) => (
              <TermAccordion key={t.id} term={t} byId={byId} anchor linkRelated />
            ))}
          </div>
        </Slide>
      ))}
    </>
  );

  const theoryPanel = (
    <>
      <Slide tone="light">
        <p className="pt-6 text-[15px] leading-relaxed text-fg-muted">
          강의를 보기 전에 알아두면 좋은 개념을 수준별로 쉽게 정리했어요. 궁금한 개념을 눌러 펼쳐 보세요.
        </p>
        <LevelShortcuts tab="theory" levels={theoryGroups.map((g) => g.level)} />
      </Slide>
      {theoryGroups.map((g) => (
        <Slide key={g.level} tone="light" aria-labelledby={`${glossaryLevelAnchor("theory", g.level)}-title`} innerClassName="pt-12 pb-6">
          <LevelHeading tab="theory" level={g.level} title={g.title} count={g.concepts.length} />
          <div className="mt-6 border-t border-border">
            {g.concepts.map((c, i) => (
              <TheoryConceptCard
                key={c.id}
                concept={c}
                index={i + 1}
                anchorId={theoryAnchorId(c.id)}
                lectures={theoryLectureLinks(c, [], videos, instructors)}
              />
            ))}
          </div>
        </Slide>
      ))}
    </>
  );

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar current="glossary" />
        <div className="animate-fade-in pt-14 pb-14">
          <p className="eyebrow text-stage-muted">Glossary</p>
          <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg">용어집</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            AI 강의를 듣기 전에 알아두면 좋은 용어와 3분 이론을 수준별로 정리했습니다.
          </p>
        </div>
      </Slide>

      <GlossaryTabs
        initialTab={initialTab}
        termIds={glossary.map((t) => t.id)}
        theoryIds={theory.map((c) => c.id)}
        panels={{ terms: termsPanel, theory: theoryPanel }}
      />

      <Slide tone="light" innerClassName="pb-6">
        <AdSlot placement="glossary-bottom" className="mt-4" />
      </Slide>

      <Slide tone="light" as="footer" innerClassName="py-12 pb-[max(48px,env(safe-area-inset-bottom))]">
        <SiteFooterLinks exclude={["glossary", "theory"]} />
      </Slide>
    </main>
  );
}
