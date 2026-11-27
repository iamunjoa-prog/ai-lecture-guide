"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "@/components/ui";

export interface SegmentedOption<V extends string> {
  value: V;
  label: string;
}

/** 다음에 그려질 때 포커스를 받을 세그먼트 (상태가 바뀌어 다른 묶음으로 옮겨 그려질 때 포커스를 잇는다) */
let pendingFocusKey: string | null = null;
export function focusSegmentedOnMount(key: string) {
  pendingFocusKey = key;
}

/**
 * 세그먼트 컨트롤 (WAI-ARIA radiogroup). 화살표 키로 이동하면 바로 선택된다.
 * `focusKey`가 `focusSegmentedOnMount`로 요청된 값이면 처음 그려질 때 선택된 항목에 포커스를 준다.
 */
export function Segmented<V extends string>({
  label,
  options,
  value,
  onChange,
  focusKey,
  className,
}: {
  label: string;
  options: readonly SegmentedOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  focusKey?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  useEffect(() => {
    if (focusKey && pendingFocusKey === focusKey) {
      pendingFocusKey = null;
      refs.current[current]?.focus();
    }
    // 처음 그릴 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("grid auto-cols-fr grid-flow-col rounded-full border border-border-strong p-0.5", className)}
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
              "min-h-10 rounded-full px-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200",
              checked ? "bg-ink text-ink-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
