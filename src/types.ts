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
  terms?: string[]; // 이 강의의 핵심 용어 GlossaryTerm.id 2~3개
}

/** 강의 전에 알아두면 좋은 용어 */
export interface GlossaryTerm {
  id: string; // kebab-case, 예: "prompt", "context-window"
  term: string; // 표시 이름 (한국어 우선, 예: "프롬프트")
  termEn?: string; // 영어 원어 (예: "Prompt")
  level: Level; // 이 용어를 처음 알아야 하는 수준
  goals: Goal[]; // 특히 중요한 목표 (범용이면 전부)
  short: string; // 한 줄 정의 (40자 안팎)
  detail: string; // 쉬운 설명 2~3문장, 비유 환영
  example?: string; // 실제 쓰임 예시 한 문장
  related?: string[]; // 관련 용어 id
}

/** 진단 후 보여주는 '3분 이론' 개념 (대중 눈높이 설명) */
export interface TheoryConcept {
  id: string; // kebab-case
  level: Level; // 이 개념을 보여줄 수준
  core: boolean; // 해당 수준의 공통 개념이면 true (수준당 1개)
  goals: Goal[]; // core가 아닐 때 어떤 목표에 보여줄지
  title: string; // 짧은 제목, 예: "AI는 '다음 말'을 예측하는 기계예요"
  summary: string; // 한 줄 요약 (50자 안팎)
  body: string[]; // 쉬운 설명 문단 3~4개
  analogy: string; // 일상 비유 한 문단
  tryIt?: string; // 바로 해볼 수 있는 한 가지 (선택)
  termIds: string[]; // 관련 GlossaryTerm.id (강의 연결에도 사용)
  sources: { title: string; url: string; publisher: string }[]; // 근거 출처 2개 이상
}

/** 진단 결과 */
export interface DiagnosisResult {
  level: Level;
  domains: Domain[]; // 0~3개 (비어 있으면 분야 미정)
  goals: Goal[]; // 1~4개, 중복 없음. 첫 번째가 가장 우선 ('잘 모르겠어요' → ["understand"])
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
