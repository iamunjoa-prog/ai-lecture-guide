# 사실 검증 기록 (2026-11-27)

AI 강의 길잡이의 강사·강의 정보를 **독립적으로 다시 점검**한 기록이에요. 원 데이터는 AI 에이전트가 기억과 영상 제목·설명을 바탕으로 만들었고 아무도 영상을 시청하지 않았어요. 이번 검증도 **영상을 시청하지 않았어요**. 근거는 (1) YouTube oEmbed 재확인(68개 전부 제목 일치·업로드 채널 확인), (2) 웹 검색으로 찾은 제3자·공식 출처예요.

## 검증 환경의 한계 (먼저 읽어 주세요)
- 이 환경에서는 YouTube 영상 페이지·설명란, Wikipedia, 대학·기업 홈페이지를 **직접 열 수 없었어요**(WebFetch는 도메인 차단, Bash는 oEmbed만 가능). 모든 외부 확인은 웹 검색 결과(제목·URL·요약)에 기댔어요.
- 그래서 "✅확인"은 *검색으로 출처를 본 사실*에 한해서예요. 영상 길이·영상 속 발화 내용·자막 여부는 직접 확인하지 못했어요.
- 확인하지 못한 세부 주장은 사실로 남기지 않고 **더 일반적인 문장으로 고치거나 삭제**했어요.

## 요약
| 구분 | 결과 |
|---|---|
| 강사 19명 | ✅ 확인 7 · ⚠️ 수정 12 · ❌ 제외 0 |
| 강의 68개 → 65개 | 제거 3 · 요약/takeaways 재작성 63 · 변경 없음 2(카파시 2개) · oEmbed 제목·채널 불일치 0 |
| 이름 표기 | 「앤드류 응」→「앤드루 응」(외래어 표기법 및 국내 언론 다수 표기), 데이터 전체 일치 |

## 가장 중요한 오류 (솔직하게)
1. **앤드루 응 강사 이름으로 올라온 강의 2개는 그가 가르친 강의가 아니었어요.** 「Full Course: Spec-Driven Development with Coding Agents」(강사: JetBrains의 Paul Everitt), 「Full Course: AI Coding Workflows From Cloud to Local」(Paul Everitt, JetBrains 협업)은 DeepLearning.AI 채널의 강의지만 앤드루 응이 강사가 아니에요. 앤드루 응의 강의로 오해를 줄 수 있어 **제거**했어요.
2. **안드레이 카파시의 소속이 낡았어요.** 2026년 5월 19일 Anthropic 사전학습(pre-training) 팀에 합류했다는 보도가 여러 곳에서 확인돼요. 이력을 갱신했고, 영상은 합류 이전 본인 채널 영상임을 명시했어요.
3. **얀 르쿤 소속이 낡았어요.** Meta를 떠나 AMI Labs를 세웠고(집행 의장) 뉴욕대 Silver Professor는 유지해요. 제목을 갱신했어요.
4. **Microsoft 제품명이 바뀌었어요.** Azure AI Foundry는 2025년 11월(Ignite 2025) Microsoft Foundry로 이름이 바뀌었어요.
5. **확인되지 않은 구체 주장 삭제**: "다리오·다니엘라 아모데이가 직접 출연"(공동창업자들이 출연하는 영상임만 확인), "서울대 AI연구원 장병탁·윤성로·곽노준·전병곤이 출연하는 강의"(원장 장병탁만 확인; 곽노준 교수는 컴퓨터공학·전기정보공학 소속도 아닐 수 있음), 카카오 세션이 "if(kakao)25"·"카카오게임즈"라는 주장, 네이버 "사내 밋업 인기 세션", "국내에서 가장 많이 본", "전 세계에서 가장 많은 사람이 들은" 같은 최상급 표현, "3분 내외 레슨 9개", "8개 영상" 같은 수치.
6. **종료된 챌린지용 영상 제거**: 업스테이지 「[MABC 2026] 예선 교육 웨비나」는 접수가 2026년 9월 초에 끝난 챌린지의 예선용 교육이에요.

## 1. 강사별 검증
범례: ✅ 확인 · ⚠️ 수정함 · ❌ 제외. "채널 확인"은 oEmbed `author_name`/`author_url`로 영상 업로드 채널을 확인했다는 뜻이고, 채널 소유자가 조직 본인이라는 점은 별도 표기했어요.

| 강사 | 결과 | 확인한 것 | 출처 | 변경·이유 |
|---|---|---|---|---|
| anthropic | ⚠️ | 공동창업자 다리오·다니엘라 아모데이 ✓(회사 사실). @anthropic-ai·@claude 두 채널이 Anthropic 영상을 올림(claude.com 영상 자료실이 같은 영상들을 소개). @claude의 소유자 확인은 간접 근거(약함) | claude.com/resources/videos · anthropic.com/news/model-context-protocol · gsb.stanford.edu 인터뷰 · 아래 영상 항목 | "다리오·다니엘라가 직접 출연하는 대담" → "공동창업자들이 출연하는 대담"(영상에서 Jared 등 공동창업자 출연만 확인) |
| openai | ✅ | OpenAI 공식 채널(@OpenAI), ChatGPT Work는 2026-07-09 출시, Agents API는 2026-09 공개 베타, DevDay 2026 존재 | openai.com/index/introducing-the-agents-api · venturebeat.com ChatGPT Work · infoq.com/news/2026/10/openai-devday-2026 | credentialNote에 Build Hour·DevDay 세션 언급 추가(오류 아님) |
| google-cloud-tech | ⚠️ | oEmbed 채널 일치(Google Cloud Tech). 두 입문 영상이 "Skills Boost 강의"라는 주장은 확인 못함 | oEmbed | "Google Cloud Skills Boost의 생성형 AI 입문 강의를 공개" 삭제 → "생성형 AI 입문 강의·에이전트 만들기 영상" |
| google-deepmind | ✅ | 허사비스: Google DeepMind 공동창업자·CEO, 2024 노벨화학상(존 점퍼와 함께, 데이비드 베이커 공동) | nobelprize.org/prizes/chemistry/2024/hassabis · deepmind.google/blog/demis-hassabis-john-jumper-awarded-nobel-prize-in-chemistry | "노벨화학상" → "노벨화학상 공동 수상" |
| andrej-karpathy | ⚠️ | OpenAI 공동창업자(2015~2017, 2023~2024 재직)·테슬라 AI 디렉터(2017~2022)·Eureka Labs 창업(2024) ✓. **2026-05 Anthropic 합류** ✓. CS231n: Fei-Fei Li와 설계·주 강사 ✓ | techcrunch.com/2026/05/19/openai-co-founder-andrej-karpathy-joins-anthropics-pre-training-team · axios.com/2026/05/19/anthropic-openai-karpathy-andrej-claude · techcrunch.com/2024/07/16/after-tesla-and-openai-andrej-karpathys-startup-aims-to-apply-ai-assistants-to-education · cs.stanford.edu/~karpathy | "전 테슬라 AI 총괄"→"전 테슬라 AI 디렉터", "2026년 5월 Anthropic 합류" 추가, "가장 쉽게 풀어 주기로 유명"(최상급) 삭제 |
| andrew-ng | ⚠️ | DeepLearning.AI 창업자, Coursera 공동창업자(현 Chairman), Landing AI 임원 의장, AI Fund 제너럴 파트너, 스탠퍼드 컴퓨터과학과 **겸임교수**, 구글 브레인 창립 주도 ✓. AI Prompting for Everyone·Build with Andrew는 본인이 강사 ✓ | hai.stanford.edu/people/andrew-ng · andrewng.org/about · coursera.org/instructor/andrewng · deeplearning.ai/courses/build-with-andrew · coursera.org/learn/ai-prompting-for-everyone | 「앤드루 응」 표기 통일, "전 세계에서 가장 많은 사람이 들은" 삭제, CS229·CS230 구체 과목 서술은 이번 검색에서 확인 못해 일반화, 강사가 아닌 DeepLearning.AI 코스 2개 제거. 채널은 DeepLearning.AI(그의 회사)·Stanford Online |
| geoffrey-hinton | ✅ | 토론토대 명예교수(University Professor Emeritus), 2024 노벨물리학상(홉필드와 공동), 튜링상. 로마네스 강연은 2024-02-19 옥스퍼드 셸도니언 극장 | utoronto.ca/news/geoffrey-hinton-wins-nobel-prize · ox.ac.uk/news/2024-02-20-romanes-lecture-godfather-ai-speaks-about-risks-artificial-intelligence | "개인 채널이 없어"(확인 불가한 부정 사실) 삭제, 강연 시점 명시 |
| fei-fei-li | ⚠️ | 스탠퍼드 Sequoia Professor(컴퓨터과학) ✓, World Labs 공동창업자·CEO ✓, ImageNet 개발 주도 ✓. TED2015 강연 ✓ (참고: 스탠퍼드 HAI 공동소장직은 휴직 상태) | engineering.stanford.edu/people/fei-fei-li · neuroscience.stanford.edu/node/3324 · fortune.com/ranking/most-powerful-women/2026/fei-fei-li · ted.com/talks/fei_fei_li_how_we_re_teaching_computers_to_understand_pictures | "ImageNet 창시자"→"ImageNet 프로젝트 주도", "World Labs 창업자"→"공동창업자", 개인 채널 부재 서술 삭제 |
| yann-lecun | ⚠️ | 뉴욕대 Silver Professor 유지, Meta 12년 후 퇴사, AMI Labs 설립(집행 의장). 알프레도 칸지아니와 NYU DS-GA 1008(2020 봄) 공동 강의 ✓. 영상 채널은 칸지아니 본인 채널(oEmbed) | techcrunch.com/2026/01/23/whos-behind-ami-labs-yann-lecuns-world-model-startup · engadget.com Meta chief AI scientist leaving · atcold.github.io/NYU-DLSP20 | 제목에 "전 Meta 수석 AI 과학자 · AMI Labs 설립" 반영, 칸지아니의 직함("교수")은 출처가 한 곳(Scribd 사본)뿐이라 삭제 |
| sung-kim | ⚠️ | 업스테이지 공동창업자·CEO(2020, 이활석·박은정과), 네이버 클로바 AI 초대 헤드(2017~2020), 홍콩과기대 컴퓨터공학 교수 경력(소속 표기가 출처마다 "교수"/"부교수"/"휴직 중") ✓. 「모두를 위한 딥러닝」: 강좌 존재와 "김성훈 교수님 강의"는 확인, 한 프로필은 600만 조회 서술 — 본인 채널(@hunkims)의 소유자 확인은 oEmbed(Sung Kim)·관행에 의존(약함) | en.content.upstage.ai/blog/people/founding-story-2022 · milkeninstitute.org (Sung Kim) · hankyung.com 2020 기사 · inflearn/boostcourse 강좌 페이지 | "전 홍콩과기대 교수"→"홍콩과기대 교수 출신/경력"(재직 상태 불명확), 클로바 AI 헤드 경력 추가, "국내 AI 입문의 표준을 만든"(최상급) 삭제 |
| upstage | ✅ | 한국 AI 기업, 자체 LLM Solar(Solar Open 2 등) ✓. 채널 소유자 확인은 oEmbed(Upstage) 기준 | koreatimes.co.kr 2026-07-23 Solar Open 2 · asiae.co.kr Solar Pro 3 | 변경 거의 없음(문장 다듬기) |
| kim-seongbeom | ✅(부분) | 고려대 산업경영공학부 김성범 교수의 실제 공개 자료 존재(연구실 사이트·KOCW 강의계획서). 채널 표시명 "김성범[ 교수 / 산업경영공학부 ]". 채널이 본인 소유임은 교수 본인 연구실 링크로 확인하지 못함(약함) | dmqa.korea.ac.kr · kocw.net 김성범 강의계획서 | "정규 강의 내용을 정리한" 삭제 |
| moon-il-chul | ✅ | KAIST 산업및시스템공학과 문일철, KOOC 「인공지능 및 기계학습 개론 I·II」(MLE/MAP·결정트리·나이브 베이즈·로지스틱 회귀·SVM·정규화 다룸) | kooc.kaist.ac.kr/machinelearning1_17 | 직함이 페이지마다 부교수/교수로 다르게 표기돼 "교수"로 유지 |
| snu-ai-institute | ⚠️ | 서울대 AI연구원(2019 설립), 원장 장병탁(컴퓨터공학부) ✓. 윤성로·곽노준·전병곤이 이 채널 영상에 나온다는 근거는 못 찾음(전병곤은 영상 제목에 이름이 있음) | aiis.snu.ac.kr · zdnet.co.kr 2020 장병탁 인터뷰 · blog.google/intl/ko-kr … ai-opportunity-fund-snu-aiis | 교수 명단과 학과 서술 삭제, "서울대 교수진 강연"으로 일반화. `professor`+`official_channel` 두 자격은 유지(대학 부설 연구원 공식 채널·교수진 강연) |
| google-for-developers | ⚠️ | ADK 공식 문서·블로그 존재 ✓. "만든 팀이 직접 출연" 서술은 확인 불가 | docs.cloud.google.com ADK overview · developers.googleblog.com | "제작사"·"만든 팀이 직접" 삭제 |
| google-workspace | ✅ | Workspace Studio·Gems·「Gemini at Work」는 영상 제목으로 확인(oEmbed) | oEmbed | 미세 수정 |
| microsoft | ⚠️ | Azure AI Foundry → **Microsoft Foundry**(2025-11 Ignite) | devblogs.microsoft.com/foundry · directionsonmicrosoft.com | 제목 갱신. Mechanics 채널은 Microsoft 공식 제품 시연 쇼(허용 목록 유지) |
| naver-d2 | ⚠️ | wo0Rsh9hlTo는 NAVER ENGINEERING DAY 2026 발표임을 네이버페이 기술 블로그가 확인. 나머지 두 영상의 행사명은 확인 못함 | medium.com 네이버페이 기술 블로그 | "사내 기술 행사 발표"로 일반화 |
| kakao-tech | ⚠️ | 카카오 if(kakao)25(2025-09) 존재 ✓. 개별 세션(Workmate·MCP 데이터 민주화)은 검색으로 확인 못함 | kakaocorp.com/page/detail/11716 | "if(kakao) 등"으로 일반화 |

화이트리스트 기준 점검: 모든 강사가 `founder`/`core_researcher`/`professor`/`official_channel` 중 근거를 갖춰서 ❌ 제외 대상은 없었어요. 다만 **김성훈의 `professor`는 "교수 경력"** 수준이고(창업자 자격으로 충분), **서울대 AI연구원의 `professor`는 소속 교수진 강연이라는 의미**예요.

## 2. 강의별 변경
공통: ① oEmbed로 68개 전부 `title` 일치·업로드 채널 일치 확인(`npm run check-links` 통과). ② 63개 강의의 `summary`·`takeaways`를 **제목·공식 정보·위 출처로 확인되는 범위**로 다시 썼어요(takeaways는 모두 3개·"~할 수 있어요" 형식 유지). 전/후 문장은 git diff(`data/videos.json`)에 그대로 남아 있어요. ③ `levels`/`goals`/`domains`는 제거 3개 외에는 그대로 둠(제목과 모순되는 태그는 발견하지 못함).

### 제거(3개)
| id | 이유 |
|---|---|
| H2tmNDX9FnQ (AI Coding Workflows From Cloud to Local) | 강사는 JetBrains의 Paul Everitt, 앤드루 응이 아님 |
| hy8UstR2NEg (Spec-Driven Development with Coding Agents) | 강사는 JetBrains의 Paul Everitt, 앤드루 응이 아님 |
| iLcH1Yp0vTw ([MABC 2026] 예선 교육 웨비나) | 접수가 2026-09 초 종료된 챌린지(참가자용 교육)이고 내용을 확인할 수 없음 |

### 의미 있는 재작성(대표 사례, 전/후는 diff 참고)
- **Anthropic 공식 영상 전반**: "가입하고 파일을 올려 요약", "XML 태그", "GitHub Actions", "레슨 9개·MCP·Hooks", "Notion·Slack·HubSpot·Figma" 같은 영상 내용 구체 서술 → 제목·공식 설명 수준으로 일반화. MCP 영상은 "MCP를 만든 사람들이 설명"이라는 서술을 삭제하고 Linux Foundation 산하 재단 기부(Anthropic 공지로 확인)로 대체.
- **Boris Cherny 「Mastering Claude Code in 30 minutes」**: Anthropic 업로드, 2025-05-22 공개, 약 28분 — 확인. CLAUDE.md·코드베이스 질의/수정 내용은 제3자 요약으로 확인. "2025년 5월 영상" 명시.
- **OpenAI ChatGPT Work 재생목록 3개**: 제품 자체는 확인(2026-07-09 출시, 예약 작업·Sites 기능). "영상 8개·2~4분", "광고 성과·주간 지표 보고", "대시보드와 데이터 에이전트" 같은 세부는 삭제.
- **OpenAI DevDay 「Harness-as-a-Service」**: Agents API(Codex와 같은 하네스를 API로, OpenAI 관리형 하네스+개발자가 고른 실행 환경)는 OpenAI 공지로 확인. 제목의 "Harness-as-a-Service"가 공식 용어인지는 확인 못함. "오래 걸리는 작업을 제품 기능으로" 삭제.
- **앤드루 응 2개**: 「AI Prompting for Everyone」(조사·브레인스토밍·글쓰기·멀티미디어·코드 프롬프트)과 「Build with Andrew」(코딩 없이 웹앱, 생일 카드 생성기 예시, 공유)를 공식 코스 페이지 서술에 맞춰 수정. 「Opportunities in AI - 2023」은 "2023년 강연" 명시.
- **힌턴 로마네스 강연**: 옥스퍼드 공식 소개(디지털 초지능이 통제를 벗어날 위험 경고)에 맞춰 수정.
- **페이페이 리 TED**: "1,500만 장 사진 데이터베이스" 서술은 TED 페이지로 확인(takeaway에 "약 1,500만 장"으로 반영).
- **김성훈 영상 2개·모두를 위한 딥러닝**: 「모두를 위한 딥러닝 시즌 1」은 구버전 TensorFlow 기준이라 실습 코드가 낡았다는 경고를 요약에 추가하고 "가장 많이 본" 삭제.
- **카카오·네이버 세션**: 제목에서 읽히는 내용만 남기고 행사명·소속 팀 등 확인 불가 서술 삭제. 네이버 「Playwright E2E 하네스」는 NAVER ENGINEERING DAY 2026 발표임을 네이버페이 기술 블로그로 확인.
- **Google·Microsoft 제품 영상**: 명령어·단계·기능 목록 같은 세부(adk run·adk web, 코드랩, 시작 조건·변수 등)를 제목 수준으로 일반화. "New in…"/"new" 제목 영상은 "공개 시점 기준"이라고 표기.

### 직접 확인하지 못한 항목과 처리
| 항목 | 상태 | 처리 |
|---|---|---|
| 모든 `durationMin` | oEmbed에 길이가 없고 영상 페이지를 열 수 없어 **독립 확인 못함**. TED 강연(약 18분)·Mastering Claude Code(약 28분)·Anthropic AI Fluency 코스(공식 안내 12레슨·3~4시간 vs 데이터 70분)는 대략 일치/불일치만 확인 | 값 유지. 재생목록은 합산 근사치. AI Fluency 70분과 AI Prompting 149분(공식 페이지가 3시간 4분/7시간 4분으로 엇갈림)은 특히 불확실 |
| 모든 영상의 실제 발화 내용 | 시청 불가 | 요약·takeaways는 제목·공식 설명·제3자 요약 기준임을 명시 |
| `hasKoreanSubtitle` | 영어 영상은 확인 못해 `false` 유지, 페이페이 리 TED만 `true`(ted.com에 한국어 번역 페이지 존재, YouTube 자막은 별도 확인 못함) | 유지. UI는 영어 영상에만 자막 여부를 표시 |
| Anthropic `@claude` 채널의 소유 | 간접 근거(claude.com 영상 자료실) | 허용 목록 유지, 위험으로 표기 |
| Karpathy 장편 영상 5개의 내용 | 알려진 강의라 제목과 일치한다고 판단했으나 직접 확인 못함 | 요약만 일부 정리, 2개(`7xTGNNLPyMI`, `PLAqhIrj…`)는 문장 변경 없음 |
| 서울대 AI연구원 재생목록 342분의 출연 교수 | 확인 못함 | 요약을 일반화 |
| 한국어 채널(김성범·문일철·SNU·네이버·카카오·업스테이지) 소유자 확인 | oEmbed 표시명·행사 내용 일치 정도 | 소유자 확인은 약함 |
| `language`/`levels`/`goals`/`domains` | 제목과의 모순 없음 | 그대로 |

## 3. 커버리지 (level × goal, 강의 수) — 제거 후
| | understand | use_tools | build_agents | build_products |
|---|---|---|---|---|
| beginner | 10 | 12 | 5 | 4 |
| user | 15 | 16 | 8 | 8 |
| practitioner | 18 | 8 | 11 | 10 |
| developer | 12 | 5 | 16 | 10 |

모든 칸이 2 이상이에요(최저 4). `npm run report -- --summary`: FEW 0, WEAK 7(검증 전 4). 새로 생긴 WEAK 3건은 모두 분야를 고르지 않은 페르소나이고 — beginner×build_agents(any·ko)에서 한국어 입문 에이전트 강의(MABC)가 빠져 한국어 선호 입문자가 일반 강의로 채워지는 것, practitioner×use_tools "한 단계 더"가 에이전트 영상으로 채워지는 것이에요. 근거 없이 새 강의를 지어내지 않아서 채우지 않았어요 — **한국어 입문 에이전트 강의 보강이 필요**해요.

## 4. 전체 신뢰도와 남은 위험
- **신뢰도**: 강사 신원·직함·창업/수상 이력은 대체로 맞았고(구체 오류는 위 6건), 영상 업로드 채널과 제목은 oEmbed로 모두 확인했어요. 가장 약한 부분은 **영상 내용 서술**이에요.
- **요약문은 영상을 시청해 확인한 것이 아니라 제목·공식 설명·제3자 요약 기준이에요.** 일반화했지만 영상이 실제로 그 내용을 다루는지는 보장하지 못해요.
- 길이·자막은 독립 확인 못함(위 표). 제품 영상(OpenAI·Google·Microsoft·Anthropic)은 몇 달 안에 낡아요 — 정기 재검증 권장.
- 직함은 시점에 민감해요(카파시, 르쿤은 올해 바뀜). 6개월마다 점검하세요.
- 채널 소유권은 oEmbed 표시명 기반이고 조직 사이트의 링크로 교차 확인한 것이 아니에요(특히 개인·한국어 채널).
- 사람이 직접 확인하면 좋은 항목: 앤드루 응 CS229/CS230 현재 강의 여부, 김성훈 홍콩과기대 현재 직위, 서울대 재생목록 출연 교수, Anthropic @claude 공식성, 각 영상 길이.
