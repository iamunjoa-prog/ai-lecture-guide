"use client";

import { AppShell, Button } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AppShell tone="stage">
      <div className="flex flex-1 animate-fade-in flex-col justify-center py-16">
        <p className="eyebrow text-stage-muted">AI Lecture Guide</p>
        <h1 className="display mt-5 text-[clamp(32px,10vw,48px)] text-stage-fg text-balance">
          잠깐 <span className="text-accent">문제가 생겼어요</span>
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
          화면을 불러오는 중에 오류가 있었어요. 다시 시도하면 대부분 바로 해결돼요.
        </p>
        <div className="mt-10 flex flex-col gap-2.5">
          <Button variant="accent" size="lg" fullWidth onClick={reset}>
            다시 시도하기
          </Button>
          <Button href="/" variant="secondary" size="lg" fullWidth className="border-stage-border! text-stage-fg! hover:bg-white/5!">
            처음 화면으로
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
