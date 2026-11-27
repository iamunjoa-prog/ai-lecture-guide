# AI 강의 길잡이

AI를 배우고 싶지만 어떤 강의부터 들어야 할지 모르는 사람을 위한 서비스입니다.
9개 질문(수준 6 · 분야 · 목표(여러 개) · 한국어 선호)에 답하면, **AI를 만든 사람들(창업자·핵심 연구자·대학 교수·AI 기업 공식 채널)의 검증된 유튜브 강의**를 기초 → 실전 → 한 단계 더 순서의 로드맵으로 정리해 줍니다.

- 회원가입·서버 저장 없음. 진단 결과는 주소(URL)와 브라우저 세션에만 담깁니다.
- 강의는 직접 확인한 링크만 등록합니다(아래 "강의 추가하기" 참고).
- `/glossary`에서 입문부터 개발까지 AI 용어를 쉬운 말로 볼 수 있습니다.

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · 정적 JSON 데이터

## 실행하기

Node.js 20 이상이 필요합니다.

```bash
npm i
npm run dev      # http://localhost:3000
```

## 스크립트

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npm test` | 단위 테스트(vitest): 질문지, 점수·로드맵, 진단 URL 변환, 용어 선택 |
| `npm run e2e` | Playwright E2E + 접근성(axe). 프로덕션 빌드를 띄워 모바일 화면(390px)으로 검사합니다. 이미 빌드했다면 `E2E_SKIP_BUILD=1`, 포트는 `E2E_PORT`(기본 3500) |
| `npm run check-links` | 데이터 스키마 점검 + 모든 유튜브 링크를 oEmbed로 확인(네트워크 필요). 네트워크 없이 스키마만: `npm run check-links -- --schema-only` |
| `npm run report` | 여러 진단 유형(수준 × 목표 × 분야)별 로드맵과 품질 경고를 출력. 예: `npm run report -- --level user --goal understand --domains none --summary` |
| `npm run og` | 공유용 이미지 `public/og.png`와 앱 아이콘 `src/app/apple-icon.png`를 다시 만듭니다(아래 "공유 이미지" 참고) |

## 데이터 파일과 강의 추가하기

| 파일 | 내용 |
|---|---|
| `data/instructors.json` | 강사(이름, 이력, 선정 기준, 채널 URL) |
| `data/videos.json` | 강의(영상 또는 재생목록) |
| `data/glossary.json` | 용어집 |
| `data/CURATION.md` | 큐레이션 기록: 강사별 선정 근거, 탈락시킨 후보와 이유 |

스키마는 `src/types.ts`의 `Instructor`, `Video`, `GlossaryTerm`입니다.

강의 하나를 추가하는 순서

1. 강사가 이미 `instructors.json`에 있는지 확인합니다. 없으면 아래 화이트리스트 기준을 만족하는지 먼저 판단하고 추가합니다.
2. 유튜브에서 직접 재생해 확인한 뒤 `videos.json`에 항목을 넣습니다. 필수 필드: `id`(영상 ID 11자 또는 재생목록 ID), `kind`, `url`, `title`, `instructorId`, `language`, `hasKoreanSubtitle`, `durationMin`, `levels`, `domains`, `goals`, `summary`, `takeaways`(정확히 3개), `verifiedAt`(확인한 날짜 `YYYY-MM-DD`). 핵심 용어가 있으면 `terms`에 용어 id를 2~3개 적습니다.
3. `npm run check-links`로 점검합니다. 스키마 오류, 강사 참조 오류, 접근 불가 링크, 강사 채널과 다른 업로드 채널이 있으면 표로 알려 주고 실패 처리합니다.
4. `npm run report`로 새 강의가 어떤 진단 결과에서 추천되는지 확인합니다.

**추측하거나 지어낸 URL은 절대 넣지 않습니다.** 확인하지 못한 링크는 등록하지 않습니다.

### 강사 화이트리스트 기준

다음 중 하나 이상을 만족하는 강사만 등록합니다(`credentials`).

- `founder`: AI 기업 창업자 (Anthropic, OpenAI, DeepMind, Upstage 등)
- `core_researcher`: 핵심 연구자·기술 창시자
- `professor`: 대학 정규 AI 강의 교수
- `official_channel`: AI 기업 공식 채널

제외: 위 기준 밖의 일반 유튜버, 수익형 강의 판매 채널, 출처 불명 재업로드.

## 진단과 추천 규칙

- 수준 질문 6개의 점수와 코딩·API·배포 신호로 입문자 · 활용자 · 실무자 · 개발자를 정합니다(`src/lib/questions.ts`, 기준은 SPEC.md "수준 판정").
- 분야는 최대 3개까지 고르며, **"잘 모르겠어요"를 고르면 분야 없이(빈 목록) 추천**합니다. 목표에서 "아직 잘 모르겠어요"는 "개념 이해"와 같게 처리합니다.
- 점수는 수준 일치 4 + 분야 일치(첫 일치 2, 이후 1씩) + 목표 일치 4 + 한국어 1이며, 분야가 비어 있으면 분야 점수만 0입니다(`src/lib/recommend.ts`).
- 진단 결과는 `/result?l=user&d=marketing,coding&g=use_tools&ko=1` 형식입니다. 분야 미정은 `d=`(빈 값)입니다.

## 공유 이미지·아이콘

`npm run og`는 `scripts/og-template.html`을 Playwright(Chromium)로 캡처해 `public/og.png`(1200×630)와 `src/app/apple-icon.png`(180×180)를 만듭니다. 폰트는 `node_modules/pretendard`의 파일을 직접 읽으므로 인터넷이 필요 없습니다. 문구나 색을 바꾸려면 템플릿을 고치고 다시 실행하세요. Chromium이 없으면 `npx playwright install chromium`을 먼저 실행합니다.

폰트(Pretendard)는 npm 패키지로 설치해 **사이트에서 직접 제공**합니다. 외부 CDN을 쓰지 않으며, 글자 범위별로 쪼개진 파일을 화면에 필요한 만큼만 받습니다.

## Vercel에 배포하기

1. 이 저장소를 GitHub에 올립니다.
2. [vercel.com/new](https://vercel.com/new)에서 저장소를 **Import** 합니다.
3. Framework Preset은 Next.js로 자동 인식됩니다. Build/Output/Install Command는 **기본값 그대로** 두고 **Deploy**를 누릅니다(`vercel.json`은 필요 없습니다).
4. 배포 주소(`xxx.vercel.app`)는 **프로젝트 이름**으로 정해집니다. 원하는 주소가 있다면 Project Settings → General → Project Name에서 `ai-lecture-guide`처럼 바꾸세요. 같은 이름이 이미 있으면 뒤에 붙는 문자가 달라집니다.
5. (선택) 공유 미리보기(OG)에 쓰는 사이트 주소를 직접 지정하려면 Settings → Environment Variables에 `NEXT_PUBLIC_SITE_URL`을 `https://내도메인` 형식으로 추가하고 다시 배포합니다.
6. (선택) 내 도메인은 Settings → Domains에서 추가합니다. 연결한 뒤에는 5번의 `NEXT_PUBLIC_SITE_URL`을 그 도메인으로 맞춰 주세요.

### 사이트 주소(`metadataBase`) 정하는 순서

공유 이미지·sitemap·robots의 절대 주소는 다음 순서로 정합니다(`src/lib/site.ts`).

1. `NEXT_PUBLIC_SITE_URL` (예: `https://guide.example.kr`)
2. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel이 자동으로 넣어 줍니다. 프로토콜은 없어도 됩니다)
3. 기본값 `https://ai-lecture-guide.vercel.app`

로컬에서 확인할 때: `NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run build`

### 공유할 때 주의

**프리뷰 배포 주소**(`프로젝트-해시-팀이름.vercel.app`)에는 Vercel 프로젝트·팀 이름이 그대로 드러납니다. 다른 사람에게 알릴 때는 **프로덕션 도메인**(`프로젝트이름.vercel.app` 또는 내 도메인)을 쓰세요.

## 방문 통계

Vercel Web Analytics(`@vercel/analytics`)만 사용합니다. 쿠키를 쓰지 않고 개인을 식별하지 않는 방문 통계로, Vercel에 배포된 빌드에서만 켜지며 로컬·다른 서버에서는 아무것도 보내지 않습니다. 다른 추적 도구는 넣지 않았습니다. 통계를 보려면 Vercel 프로젝트의 Analytics 탭에서 Enable 하세요.

## 수익화(광고·제휴)

**광고와 제휴 링크는 기본적으로 꺼져 있습니다.** 이 서비스의 가치는 "검증해서 고른 강의"이므로, 광고가 추천처럼 보이지 않도록 아래 원칙을 지킵니다.

### 배치 원칙

- 광고는 **/result의 마지막 강의 카드 아래(선별 기준 안내 위)**, **/glossary 맨 아래** 두 곳에만 들어갑니다(`AdSlot`).
- 허용하지 않는 곳: 진단 화면, 랜딩, 히어로 슬라이드, 강의 카드 사이, 404·오류 화면, 진단 정보가 없는 결과 화면.
- 광고는 항상 "광고" 라벨이 달린 별도 카드에 들어가며, 높이를 미리 확보해 화면이 밀리지 않습니다. 라벨은 숨길 수 없습니다.
- 광고·제휴 여부는 강의 선정과 순서에 영향을 주지 않습니다. 개인정보 처리방침(/privacy)에도 같은 내용을 밝혔습니다.

### 광고 켜는 순서

1. 광고 업체에 사이트를 신청합니다: [Kakao AdFit](https://adfit.kakao.com) 또는 [Google AdSense](https://adsense.google.com). 승인에는 보통 충분한 콘텐츠와 방문자가 필요하고, 커스텀 도메인을 요구하는 경우가 많습니다. 공용 `*.vercel.app` 주소는 거절될 수 있으니 **업체의 현재 정책을 확인**하세요.
2. 승인 후 광고 단위를 만듭니다. 코드 스니펫의 세부 형식은 업체가 바꿀 수 있으므로 **가입 시점의 대시보드 안내와 `src/components/ads/AdfitAd.tsx`, `AdsenseAd.tsx`가 맞는지 대조**하세요. 어댑터는 업체별로 작게 분리해 두었습니다.
3. Vercel 프로젝트 → Settings → Environment Variables에 아래 값을 넣고 **다시 배포**합니다(`NEXT_PUBLIC_*`는 빌드 때 박히므로 재배포가 필요합니다).
4. 켜기 전에 `/privacy`를 직접 읽고 사실과 맞는지 검토합니다. 광고를 켜면 "광고 서비스 이용" 항목이 자동으로 나타납니다.
5. 끄려면 `NEXT_PUBLIC_AD_PROVIDER`를 지우고 다시 배포합니다.

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_AD_PROVIDER` | `adfit` 또는 `adsense`. 비우면 전부 꺼짐 |
| `NEXT_PUBLIC_ADFIT_UNIT_RESULT` / `_GLOSSARY` | AdFit 광고 단위 ID(`DAN-...`). 자리별로 따로 넣으며, 비운 자리는 광고가 나오지 않음 |
| `NEXT_PUBLIC_ADFIT_WIDTH` / `_HEIGHT` | AdFit 크기. 기본 320x100 (320x50, 300x250 등 업체가 지원하는 크기) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-...` |
| `NEXT_PUBLIC_ADSENSE_SLOT_RESULT` / `_GLOSSARY` | AdSense 광고 단위 슬롯(숫자) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | (선택) 개인정보 처리방침 문의처. 비우면 GitHub 이슈 안내 |

필요한 값이 하나라도 빠지거나 형식이 틀리면 해당 자리는 아무것도 그리지 않습니다(`src/lib/ads.ts`, 단위 테스트 있음).

> TODO(운영자): 유럽(EEA) 방문자를 대상으로 한다면 AdSense의 동의 관리(CMP) 배너 등 쿠키 동의 절차가 필요합니다. 이 프로젝트에는 아직 없습니다.

### 제휴 링크

`data/affiliate.json`은 기본이 빈 배열(`[]`)이며, 항목이 있고 진단 결과와 맞을 때만 결과 화면에 "더 깊이 배우고 싶다면 (제휴 링크)" 블록이 나옵니다(최대 2개, 수준 일치 > 목표 일치 순). 링크는 `rel="sponsored noopener noreferrer"`로 열리고, 고지 문구가 항상 보입니다. 무료 유튜브 강의가 항상 먼저이며 제휴 항목은 "참고용 추천"입니다.

항목 예시(실제 파일에 넣을 때는 본인이 확인한 https 링크만 사용하세요):

```json
[
  {
    "id": "example-book",
    "title": "예시 도서 제목",
    "description": "프롬프트 작성을 체계적으로 정리한 입문서입니다.",
    "url": "https://example.com/affiliate-link",
    "label": "책",
    "merchant": "예시서점",
    "levels": ["beginner", "user"],
    "goals": ["understand"],
    "disclosure": "(선택) 제휴 프로그램이 요구하는 고지 문구"
  }
]
```

- `label`은 `책`·`유료 강의`·`도구` 중 하나입니다. `levels`·`goals`를 생략하면 모든 방문자에게 해당합니다.
- `disclosure`가 있으면 기본 고지 문구에 **더해** 표시됩니다. 제휴 프로그램마다 요구하는 표기(예: 쿠팡 파트너스의 지정 문구)가 다르므로 **각 프로그램의 약관과 국내 표시·광고 관련 규정을 확인하고 지키는 책임은 운영자에게 있습니다.**
- 제휴 항목이 하나라도 있으면 개인정보 처리방침에 제휴 링크 항목이 자동으로 나타납니다.

## 폴더 구조

```
src/app/          페이지(/, /diagnosis, /result, /glossary, /privacy), 메타데이터(robots, sitemap, manifest, 아이콘)
src/components/   화면 컴포넌트 (ui/ 는 디자인 시스템 부품)
src/lib/          질문지·진단 URL 변환·추천 알고리즘·용어 선택 (순수 함수 + 단위 테스트)
data/             강사·강의·용어 JSON
scripts/          링크 점검, 로드맵 리포트, OG 이미지 생성
tests/e2e/        Playwright E2E·접근성
```

디자인은 "키노트 하이브리드"입니다. 어두운 무대 슬라이드와 흰 본문, 포인트 컬러 오렌지(`#ff6a1a`)를 쓰고 이모지는 쓰지 않습니다.
