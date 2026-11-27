import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { glossary, instructors, knownIdLists, practice, skills, theory, videos } from "@/components/catalog";
import { SavedHeroStatus, SavedView, type SavedCatalog } from "@/components/saved/SavedView";
import { Slide } from "@/components/ui";

export const metadata: Metadata = {
  title: "내 학습함",
  description: "저장한 강의·실습·스킬·이론·용어를 이 브라우저에서 모아 봅니다.",
  // 사람마다 내용이 다르고 브라우저에만 저장된다
  robots: { index: false, follow: true },
};

/** 강의 카드의 formatDuration과 같은 표기 (그쪽은 클라이언트 모듈이라 서버에서 부를 수 없다) */
function durationLabel(min: number): string {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function buildCatalog(): SavedCatalog {
  const name = (id: string) => instructors.find((i) => i.id === id)?.name ?? "";
  return {
    lectures: Object.fromEntries(
      videos.map((v) => [
        v.id,
        { id: v.id, title: v.title, instructorName: name(v.instructorId), url: v.url, durationLabel: durationLabel(v.durationMin) },
      ]),
    ),
    missions: Object.fromEntries(practice.map((m) => [m.videoId, m])),
    skills: skills.map((s) => ({ id: s.id, name: s.name, tagline: s.tagline, lectureIds: s.lectureIds })),
    terms: Object.fromEntries(
      glossary.map((t) => [t.id, { id: t.id, term: t.term, termEn: t.termEn, short: t.short, detail: t.detail }]),
    ),
    theory: Object.fromEntries(theory.map((c) => [c.id, { id: c.id, title: c.title, summary: c.summary }])),
    known: knownIdLists(),
  };
}

export default function SavedPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar showSaved={false} current="saved" />
        <div className="animate-fade-in pt-12 pb-12">
          <p className="eyebrow text-stage-muted">My shelf</p>
          <h1 className="display mt-4 text-[clamp(36px,11vw,52px)] text-stage-fg">내 학습함</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            저장한 강의와 실습을 이어서 해 보세요. 로그인 없이 이 브라우저에만 저장돼요.
          </p>
          <SavedHeroStatus />
        </div>
      </Slide>

      <SavedView catalog={buildCatalog()} />

      <Slide tone="light" as="footer" innerClassName="pt-2 pb-[max(48px,env(safe-area-inset-bottom))]">
        <div className="flex flex-wrap items-center gap-x-5">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full text-[15px] font-medium text-accent-ink underline underline-offset-4">
            처음 화면으로
          </Link>
          <Link href="/skills" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            AI 스킬
          </Link>
          <Link href="/privacy#p-saved" className="inline-flex min-h-11 items-center rounded-full text-[14px] text-fg-muted underline underline-offset-4">
            저장 기능 안내
          </Link>
        </div>
      </Slide>
    </main>
  );
}
