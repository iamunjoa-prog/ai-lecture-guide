/**
 * 데이터 계약 (Phase 0). 이 파일은 PM만 수정한다.
 * 변경이 필요하면 PM에게 요청 → 반영 후 모든 에이전트가 따른다.
 */

/** AI 활용 수준 */
export type Level = "beginner" | "user" | "practitioner" | "developer";

/** 적용 분야 */
export type Domain =
  | "automation" // 업무 자동화
  | "marketing" // 마케팅·콘텐츠
  | "coding" // 코딩
  | "data" // 데이터 분석
  | "education" // 교육
  | "startup"; // 창업·비즈니스

/** 목표 */
export type Goal =
  | "understand" // 개념 이해
  | "use_tools" // 업무 도구로 쓰기
  | "build_agents" // 나만의 에이전트 만들기
  | "build_products"; // AI 제품 만들기

export type Language = "ko" | "en";

/** 강사 선정 기준 (하나 이상 충족해야 등록 가능) */
export type CredentialType =
  | "founder" // AI 기업 창업자
  | "core_researcher" // 핵심 연구자·기술 창시자
  | "professor" // 대학 정규 강의 교수
  | "official_channel"; // 기업 공식 채널

export interface Instructor {
  id: string; // kebab-case, 예: "andrej-karpathy"
  name: string; // 표시 이름 (한국어 우선, 예: "안드레이 카파시")
  nameEn: string;
  title: string; // 이력 한 줄, 예: "OpenAI 공동창업자 · 전 테슬라 AI 총괄"
  credentials: CredentialType[];
  credentialNote: string; // 선정 근거 설명
  channelUrl: string; // 유튜브 채널 URL
  photoUrl?: string;
}

export interface Video {
  id: string; // 유튜브 videoId (11자) 또는 playlist id
  kind: "video" | "playlist";
  url: string; // 실제 검증된 URL만
  title: string;
  instructorId: string; // Instructor.id 참조
  language: Language;
  hasKoreanSubtitle: boolean;
  durationMin: number; // 플레이리스트는 총합 근사치
  levels: Level[]; // 적합한 수준
  domains: Domain[]; // 관련 분야 (범용이면 전부)
  goals: Goal[]; // 도움이 되는 목표
  summary: string; // 강의 한 줄 소개
  takeaways: [string, string, string]; // 강의로 얻을 수 있는 것 3가지
  verifiedAt: string; // 링크 확인 날짜 ISO (YYYY-MM-DD)
}

/** 진단 결과 */
export interface DiagnosisResult {
  level: Level;
  domains: Domain[]; // 1~3개 선택
  goal: Goal;
  preferKorean: boolean;
}

/** 추천 결과 한 건 */
export interface Recommendation {
  video: Video;
  instructor: Instructor;
  score: number;
  reason: string; // 진단 결과와 연결된 추천 사유
}

/** 로드맵: 단계별 추천 */
export interface Roadmap {
  diagnosis: DiagnosisResult;
  steps: { label: string; items: Recommendation[] }[];
}
