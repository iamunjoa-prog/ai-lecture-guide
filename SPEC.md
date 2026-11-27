# AI 강의 길잡이 — 제품 명세 (Phase 0)

AI를 배우고 싶지만 어떤 강의를 들어야 할지 모르는 사람에게,
**짧은 진단(수준·분야·목표)** 후 **검증된 강사의 유튜브 강의**를 로드맵으로 추천한다.

## 1. 사용자 흐름

```
/ (랜딩) → /diagnosis (3단계, 한 화면에 질문 하나) → /result (맞춤 로드맵) → 강의 카드 → 유튜브
```

### 진단
| 단계 | 내용 | 결과 |
|---|---|---|
| ① 수준 | 질문 4~5개 (사용 경험, 프롬프트 작성, API·코딩 경험 등) | `Level` 1개 |
| ② 분야 | 다중 선택 (최대 3개) | `Domain[]` |
| ③ 목표 | 단일 선택 | `Goal` |
| 부가 | 한국어 강의 선호 여부 | `preferKorean` |

### 결과 화면
- 헤드라인: "당신을 위한 AI 학습 플랜이 준비됐어요"
- 로드맵 2~3단계 (예: 기초 다지기 → 실전 활용 → 한 단계 더), 단계당 강의 1~3개
- 강의 카드: **강사명 · 이력 한 줄 · 추천 사유 · 주요 강의(제목/길이/언어/자막) · 얻을 수 있는 것 3가지 · 유튜브 버튼**

## 2. 강사 화이트리스트 기준
다음 중 하나 이상 충족 (`CredentialType`):
- `founder` AI 기업 창업자 (예: Anthropic, OpenAI, DeepMind, Upstage)
- `core_researcher` 핵심 연구자·기술 창시자 (예: 딥러닝 선구자)
- `professor` 대학 정규 AI 강의 교수
- `official_channel` AI 기업 공식 채널 (예: Anthropic 공식)

**제외:** 위 기준 밖의 일반 유튜버, 수익형 강의 판매 채널, 출처 불명 재업로드

## 3. 데이터 원칙
- `data/instructors.json`, `data/videos.json` — 스키마는 `src/types.ts`
- **실제로 확인한 URL만 등록.** 추측·생성 URL 금지. `verifiedAt` 필수
- `scripts/check-links.ts` (E 담당)가 YouTube oEmbed로 전체 링크를 점검

## 4. 추천 알고리즘 (1차 버전: 규칙 기반)
```
score = 4·[level ∈ video.levels]
      + 2·|domains ∩ video.domains|
      + 3·[goal ∈ video.goals]
      + 1·[preferKorean && (language=ko || hasKoreanSubtitle)]
```
- 동점이면 짧은 강의 우선, 한 강사당 최대 2개
- 로드맵 단계는 `levels`로 구분: 현재 수준 이하 → 기초, 현재 수준 → 실전, 다음 수준 → 심화
- `reason`은 템플릿으로 생성 (예: "{분야}에 AI를 적용하려는 {수준}에게 맞는 강의예요")

## 5. UI/UX (스픽 벤치마킹 — 패턴만, 브랜드 요소는 쓰지 않음)
- 모바일 우선, 최대 폭 480px 중앙 정렬
- 한 화면 한 질문, 큰 카드형 선택지, 상단 진행 바, 하단 고정 CTA
- 진단 → 결과 사이 "플랜 만드는 중" 로딩 연출
- 친근한 존댓말, 짧은 문장, 부드러운 전환 애니메이션

## 6. 기술 구성
Next.js 15 (App Router) · TypeScript · Tailwind CSS · 정적 JSON · Vercel 배포
진단 상태는 URL 쿼리 + sessionStorage (서버 저장 없음)

## 7. 범위 밖 (2차 버전)
Claude API로 맞춤형 추천 사유 생성 · 로그인/진도 체크/streak · 유료 강의
