import Link from "next/link";
import { cn } from "@/components/ui";

export type FooterLinkId = "practice" | "glossary" | "theory" | "skills" | "saved" | "home" | "privacy";

const LINKS: Record<FooterLinkId, { href: string; label: string }> = {
  practice: { href: "/practice", label: "실습 모음" },
  glossary: { href: "/glossary", label: "AI 용어집" },
  theory: { href: "/glossary?tab=theory", label: "3분 이론" },
  skills: { href: "/skills", label: "AI 스킬" },
  saved: { href: "/saved", label: "내 학습함" },
  home: { href: "/", label: "처음 화면으로" },
  privacy: { href: "/privacy", label: "개인정보 처리방침" },
};

const ORDER: FooterLinkId[] = ["practice", "glossary", "theory", "skills", "saved", "home", "privacy"];

/** 흰 본문 바닥글의 작은 링크 줄 (지금 페이지는 `exclude`로 뺀다). 모든 화면에서 같은 순서 */
export function SiteFooterLinks({ exclude = [], className }: { exclude?: FooterLinkId[]; className?: string }) {
  return (
    <nav aria-label="바닥글" className={cn("flex flex-wrap items-center gap-x-5", className)} data-testid="site-footer-links">
      {ORDER.filter((id) => !exclude.includes(id)).map((id) => (
        <Link
          key={id}
          href={LINKS[id].href}
          className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4"
        >
          {LINKS[id].label}
        </Link>
      ))}
    </nav>
  );
}
