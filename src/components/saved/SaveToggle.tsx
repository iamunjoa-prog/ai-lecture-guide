"use client";

import { cn, IconBookmark, IconCheck } from "@/components/ui";
import {
  hasRef,
  lectureOf,
  missionOf,
  setLectureStatus,
  setMissionStatus,
  toggleLecture,
  toggleMission,
  toggleRef,
  type RefKind,
  type SavedState,
} from "@/lib/saved";
import { nowIso, updateSaved, useSaved } from "./use-saved";
import { showToast } from "./toast";

export const UNAVAILABLE_MESSAGE = "이 브라우저에서는 저장할 수 없어요";

export type SaveKind = "lecture" | "mission" | "skill" | "term" | "theory";

const REF_KIND: Record<"skill" | "term" | "theory", RefKind> = { skill: "skills", term: "terms", theory: "theory" };

function isSaved(state: SavedState, kind: SaveKind, id: string): boolean {
  if (kind === "lecture") return Boolean(lectureOf(state, id));
  if (kind === "mission") return Boolean(missionOf(state, id));
  return hasRef(state, REF_KIND[kind], id);
}

function toggle(state: SavedState, kind: SaveKind, id: string): SavedState {
  const now = nowIso();
  if (kind === "lecture") return toggleLecture(state, id, now);
  if (kind === "mission") return toggleMission(state, id, now);
  return toggleRef(state, REF_KIND[kind], id, now);
}

/** 저장에 실패했을 때 공통 안내 */
export function applySaved(fn: (s: SavedState) => SavedState, okMessage?: string): boolean {
  const ok = updateSaved(fn);
  if (!ok) showToast(UNAVAILABLE_MESSAGE, "info", 3200);
  else if (okMessage) showToast(okMessage, "ok");
  return ok;
}

export interface SaveToggleProps {
  kind: SaveKind;
  id: string;
  /** 접근 가능한 이름 (상태와 상관없이 같다. 상태는 aria-pressed로 알린다). 예: "강의 저장" */
  label: string;
  /** icon: 44px 원형 아이콘 버튼 · pill: 아이콘 + 글자 */
  variant?: "icon" | "pill";
  /** 어두운 무대 위에 둘 때 */
  onStage?: boolean;
  className?: string;
}

/**
 * 북마크 저장 토글. 서버와 하이드레이션 중에는 '저장 안 됨'으로 그리고,
 * 하이드레이션 뒤 브라우저 저장 내용을 반영한다(불일치 없음, 크기 고정이라 화면 밀림 없음).
 */
export function SaveToggle({ kind, id, label, variant = "icon", onStage = false, className }: SaveToggleProps) {
  const { state, available, ready } = useSaved();
  const pressed = ready && available && isSaved(state, kind, id);

  const onClick = () => {
    if (!ready) return;
    if (!available) {
      showToast(UNAVAILABLE_MESSAGE, "info", 3200);
      return;
    }
    applySaved((s) => toggle(s, kind, id), pressed ? "저장을 취소했어요" : "내 학습함에 저장했어요");
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        data-save-kind={kind}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-colors duration-200",
          pressed ? "border-fg bg-surface-2 text-fg" : "border-border-strong text-fg-muted hover:text-fg",
          className,
        )}
      >
        <span aria-hidden="true" className={cn("flex", pressed && "text-accent-ink")}>
          <IconBookmark size={16} filled={pressed} />
        </span>
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={pressed ? "저장됨" : label}
      onClick={onClick}
      data-save-kind={kind}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
        onStage ? "text-stage-muted hover:text-stage-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
        pressed && (onStage ? "text-accent" : "text-accent-ink"),
        className,
      )}
    >
      <IconBookmark size={20} filled={pressed} />
    </button>
  );
}

/** 실습 '완료했어요' 토글 (누르면 실습도 함께 저장된다) */
export function MissionDoneToggle({
  videoId,
  title,
  className,
  onDone,
}: {
  videoId: string;
  /** 있으면 접근 가능한 이름을 '완료했어요: {title}'로 (한 화면에 미션이 여럿일 때) */
  title?: string;
  className?: string;
  onDone?: () => void;
}) {
  const { state, available, ready } = useSaved();
  const done = ready && available && missionOf(state, videoId)?.status === "done";
  const onClick = () => {
    if (!ready) return;
    if (!available) {
      showToast(UNAVAILABLE_MESSAGE, "info", 3200);
      return;
    }
    const ok = applySaved(
      (s) => setMissionStatus(s, videoId, done ? "todo" : "done", nowIso()),
      done ? "해볼 예정으로 바꿨어요" : "실습 완료! 내 학습함에 기록했어요",
    );
    if (ok && !done) onDone?.();
  };
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={title ? `완료했어요: ${title}` : undefined}
      onClick={onClick}
      data-testid="mission-done"
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-colors duration-200",
        done ? "border-transparent bg-ink text-ink-fg" : "border-border-strong text-fg-muted hover:text-fg",
        className,
      )}
    >
      <span aria-hidden="true" className="flex">
        <IconCheck size={16} strokeWidth={2} />
      </span>
      완료했어요
    </button>
  );
}

/**
 * 강의 '다 봤어요' 토글 (누르면 강의도 함께 저장된다). 다시 누르면 '보는 중'으로 돌린다.
 * 내 학습 여정의 강의 완료는 이 상태로 센다.
 */
export function LectureDoneToggle({ videoId, title, className }: { videoId: string; title: string; className?: string }) {
  const { state, available, ready } = useSaved();
  const done = ready && available && lectureOf(state, videoId)?.status === "done";
  const onClick = () => {
    if (!ready) return;
    if (!available) {
      showToast(UNAVAILABLE_MESSAGE, "info", 3200);
      return;
    }
    applySaved(
      (s) => setLectureStatus(s, videoId, done ? "watching" : "done", nowIso()),
      done ? "보는 중으로 바꿨어요" : "다 본 강의로 기록했어요",
    );
  };
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={`다 봤어요: ${title}`}
      onClick={onClick}
      data-testid="lecture-done"
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-medium transition-colors duration-200",
        done ? "border-transparent bg-ink text-ink-fg" : "border-border-strong text-fg-muted hover:text-fg",
        className,
      )}
    >
      <span aria-hidden="true" className="flex">
        <IconCheck size={16} strokeWidth={2} />
      </span>
      다 봤어요
    </button>
  );
}
