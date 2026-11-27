/**
 * 사이트 공통 상수. 메타데이터·sitemap·robots가 같은 주소를 쓰도록 한 곳에 둔다.
 *
 * 사이트 주소 우선순위
 *  1. NEXT_PUBLIC_SITE_URL (커스텀 도메인을 쓸 때 직접 지정)
 *  2. VERCEL_PROJECT_PRODUCTION_URL (Vercel이 자동 제공, 프로토콜 없음)
 *  3. 기본값 https://ai-lecture-guide.vercel.app
 */
import { DIAGNOSIS_MINUTES } from "./questions";

export const SITE_NAME = "AI 강의 길잡이";
export const SITE_TAGLINE = "AI를 만든 사람에게 직접 배우세요.";
export const SITE_DESCRIPTION =
  `AI 기업 창업자·핵심 연구자·대학 교수·AI 기업 공식 채널의 유튜브 강의 중 검증된 것만 선별했습니다. ${DIAGNOSIS_MINUTES}분 진단으로 수준과 목표에 맞는 학습 로드맵을 순서대로 정리해 드립니다.`;
export const OG_ALT = "AI 강의 길잡이 — AI를 만든 사람에게 직접 배우세요. 검증된 유튜브 AI 강의를 수준·목표별로 선별합니다";

export const DEFAULT_SITE_URL = "https://ai-lecture-guide.vercel.app";

/** "example.com"이나 "https://example.com/" 같은 값을 `https://example.com`으로 맞춘다. 잘못된 값이면 null */
export function normalizeSiteUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(env: Record<string, string | undefined> = process.env): string {
  return (
    normalizeSiteUrl(env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(env.VERCEL_PROJECT_PRODUCTION_URL) ??
    DEFAULT_SITE_URL
  );
}

export const REPO_URL = "https://github.com/iamunjoa-prog/ai-lecture-guide";
