/** 강사 선정 기준 (랜딩 섹션과 기준 시트가 함께 쓴다) */
export const CRITERIA = [
  { title: "AI 기업 창업자", desc: "Anthropic, OpenAI, 업스테이지처럼 AI 기업을 직접 세운 사람" },
  { title: "핵심 연구자", desc: "딥러닝 선구자처럼 기술을 직접 만든 연구자" },
  { title: "대학 교수", desc: "대학에서 정규 AI 강의를 맡고 있는 교수" },
  { title: "AI 기업 공식 채널", desc: "AI를 만드는 회사가 직접 운영하는 유튜브 채널" },
] as const;

export const EXCLUDED_NOTE = "일반 유튜버, 유료 강의 판매 채널, 출처가 불분명한 재업로드 영상은 제외했습니다.";
