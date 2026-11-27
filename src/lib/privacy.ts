import { activeAdProvider, type AdEnv } from "./ads";
import { REPO_URL } from "./site";
import { SAVED_STORAGE_KEY } from "./saved";

/** 개인정보 처리방침 시행일. 내용을 고칠 때 함께 바꾸고 개정 이력에 적는다 */
export const PRIVACY_EFFECTIVE_DATE = "2026-11-27";

/** '내 학습함' 저장 기능 안내 (개인정보 처리방침 "저장 기능" 항목) */
export const SAVED_FEATURE_PRIVACY = {
  storageKey: SAVED_STORAGE_KEY,
  /** 저장되는 것 */
  items: ["저장한 강의와 시청 상태", "실습 미션과 완료 여부", "저장한 스킬·3분 이론·용어", "마지막으로 본 진단 결과 주소"],
  /** 저장 위치 */
  where: "이 브라우저의 로컬 저장소(localStorage)",
} as const;

/** 개정 이력 (최근 것이 위) */
export const PRIVACY_REVISIONS: readonly { date: string; note: string }[] = [
  { date: "2026-11-27", note: "'내 학습함' 저장 기능 항목 추가 (브라우저에만 저장)." },
  { date: "2026-11-27", note: "최초 시행." },
];

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
