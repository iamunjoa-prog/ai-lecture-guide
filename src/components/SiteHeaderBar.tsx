import Link from "next/link";
import { cn } from "@/components/ui";
import { knownIdLists } from "./catalog";
import { SavedHeaderLink } from "./saved/SavedHeaderLink";

export type SiteSection = "glossary" | "skills" | "saved";

/** 좁은 화면(320px)에서도 한 줄에 들어가도록 359px 이하에서는 글자·여백을 줄인다 */
const navLink =
  "inline-flex min-h-11 items-center rounded-full px-2 text-[15px] font-medium transition-colors duration-200 max-[359px]:px-1.5 max-[359px]:text-[14px]";

/**
 * 어두운 무대 위 상단 줄: 왼쪽 서비스 이름, 오른쪽 용어집 · AI 스킬 · 내 학습함.
 * - `home`: 처음 화면에서는 서비스 이름을 링크로 만들지 않는다
 * - `showSkills`: 입문자 결과 화면에서는 'AI 스킬'을 숨긴다 (입문자는 기본 강의·실습에 집중)
 * - `current`: 지금 보고 있는 페이지 (aria-current)
 */
export function SiteHeaderBar({
  showSaved = true,
  showSkills = true,
  home = false,
  current,
}: {
  showSaved?: boolean;
  showSkills?: boolean;
  home?: boolean;
  current?: SiteSection;
}) {
  const brandCls =
    "-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-full px-1 text-[15px] font-semibold tracking-[-0.01em] text-stage-fg max-[359px]:text-[14px]";
  const item = (section: SiteSection, href: string, label: string) => {
    const here = current === section;
    return (
      <Link
        href={href}
        aria-current={here ? "page" : undefined}
        className={cn(navLink, here ? "text-stage-fg" : "text-stage-muted hover:text-stage-fg")}
        data-testid={`header-${section}`}
      >
        {label}
      </Link>
    );
  };
  return (
    <div className="flex min-h-14 items-center justify-between gap-2" data-testid="site-header">
      {home ? (
        <p className={brandCls}>AI 강의 길잡이</p>
      ) : (
        <Link href="/" aria-label="처음 화면으로" className={brandCls}>
          AI 강의 길잡이
        </Link>
      )}
      <nav aria-label="내 메뉴" className="-mr-2 flex min-w-0 items-center max-[359px]:-mr-1.5">
        {item("glossary", "/glossary", "용어집")}
        {showSkills && item("skills", "/skills", "AI 스킬")}
        {showSaved && <SavedHeaderLink known={knownIdLists()} className="max-[359px]:pr-3 max-[359px]:pl-1.5 max-[359px]:text-[14px]" />}
      </nav>
    </div>
  );
}
