import Link from "next/link";
import { knownIdLists } from "./catalog";
import { SavedHeaderLink } from "./saved/SavedHeaderLink";

/** 어두운 무대 위 상단 줄: 왼쪽 서비스 이름(처음 화면), 오른쪽 '내 학습함' */
export function SiteHeaderBar({ showSaved = true }: { showSaved?: boolean }) {
  return (
    <div className="flex h-14 items-center justify-between gap-3">
      <Link
        href="/"
        aria-label="처음 화면으로"
        className="-ml-1 inline-flex min-h-11 items-center rounded-full px-1 text-[15px] font-semibold tracking-[-0.01em] text-stage-fg"
      >
        AI 강의 길잡이
      </Link>
      {showSaved && (
        <nav aria-label="내 메뉴">
          <SavedHeaderLink known={knownIdLists()} className="-mr-2" />
        </nav>
      )}
    </div>
  );
}
