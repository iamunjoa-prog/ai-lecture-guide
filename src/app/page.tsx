import { AppShell, BottomCTA } from "@/components/ui";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { InstructorMarquee } from "@/components/InstructorMarquee";
import { instructors, videos } from "@/components/catalog";

const VALUE_POINTS = [
  {
    icon: "⏱️",
    title: "1분 진단",
    desc: "질문 8개에 답하면 지금 수준과 관심 분야를 알려 드려요.",
  },
  {
    icon: "🧑‍🔬",
    title: "AI를 만든 사람들의 강의만",
    desc: "AI 기업 창업자, 핵심 연구자, 대학 교수, 공식 채널만 골랐어요.",
  },
  {
    icon: "🎁",
    title: "무료 유튜브 강의",
    desc: "돈 들이지 않고 지금 바로 들을 수 있는 강의로만 짜 드려요.",
  },
];

export default function Home() {
  return (
    <AppShell>
      <header className="flex h-14 items-center">
        <p className="flex items-center gap-1.5 text-[15px] font-bold text-fg">
          <span aria-hidden="true">🧭</span>
          AI 강의 길잡이
        </p>
      </header>

      <section className="animate-fade-up pt-8 pb-10">
        <p className="mb-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary-soft-fg">
          검증된 강사 {instructors.length}명 · 강의 {videos.length}개
        </p>
        <h1 className="text-[30px] leading-[1.3] font-bold tracking-[-0.03em] text-balance text-fg">
          수많은 AI 강의,
          <br />
          뭐부터 들어야 할지 <span className="text-primary">막막하셨죠?</span>
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-fg-muted">
          간단한 진단만 하면 내 수준에 딱 맞는 강의를 순서대로 정리해 드릴게요.
        </p>
      </section>

      <section aria-labelledby="value-title" className="pb-10">
        <h2 id="value-title" className="sr-only">
          AI 강의 길잡이의 특징
        </h2>
        <ul className="flex flex-col gap-3">
          {VALUE_POINTS.map((v, i) => (
            <li
              key={v.title}
              className="flex animate-fade-up items-start gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[26px] leading-none"
              >
                {v.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-bold text-fg">{v.title}</span>
                <span className="mt-0.5 block text-[15px] leading-relaxed text-fg-muted">{v.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="instructors-title" className="pb-6">
        <h2 id="instructors-title" className="mb-1 text-lg font-bold text-fg">
          이런 분들의 강의를 추천해요
        </h2>
        <p className="mb-4 text-sm text-fg-muted">AI를 직접 만들고 가르치는 사람들이에요.</p>
        <InstructorMarquee instructors={instructors} />
        <div className="mt-3 flex justify-center">
          <CriteriaSheet />
        </div>
      </section>

      <BottomCTA
        label="1분 진단 시작하기"
        href="/diagnosis"
        trailingIcon="→"
        helperText="회원가입 없이 바로 시작해요"
      />
    </AppShell>
  );
}
