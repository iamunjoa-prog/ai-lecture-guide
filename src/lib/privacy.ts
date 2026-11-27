import { activeAdProvider, type AdEnv } from "./ads";
import { REPO_URL } from "./site";

/** 개인정보 처리방침 시행일. 내용을 고칠 때 함께 바꾸고 개정 이력에 적는다 */
export const PRIVACY_EFFECTIVE_DATE = "2026-11-27";

export interface PrivacyFlags {
  adProvider: "adfit" | "adsense" | null;
  hasAffiliate: boolean;
  /** 이메일(있으면) 또는 null */
  contactEmail: string | null;
  repoIssuesUrl: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 방침에 조건부로 들어갈 항목(광고·제휴·문의처)을 환경 변수와 제휴 목록 개수로 정한다 */
export function getPrivacyFlags(env: AdEnv, affiliateCount: number): PrivacyFlags {
  const email = (env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim();
  return {
    adProvider: activeAdProvider(env),
    hasAffiliate: affiliateCount > 0,
    contactEmail: EMAIL.test(email) ? email : null,
    repoIssuesUrl: `${REPO_URL}/issues`,
  };
}
