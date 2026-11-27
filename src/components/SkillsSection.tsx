import Link from "next/link";
import type { GlossaryTerm, Instructor, Video } from "@/types";
import { IconArrowRight } from "@/components/ui";
import type { TrendingSkill } from "@/lib/skills";
import { formatAsOf, latestAsOf, SkillCard, skillLectureLinks } from "./SkillCard";

export function skillTerms(skill: TrendingSkill, byId: Record<string, GlossaryTerm>) {
  return skill.termIds.map((id) => byId[id]).filter(Boolean).map((t) => ({ id: t.id, term: t.term }));
}

/** 결과 화면: 요즘 주목받는 AI 스킬 (입문자는 한 줄 안내만) */
export function SkillsSection({
  skills,
  isBeginner,
  levelLabel,
  videosById,
  instructors,
  roadmapIds,
  termsById,
}: {
  skills: TrendingSkill[];
  isBeginner: boolean;
  levelLabel: string;
  videosById: ReadonlyMap<string, Video>;
  instructors: readonly Instructor[];
  roadmapIds: ReadonlySet<string>;
  termsById: Record<string, GlossaryTerm>;
}) {
  if (isBeginner || skills.length === 0) {
    return (
      <p className="mt-2 border-t border-border pt-6 pb-2 text-[14px] leading-relaxed text-fg-muted" data-testid="skills-hint">
        기본기를 익히면 다음 단계 스킬을 추천해 드려요.
      </p>
    );
  }
  const asOf = latestAsOf(skills);
  return (
    <section aria-labelledby="skills-title" className="border-t border-border pt-10 pb-2" data-testid="skills-section">
      <p className="eyebrow text-fg-muted">Trending skills</p>
      <h2 id="skills-title" className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-fg">
        요즘 주목받는 AI 스킬
      </h2>
      <p className="mt-1.5 text-[15px] leading-relaxed text-fg-muted">
        {levelLabel}가 다음에 익히면 좋은 스킬 {skills.length}가지예요.
        {asOf && <span className="whitespace-nowrap"> {formatAsOf(asOf)}</span>}
      </p>
      <div className="mt-5 border-t border-border">
        {skills.map((s) => (
          <SkillCard
            key={s.id}
            skill={s}
            lectures={skillLectureLinks(s, videosById, instructors, roadmapIds)}
            terms={skillTerms(s, termsById)}
          />
        ))}
      </div>
      <Link href="/skills" className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-medium text-accent-ink">
        스킬 전체 보기
        <IconArrowRight size={16} strokeWidth={2} />
      </Link>
    </section>
  );
}
