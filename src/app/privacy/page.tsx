import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Slide } from "@/components/ui";
import { SiteHeaderBar } from "@/components/SiteHeaderBar";
import { readAdEnv } from "@/lib/ads";
import type { AffiliateItem } from "@/lib/affiliate";
import { getPrivacyFlags, PRIVACY_EFFECTIVE_DATE, PRIVACY_REVISIONS, SAVED_FEATURE_PRIVACY } from "@/lib/privacy";
import affiliateJson from "@data/affiliate.json";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "AI 강의 길잡이가 어떤 정보를 다루는지, 내 학습함 저장과 광고·제휴 링크가 있을 때 무엇이 달라지는지 알려 드립니다.",
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-border py-8">
      <h2 id={id} className="text-[20px] font-bold tracking-[-0.02em] text-fg">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-fg-muted">{children}</div>
    </section>
  );
}

const linkCls = "text-accent-ink underline underline-offset-4";

export default function PrivacyPage() {
  const flags = getPrivacyFlags(
    { ...readAdEnv(), NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL },
    (affiliateJson as unknown as AffiliateItem[]).length,
  );
  const providerName = flags.adProvider === "adfit" ? "카카오 애드핏(Kakao AdFit)" : "구글 애드센스(Google AdSense)";

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <Slide tone="stage" as="header" className="border-b border-stage-border" innerClassName="pt-[env(safe-area-inset-top)]">
        <SiteHeaderBar />
        <div className="animate-fade-in pt-10 pb-12">
          <p className="eyebrow text-stage-muted">Privacy</p>
          <h1 className="display mt-4 text-[clamp(32px,10vw,46px)] text-stage-fg">개인정보 처리방침</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stage-muted">
            이 서비스는 회원가입이 없고, 이름이나 연락처 같은 개인정보를 받지 않습니다.
          </p>
          <p className="mt-3 text-[14px] text-stage-muted">시행일: {PRIVACY_EFFECTIVE_DATE}</p>
        </div>
      </Slide>

      <Slide tone="light" innerClassName="pt-4 pb-6">
        <Section id="p-collect" title="수집하는 정보">
          <p>
            AI 강의 길잡이는 계정이 없고, 운영자가 서버에 개인정보를 수집하거나 저장하지 않습니다. 진단 답변은 방문자의 브라우저(sessionStorage)와 결과 화면 주소(URL)에만
            담기며, 브라우저를 닫거나 &quot;다시 진단하기&quot;를 누르면 사라집니다. 결과 주소를 다른 사람에게 공유하면 그 안의 진단 답변(수준·분야·목표)도 함께 전달되는
            점에 유의해 주세요. 다만 &quot;내 학습함&quot;은 마지막으로 본 결과 화면 주소를 이 브라우저에 기억해 &quot;최근 진단 결과 다시 보기&quot;에 씁니다(아래
            &quot;저장 기능&quot; 참고).
          </p>
        </Section>

        <Section id="p-saved" title="저장 기능 (내 학습함)">
          <p>
            &quot;내 학습함&quot;에 저장한 내용은 {SAVED_FEATURE_PRIVACY.where}에만 보관되며, 운영자의 서버나 다른 곳으로 보내지 않습니다. 로그인이 없으므로 다른 기기나
            다른 브라우저에서는 보이지 않습니다.
          </p>
          <ul className="list-disc pl-5">
            {SAVED_FEATURE_PRIVACY.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
          <p>
            저장한 내용은 내 학습함 화면의 &quot;전체 삭제&quot;를 누르거나, 브라우저 설정에서 이 사이트의 데이터(쿠키 및 사이트 데이터)를 지우면 사라집니다. &quot;내보내기&quot;로
            만든 파일은 내 기기에만 저장되며, &quot;가져오기&quot;로 고른 파일도 브라우저 안에서만 읽습니다. 사생활 보호(시크릿) 모드나 저장이 막힌 브라우저에서는 저장되지
            않습니다.
          </p>
        </Section>

        <Section id="p-hosting" title="호스팅과 방문 통계">
          <p>
            사이트는 Vercel에서 제공됩니다. 접속할 때 IP 주소, 브라우저 종류 같은 기본 접속 기록이 Vercel의 서버 로그에 남을 수 있으며, 이는 Vercel이 자신의 방침에 따라
            처리합니다.
          </p>
          <p>
            방문 통계에는 Vercel Analytics를 사용합니다. 쿠키를 쓰지 않고 개인을 식별하지 않는 집계 정보(방문 페이지 수, 대략적인 국가·기기 종류 등)만 다룹니다.
          </p>
        </Section>

        <Section id="p-youtube" title="유튜브 연결">
          <p>
            강의 썸네일은 YouTube(Google)에서 불러오고, 강의 링크를 누르면 유튜브로 이동합니다. 이때 Google이 자신의 방침에 따라 접속 정보를 처리할 수 있으며, 이 서비스는
            그 정보를 받지 않습니다.
          </p>
        </Section>

        <Section id="p-ads-notice" title="광고·제휴 안내">
          <p>
            이 서비스는 무료입니다. 운영 비용을 위해 광고나 제휴 링크가 표시될 수 있으며, 광고와 제휴 링크에는 항상 &quot;광고&quot; 또는 &quot;제휴 링크&quot;라고 따로
            표시합니다. 광고·제휴 여부는 강의 선정과 순서에 영향을 주지 않습니다. 강의는 강사 기준(AI 기업 창업자·핵심 연구자·대학 교수·공식 채널)으로만 고릅니다.
          </p>
        </Section>

        {flags.adProvider && (
          <Section id="p-ads" title="광고 서비스 이용">
            <p>
              현재 이 사이트에는 {providerName} 광고가 표시됩니다. 광고 업체는 광고를 보여 주고 성과를 측정하기 위해 쿠키나 광고 식별자를 사용할 수 있으며, 방문자의 관심에
              맞춘 맞춤형 광고를 보여 줄 수 있습니다. 이 정보는 광고 업체가 직접 수집·처리하며 운영자는 받지 않습니다.
            </p>
            <p>
              맞춤형 광고는 각 광고 업체의 광고 설정 페이지에서 끄거나 조정할 수 있습니다. 구글 광고는{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className={linkCls}>
                Google 광고 설정
              </a>
              에서 바꿀 수 있고, 카카오 등 다른 업체도 각 광고 업체의 광고 설정 페이지에서 같은 선택을 할 수 있습니다. 브라우저의 쿠키 차단 기능으로도 제한할 수 있습니다.
            </p>
          </Section>
        )}

        {flags.hasAffiliate && (
          <Section id="p-affiliate" title="제휴 링크">
            <p>
              결과 화면의 &quot;더 깊이 배우고 싶다면 (제휴 링크)&quot; 영역에는 제휴 링크가 있습니다. 이 링크로 구매하시면 운영자가 일정액의 수수료를 받을 수 있으며, 구매
              가격에는 영향이 없습니다. 링크를 누르면 판매처가 구매 확인을 위해 자신의 방침에 따라 쿠키 등을 사용할 수 있습니다.
            </p>
          </Section>
        )}

        <Section id="p-contact" title="문의">
          {flags.contactEmail ? (
            <p>
              개인정보 관련 문의는{" "}
              <a href={`mailto:${flags.contactEmail}`} className={linkCls}>
                {flags.contactEmail}
              </a>
              로 보내 주세요.
            </p>
          ) : (
            <p>
              문의:{" "}
              <a href={flags.repoIssuesUrl} target="_blank" rel="noopener noreferrer" className={linkCls}>
                GitHub 저장소 이슈
              </a>
              로 남겨 주세요.
            </p>
          )}
        </Section>

        <Section id="p-revision" title="개정 이력">
          <ul className="flex flex-col gap-1">
            {PRIVACY_REVISIONS.map((r, i) => (
              <li key={i}>
                {r.date} {r.note}
              </li>
            ))}
          </ul>
          <p>광고나 제휴 링크를 추가하거나 처리 방식이 바뀌면 이 페이지를 먼저 고치고 시행일을 갱신합니다.</p>
        </Section>
      </Slide>

      <Slide tone="light" as="footer" innerClassName="pt-2 pb-[max(48px,env(safe-area-inset-bottom))]">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full text-[15px] font-medium text-accent-ink underline underline-offset-4">
          처음 화면으로
        </Link>
      </Slide>
    </main>
  );
}
