# 큐레이션 노트 (Agent A)

검증일: 2026-11-27 · 강사 21명 · 강의 80개 (영상 66 · 재생목록 14, 한국어 14개 · 한국어 친화 15개) — 2차 보강 + 사실 검증 + 3차 정비 + 이미지·영상 분야 추가(2026-11-27) 반영

> **사실 검증 반영**: 아래 표·기록은 검증 전 작성본이라 일부가 옛 내용이에요(예: 제거된 강의, 「앤드루 응」 표기). 최신 판단은 [`VERIFICATION.md`](./VERIFICATION.md)를 따르세요.

## 검증 방법
- 모든 URL은 YouTube oEmbed(`/oembed?url=...&format=json`)로 200 응답과 `author_name`을 확인했어요. 영상 `title`은 oEmbed 제목을 그대로 썼어요.
- 후보 ID는 각 공식 채널의 `/videos`, `/playlists` 페이지, claude.com 영상 자료실, YouTube 검색 결과에서 모았어요. 추측한 ID는 oEmbed로 확인되지 않으면 모두 뺐어요.
- `channelUrl`은 oEmbed `author_url` 값이에요.

## 강사별 선정 근거
| id | 기준 | 근거 / 비고 |
|---|---|---|
| anthropic | official_channel, founder | Anthropic 공식 채널(@anthropic-ai). 공동창업자 대담 포함 |
| (anthropic에 통합) | official_channel | Claude 제품 채널(@claude) 영상은 `anthropic` 강사로 묶음 — 같은 회사가 결과에 과하게 반복되지 않도록 (2026-11-27 PM 결정) |
| openai | official_channel | OpenAI 공식 채널(@OpenAI) |
| google-cloud-tech | official_channel | Google 공식 기술 교육 채널 |
| google-deepmind | official_channel, founder | 데미스 허사비스(공동창업자·CEO) 출연 |
| andrej-karpathy | founder, core_researcher | OpenAI 공동창업자, 본인 채널 |
| andrew-ng | founder, professor, core_researcher | DeepLearning.AI 공식 채널 + Stanford Online(본인 강연 1개) |
| geoffrey-hinton | core_researcher, professor | 개인 채널이 없어 옥스퍼드대 공식 채널의 Romanes Lecture를 씀 |
| fei-fei-li | professor, core_researcher, founder | 개인 채널이 없어 TED 공식 채널의 본인 강연을 씀 |
| yann-lecun | core_researcher, professor | NYU 정규 강의 녹화본. 공동 강사 Alfredo Canziani(NYU) 본인 채널에 올라옴 |
| sung-kim | founder, professor | 김성훈(업스테이지 창업자·전 HKUST 교수). 본인 채널 강좌 1개 + 주최 기관 공식 채널(제주창조경제혁신센터, 네이버 커넥트재단)에 올라온 본인 강연 2개 |
| upstage | official_channel | 업스테이지 공식 채널, 한국어 실전 웨비나 |
| kim-seongbeom | professor | 고려대 산업경영공학부 김성범 교수 본인 채널 |
| moon-il-chul | professor | KAIST 공식 MOOC(KOOC) 채널의 「인공지능 및 기계학습 개론1」 |
| snu-ai-institute | professor, official_channel | 서울대학교 AI연구원 공식 채널, 서울대 교수진 강의 |
| google-for-developers | official_channel | (2차) Google 공식 개발자 채널(@GoogleDevelopers). ADK·AI Studio 제작팀 영상 |
| google-workspace | official_channel | (2차) Google Workspace 공식 채널(@googleworkspace). 비개발자용 Gemini·Workspace Studio 레슨이라 개발자 채널과 따로 둠 (3차: Gems 레슨 제거, 「Gemini at Work」 6강·마케팅 레슨 추가) |
| microsoft | official_channel | (2차) Microsoft Developer(@MicrosoftDeveloper) 본 채널 + Microsoft 공식 제품 시연 채널 Microsoft Mechanics(@MSFTMechanics, `check-links` 허용 목록에 추가) |
| naver-d2 | official_channel | (2차) 네이버 공식 기술 채널(@naver_d2). NAVER ENGINEERING DAY 등 사내 기술 행사 발표 |
| kakao-tech | official_channel | (2차) 카카오 공식 기술 채널(@kakaotech). if(kakao) 개발자 콘퍼런스 세션 |
| runway | official_channel | (이미지·영상) AI 영상 생성·편집 모델(Gen-4.5·Aleph)을 직접 만드는 Runway의 공식 채널(@RunwayML) |
| adobe-firefly | official_channel | (이미지·영상) Firefly 모델을 직접 개발하는 Adobe의 Firefly 공식 채널(@AdobeFirefly). 채널 소유 확인은 간접 근거(아래 참고) |

참고: 강사 한 명에 `channelUrl`은 하나라서, 개인 채널이 없는 강사(힌턴, 페이페이 리)는 대표 강의가 있는 기관 채널을 적었어요. 앤드루 응·김성훈은 영상마다 실제 업로드 채널이 다를 수 있어요(위 표 참고).

## 탈락시킨 후보와 이유
- **일리야 수츠케버** — NeurIPS 2024 강연(`1yvBqasHLZs`)이 개인 채널(João Tomé)에 올라온 재업로드였어요. 공식 출처를 찾지 못해 강사에서 뺐어요.
- **Stanford CS229 (Andrew Ng) 재생목록** `PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU` — oEmbed 401(비공개 또는 퍼가기 차단). 뺐어요.
- `5p5qPp2fk_U`, `OrEhG5yXDS8`, `Ll8gtP1ElTU` — 기억으로 떠올린 ID인데 oEmbed 404가 나와서 뺐어요.
- **Karpathy "Software Is Changing (Again)"** (Y Combinator), **Andrew Ng 강연** (Sequoia, Snowflake, LangChain), **Anthropic 엔지니어 발표** (AI Engineer 채널) — 진짜 강연이지만 업로드한 곳이 투자사, 기업 행사, 커뮤니티 채널이에요. 공식 채널 원칙을 지키려고 뺐어요.
- **Lex Fridman 팟캐스트** (다리오 아모데이, 카파시), 언론 인터뷰 (CBS, Bloomberg, 60 Minutes 등) — 인터뷰 채널이고 강의가 아니라서 뺐어요.
- **Hinton 노벨 강연** (`XDE9DjpcSdI`, Nobel Prize 공식 채널) — 검증은 통과했어요. 강사당 1~2개로 맞추려고 Romanes Lecture를 대신 골랐어요.
- **CS231n 2017 재생목록** (Stanford Engineering), **ML Specialization 재생목록** (DeepLearning.AI) — 검증은 통과했어요. 개발자 개념 이해 강의가 이미 충분해서 뺐어요.
- **OpenAI Korea 채널** — 30초~3분짜리 광고나 출시 영상뿐이고 강의가 없어서 뺐어요.
- **Google Korea 채널** — 광고 영상만 있어서 뺐어요. 검색에 나온 한국어 Gemini/ChatGPT 사용법 영상은 모두 일반 유튜버나 강의 판매 채널이라 화이트리스트 기준에 맞지 않아요.
- **서울대 공식 채널 '샤로잡다'** (박현우·이재욱 교수) — 출연 교수가 AI 정규 강의 담당인지 확인하지 못해서 보류했어요.
- **김성훈 「모두를 위한 ChatGPT UP!」** — 유료 강좌의 홍보 영상이라 뺐어요.
- **3Blue1Brown** — 지시에 따라 대상에서 뺐어요 (AI 창업자나 연구자가 아님).
- **Introducing GPT-4o** (`DQacCB9tDaw`) — 검증은 통과했어요. 2024년 제품 발표라 지금 기준으로 낡아서 뺐어요.

## 길이(durationMin) 출처
- 단일 영상은 채널 목록이나 검색 결과에 표시된 재생 시간을 분 단위로 반올림했어요.
- 재생목록은 목록 첫 페이지에 보이는 영상 길이를 합했어요. 영상이 많은 재생목록은 실제와 다를 수 있어요.
- **추정값**:
  - `PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv` (AI Fluency Course, 70분): 코스형 목록이라 영상이 다 보이지 않았어요. 레슨당 4~12분, 14개 안팎으로 보고 추정했어요.
  - `d95J8yzvjbQ` (The Thinking Game, 84분): 다큐멘터리 공개 상영 시간을 바탕으로 추정했어요.
  - `PLLHTzKZzVU9eaEyErdV26ikyolxOsz6mq` (2470분), `PLpIPLT0Pf7IoTxTCi2MEQ94MZnHaxrP0j` (1970분): 첫 페이지 합계라 실제는 더 길 수 있어요.
- **3차 정비 추가분 6개**: 공식 채널 `/search` 결과에 표시된 재생 시간을 분 단위로 반올림했어요(추정값 없음) — `uDr0xdA_E_A` 8:32→9 · `YkCDVn3_wiw` 20:16→20 · `R-KJgjIrh24` 2:51→3 · `_jjSS0qGFbI` 3:44→4 · `6Mmevs1877A` 15:47→16 · `IJsp9AC-n7Q` 8:05→8.
- 3차 정비 때 AI Fluency 재생목록(`PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv`)의 레슨 12개(예고편 포함) 길이를 재생목록 페이지에서 합해 보니 약 71분이라 데이터의 70분 추정과 거의 같았어요.

## 자막(hasKoreanSubtitle)
- 한국어 강의 14개는 모두 `true`예요.
- 영어 강의 중에는 TED 강연(페이페이 리)만 `true`로 했어요. TED는 공식 한국어 번역 자막을 제공해요.
- 나머지 영어 강의는 공식 한국어 자막을 확인하지 못해 `false`로 했어요. 자동 번역 자막은 치지 않았어요.

## 커버리지 (level × goal, 강의 수)
3차 정비 후 값이에요 (`npm run report -- --summary`로 다시 계산할 수 있어요). 괄호 안은 3차 정비 전(사실 검증 후, 65개) 값이에요.

| | understand | use_tools | build_agents | build_products |
|---|---|---|---|---|
| beginner | 10 (10) | 14 (12) | 5 (5) | 4 (4) |
| user | 16 (15) | 20 (16) | 8 (8) | 8 (8) |
| practitioner | 20 (18) | 10 (8) | 11 (11) | 11 (10) |
| developer | 13 (12) | 5 (5) | 16 (16) | 11 (10) |

모든 칸이 2 이상이에요(최저 4). 분야별: automation 40 (38) · coding 34 (33) · data 32 (28) · education 16 (14) · marketing 21 (18) · startup 29 (24)
한국어 친화 강의 14개 (14개). 2차 보강 전후 값은 git 기록과 [`VERIFICATION.md`](./VERIFICATION.md) 3장을 보세요.

## 태그 보정 기록 (Agent E, 2026-11-27)
`npm run report`(수준 4 × 목표 4 × 분야 조합 9 × 한국어 선호 2 = 288개 페르소나)로 로드맵을 훑어보고, 강의 내용과 대상이 태그와 어긋난 곳을 고쳤어요. 재생목록은 목록 페이지의 실제 레슨 제목을 보고 판단했어요. 링크·제목·요약·takeaways는 바꾸지 않았어요.

**원칙**: `domains`는 실제로 쓸모 있는 분야만(범용 개념 강의만 6개 전부), `goals`는 정말 도움이 되는 1~2개, `levels`는 연속·현실적으로.

| 강의 | 바꾼 것 | 이유 |
|---|---|---|
| 개발자 아니어도 따라 하는 Claude Code & Hermes Agent… (Upstage) | levels beginner 제외 · domains에서 coding 제외 · goals에서 build_agents 제외 | 제목 그대로 비개발자 대상. 이미 있는 에이전트 도구에 Solar를 연결해 **쓰는** 웨비나라 use_tools. 개발자·코딩·에이전트 만들기 진단의 "기초 다지기"에 뜨던 문제 |
| ChatGPT Work for Data Analytics (OpenAI) | goals에서 build_agents 제외 | 대시보드·시맨틱 레이어 등 데이터 분석가용 도구 사용법이 중심. 위와 같은 페르소나의 "기초 다지기"에 분야도 안 맞는데 목표 점수만으로 뜨던 문제 |
| Getting Started with ChatGPT Work (OpenAI) | goals use_tools만 | 레슨이 Plugins·Scheduled tasks·Slides·모바일 등 기능 소개. 에이전트·제품 제작 강의가 아님 |
| AI Fluency for nonprofits | goals use_tools만 · domains에서 education 제외 | 조사·글쓰기·데이터 분석·업무 보강 레슨. 교육 분야 내용 아님 |
| Claude Code 101 | levels user,practitioner → practitioner,developer · goals use_tools, build_products | 설치·CLAUDE.md·Explore→Plan→Code→Commit 등 개발 워크플로 입문. 터미널을 쓰는 실무자·개발자 대상 |
| Prompting 101 \| Code w/ Claude | levels → practitioner,developer · domains → automation,coding,data | 개발자 행사 세션, API 앱용 프롬프트(문서 분석 사례)를 다룸. 마케팅·교육과 거리가 멂 |
| Mastering Claude Code in 30 minutes | domains coding만 | 코딩 도구 사용법 |
| Lessons from building agents on the Claude Platform | domains에서 startup 제외 | 개발자 관점의 구현 교훈 |
| How teams use Claude | domains에서 marketing 제외 | 사례가 법무·고객지원·검색·앱 빌더(Notion·Lyft·HubSpot·Figma) 중심 |
| How OpenAI uses ChatGPT Work | domains + startup | 전략 덱·고객 미팅 준비·예측 시트 레슨 포함 |
| AI prompt engineering: A deep dive | domains + automation | 프롬프트 설계 전반이라 자동화에도 바로 쓰임 |
| Getting started with Claude.ai · Prompting tips for Claude.ai · Full AI Prompting Course (Andrew Ng) · 챗지피티 A to Z (김성훈) | domains에서 coding 제외 | 채팅 앱 사용법·비개발자용 프롬프트. 코딩 진단에서 코딩 강의보다 앞서던 문제 |
| Build Your Own App In 30 Minutes (Andrew Ng) | domains에서 education 제외 | 노코드 앱 만들기, 교육 분야 내용 아님 |
| 모두를 위한 딥러닝 시즌 1 | domains에서 education 제외 | 텐서플로 실습 포함 딥러닝 강좌(교육에 AI를 쓰는 내용 아님) |
| The Thinking Game · The future of intelligence (DeepMind) | domains에서 education 제외 · 다큐는 levels + practitioner | 교육 분야 내용 아님. 다큐는 누구나 볼 수 있음 |
| What does AI mean for education? | levels + practitioner | AI를 이미 수업에 쓰는 교사에게도 유용 |
| 초거대 AI를 위한 시스템 (서울대 전병곤) | domains에서 startup 제외 · goals understand만 | 학습·서빙 시스템 기술 개론 |

**보정 전/후 — 개발자 · 코딩 · 에이전트 만들기 (영어 허용)**

| 단계 | 보정 전 | 보정 후 |
|---|---|---|
| 기초 다지기 | 개발자 아니어도 따라 하는 Claude Code & Hermes Agent… (Upstage) · ChatGPT Work for Data Analytics (OpenAI) | Introduction to large language models · Introduction to Generative AI (Google Cloud Tech) |
| 실전 활용 | Lessons from building agents · Tips for building AI agents · Spec-Driven Development | Lessons from building agents · Tips for building AI agents · 초거대 AI를 위한 시스템 (서울대) |

### 남은 콘텐츠 공백 (새 강의가 필요해요 — 지어내지 않음) — 1차 기록, 2차 보강에서 대부분 해소
- **입문자·활용자용 "에이전트 만들기" 강의가 0개.** 비개발자가 노코드로 에이전트·자동화 비서를 만드는 공식 강의(예: GPTs·Claude Projects·노코드 자동화)가 없어요. 지금은 이 페르소나에 일반 사용법·개념 강의가 대신 나가요.
- **Anthropic 외 강사의 에이전트 개발 강의가 없음.** build_agents 강의 6개가 모두 Anthropic이라, 강사당 2개 상한에 걸리면 개발자·에이전트 진단의 실전 3번째 칸과 실무자·에이전트 진단의 "한 단계 더"가 목표와 무관한 강의(서울대 시스템, KAIST 기계학습)로 채워져요. DeepLearning.AI·Google 등의 공식 에이전트 강의가 후보예요.
- **입문자 build_products 1개**(Andrew Ng 30분 앱)뿐이고, **마케팅·교육 분야 전용 강의**가 적어요(각 14개 중 대부분 범용 강의).
- **한국어 친화 강의 9개**(한국어 8 + 한국어 자막 1)뿐이고, 실무자·개발자용 한국어 실전(에이전트·코딩 도구) 강의가 없어요.
- 한 번도 추천되지 않는 강의: Prompting for Agents, Mastering Claude Code, Headless automation(모두 Anthropic 상한), Zero to Hero·NYU DL·The Thinking Game(길이가 길어 동점에서 밀림), AI Fluency for nonprofits.

## 2차 보강 (Agent A, 2026-11-27)
QA가 찾은 콘텐츠 공백을 채우려고 23개를 추가했어요. 모두 공식 채널 `/search`·재생목록 페이지에서 찾은 ID이고, oEmbed로 제목·업로드 채널을 확인했어요. `title`은 oEmbed 제목 그대로예요. 영어 강의의 공식 한국어 자막은 확인하지 못해 모두 `hasKoreanSubtitle: false`로 두었어요.

**① 입문자·활용자용 에이전트 만들기 (노코드)** — 7개
| 강의 | 강사 | 수준 | 비고 |
|---|---|---|---|
| Build custom AI agents in Workspace Studio… (`AkUUeePtbe4`) | google-workspace | beginner,user | 노코드 에이전트 |
| ~~Gemini at Work 5강: Gmail·Custom Gems (`qtO940hejdE`)~~ — 3차 정비에서 제거(Gems 종료·전환) | google-workspace | beginner,user | use_tools + build_agents |
| Create agents fast with Agent Builder in Copilot (`dlS2meHJWAk`) | microsoft (Mechanics) | beginner,user | 노코드 |
| Build Hour: Workspace agents in ChatGPT (`kktBVmjA19A`) | openai | user,practitioner | 팀 공유 에이전트 |
| What are skills? (`bjdBVZa66oU`) | anthropic (@claude) | beginner,user | |
| Delegate and schedule tasks in Claude Cowork (`tYOI-WoLS_o`) | anthropic (@claude) | beginner,user | use_tools + build_agents |

**② Anthropic 외 에이전트 개발 강의 (실무자·개발자)** — 8개
| 강의 | 강사 | 수준 |
|---|---|---|
| Getting started with Agent Development Kit (`44C8u0CDtSo`) | google-for-developers | developer |
| Prototype to Production with ADK (`jDCkirAz4-E`) | google-for-developers | developer |
| Vibe code conversational agents in AI Studio (`KiJcZlqJKuE`) | google-for-developers | user,practitioner |
| AI agents explained: Build your first agent in 8 minutes (`Zqno_vux6d8`) | google-cloud-tech | practitioner,developer |
| Build Hour: Agents SDK (`tK32trvj_b4`) | openai | developer |
| Harness-as-a-Service: Building with the Agents API \| DevDay 2026 (`b7l_Dhe1h8M`) | openai | developer |
| Full Course (Lessons 1-10) AI Agents for Beginners (`OhI005_aJkA`) | microsoft | practitioner,developer |
| Build Automated Agents, Workflows, and Apps - New in Copilot Studio (`k4V44dn_TQo`) | microsoft (Mechanics) | user,practitioner |

**③ 입문자·활용자용 제품 만들기** — 3개: Google AI Studio 풀스택 바이브 코딩(`gJYZE9UXiHk`, google-for-developers), Build and publish web apps directly in ChatGPT(`8zH_O74hZBw`, openai), Gemini Canvas 마케팅 앱(`7dsaxBUZPII`, google-workspace — 마케팅 전용 강의 보강 겸).

**④ 한국어 실무자·개발자 실전** — 5개 (모두 회사 공식 기술 채널의 사내 행사·콘퍼런스 발표)
| 강의 | 강사 | 수준 |
|---|---|---|
| 운영자의 시간을 아끼는 AI 에이전트 2부 - MCP 부터 Agent 설계까지 (`DRghWwm3dt8`) | naver-d2 | developer |
| 에이전트, 개념부터 같이 정리해봐요 (`UjvgpPG1XTU`) | naver-d2 | practitioner,developer |
| AI 에이전트를 위한 Playwright E2E 테스트 하네스 구축하기 (`wo0Rsh9hlTo`) | naver-d2 | developer |
| Workmate: A2A로 협업하고 확장하는 사내 AI 비서 (`NPIi9XaNIHs`) | kakao-tech | developer |
| 김대리, SQL 팡션? 사용하지 마세요. MCP 쓰세요 (`2v6zhEFh3HI`) | kakao-tech | practitioner,developer |

**보강 중 뺀 후보**
- **OpenAI Agent Builder** (`44eFf-tRiSg`, `sAitLFLbgDA`) — OpenAI가 2026-06-03부터 Agent Builder를 종료한다고 공지해서 뺐어요.
- **Introducing GPTs in ChatGPT** (`CmP3XXwKJ60`) — 3년 전 출시 영상이라 낡았어요.
- **DeepLearning.AI 에이전트 강좌** — YouTube에는 2분 안팎 코스 예고편만 있어요. AI Dev 25 세션은 공식 채널이지만 발표자가 Andrew Ng이 아니라 `andrew-ng` 강사로 묶으면 오해가 생겨서 뺐어요. LangGraph·crewAI 레슨은 2년 전 내용이에요.
- **Copilot Studio·Gemini Gems·Google ADK 한국어 튜토리얼** — 검색 결과가 모두 일반 유튜버·강의 판매 채널이라 화이트리스트 기준에 맞지 않아요.
- **NAVER D2 「AI와 함께하는 프로젝트 자동화」** (`8NMfqYqe6fs`) — 검증은 통과했지만 공개 설명만으로 내용을 확인하기 어려워 보류했어요.
- **Getting started with Claude Cowork**, **Build an App With Claude Design** — 검증은 통과했지만 Anthropic 강의가 이미 많아서(강사당 2개 상한) 다른 회사 강의를 골랐어요.

**보강 전/후 페르소나 (영어 허용)**
| 페르소나 | 보강 전 | 보강 후 |
|---|---|---|
| 입문자·에이전트·자동화+마케팅+데이터 | 목표 일치 0개 | 기초 다지기 3개 모두 에이전트 만들기(Claude Skills · Copilot Agent Builder · Gemini Gems). 실전 활용은 분야 3개 일치 범용 강의가 점수로 앞섬 |
| 활용자·에이전트·자동화 | 목표 일치 0개 | 7개 중 6개가 에이전트 만들기 (Copilot ×2, Workspace Studio, Skills, Cowork, ChatGPT 워크스페이스 에이전트) |
| 개발자·에이전트·코딩 | 실전 3번째 칸·심화가 목표 무관(서울대 시스템 등) | 실전 3개 모두 에이전트 개발(Google Cloud ADK 입문 + Anthropic 2), 기초에 AI Studio 에이전트 앱 |
| 실무자·에이전트·자동화 | "한 단계 더"가 목표 무관 강의 | 실전 Copilot Studio + Anthropic 2, 한 단계 더 NAVER D2 에이전트 개념 |
| 실무자·에이전트·데이터 (한국어) | 한국어 실전 0개 | 실전 1·3번째가 카카오 MCP 데이터 사례·NAVER D2 |

### 남은 공백
- 입문자·에이전트 + 분야 3개 선택 페르소나는 "실전 활용" 칸이 여전히 범용 사용법 강의예요. 노코드 에이전트 강의는 대부분 자동화 한 분야라, 분야 일치 점수(2점×3)가 목표 점수(3점)보다 커요. 태그를 부풀리지 않고 남겨 뒀어요 (알고리즘 쪽 판단 필요).
- 교육 분야 전용 강의는 여전히 14개로 늘지 않았어요.
- 한국어 입문자용 노코드 에이전트 강의는 업스테이지 MABC 웨비나 1개뿐이에요. 공식 채널(Google Korea, OpenAI Korea 등)에 한국어 사용법 강의가 없어요. (→ 사실 검증에서 제거됨: 종료된 챌린지용이라서)
- 한 번도 추천되지 않는 강의: AI Fluency for nonprofits, Prompting for Agents, Mastering Claude Code(모두 Anthropic 상한), Zero to Hero·NYU DL(길이).


## 사실 검증 (2026-11-27)
강사·강의 정보를 독립적으로 다시 점검했어요(제3자 출처 검색 + YouTube oEmbed 재확인). 자세한 근거·변경 내역·검증하지 못한 항목은 [`VERIFICATION.md`](./VERIFICATION.md)에 있어요.
- 강사 19명: ✅ 7 · ⚠️ 수정 12 · ❌ 제외 0
- 강의: 3개 제거(DeepLearning.AI 코스 2개는 앤드루 응이 강사가 아님, MABC 웨비나는 종료된 챌린지용), 63개의 요약·takeaways를 제목·공식 정보 기준으로 보수적으로 재작성
- 요약문은 영상을 직접 시청해 확인한 것이 아니에요.

## 3차 정비 (2026-11-27)
종료되거나 바뀌는 중인 기능을 다루는 강의를 정리하고, 스킬 공백(data/SKILLS_RESEARCH.md)의 후보 강의를 넣었어요. **영상은 이번에도 시청하지 않았어요.** 새 강의의 요약·takeaways는 oEmbed 제목과 공식 채널 검색 결과에 보이는 설명 첫 줄만 근거로 보수적으로 썼어요. 강의 65개 → **70개** (제거 1 · 추가 6 · 문구 갱신 2).

### 공식 문서로 다시 확인한 사실 (curl로 원문 확인)
- **OpenAI 맞춤 GPT 종료** — [Custom GPT retirement and migration FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq): "Custom GPTs are scheduled to retire on Dec 11, 2026." FedRAMP·유예 승인 Enterprise 워크스페이스는 2027-02-28. 해당 Enterprise 워크스페이스는 2026-10-26부터 새 GPT 생성 중단. GPT는 플러그인으로 옮기고(지시문 → 플러그인 안의 스킬), 계속 쓰는 작업은 프로젝트로 대신할 수 있다고 안내해요.
- **Gemini Gems → 스킬 전환** — [About the transition from Gems to skills](https://support.google.com/gemini/answer/18560919): "Starting in November 2026, Gems will transition to skills in Gemini Apps for personal Google Accounts, and in 2027, for work and school accounts." 개인 계정은 "before December 17, 2026"까지 Gem 파일을 내려받을 수 있고, 그 뒤에는 Gems를 쓸 수 없어요(자동으로 스킬로 다시 만들어 줌).
- **OpenAI Agent Builder** — 2차 보강 때 이미 종료 공지(2026-06-03)로 후보에서 뺐어요. 지금 데이터에는 없어요.
- **유지 판단에 쓴 확인**: Microsoft Learn [Agent Builder overview](https://learn.microsoft.com/en-us/plugins/agent-builder)(현재 문서, 스킬 추가 기능까지 안내) · OpenAI Help [ChatGPT Workspace Agents for Enterprise and Business](https://help.openai.com/en/articles/20001143-chatgpt-workspace-agents-for-enterprise-and-business)(현재 기능, 맞춤 GPT 종료와 별개) · Claude Help 리서치·커넥터 문서, OpenAI·Gemini 딥 리서치 도움말(모두 200 응답, 현재 기능) · Google Cloud [Gemini Enterprise](https://cloud.google.com/gemini-enterprise)(현재 제품).

### 전수 점검 결과 (65개 강의의 제목·요약·takeaways·용어·실습 미션)
맞춤 GPT·Gems·Agent Builder·Assistants·플러그인·Canvas·Projects 같은 낱말로 훑고, 제품 사용법 영상은 공식 채널 검색 결과의 공개 시점을 확인했어요.

| 강의 | 결정 | 이유 |
|---|---|---|
| `qtO940hejdE` Gmail Help Me Write·AI 요약·**Custom Gems** (Gemini at Work 5강) | **제거** | 제목의 절반이 Gems 만들기예요. 개인 계정은 2026-12-17 이후 Gems를 쓸 수 없고 업무·학교 계정도 2027년에 스킬로 바뀌어요. 핵심 실습(Gem 만들기 화면)이 곧 맞지 않게 돼요. 지시문 쓰는 요령은 이미 `bjdBVZa66oU`(What are skills?)·Claude Code Skills 재생목록이 다뤄요. 실습 미션·`reusable-skills.lectureIds`에서도 뺐어요. **대체**: 같은 시리즈 6강 `uDr0xdA_E_A`(아래) |
| `dlS2meHJWAk` Create agents fast with Agent Builder in Copilot | 유지 | OpenAI Agent Builder와 다른 Microsoft 365 Copilot 기능이고, Microsoft Learn에 현재 문서가 있어요. 영상도 약 2개월 전 공개 |
| `kktBVmjA19A` Build Hour: Workspace agents in ChatGPT | 유지 | 워크스페이스 에이전트는 현재 기능(도움말 문서 최근 갱신)이고 맞춤 GPT 종료 대상이 아니에요 |
| `EWvNQjAaOHw` 카파시 How I use LLMs | 유지 | 일부에서 당시 ChatGPT 기능을 보여 줄 수 있지만 주제는 LLM 활용 전반이에요. 요약에 이미 "2025년 2월 공개, 도구 화면은 달라졌을 수 있어요"가 있어요 |
| `OfUn6HjwXhI` Behind the prompt: Prompting tips for Claude.ai | **유지 + 문구 갱신** | 채널 검색 기준 약 3년 전 영상이라 화면이 낡았어요. 핵심(요청 요령)은 그대로 통해서 남기고, 요약에 "몇 년 전 공개라 화면은 지금과 달라요"를 넣었어요 |
| `ycAnRjyYC6o` 챗지피티 A to Z (김성훈) | **유지 + 문구 갱신** | 약 3년 전 강연. 개념·활용 아이디어 중심이라 남기고, 요약에 "2023년 무렵 강연이라 서비스 화면·기능은 지금과 달라요"를 넣었어요 |
| `7dsaxBUZPII` Gemini Canvas 마케팅 앱 | 유지 | 약 1년 전 영상이지만 Canvas는 현재 기능이에요 |
| 그 밖의 제품 영상(ChatGPT Work 재생목록 3개, Claude Cowork·Skills, ChatGPT 웹앱, AI Studio 2개, Copilot Studio, Workspace Studio 등) | 유지 | 공개 1년 이내이고 종료·전환 공지를 찾지 못했어요 |

실습 미션 점검: Gem·GPT를 직접 쓰게 하는 미션은 `qtO940hejdE` 하나였고(강의와 함께 제거) 나머지는 모두 도구에 묶이지 않은 미션이에요.

### 추가한 강의 6개 (모두 oEmbed로 제목·업로드 채널 재확인, `hasKoreanSubtitle: false`)
| 강의 | 강사(채널) | 수준 · 목표 | 연결 스킬 | 근거 |
|---|---|---|---|---|
| `uDr0xdA_E_A` How to Use Agentic AI for Business with Gemini Enterprise \| Gemini at Work - Lesson 6 | google-workspace (@googleworkspace) | beginner·user · use_tools, build_agents | delegate-to-agents | 제거한 5강의 대체. 같은 공식 시리즈, 약 7개월 전 공개. Gemini Enterprise는 현재 제품 |
| `YkCDVn3_wiw` Introduction to Deep Research | openai (@OpenAI) | user·practitioner · use_tools, understand | deep-research | 채널 검색 설명: "Mark Chen, Josh Tobin, Neel Ajjarapu, and Isa Fulford introduce and demo deep research from Tokyo." 2025년 2월 출시 발표라 요약에 "지금 화면·모델과는 달라요"를 넣었어요 |
| `R-KJgjIrh24` Getting started with research in Claude.ai | anthropic (@anthropic-ai) | beginner·user · use_tools | deep-research | 설명 첫 줄 "See how Claude's Research feature transforms how you find and analyze information." |
| `_jjSS0qGFbI` Getting started with connectors in Claude.ai | anthropic (@anthropic-ai) | user·practitioner · use_tools | connect-tools-and-data | 설명 첫 줄 "Learn how to supercharge Claude by connecting the tools you already use." 활용(user) 수준 공백을 메워요 |
| `6Mmevs1877A` How AI jailbreaks work and what stops them. (… feat. Mark Russinovich) | microsoft (@MSFTMechanics, 기존 허용 채널) | practitioner·developer · understand, build_products | agent-safety | 설명 첫 줄 "What are prompt injection attacks and how do you stop them?" 1년 이상 된 영상이라 요약에 "제품 이름은 바뀌었을 수 있어요"를 넣었어요. 개념(탈옥·인젝션·방어 갈래)은 지금도 유효 |
| `IJsp9AC-n7Q` How to use AI for Marketing with NotebookLM & Gemini Deep Research \| Lesson 1 | google-workspace (@googleworkspace) | beginner·user · use_tools | deep-research | 마케팅 팀용 AI Boost Bootcamp 레슨(설명 첫 줄), 약 5개월 전 공개. 아래 @Google 데모 대신 넣었어요 |

실습 미션도 6개 추가했어요(모두 `needsTool: "chat"`, 도구 이름에 묶이지 않음, 자리표시자 최대 1개, 강의 내용을 단정하지 않음). 숨은 지시 미션(`6Mmevs1877A`)은 가짜 메일로만 연습하고 남의 서비스를 시험하지 말라는 주의를 달았어요.

### 넣지 않은 후보와 이유
- **`jv-lpIsnLOo` "Introduction to Deep Research"** — oEmbed로는 OpenAI 채널·같은 제목이 확인되지만, 채널 검색·일반 검색 어디에도 목록으로 나오지 않아 길이·설명을 확인할 수 없었어요(일부 공개나 중복 업로드로 보여요). 같은 제목으로 채널에 공개돼 있고 설명·길이를 확인할 수 있는 `YkCDVn3_wiw`를 대신 넣었어요.
- **`Y0KidGr9Z2Y` AI Fluency 8강(Discernment) · `QbLf2zb3oPc` 10강(Diligence)** — AI Fluency 재생목록 페이지에서 두 레슨 모두 이미 연결한 `PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv` 안에 들어 있는 것을 확인했어요(예고편 포함 12개). 따로 넣으면 같은 내용이 두 번 추천돼서 넣지 않았어요. (`W4Ua6XFfX9w` 2B강도 같은 재생목록 안에 있어요.)
- **`buwMJxvW7wI` Gemini Deep Research Demo (@Google)** — @Google은 Google 공식 채널이 맞지만(oEmbed author_url `@Google`), 1년도 더 된 짧은 데모라 화면이 낡았고, 넣으려면 허용 채널을 새로 추가해야 해요. 이미 등록된 @googleworkspace의 더 최근 딥 리서치 레슨(`IJsp9AC-n7Q`)으로 대신했어요. 그래서 `THIRD_PARTY_CHANNELS`는 바꾸지 않았어요.
- **`LCEmiRjPEtQ` 카파시 "Software Is Changing (Again)" (@ycombinator)** — 1차 큐레이션 때 투자사 채널이라 뺀 영상이고, 내용도 시청으로 확인하지 못했어요. 그대로 제외했어요.

### 스킬 강의 연결 변경 (data/skills.json `lectureIds`, 앞쪽이 더 잘 맞음)
| 스킬 | 전 | 후 |
|---|---|---|
| delegate-to-agents | tYOI-WoLS_o, PLOjSa4kyvo_M, PLHiXJG-Lqz-s | + **uDr0xdA_E_A** (4번째) |
| reusable-skills | bjdBVZa66oU, PLmWCw…, dlS2meHJWAk, qtO940hejdE | bjdBVZa66oU, PLmWCw…, dlS2meHJWAk (**qtO940hejdE 제거**) |
| connect-tools-and-data | PLyCki2K0Lg, 2v6zhEFh3HI, DRghWwm3dt8 | **_jjSS0qGFbI**, PLyCki2K0Lg, 2v6zhEFh3HI, DRghWwm3dt8 |
| deep-research | EWvNQjAaOHw, t2Zo3YAJdj4 | **R-KJgjIrh24, YkCDVn3_wiw, IJsp9AC-n7Q**, EWvNQjAaOHw (t2Zo3YAJdj4는 조사 전용이 아니라 뺌) |
| agent-safety | PLf2m23nhTg1MjwozACw3ufAc3CUpfOBWO, 2v6zhEFh3HI | **6Mmevs1877A**, PLf2m23nhTg1MjwozACw3ufAc3CUpfOBWO, 2v6zhEFh3HI |
| 나머지 6개 | 그대로 | 그대로 (verify-ai-output은 AI Fluency 재생목록이 분별 레슨을 이미 포함) |

모든 스킬이 강의 3~4개를 가져요. 커버리지는 위 표(모든 칸 ≥ 4). `npm run report -- --summary`: FEW 0 · WEAK 7(정비 전과 같은 수).

### 다시 볼 것
- 2026-12-11(맞춤 GPT 종료), 2026-12-17(개인 계정 Gems 종료) 뒤에 OpenAI·Google 도움말을 다시 확인하세요. 업무·학교 계정 Gems 전환(2027)도 일정이 바뀔 수 있어요.
- `YkCDVn3_wiw`·`6Mmevs1877A`·`OfUn6HjwXhI`·`ycAnRjyYC6o`는 오래된 영상이라 더 새 공식 영상이 나오면 바꾸는 것이 좋아요.

## 이미지·영상 분야 추가 (2026-11-27)
진단 분야에 **이미지·영상 제작**(`creative`, URL `d=creative`)이 생겨서, 이 분야 강의를 공식 채널에서만 새로 골랐어요. 강의 70개 → **80개**, 강사 19명 → **21명**(Runway, Adobe Firefly). **영상은 이번에도 시청하지 않았어요.** 요약·takeaways는 oEmbed 제목과 공식 채널 검색 결과의 설명 첫 줄만 근거로 보수적으로 썼어요.

### 확인 방법
- 후보는 각 공식 채널의 `/search` 결과(제목·길이·공개 시점·설명 첫 줄)에서 모았어요. 10개 모두 oEmbed로 제목·업로드 채널(author_url)을 확인했고, `npm run check-links` 80/80 통과.
- 제품이 지금도 있는지: OpenAI Help「ChatGPT Images in ChatGPT」(원문 확인: 모든 요금제에서 이미지 생성, Images 2.6 언급), Gemini Apps Help「Generate & edit images with Gemini Apps」(원문 확인: Nano Banana로 생성·편집), Anthropic「Introducing Claude Design by Anthropic Labs」(원문 확인: 2026-04-17 연구 미리보기), Runway「Introducing Aleph 2.0 and Edit Studio」(검색 확인: 2026-05-21, 유료 플랜), Google Vids·Adobe Firefly는 각 공식 채널의 최근 업로드(각각 2개월 전 Vids HD 영상 생성, 2주 전 Adobe MAX 2026 Firefly 소식)로 현재 제품임을 확인했어요.
- **Sora 종료**: OpenAI Help「Provenance signals in content processed by OpenAI tools」(원문 확인)에 "Sora is discontinued"라고 적혀 있고, 2026-03-24 종료 발표가 여러 언론에 보도됐어요. 그래서 Sora 영상은 하나도 넣지 않았어요.
- `durationMin`은 채널 검색 결과의 재생 시간을 반올림했어요(추정값 없음): `CrrpfvbNyMw` 2:51→3 · `bH2nP-aCFjk` 29:23→29 · `jDxKzlGLCas` 22:38→23 · `nRLZqaNOrwQ` 27:24→27 · `VldX34mM95o` 48:11→48 · `56MhbPXEr9k` 2:10→2 · `Uvl-tRga98g` 28:00→28 · `-lVVZDuEIVs` 3:20→3 · `sqwbGJL4Pdk` 3:49→4 · `6oBmJARc0Aw` 24:43→25.
- 영어 강의의 공식 한국어 자막은 확인하지 못해 모두 `hasKoreanSubtitle: false`.

### 추가한 강의 10개
| 강의 | 강사(채널) | 수준 · 목표 | 공개 시점(검색 기준) | 선정 근거 |
|---|---|---|---|---|
| `CrrpfvbNyMw` ChatGPT Images: Three Ways to Get Started | openai (@OpenAI) | beginner·user · use_tools | 약 2주 전 | 설명 첫 줄 "create new images and edit existing images directly inside ChatGPT". 입문자용 사용법 |
| `bH2nP-aCFjk` Inside image generation’s Renaissance moment — the OpenAI Podcast Ep. 19 | openai | user·practitioner · understand | 약 6개월 전 | 설명: 제품 책임자 Adele Li·연구자 Kenji Hata가 출시 뒤 쓰임·흐름을 이야기. 공식 팟캐스트 |
| `jDxKzlGLCas` Building with GPT-Live and Image Generation \| DevDay 2026 | openai | developer · build_products, build_agents | 약 2주 전 | 설명: 음성 에이전트에 위임·지연시간·끼어들기 설계. DevDay 공식 세션 |
| `nRLZqaNOrwQ` Build creative apps with the GenMedia suite (I/O Connect ‘26) | google-for-developers (@GoogleDevelopers) | practitioner·developer · build_products, understand | 약 4개월 전 | 설명: Veo·Nano Banana·Genie·Lyria로 창작 앱 만들기. Google 공식 행사 세션 |
| `VldX34mM95o` How a Moonshot Led to Google DeepMind's Veo 3 | google-for-developers | practitioner·developer · understand | 약 1년 전 | 설명: Veo 프로젝트 공동 리드(핵심 연구자) 대담. 요약에 "Veo 3 시점, 최신 버전과 달라요" 명시 |
| `56MhbPXEr9k` Convert Google Slides into engaging product videos using Google Vids. | google-workspace (@googleworkspace) | beginner·user · use_tools | 약 4개월 전 | 설명 "you'll learn to convert static Google Slides into engaging product videos using Google Vids and Gemini". 공식 레슨 |
| `Uvl-tRga98g` Designing with Claude: From prompt to production | anthropic (@claude, 기존 허용 채널) | user·practitioner · use_tools, build_products | 약 6개월 전 | 설명: Claude Design으로 브랜드에 맞는 시각 결과물. 디자인·시안 쪽 창작 |
| `-lVVZDuEIVs` How to Use Aleph 2.0 in Edit Studio \| Runway | runway (@RunwayML) | user·practitioner · use_tools | 약 6개월 전 | 영상 편집 모델을 만든 회사의 공식 사용법. 요약에 "유료 플랜 기능" 명시 |
| `sqwbGJL4Pdk` Get Started in Adobe Firefly and Create with Confidence with Jesús Ramirez \| Adobe Firefly | adobe-firefly (@AdobeFirefly) | beginner·user · use_tools | 약 7개월 전 | 설명 "beginner-friendly", 화면·모듈·커뮤니티 둘러보기. 진행자는 외부 크리에이터지만 Adobe 공식 채널 튜토리얼 |
| `6oBmJARc0Aw` "토큰은 더 적게, 속도는 더 빠르게" 고효율 비디오 생성을 위한 잠재 공간 압축 기술 \| 상생과 성장 | kakao-tech (@kakaotech) | developer · understand | 약 4주 전 | 한국어 기술 발표(공식 기술 채널). 발표자·행사 정보는 확인하지 못해 요약에 넣지 않았어요. 카카오가 ECCV 2026에서 영상 생성 효율화 기술(KATok)을 발표했다는 공식 보도(kakaocorp.com)는 있지만, 이 영상과 같은 연구인지는 확인하지 못해 연결하지 않았어요 |

**새 강사 적격성**
- **runway** — Runway는 영상 생성·편집 모델을 직접 연구·개발하는 AI 기업이고, @RunwayML은 회사 공식 채널이에요(제품 레슨 Runway Academy, 공동창업자 크리스토발 발렌수엘라의 공식 행사 발표가 올라옴). `official_channel`.
- **adobe-firefly** — Firefly 이미지·영상 모델은 Adobe가 직접 개발해요. @AdobeFirefly는 영상 설명에 Adobe 단축 링크(adobe.ly)와 "Subscribe to Adobe Firefly"를 다는 Adobe의 Firefly 채널이에요. 다만 Adobe 홈페이지에서 이 채널로 가는 링크는 직접 확인하지 못했어요(제3자 채널 목록 페이지로만 확인) — `@claude`처럼 **소유 확인은 간접 근거**예요. `official_channel`.
- `THIRD_PARTY_CHANNELS`는 바꾸지 않았어요(새 강의는 모두 강사 본인 채널 또는 기존 허용 `@claude`).

### 기존 강의 재태그 (`domains`에 creative 추가)
| 강의 | 이유 |
|---|---|
| `G2fqAlgmoPo` Introduction to Generative AI (Google Cloud Tech) | 범용 생성형 AI 입문 — 글뿐 아니라 이미지 생성도 생성형 AI의 대표 예. 이미 모든 분야가 붙은 범용 개념 강의라 원칙("범용 개념 강의는 분야 전부")에 맞춰 추가 |
| `PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv` AI Fluency Course (Anthropic) | 같은 원칙(모든 분야가 붙은 범용 AI 협업 강좌) |
| `8ib4Qnh2HFE` Full AI Prompting Course with Andrew Ng | 공식 코스 페이지(사실 검증 때 확인)에 멀티미디어 프롬프트 레슨이 있음 |

LLM 전용 개념 강의(`zizonToFXDs`, 카파시 강의들)와 Gemini Canvas 마케팅 앱(`7dsaxBUZPII`: 그림 입력 → 앱 만들기라 이미지 제작이 아님), 페이페이 리 TED(이미지 *이해*이지 제작이 아님)는 태그를 붙이지 않았어요.

### 넣지 않은 후보와 이유
- **Sora 영상 전부**(`gzneGhpXwjU` Introducing Sora 2, `360ZqfabuPQ` Getting started with Sora, `6PXWAvUG8Sg` storyboard, `70ush8Vknx8` "Sora, ImageGen, and Codex…" 등) — Sora 종료(위 참고).
- **`sWkGomJ3TLI` Introducing ChatGPT Images 2.0** — 공식이지만 7개월 전 출시 발표이고 지금은 2.6까지 나왔어요. 같은 회사 입문 영상(`CrrpfvbNyMw`, 2주 전)과 팟캐스트로 충분.
- **`H6ZXujE1qBA` nano-banana 비하인드, Nano Banana Pro 데모 영상들(@GoogleDevelopers)** — 1년 안팎 된 짧은 데모가 많고, google-for-developers 강의가 이미 2개 늘어 강사당 상한(로드맵당 2)에 걸려요.
- **Google Vids·Google Pics·Veo 3.1 짧은 소개(@googleworkspace, @GoogleDeepMind)** — 15초~1분 30초 광고성 소개라 강의로 보기 어려워요. Vids는 실제 사용 과정을 보여 주는 레슨(`56MhbPXEr9k`)을 골랐어요.
- **Microsoft(Designer·Copilot 이미지)** — 공식 채널에 1분 미만 소개 영상(`CVYs-WN8cOE`)만 찾았어요.
- **Runway Gen-4·Gen-4.5 소개, App Studio, 발렌수엘라 기조연설(`fMV0Gs2hdKU`)** — 소개 영상은 짧은 시연, 기조연설은 제목상 '현실 세계 지능' 주제라 이미지·영상 제작 강의로 보기 어려워 뺐어요.
- **카카오 `uGU-pvHx5oU` Personalized T2I 모델 개발기(2024)** — 공식이지만 2년 전. 더 최근 발표(`6oBmJARc0Aw`)를 골랐어요. NAVER D2「그림 그리는 AI」(8년 전)도 같은 이유로 제외. LG AI연구원 채널은 짧은 홍보 영상만 있었어요.
- **Adobe `4U39evmdtac` Lightroom·Firefly 무드보드** — 검증은 통과했지만 사진가용이라 대상이 좁고 Adobe 강의가 2개가 되면 상한에 걸려서 보류.

### 커버리지 — 이미지·영상(creative) 강의 13개(새 10 + 재태그 3), level × goal
| | understand | use_tools | build_agents | build_products |
|---|---|---|---|---|
| beginner | 2 | 5 | 0 | 0 |
| user | 3 | 7 | 0 | 1 |
| practitioner | 3 | 2 | 0 | 2 |
| developer | 3 | 0 | 1 | 2 |

입문·활용자용 사용법(use_tools)이 가장 많고, 이해(understand)는 모든 수준에 2개 이상이에요. **빈칸**: beginner·user의 build_agents·build_products, developer·use_tools — 이 조합의 공식 이미지·영상 강의를 찾지 못했어요(지어내지 않음). 이런 진단에서는 분야 일치 강의가 기초·한 단계 더 칸에 들어가고, 실전 칸은 목표 일치 범용 강의가 채워요(`npm run report -- --domains creative`).

전체 커버리지(`npm run report -- --summary`): beginner 10·17·5·4 / user 17·25·8·9 / practitioner 23·12·11·13 / developer 16·5·17·13 (understand·use_tools·build_agents·build_products). 분야별 automation 40 · marketing 27 · **creative 13** · coding 37 · data 32 · education 16 · startup 31. 페르소나 1,040개(분야 조합에 `creative`, `marketing+creative`, `creative+education+startup` 추가): FEW 0 · WEAK 5(이전 7) · MISSGOAL 0.

### 용어·실습·스킬
- 용어 5개 추가(61 → 66): `image-generation-model`(입문) · `ai-media-rights`(입문, 초상권·저작권·약관 확인과 AI 생성물 표시 — "법률 조언이 아니에요"·"서비스 약관과 관련 법을 확인하세요") · `diffusion-model`(활용, "모든 모델이 확산 모델은 아니에요") · `text-to-video`(활용) · `image-editing`(활용, 인페인팅·레퍼런스 이미지). 워터마크 설명(SynthID·C2PA)은 OpenAI Help 출처 신호 문서(원문 확인: ChatGPT·API 이미지에 C2PA 콘텐츠 자격 증명과 SynthID 워터마크, 편집·캡처로 사라질 수 있음)와 Google SynthID 공식 블로그(검색 확인) 범위로만 썼어요. 용어집 테스트 상한을 65 → 70개로 올렸어요.
- 실습 10개 추가(모두 `needsTool: "chat"`). 이미지는 "이미지 생성 기능이 있는 AI", 영상은 "영상 생성 도구가 없다면 스토리보드·장면 프롬프트만 받아 두기" 같은 대안 단계를 넣었고, 실존 인물 얼굴·유명 캐릭터·브랜드 로고 금지, 상업적 이용 전 약관 확인, 필요하면 AI 생성물 표시를 주의로 달았어요. 기존 일반 미션 4개(`0vZ_UVLhSQQ`, `8ib4Qnh2HFE`, `G2fqAlgmoPo`, AI Fluency)에 `creative` 분야 문구를 추가했어요.
- 스킬 1개 추가: `creative-drafts`「AI로 이미지·영상 초안 만들기」(user·practitioner, use_tools·build_products, 강의 `CrrpfvbNyMw`·`sqwbGJL4Pdk`·`-lVVZDuEIVs`·`Uvl-tRga98g`). 근거 4개 모두 원문 확인 — [`SKILLS_RESEARCH.md`](./SKILLS_RESEARCH.md) 12번. 기존 스킬의 `domains`에는 creative를 붙이지 않았어요(연결 강의가 이미지·영상과 무관해서).

### 다시 볼 것
- `VldX34mM95o`(Veo 3 시점), `bH2nP-aCFjk`(Images 2.0 무렵)는 제품 버전이 빨리 바뀌어요. 6개월 안에 더 새 공식 영상으로 바꿀지 확인하세요.
- Adobe Firefly 채널 소유를 Adobe 공식 페이지 링크로 확인하면 위험 표기를 지울 수 있어요.
