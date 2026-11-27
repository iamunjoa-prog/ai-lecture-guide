"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { cn, IconArrowRight, IconArrowUpRight, IconCheck, IconChevronDown } from "@/components/ui";
import type { TrendingSkill } from "@/lib/skills";
import { CopyButton, PromptBox } from "./saved/CopyPrompt";
import { SaveToggle } from "./saved/SaveToggle";
import { formatAsOf, type SkillLectureLink } from "./skill-links";
import { useLocationHash } from "./use-location-hash";

export interface SkillCardProps {
  skill: TrendingSkill;
  lectures: SkillLectureLink[];
  terms: { id: string; term: string }[];
  /** 스킬 id를 앵커로 (/skills 전용). 주소 해시가 이 id면 펼쳐진다 */
  anchor?: boolean;
  defaultOpen?: boolean;
}

/**
 * 요즘 주목받는 AI 스킬 하나.
 * 접힘: 이름 · 한 줄 소개 · '첫걸음 프롬프트 복사'(펼치지 않아도 바로 복사) · '자세히 보기'
 * 펼침: 왜 지금 · 익히면 할 수 있는 것 · 첫걸음 프롬프트 · 관련 강의 · 관련 용어 · 근거
 */
export function SkillCard({ skill, lectures, terms, anchor = false, defaultOpen = false }: SkillCardProps) {
  const uid = useId();
  const hash = useLocationHash();
  const hashOpen = anchor && hash === `#${skill.id}`;
  // 사용자가 직접 펼치거나 접은 상태는 같은 해시에서만 유지 (해시로 다시 들어오면 펼친다)
  const [toggled, setToggled] = useState<{ hash: string; open: boolean } | null>(null);
  const open = toggled && toggled.hash === hash ? toggled.open : defaultOpen || hashOpen;
  const bodyId = `${uid}-body`;
  const titleId = `${uid}-title`;

  return (
    <div
      id={anchor ? skill.id : undefined}
      className="relative scroll-mt-24 border-b border-border pt-4 pb-3"
      data-testid="skill-card"
      data-skill-id={skill.id}
      data-open={open ? "" : undefined}
    >
      <h3 id={titleId} className="pr-12 text-[17px] leading-snug font-semibold tracking-[-0.015em] text-fg">
        {skill.name}
      </h3>
      <p className="mt-1 text-[15px] leading-relaxed text-fg-muted">{skill.tagline}</p>
      <SaveToggle kind="skill" id={skill.id} label={`스킬 저장: ${skill.name}`} className="absolute top-1.5 -right-2" />

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <CopyButton
          text={skill.firstStep.prompt}
          label={`첫걸음 프롬프트 복사: ${skill.name}`}
          variant="outline"
          className="px-3.5 text-[13px]"
        >
          첫걸음 프롬프트 복사
        </CopyButton>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setToggled({ hash, open: !open })}
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[14px] font-medium text-fg-muted transition-colors duration-200 hover:text-fg"
          data-testid="skill-more"
        >
          {open ? "접기" : "자세히 보기"}
          <span aria-hidden="true" className={cn("flex transition-transform duration-300", open && "rotate-180")}>
            <IconChevronDown size={16} />
          </span>
        </button>
      </div>

      <div id={bodyId} hidden={!open} className="pt-4 pb-3">
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
          <p className="eyebrow-ko text-fg-muted">첫걸음 프롬프트</p>
          <div className="mt-2">
            <PromptBox label={skill.firstStep.label} text={skill.firstStep.prompt} copy={false} />
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
                  className="break-words underline decoration-border-strong underline-offset-4 hover:text-fg"
                >
                  {s.publisher} · {s.title}
                  <span className="sr-only"> (새 탭에서 열림)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
