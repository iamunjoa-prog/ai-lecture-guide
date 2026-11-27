import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI 강의 길잡이",
    template: "%s · AI 강의 길잡이",
  },
  description:
    "AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널의 유튜브 강의 중 검증된 것만 선별했습니다. 1분 진단으로 수준과 목표에 맞는 학습 로드맵을 순서대로 정리해 드립니다.",
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
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
