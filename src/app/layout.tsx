import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
// Pretendard 가변 폰트(동적 서브셋): 글자 범위별 woff2 조각을 필요한 만큼만 받는다. 외부 CDN 요청 없음.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { getSiteUrl, OG_ALT, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", alt: OG_ALT }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

/** 스크롤 등장 효과는 JS가 켜졌을 때만 적용한다(꺼져 있으면 모든 내용이 그대로 보인다) */
const JS_FLAG = "document.documentElement.classList.add('js')";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body className="antialiased">
        {children}
        {/* 쿠키 없는 방문 통계(Vercel Web Analytics). Vercel 배포 빌드에서만 넣는다(로컬·자체 서버에서는 스크립트 404를 피한다) */}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
