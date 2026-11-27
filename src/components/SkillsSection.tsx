import Link from "next/link";
import type { GlossaryTerm, Instructor, Video } from "@/types";
import { IconArrowRight, Slide } from "@/components/ui";
import type { TrendingSkill } from "@/lib/skills";
import { SkillCard } from "./SkillCard";
import { formatAsOf, latestAsOf, skillLectureLinks, skillTerms } from "./skill-links";

export { skillTerms } from "./skill-links";

/**
 * 결과 화면 '다음 스킬' 탭: 요즘 주목받는 AI 스킬.
 * 입문자에게는 이 탭 자체를 만들지 않는다 (결과 페이지에서 걸러 낸다).
 */
export function SkillsSection({
  skills,
  levelLabel,
  videosById,
  instructors,
  roadmapIds,
  termsById,
  level,
}: {
  skills: TrendingSkill[];
  levelLabel: string;
  videosById: ReadonlyMap<string, Video>;
  instructors: readonly Instructor[];
  roadmapIds: ReadonlySet<string>;
  termsById: Record<string, GlossaryTerm>;
  /** '스킬 전체 보기' 링크에 수준 필터를 붙인다 */
  level: string;
}) {
  if (skills.length === 0) return null;
  const asOf = latestAsOf(skills);
  return (
    <Slide tone="light" aria-labelledby="skills-title" innerClassName="pt-10 pb-10">
      <section data-testid="skills-section">
        <p className="eyebrow text-fg-muted">Trending skills</p>
        <h2 id="skills-title" className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-fg">
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
        <Link
          href={`/skills?l=${level}`}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full text-[15px] font-medium text-accent-ink"
        >
          스킬 전체 보기
          <IconArrowRight size={16} strokeWidth={2} />
        </Link>
      </section>
    </Slide>
  );
}
