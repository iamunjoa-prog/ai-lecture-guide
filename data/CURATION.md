# 큐레이션 노트 (Agent A)

검증일: 2026-11-27 · 강사 15명 · 강의 45개 (영상 31 · 재생목록 14, 한국어 8개)

## 검증 방법
- 모든 URL은 YouTube oEmbed(`/oembed?url=...&format=json`)로 200 응답과 `author_name`을 확인했어요. 영상 `title`은 oEmbed 제목을 그대로 썼어요.
- 후보 ID는 각 공식 채널의 `/videos`, `/playlists` 페이지, claude.com 영상 자료실, YouTube 검색 결과에서 모았어요. 추측한 ID는 oEmbed로 확인되지 않으면 모두 뺐어요.
- `channelUrl`은 oEmbed `author_url` 값이에요.

## 강사별 선정 근거
| id | 기준 | 근거 / 비고 |
|---|---|---|
| anthropic | official_channel, founder | Anthropic 공식 채널(@anthropic-ai). 공동창업자 대담 포함 |
| claude | official_channel | Anthropic이 운영하는 Claude 제품 채널(@claude). claude.com/resources/videos에서 연결됨 |
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
| | understand | use_tools | build_agents | build_products |
|---|---|---|---|---|
| beginner | 10 | 10 | 3 | 2 |
| user | 15 | 15 | 5 | 7 |
| practitioner | 14 | 8 | 7 | 9 |
| developer | 10 | 2 | 7 | 8 |

분야별: automation 25 · coding 29 · data 24 · education 20 · marketing 16 · startup 23
