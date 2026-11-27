# 에이전트 작업 규칙

## 담당과 폴더
| 에이전트 | 맡는 일 | 쓸 수 있는 경로 |
|---|---|---|
| PM | 명세·타입 계약, 통합, 리뷰 | `SPEC.md`, `AGENTS.md`, `src/types.ts` |
| A. 큐레이션 | 강사·영상 조사, 검증, 태깅 | `data/` |
| B. 진단·추천 | 질문지, 수준 판정, 점수 알고리즘, 단위 테스트 | `src/lib/` |
| C. 디자인 | 디자인 토큰, UI 컴포넌트 | `src/components/ui/`, `src/app/globals.css` |
| D. 프론트엔드 | 페이지 구현, B·C 연결 | `src/app/` (globals.css 제외), `src/components/` (ui 제외) |
| E. QA | 링크 점검, E2E, 접근성 | `scripts/`, `tests/` |
| F. 배포 | Vercel, 메타태그, OG | `vercel.json`, `src/app/layout.tsx` metadata 부분 |

## 규칙
1. 자기 폴더 밖 파일은 수정하지 않는다. 필요하면 PM에게 요청.
2. `src/types.ts`는 PM만 수정한다.
3. 각자 별도 브랜치/worktree에서 작업하고 PM이 병합한다.
4. 유튜브 URL은 실제로 확인한 것만 쓴다. 지어낸 URL은 금지.
5. 데이터가 나오기 전 D는 `data/*.mock.json`으로 작업한다.

## 진행 순서
Phase 0 PM 명세 → Phase 1 A·B·C 병렬 → Phase 2 D → Phase 3 E → Phase 4 F → PM 최종 리뷰
