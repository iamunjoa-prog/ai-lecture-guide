import type { Metadata } from "next";
import { AppShell, Button, IconArrowRight } from "@/components/ui";
import { DIAGNOSIS_MINUTES } from "@/lib/questions";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <AppShell tone="stage">
      <div className="flex flex-1 animate-fade-in flex-col justify-center py-16">
        <p className="eyebrow text-stage-muted">404</p>
        <h1 className="display mt-5 text-[clamp(32px,10vw,48px)] text-stage-fg text-balance">
          찾으시는 <span className="text-accent">페이지가 없어요</span>
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
          주소가 바뀌었거나 잘못 입력된 것 같아요. 처음 화면에서 다시 시작해 보세요.
        </p>
        <div className="mt-10 flex flex-col gap-2.5">
          <Button href="/" variant="accent" size="lg" fullWidth trailingIcon={<IconArrowRight size={18} strokeWidth={2} />}>
            처음 화면으로
          </Button>
          <Button href="/diagnosis" variant="secondary" size="lg" fullWidth className="border-stage-border! text-stage-fg! hover:bg-white/5!">
            {DIAGNOSIS_MINUTES}분 진단 시작하기
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
