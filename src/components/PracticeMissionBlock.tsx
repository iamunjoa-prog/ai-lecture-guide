import { cn, IconCheck, IconInfo } from "@/components/ui";
import { PRACTICE_TOOL_LABELS, resolvePrompt, type PracticeMission } from "@/lib/practice";
import type { Domain } from "@/types";
import { PromptBox } from "./saved/CopyPrompt";
import { MissionDoneToggle, SaveToggle } from "./saved/SaveToggle";

export interface ResolvedPrompt {
  label: string;
  text: string;
}

/** 사용자 분야에 맞춘 프롬프트 문구 */
export function resolvePrompts(mission: PracticeMission, domains: readonly Domain[]): ResolvedPrompt[] {
  return mission.prompts.map((p) => ({ label: p.label, text: resolvePrompt(p, { domains: [...domains] }) }));
}

export interface PracticeMissionBodyProps {
  mission: PracticeMission;
  prompts: ResolvedPrompt[];
  /** 목표·준비물을 따로(접힌 머리에) 보여 줄 때 true */
  hideIntro?: boolean;
  className?: string;
}

/** 목표 · 준비물 */
export function MissionIntro({ mission, className }: { mission: PracticeMission; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[15px] leading-relaxed text-fg">{mission.goal}</p>
      {mission.needsTool && (
        <p className="mt-1.5 text-[13px] text-fg-muted">
          <span className="font-semibold text-fg">준비물</span> · {PRACTICE_TOOL_LABELS[mission.needsTool]}
        </p>
      )}
    </div>
  );
}

/** 미션 본문: 목표 · 준비물 · 단계 · 프롬프트(복사) · 성공 기준 · 주의 */
export function PracticeMissionBody({ mission, prompts, hideIntro = false, className }: PracticeMissionBodyProps) {
  return (
    <div className={className}>
      {!hideIntro && <MissionIntro mission={mission} />}
      <ol className={cn("flex flex-col gap-2", !hideIntro && "mt-3.5")} aria-label="해 보는 순서">
        {mission.steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-fg">
            <span
              aria-hidden="true"
              className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-[12px] font-semibold text-fg-muted tabular-nums"
            >
              {i + 1}
            </span>
            <span className="min-w-0">{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-col gap-2.5">
        {prompts.map((p, i) => (
          <PromptBox key={i} label={p.label} text={p.text} />
        ))}
      </div>
      <p className="mt-4 flex gap-2 text-[14px] leading-relaxed text-fg">
        <span aria-hidden="true" className="mt-[3px] flex shrink-0 text-accent-ink">
          <IconCheck size={16} strokeWidth={2} />
        </span>
        <span>
          <span className="font-semibold">이렇게 되면 성공</span> · {mission.success}
        </span>
      </p>
      {mission.caution && (
        <p className="mt-3 flex gap-2 rounded-md border border-border px-3.5 py-3 text-[13px] leading-relaxed text-fg-muted">
          <span aria-hidden="true" className="mt-[2px] flex shrink-0">
            <IconInfo size={16} />
          </span>
          <span>
            <span className="font-semibold text-fg">주의</span> · {mission.caution}
          </span>
        </p>
      )}
    </div>
  );
}

/** 실습 저장 + 완료 토글 */
export function MissionActions({ videoId, title, className }: { videoId: string; title?: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <SaveToggle kind="mission" id={videoId} label="실습 저장" variant="pill" />
      <MissionDoneToggle videoId={videoId} title={title} />
    </div>
  );
}
