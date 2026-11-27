import Link from "next/link";
import type { Instructor, Video } from "@/types";
import { cn, IconArrowRight, IconArrowUpRight, IconCheck, IconChevronDown } from "@/components/ui";
import { lecturesForSkill, type TrendingSkill } from "@/lib/skills";
import { lectureAnchorId } from "@/lib/theory";
import { PromptBox } from "./saved/CopyPrompt";
import { SaveToggle } from "./saved/SaveToggle";

export interface SkillLectureLink {
  videoId: string;
  title: string;
  instructorName: string;
  /** 로드맵 카드 앵커 또는 유튜브 URL */
  href: string;
  external: boolean;
}

/** "2026-11" → "2026년 11월 기준" */
export function formatAsOf(asOf: string): string {
  const m = asOf.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}년 ${Number(m[2])}월 기준` : `${asOf} 기준`;
}

/** 여러 스킬 중 가장 최근 기준 월 */
export function latestAsOf(skills: readonly Pick<TrendingSkill, "asOf">[]): string | undefined {
  return skills.map((s) => s.asOf).sort().at(-1);
}

/** 스킬 관련 강의 링크: 로드맵에 있으면 카드 앵커, 없으면 유튜브 새 탭 */
export function skillLectureLinks(
  skill: TrendingSkill,
  videosById: ReadonlyMap<string, Video>,
  instructors: readonly Instructor[],
  roadmapIds: ReadonlySet<string> = new Set(),
): SkillLectureLink[] {
  return lecturesForSkill(skill, videosById).map((v) => {
    const inRoadmap = roadmapIds.has(v.id);
    return {
      videoId: v.id,
      title: v.title,
      instructorName: instructors.find((i) => i.id === v.instructorId)?.name ?? "",
      href: inRoadmap ? `#${lectureAnchorId(v.id)}` : v.url,
      external: !inRoadmap,
    };
  });
}

export interface SkillCardProps {
  skill: TrendingSkill;
  lectures: SkillLectureLink[];
  terms: { id: string; term: string }[];
  /** 스킬 id를 앵커로 (/skills 전용) */
  anchor?: boolean;
  defaultOpen?: boolean;
}

/** 요즘 주목받는 AI 스킬 하나 (네이티브 details: 접힘 = 이름·한 줄 소개) */
export function SkillCard({ skill, lectures, terms, anchor = false, defaultOpen = false }: SkillCardProps) {
  return (
    <div className="relative border-b border-border">
      <details
        id={anchor ? skill.id : undefined}
        open={defaultOpen || undefined}
        className="group scroll-mt-24"
        data-testid="skill-card"
        data-skill-id={skill.id}
      >
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-md py-4 select-none [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className="block pr-10 text-[17px] leading-snug font-semibold tracking-[-0.015em] text-fg">{skill.name}</span>
            <span className="mt-1 block text-[15px] leading-relaxed text-fg-muted">{skill.tagline}</span>
          </span>
          <span
            aria-hidden="true"
            className="mt-0.5 flex shrink-0 text-fg-muted transition-transform duration-300 group-open:rotate-180"
          >
            <IconChevronDown size={20} />
          </span>
        </summary>

        <div className="pb-6">
          <p className="eyebrow-ko text-fg-muted">왜 지금</p>
          <p className="mt-1 text-[15px] leading-[1.75] text-fg">{skill.whyNow}</p>

          <p className="mt-5 eyebrow-ko text-fg-muted">익히면 할 수 있는 것</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {skill.whatYouCanDo.slice(0, 3).map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-fg">
                <span aria-hidden="true" className="mt-[4px] flex shrink-0 text-accent-ink">
                  <IconCheck size={16} strokeWidth={2} />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <p className="eyebrow-ko text-fg-muted">첫걸음</p>
            <div className="mt-2">
              <PromptBox label={skill.firstStep.label} text={skill.firstStep.prompt} />
            </div>
          </div>

          {lectures.length > 0 && (
            <div className="mt-5">
              <p className="eyebrow-ko text-fg-muted">관련 강의</p>
              <ul className="mt-1.5 border-t border-border" data-testid="skill-lectures">
                {lectures.map((l) => (
                  <li key={l.videoId} className="border-b border-border">
                    <a
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex min-h-11 items-start gap-3 py-2.5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] leading-snug font-medium text-fg underline-offset-4 hover:underline">
                          {l.title}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-fg-muted">
                          {l.instructorName} · {l.external ? "유튜브에서 보기" : "내 로드맵에 있어요"}
                        </span>
                      </span>
                      <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-accent-ink">
                        {l.external ? <IconArrowUpRight size={16} strokeWidth={2} /> : <IconArrowRight size={16} strokeWidth={2} />}
                      </span>
                      {l.external && <span className="sr-only">(새 탭에서 열림)</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {terms.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[13px] text-fg-muted">관련 용어</span>
              {terms.map((t) => (
                <Link
                  key={t.id}
                  href={`/glossary#${t.id}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-border-strong px-3 text-[13px] font-medium text-fg-muted transition-colors duration-200 hover:text-fg"
                >
                  {t.term}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-5">
            <p className="eyebrow-ko text-fg-muted">근거 · {formatAsOf(skill.asOf)}</p>
            <ul className="mt-1.5 space-y-1" data-testid="skill-sources">
              {skill.sources.map((s) => (
                <li key={s.url} className="text-[13px] leading-relaxed text-fg-muted">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("break-words underline decoration-border-strong underline-offset-4 hover:text-fg")}
                  >
                    {s.publisher} · {s.title}
                    <span className="sr-only"> (새 탭에서 열림)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
      <SaveToggle kind="skill" id={skill.id} label={`스킬 저장: ${skill.name}`} className="absolute top-1.5 right-8" />
    </div>
  );
}
