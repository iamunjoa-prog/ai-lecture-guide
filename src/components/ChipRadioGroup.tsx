"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/components/ui";

export interface ChipOption<V extends string> {
  value: V;
  label: string;
}

/**
 * 알약 모양 단일 선택 묶음 (WAI-ARIA radiogroup, 화살표 키로 이동하면 바로 선택).
 * 보이는 묶음 이름(`label`)이 radiogroup의 이름이 된다.
 */
export function ChipRadioGroup<V extends string>({
  label,
  options,
  value,
  onChange,
  testId,
  className,
}: {
  label: string;
  options: readonly ChipOption<V>[];
  value: V;
  onChange: (v: V) => void;
  testId?: string;
  className?: string;
}) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (current + keys[e.key] + options.length) % options.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    if (next === null) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(options[next].value);
  };

  return (
    <div className={className}>
      <p id={labelId} className="text-[13px] font-semibold text-fg-muted">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="mt-1.5 flex flex-wrap gap-1.5"
        data-testid={testId}
      >
        {options.map((o, i) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={i === current ? 0 : -1}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-3 text-[14px] font-medium whitespace-nowrap transition-colors duration-200",
                checked ? "border-ink bg-ink text-ink-fg" : "border-border-strong text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
