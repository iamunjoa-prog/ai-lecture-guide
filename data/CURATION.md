# 큐레이션 노트 (Agent A)

검증일: 2026-11-27 · 강사 14명 · 강의 45개 (영상 31 · 재생목록 14, 한국어 8개)

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

참고: 강사 한 명에 `channelUrl`은 하나라서, 개인 채널이 없는 강사(힌턴, 페이페이 리)는 대표 강의가 있는 기관 채널을 적었어요. 앤드류 응·김성훈은 영상마다 실제 업로드 채널이 다를 수 있어요(위 표 참고).

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

## 자막(hasKoreanSubtitle)
- 한국어 강의 8개는 모두 `true`예요.
- 영어 강의 중에는 TED 강연(페이페이 리)만 `true`로 했어요. TED는 공식 한국어 번역 자막을 제공해요.
- 나머지 영어 강의는 공식 한국어 자막을 확인하지 못해 `false`로 했어요. 자동 번역 자막은 치지 않았어요.

## 커버리지 (level × goal, 강의 수)
2026-11-27 태그 보정 후 값이에요 (`npm run report -- --summary`로 다시 계산할 수 있어요).

| | understand | use_tools | build_agents | build_products |
|---|---|---|---|---|
| beginner | 10 | 9 | 0 | 1 |
| user | 15 | 13 | 0 | 4 |
| practitioner | 16 | 9 | 4 | 10 |
| developer | 10 | 5 | 6 | 9 |

분야별: automation 25 · coding 24 · data 24 · education 14 · marketing 14 · startup 20

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
| Spec-Driven Development with Coding Agents (Andrew Ng) | levels + practitioner · domains coding만 · goals use_tools, build_products | 코딩 에이전트를 **써서** 소프트웨어를 만드는 강의. 에이전트를 만드는 강의가 아님 |
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

### 남은 콘텐츠 공백 (새 강의가 필요해요 — 지어내지 않음)
- **입문자·활용자용 "에이전트 만들기" 강의가 0개.** 비개발자가 노코드로 에이전트·자동화 비서를 만드는 공식 강의(예: GPTs·Claude Projects·노코드 자동화)가 없어요. 지금은 이 페르소나에 일반 사용법·개념 강의가 대신 나가요.
- **Anthropic 외 강사의 에이전트 개발 강의가 없음.** build_agents 강의 6개가 모두 Anthropic이라, 강사당 2개 상한에 걸리면 개발자·에이전트 진단의 실전 3번째 칸과 실무자·에이전트 진단의 "한 단계 더"가 목표와 무관한 강의(서울대 시스템, KAIST 기계학습)로 채워져요. DeepLearning.AI·Google 등의 공식 에이전트 강의가 후보예요.
- **입문자 build_products 1개**(Andrew Ng 30분 앱)뿐이고, **마케팅·교육 분야 전용 강의**가 적어요(각 14개 중 대부분 범용 강의).
- **한국어 친화 강의 9개**(한국어 8 + 한국어 자막 1)뿐이고, 실무자·개발자용 한국어 실전(에이전트·코딩 도구) 강의가 없어요.
- 한 번도 추천되지 않는 강의: Prompting for Agents, Mastering Claude Code, Headless automation(모두 Anthropic 상한), Zero to Hero·NYU DL·The Thinking Game(길이가 길어 동점에서 밀림), AI Fluency for nonprofits.
