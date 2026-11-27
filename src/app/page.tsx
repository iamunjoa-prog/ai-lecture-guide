import { Button, IconArrowRight, IconCheck, Reveal, Slide } from "@/components/ui";
import { CriteriaSheet } from "@/components/CriteriaSheet";
import { credentialBadge, instructors, videos } from "@/components/catalog";
import { CRITERIA, EXCLUDED_NOTE } from "@/components/criteria";

const STEPS = [
  { title: "지금 수준을 진단합니다", desc: "AI 사용 경험, 프롬프트 작성, 자동화·코딩 경험을 묻는 다섯 문항으로 수준을 판단합니다." },
  { title: "분야와 목표를 고릅니다", desc: "업무 자동화, 마케팅, 코딩 등 관심 분야와 이루고 싶은 목표를 알려 주세요." },
  { title: "순서대로 정리해 드립니다", desc: "기초부터 실전, 다음 단계까지 들을 순서에 맞춰 유튜브 강의를 배치합니다." },
];

export default function Home() {
  const instructorCount = instructors.length;
  const videoCount = videos.length;

  return (
    <main className="flex min-h-dvh flex-col">
      {/* 1. 히어로 — 어두운 키노트 슬라이드 */}
      <Slide tone="stage" as="header" innerClassName="flex min-h-[92svh] flex-col pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-stage-fg">AI 강의 길잡이</p>
        </div>
        <div className="flex flex-1 flex-col justify-center py-14">
          <p className="eyebrow animate-fade-in text-stage-muted">Curated YouTube Lectures</p>
          <h1 className="display mt-5 animate-fade-in text-[clamp(38px,11.5vw,60px)] text-stage-fg [animation-delay:80ms]">
            <span className="text-accent">AI를 만든 사람</span>에게
            <br />
            직접 배우세요.
          </h1>
          <p className="mt-6 animate-fade-in text-[17px] leading-relaxed text-stage-muted [animation-delay:160ms]">
            AI 창업자·연구자·교수의 유튜브 강의 중 검증된 것만 선별해, 수준과 목표에 맞게 순서대로 정리해 드립니다.
          </p>
          <div className="mt-10 flex animate-fade-in flex-col items-start gap-4 [animation-delay:240ms]">
            <Button href="/diagnosis" variant="accent" size="lg" trailingIcon={<IconArrowRight size={18} strokeWidth={2} />}>
              1분 진단 시작하기
            </Button>
            <p className="text-[13px] text-stage-muted">질문 8개 · 회원가입 없이 바로 시작합니다</p>
          </div>
        </div>
        <dl className="grid animate-fade-in grid-cols-2 border-t border-stage-border py-6 [animation-delay:320ms]">
          <div>
            <dt className="text-[13px] text-stage-muted">검증된 강사</dt>
            <dd className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-stage-fg tabular-nums">{instructorCount}명</dd>
          </div>
          <div>
            <dt className="text-[13px] text-stage-muted">선별한 유튜브 강의</dt>
            <dd className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-stage-fg tabular-nums">{videoCount}개</dd>
          </div>
        </dl>
      </Slide>

      {/* 2. 진행 방식 */}
      <Slide tone="light" aria-labelledby="how-title" innerClassName="py-24">
        <Reveal>
          <p className="eyebrow text-fg-muted">How it works</p>
          <h2 id="how-title" className="display mt-4 text-[clamp(32px,9vw,44px)] text-fg">
            질문 8개면
            <br />
            충분합니다.
          </h2>
        </Reveal>
        <ol className="mt-12 border-t border-border">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className="flex gap-5 border-b border-border py-7">
              <span aria-hidden="true" className="w-9 shrink-0 text-[28px] leading-none font-extralight tracking-[-0.04em] text-fg tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[19px] font-bold tracking-[-0.02em] text-fg">{s.title}</span>
                <span className="mt-1.5 block text-[15px] leading-relaxed text-fg-muted">{s.desc}</span>
              </span>
            </Reveal>
          ))}
        </ol>
      </Slide>

      {/* 3. 선별 기준 */}
      <Slide tone="muted" aria-labelledby="criteria-title" innerClassName="py-24">
        <Reveal>
          <p className="eyebrow text-fg-muted">Selection</p>
          <h2 id="criteria-title" className="display mt-4 text-[clamp(32px,9vw,44px)] text-fg">
            누가 가르치는지부터
            <br />
            <span className="text-accent-ink">확인했습니다.</span>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-fg-muted">
            유튜브에 있는 수많은 AI 강의 중, 아래 기준을 하나 이상 충족한 강사의 강의만 선별했습니다.
          </p>
        </Reveal>
        <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {CRITERIA.map((c, i) => (
            <Reveal as="li" key={c.title} delay={i * 60} className="flex items-start gap-3.5 bg-bg px-5 py-5">
              <span aria-hidden="true" className="mt-[3px] flex shrink-0 text-accent-ink">
                <IconCheck size={18} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-semibold tracking-[-0.015em] text-fg">{c.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-fg-muted">{c.desc}</span>
              </span>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mt-8">
          <p className="text-[15px] leading-relaxed text-fg-muted">
            {EXCLUDED_NOTE} 등록된 모든 링크는 직접 열어 확인했습니다.
          </p>
          <CriteriaSheet className="mt-3" />
        </Reveal>
      </Slide>

      {/* 4. 강사 목록 (정적) */}
      <Slide tone="light" aria-labelledby="instructors-title" innerClassName="py-24">
        <Reveal>
          <p className="eyebrow text-fg-muted">Instructors</p>
          <h2 id="instructors-title" className="display mt-4 text-[clamp(32px,9vw,44px)] text-fg">
            강사 {instructorCount}명,
            <br />
            강의 {videoCount}개.
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-fg-muted">AI를 직접 만들고 가르치는 사람들의 강의입니다.</p>
        </Reveal>
        <ul className="mt-10 border-t border-border">
          {instructors.map((ins) => (
            <li key={ins.id} className="flex flex-col gap-0.5 border-b border-border py-3.5">
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-[16px] font-semibold tracking-[-0.015em] text-fg">{ins.name}</span>
                <span className="eyebrow-ko shrink-0 text-[11px] text-fg-muted">{credentialBadge(ins)}</span>
              </p>
              <p className="text-[13px] leading-relaxed text-fg-muted">{ins.title}</p>
            </li>
          ))}
        </ul>
      </Slide>

      {/* 5. 마무리 CTA — 어두운 슬라이드 */}
      <Slide tone="stage" as="footer" innerClassName="py-28 pb-[max(48px,env(safe-area-inset-bottom))]">
        <Reveal>
          <h2 className="display text-[clamp(34px,10vw,52px)] text-stage-fg">
            지금 수준에서
            <br />
            <span className="text-accent">시작하세요.</span>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-stage-muted">
            1분이면 나에게 맞는 강의 순서를 받아 볼 수 있습니다. 모든 강의는 유튜브에서 무료로 볼 수 있습니다.
          </p>
          <Button
            href="/diagnosis"
            variant="accent"
            size="lg"
            className="mt-10"
            trailingIcon={<IconArrowRight size={18} strokeWidth={2} />}
          >
            지금 진단 받기
          </Button>
        </Reveal>
        <p className="mt-20 border-t border-stage-border pt-6 text-[13px] text-stage-muted">AI 강의 길잡이</p>
      </Slide>
    </main>
  );
}
