"use client";

import { cn, IconCopy } from "@/components/ui";
import { PLACEHOLDER_RE, placeholdersOf } from "@/lib/practice";
import { copyText } from "./clipboard";
import { showToast } from "./toast";

/** 자리표시자 `[...]`를 강조해서 보여 준다 */
export function PromptText({ text, className }: { text: string; className?: string }) {
  const holes = placeholdersOf(text);
  if (holes.length === 0) return <span className={className}>{text}</span>;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(new RegExp(PLACEHOLDER_RE.source, "g"))) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <mark key={i} className="rounded-[4px] bg-accent-soft px-0.5 font-semibold text-accent-soft-fg" data-placeholder>
        {m[0]}
      </mark>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span className={className}>{parts}</span>;
}

export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const onClick = async () => {
    const ok = await copyText(text);
    showToast(ok ? "복사했어요" : "복사하지 못했어요. 글을 길게 눌러 직접 복사해 주세요.", ok ? "ok" : "error", ok ? 2000 : 3600);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-semibold text-ink-fg transition-colors duration-200 hover:bg-ink-hover",
        className,
      )}
    >
      <span aria-hidden="true" className="flex">
        <IconCopy size={16} />
      </span>
      복사
    </button>
  );
}

/** 프롬프트 한 개: 이름 + 본문(자리표시자 강조) + 복사 버튼 */
export function PromptBox({ label, text, hint = true }: { label: string; text: string; hint?: boolean }) {
  const hasHole = placeholdersOf(text).length > 0;
  return (
    <div className="rounded-md border border-border bg-surface-2 px-4 pt-3 pb-3" data-testid="prompt-box">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-[13px] font-semibold text-fg">{label}</p>
        <CopyButton text={text} label={`프롬프트 복사: ${label}`} className="-mr-1" />
      </div>
      <p className="mt-1.5 text-[14px] leading-[1.7] break-words whitespace-pre-line text-fg" data-testid="prompt-text">
        <PromptText text={text} />
      </p>
      {hint && hasHole && (
        <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">색이 칠해진 [대괄호] 부분을 내 상황으로 바꿔 보내세요.</p>
      )}
    </div>
  );
}
