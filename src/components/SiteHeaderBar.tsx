import Link from "next/link";
import { cn } from "@/components/ui";
import { knownIdLists } from "./catalog";
import { SavedHeaderLink } from "./saved/SavedHeaderLink";

export type SiteSection = "practice" | "glossary" | "skills" | "saved";

/**
 * 메뉴 4개(실습 · 용어집 · AI 스킬 · 내 학습함)가 320px에서도 한 줄에 들어가도록
 * 화면 폭에 따라 글자·여백을 줄인다 (≥400px 15px · 360~399px 14px · 359px 이하 13.5px, 메뉴 사이 10px 이상).
 */
const navLink =
  "inline-flex min-h-11 items-center rounded-full px-2 text-[15px] font-medium whitespace-nowrap transition-colors duration-200 max-[399px]:px-1.5 max-[399px]:text-[14px] max-[359px]:px-[5px] max-[359px]:text-[13.5px]";

/**
 * 어두운 무대 위 상단 줄: 왼쪽 서비스 이름, 오른쪽 실습 · 용어집 · AI 스킬 · 내 학습함.
 * - `home`: 처음 화면에서는 서비스 이름을 링크로 만들지 않는다
 * - `showSkills`: 입문자 결과 화면에서는 'AI 스킬'을 숨긴다 (입문자는 기본 강의·실습에 집중)
 * - `current`: 지금 보고 있는 페이지 (aria-current)
 */
export function SiteHeaderBar({
  showSkills = true,
  home = false,
  current,
}: {
  showSkills?: boolean;
  home?: boolean;
  current?: SiteSection;
}) {
  const brandCls =
    "-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-full px-1 text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap text-stage-fg max-[399px]:text-[14px] max-[359px]:text-[13.5px]";
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
    <div className="flex min-h-14 items-center justify-between gap-1" data-testid="site-header">
      {home ? (
        <p className={brandCls}>AI 강의 길잡이</p>
      ) : (
        <Link href="/" aria-label="처음 화면으로" className={brandCls}>
          AI 강의 길잡이
        </Link>
      )}
      <nav aria-label="내 메뉴" className="-mr-2 flex min-w-0 items-center max-[399px]:-mr-1.5 max-[359px]:-mr-[5px]">
        {item("practice", "/practice", "실습")}
        {item("glossary", "/glossary", "용어집")}
        {showSkills && item("skills", "/skills", "AI 스킬")}
        <SavedHeaderLink
          known={knownIdLists()}
          current={current === "saved"}
          className={cn(navLink, "pr-3 max-[399px]:pr-3 max-[359px]:pr-2.5")}
        />
      </nav>
    </div>
  );
}
