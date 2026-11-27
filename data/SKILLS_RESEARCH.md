# '요즘 주목받는 AI 스킬' 조사 기록 (data/skills.json)

조사일: 2026-11-27 · 기준 시점(asOf): 2026-11 · 대상: AI를 써 본 사람(수준 user·practitioner·developer). 입문자에게는 이 기능이 아무것도 보여 주지 않아요(기본기 먼저).

## 방법과 한계
- 출처는 AI 기업 공식 문서·도움말·연구 보고서, 표준 문서, 공식 기업 보고서만 썼어요. 블로그·SEO 글·유튜버 정리는 쓰지 않았어요.
- **원문 확인**: `curl`로 원문을 내려받아 HTML을 텍스트로 바꾸거나(PDF는 `pdftotext`), 해당 주장이 있는 문장을 직접 읽었어요.
- **검색 확인**: 이 환경에서 열 수 없는 사이트(microsoft.com WorkLab, weforum.org, news.linkedin.com 등)는 WebSearch 결과에 그 페이지와 주장이 함께 보일 때만 썼어요. 데이터에는 2곳(Microsoft 업무 동향 지수 2025·2026)만 '검색 확인'으로 들어갔고, 두 출처 모두 같은 스킬 안의 '원문 확인' 출처와 함께 있어요.
- 출처 41건(중복 제외 34개 URL): **원문 확인 39건 · 검색 확인 2건** (12번 스킬 추가분 4건 포함).
- 가격·플랜·사용 한도·모델 버전 같은 금방 낡는 정보는 넣지 않았어요. 통계는 출처와 연도를 문장 안에 적었어요.
- 영상은 시청하지 않았어요. 강의 연결은 data/videos.json의 제목·요약·용어(terms)로 판단했고, 후보 영상은 YouTube oEmbed로 제목과 채널만 확인했어요.

## 선정한 스킬 12개 (12번은 이미지·영상 분야 추가 때 더함)

| # | id | 이름 | 수준 | 목표 | 강의 |
|---|---|---|---|---|---|
| 1 | delegate-to-agents | AI에게 일 맡기기 | user·practitioner·developer | use_tools, build_agents | tYOI-WoLS_o, PLOjSa4kyvo_M, PLHiXJG-Lqz-s, uDr0xdA_E_A |
| 2 | reusable-skills | 나만의 AI 스킬 만들기 | user·practitioner·developer | use_tools, build_agents | bjdBVZa66oU, PLmWCw1CzcFim_hkruZSlABOUOAAQ5JMyo, dlS2meHJWAk |
| 3 | connect-tools-and-data | AI에 도구·자료 연결하기 | user·practitioner·developer | build_agents, use_tools | _jjSS0qGFbI, PLyCki2K0Lg, 2v6zhEFh3HI, DRghWwm3dt8 |
| 4 | vibe-coding | 말로 작은 도구 만들기 | user·practitioner | build_products | gJYZE9UXiHk, 8zH_O74hZBw, ff3j4olCUig, KiJcZlqJKuE |
| 5 | context-engineering | AI에게 맥락 설계해 주기 | practitioner·developer | build_agents, build_products, use_tools | 8Aoq6mJeAXI, UjvgpPG1XTU, T9aRN5JkmL8 |
| 6 | verify-ai-output | AI 결과 검증하기 | user·practitioner·developer | use_tools, understand, build_products | PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv, T9aRN5JkmL8, jDCkirAz4-E |
| 7 | deep-research | AI로 깊이 조사하기 | user·practitioner | use_tools, understand | R-KJgjIrh24, YkCDVn3_wiw, IJsp9AC-n7Q, EWvNQjAaOHw |
| 8 | workflow-automation | 반복 업무 자동화하기 | user·practitioner | use_tools, build_agents | AkUUeePtbe4, k4V44dn_TQo, tYOI-WoLS_o |
| 9 | coding-agents | 코딩 에이전트와 일하기 | practitioner·developer | build_products, use_tools | 6eBSHbLKuN0, PLmWCw1CzcFilebjK89WLb5cAvM8K0cLB3, wo0Rsh9hlTo, dRsjO-88nBs |
| 10 | agent-safety | 에이전트 시대 보안 습관 | user·practitioner·developer | use_tools, build_agents | 6Mmevs1877A, PLf2m23nhTg1MjwozACw3ufAc3CUpfOBWO, 2v6zhEFh3HI |
| 11 | agent-design | 에이전트 직접 설계하기 | practitioner·developer | build_agents, build_products | LP5OCa20Zpg, XSZP9GhhuAc, OhI005_aJkA, tK32trvj_b4 |
| 12 | creative-drafts | AI로 이미지·영상 초안 만들기 | user·practitioner | use_tools, build_products | CrrpfvbNyMw, sqwbGJL4Pdk, -lVVZDuEIVs, Uvl-tRga98g |

추천 규칙(src/lib/skills.ts `selectSkills`): 수준 일치 → 목표 점수(1순위 목표 +2, 나머지 목표 하나당 +1) → 분야 겹침 수 → skills.json 순서. 최대 3개. 그래서 데이터 순서도 '두루 쓸모 있는 것'이 앞에 오도록 정했어요.

---

### 1. AI에게 일 맡기기 (delegate-to-agents)
- **Anthropic, Economic Index report: Economic primitives (2026년 1월)** — 원문 확인. "From January 2025 to August 2025 the share of such directive conversations rose from 27% to 39%." 이어서 "the share of directive conversations had fallen 7pp to 32% in November 2025" — 그래서 데이터 문장에 11월 수치(32%)도 함께 적었어요. 보고서도 "the underlying trend is still toward greater automation"이라고 해석해요.
- **Microsoft, 2025 Work Trend Index** — 검색 확인. 검색 결과 요약: 'agent boss'를 "build, delegate to, and manage AI agents"하는 사람으로 설명하고, 모두의 새 역할로 제시.
- **OpenAI Help, ChatGPT Work and Codex** — 원문 확인. "Work is an agent designed for longer, multi-step work and finished deliverables."
- **Claude Help, Get started with Claude Cowork** — 원문 확인. "Claude can take on complex, multi-step tasks and execute them on your behalf." 승인 모드("Claude pauses and asks for approval for actions")도 있어 '확인 요청 판단' 결과물의 근거로 삼았어요.
- 선정 이유: 사용 데이터(Anthropic)·설문(Microsoft)·제품 변화(OpenAI·Anthropic) 세 방향이 모두 '맡기기'를 가리켜요. 주의: 지시형 비율은 오르내리므로 '꾸준히 늘었다'고 쓰지 않았어요.

### 2. 나만의 AI 스킬 만들기 (reusable-skills)
- **Anthropic, Donating Agent Skills to the Agentic AI Foundation (2026-10-22)** — 원문 확인. "More than 70 agent platforms, including ChatGPT, Cursor, GitHub Copilot, and VS Code, have integrated Agent Skills since we published the standard in December 2025."
- **Gemini Apps Help, About the transition from Gems to skills** — 원문 확인. "Starting in November 2026, Gems will transition to skills in Gemini Apps for personal Google Accounts, and in 2027, for work and school accounts." "Skills are reusable custom instructions…"
- **OpenAI Help, Custom GPT retirement and migration FAQ** — 원문 확인. "We're planning to retire custom GPTs and help creators migrate them to plugins. Plugins can bring reusable instructions, reference files, and connected apps together."
- **OpenAI, The state of enterprise AI 2025 report (PDF, 2025-12)** — 원문 확인. "Weekly users of Custom GPTs and Projects have increased by approximately 19× year-to-date." (데이터 문장에는 넣지 않고 근거로만 둠)
- 선정 이유: 2026년 하반기에 세 회사가 '맞춤 비서(GPT·Gems)'에서 '스킬'로 형식을 모으고 있어요. 지금 가장 시의성이 큰 스킬이에요.
- ~~주의: 강의 qtO940hejdE(Gems 만들기)는 … 남겼어요.~~ → **3차 정비(2026-11-27)에서 제거**: 개인 계정은 2026-12-17 이후 Gems를 쓸 수 없어(Gemini Apps Help 원문 확인) 강의의 핵심 화면이 곧 맞지 않게 돼요. 이 스킬의 강의는 bjdBVZa66oU·Claude Code Skills 재생목록·dlS2meHJWAk 3개예요.

### 3. AI에 도구·자료 연결하기 (connect-tools-and-data)
- **MCP 공식 문서, What is the Model Context Protocol (MCP)?** — 원문 확인. "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems."
- **Anthropic, Donating the Model Context Protocol… (2025-12-09)** — 원문 확인. "MCP has been adopted by ChatGPT, Cursor, Gemini, Microsoft Copilot, Visual Studio Code, and other popular AI products". 리눅스 재단 산하 AAIF 기부도 같은 글에서 확인.
- **Claude Help, Use connectors to extend Claude's capabilities** — 원문 확인. "Connectors let Claude access your apps and services, retrieve your data, and take actions within connected services."
- **Microsoft Learn, Extend your agent with Model Context Protocol** — 원문 확인. "You can extend your agent with tools by using Model Context Protocol (MCP)."
- 선정 이유: 업계 공통 표준이 됐고, 일반 사용자도 '커넥터'로 매일 접해요.

### 4. 말로 작은 도구 만들기 (vibe-coding)
- **Google Cloud, Vibe Coding Explained** — 원문 확인. "The term, coined by AI researcher Andrej Karpathy in early 2025…" 그리고 "The user guides the AI but then reviews, tests, and understands the code it generates".
- **OpenAI, The state of enterprise AI 2025 report** — 원문 확인. "outside of engineering, IT, and research, coding-related messages have grown by an average of 36% over the past six months."
- 선정 이유: 개발자가 아닌 사람이 AI로 만드는 일이 실제 사용 데이터에서 늘었어요. 개발자는 9번(코딩 에이전트)으로 보내려고 수준에서 developer는 뺐어요.

### 5. AI에게 맥락 설계해 주기 (context-engineering)
- **Anthropic, Effective context engineering for AI agents (2025-09-29)** — 원문 확인. "we view context engineering as the natural progression of prompt engineering" · "Context, therefore, must be treated as a finite resource with diminishing marginal returns."
- **Google Cloud Blog, Announcing the 2025 DORA Report** — 원문 확인. 시작할 일 목록에 "Connect AI to your internal context".
- **Claude Code Docs, Best practices** — 원문 확인(anthropic.com 주소가 code.claude.com으로 리다이렉트). 목차 "Tell Claude what it can't see".
- 선정 이유: 프롬프트 요령의 다음 단계로, 에이전트·스킬·연결이 늘수록 '무엇을 보여 줄지'가 품질을 좌우해요.

### 6. AI 결과 검증하기 (verify-ai-output)
- **OpenAI, Why language models hallucinate (2025-09-05)** — 원문 확인. "language models hallucinate because standard training and evaluation procedures reward guessing over acknowledging uncertainty."
- **Claude Docs, Reduce hallucinations** — 원문 확인. "allowing uncertainty, grounding responses in direct quotes, and verifying claims with citations." (시작 프롬프트의 '모르면 모른다고' 근거)
- **Google Cloud Blog, 2025 DORA Report** — 원문 확인. "90% of survey respondents report using AI at work… 30% report little or no trust in the code generated by AI".
- 선정 이유: 맡기는 양이 늘수록 검증이 병목이 돼요. 모든 수준에 필요해서 세 수준 모두에 넣었어요.

### 7. AI로 깊이 조사하기 (deep-research)
- **OpenAI Help, Deep research in ChatGPT** — 원문 확인. "You get a structured report with citations or source links so you can verify the information." 조사 계획 검토("ChatGPT creates a proposed research plan. You can review and modify it")도 시작 프롬프트에 반영했어요.
- **Gemini Apps Help, Use Deep Research in Gemini Apps** — 원문 확인. "You can conduct in-depth and real-time research on almost any subject with Deep Research".
- **Claude Help, Use research on Claude** — 원문 확인. "It runs multiple searches that build on each other and decides what to look into next based on what it finds."
- **Anthropic, Economic Index: Uneven AI adoption (2025-09)** — 원문 확인. "'Conduct internet-based and library research' increased from 0.003% to 0.27%." 비율 자체는 작아서, 데이터에는 숫자 없이 '비중이 늘었다'고만 썼어요.
- 선정 이유: 세 회사가 같은 기능을 표준으로 갖췄고, '출처 확인'과 짝지으면 검증 스킬과도 이어져요.

### 8. 반복 업무 자동화하기 (workflow-automation)
- **Microsoft Learn, Agent flows overview** — 원문 확인. "Agent flows are deterministic… The same input always produces the same output" · "using AI-driven suggestions for triggers, actions, and automation steps."
- **Google Workspace Learning Center, Workspace Studio training and help** — 원문 확인. "Use Google Workspace Studio to automate cross-Workspace tasks with Gemini. You can tell Gemini what you want to automate…" · "no programming required!"
- **Anthropic, Economic Index report: Economic primitives (2026-01)** — 원문 확인. "businesses are increasingly using Claude to automate routine back-office workflows such as email management, document processing…"
- 선정 이유: 사무 자동화가 '코딩 없는 말로 설명하기'로 바뀌고 있어요. 1번(맡기기)은 한 번의 일, 8번은 반복되는 흐름이라 나눴어요.

### 9. 코딩 에이전트와 일하기 (coding-agents)
- **Google Cloud Blog, 2025 DORA Report** — 원문 확인. "AI doesn't fix a team; it amplifies what's already there." · 90% 사용.
- **Claude Code Docs, Best practices** — 원문 확인. "Give Claude a check to run" · "If it has nothing to run that tells it whether the work actually is done, 'looks done' is all it has to go on."
- **OpenAI Help, ChatGPT Work and Codex** — 원문 확인. "Codex remains dedicated to software development and technical work."
- 선정 이유: 개발자 수준의 대표 스킬. 명세 기반 개발(spec-driven development)은 따로 두지 않고 여기에 용어로 묶었어요.

### 10. 에이전트 시대 보안 습관 (agent-safety)
- **Anthropic, Mitigating prompt injections in browser use (2025-11-24)** — 원문 확인. "prompt injection is far from a solved problem, particularly as models take more real-world actions."
- **OpenAI, Understanding prompt injections (2025-11-07)** — 원문 확인. "Use built in features to limit access to sensitive data" · "When an agent asks for confirmation, carefully review that it is about to do the right thing".
- **Claude Help, connectors** — 원문 확인. "Claude inherits each person's permissions from the connected service." · "Only connect services you trust and need for your workflows."
- **OpenAI Help, Data controls in ChatGPT** — 원문 확인. "Data controls let you choose whether your conversations help train OpenAI models."
- 선정 이유: 1·3·8번을 쓰면 위험도 같이 커져요. 회사 실무에서 바로 필요한 습관이에요.

### 11. 에이전트 직접 설계하기 (agent-design)
- **OpenAI, A practical guide to building agents (PDF)** — 원문 확인. "Agents are systems that independently accomplish tasks on your behalf." 가드레일 장도 확인.
- **Anthropic, Building effective AI agents** — 원문 확인. "we recommend finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all."
- **Microsoft, 2026 Work Trend Index** — 검색 확인. 검색 결과 인용: "Frontier Professionals use agents for multi-step workflows and building multi-agent systems."
- 선정 이유: 실무자·개발자가 직접 만들 때의 기본기. 우리 강의가 가장 두터운 분야이기도 해요.

---

### 12. AI로 이미지·영상 초안 만들기 (creative-drafts) — 2026-11-27 추가
- **OpenAI Help, ChatGPT Images in ChatGPT** — 원문 확인. "All ChatGPT plans include image creation in supported countries and territories." · "You can also upload an existing image and describe the changes you want ChatGPT to make." (Images 2.6 언급, 하루 전 갱신)
- **Gemini Apps Help, Generate & edit images with Gemini Apps** — 원문 확인. "You can use Google's Nano Banana models to create and refine images." · "Be sure not to violate others' copyright or privacy rights."
- **Anthropic, Introducing Claude Design by Anthropic Labs (2026-04-17)** — 원문 확인. "collaborate with Claude to create polished visual work like designs, prototypes, slides, one-pagers" · research preview.
- **OpenAI Help, Provenance signals in content processed by OpenAI tools** — 원문 확인. "Images generated with ChatGPT or the OpenAI API include both signals"(Content Credentials·SynthID). 같은 문서에 "Sora is discontinued".
- 선정 이유: 주요 챗봇 세 곳이 이미지 생성·편집·시각 디자인을 기본 기능으로 넣었고, 동시에 권리·출처 표시 안내가 공식 문서에 들어왔어요. '얼마나 많이 쓰는지' 같은 수치는 공식 원문에서 확인하지 못해(팟캐스트 영상 설명의 "1.5 billion images a week"는 영상 설명일 뿐이라) whyNow에 넣지 않았어요. 입문자에게는 스킬이 보이지 않으므로 levels는 user·practitioner.
- 기존 스킬 `domains`에는 creative를 붙이지 않았어요(연결 강의가 이미지·영상과 무관).

## 탈락시킨 후보와 이유
| 후보 | 결정 | 이유 |
|---|---|---|
| 멀티모달 활용(이미지·음성·문서) | 탈락 | '요즘 새로 뜨는' 근거가 약했어요. 음성은 ChatGPT Work에 붙는 등 기능으로는 있지만, 스킬로서 수요가 늘었다는 1차 자료를 2개 찾지 못했어요. 입문 수준 기본기(이미 glossary `multimodal`, beginner 이론)에 가까워요. |
| 프롬프트 엔지니어링 기초 | 흡수 | 이미 입문·활용 수준 강의와 이론이 충분해요. Anthropic이 '다음 단계'라 부른 컨텍스트 엔지니어링(5번)으로 대신했어요. |
| RAG(검색 증강 생성) 따로 | 흡수 | 사용자에게는 '자료 연결'(3번)과 '조사'(7번)로 나타나서 합쳤어요. 이론 `rag-search-then-answer`로 연결. |
| 멀티 에이전트·A2A | 흡수 | 개발자 일부에만 해당해요. 11번(에이전트 설계)에 용어 `multi-agent`로 묶었어요. |
| 브라우저·컴퓨터 사용 에이전트 | 흡수 | 1번(맡기기)과 10번(보안)에 나눠 담았어요. 기능·플랜이 빨리 바뀌어 따로 두면 낡기 쉬워요. |
| 명세 기반 개발 | 흡수 | 9번(코딩 에이전트)의 용어로 묶었어요. |
| 미세조정(fine-tuning) | 탈락 | 대상자 대부분에게 우선순위가 낮고, 최근 공식 자료는 컨텍스트·도구 연결을 먼저 권해요. |
| 일반 'AI 리터러시' | 탈락 | 검색 결과(LinkedIn Skills on the Rise 2026, WEF Future of Jobs 2025)에서 AI 관련 스킬 수요 증가는 보이지만 범위가 너무 넓고, 원문을 직접 읽을 수 없었어요. 데이터 근거로 쓰지 않았어요. |

## 강의 공백 (PM 검토용) — 3차 정비(2026-11-27) 반영

**반영 결과**: 후보 9개 중 ✅ 그대로 추가 3개(R-KJgjIrh24, 6Mmevs1877A, _jjSS0qGFbI) · 🔁 같은 성격의 확인 가능한 영상으로 바꿔 추가 2개(jv-lpIsnLOo → YkCDVn3_wiw, buwMJxvW7wI → IJsp9AC-n7Q) · ⏭️ 넣지 않음 4개(AI Fluency 레슨 3개 중복, 카파시 @ycombinator). 근거는 CURATION.md 「3차 정비」.

| 후보 | 결과 |
|---|---|
| jv-lpIsnLOo (OpenAI Introduction to Deep Research) | ⏭️→✅ 같은 제목으로 채널에 공개돼 있고 설명·길이(20:16)를 확인할 수 있는 **YkCDVn3_wiw**로 바꿔 추가. jv-lpIsnLOo는 채널·검색 목록에 나오지 않아 확인 불가 |
| R-KJgjIrh24 (Claude 리서치) | ✅ 추가 → deep-research 1순위 |
| buwMJxvW7wI (@Google Gemini Deep Research 데모) | ⏭️ @Google은 공식 채널이지만 1년 넘은 2분 데모 + 새 허용 채널 필요 → 이미 등록된 @googleworkspace의 최근 레슨 **IJsp9AC-n7Q**(NotebookLM·Gemini 딥 리서치, 마케팅)를 대신 추가 → deep-research 3순위 |
| Y0KidGr9Z2Y (AI Fluency 8강 Discernment) | ⏭️ 이미 연결한 AI Fluency 재생목록에 포함(재생목록 페이지에서 확인) — 중복 |
| W4Ua6XFfX9w (AI Fluency 2B강 4D) | ⏭️ 같은 재생목록에 포함 — 중복 |
| 6Mmevs1877A (Microsoft Mechanics 탈옥·인젝션) | ✅ 추가 → agent-safety 1순위 |
| QbLf2zb3oPc (AI Fluency 10강 Diligence) | ⏭️ 같은 재생목록에 포함 — 중복 |
| _jjSS0qGFbI (Claude 커넥터) | ✅ 추가 → connect-tools-and-data 1순위(활용 수준 공백 해소) |
| LCEmiRjPEtQ (카파시 @ycombinator) | ⏭️ 투자사 채널(1차 큐레이션에서도 제외), 내용 미확인 |

아래 표는 3차 정비 전 조사 기록이에요(그대로 둠).
강의가 약한 스킬과, 화이트리스트 채널(AI 기업 공식 채널·창업자·핵심 연구자·교수)의 후보예요. 모두 2026-11-27에 `curl -sS -m 20 "https://www.youtube.com/oembed?url=<url>&format=json"`으로 **제목과 업로드 채널을 확인**했어요(시청은 안 함). 추가하려면 강의마다 실습 미션이 필요해요.

| 스킬 | 공백 | 후보 (oEmbed 제목 · 채널) | 한 줄 이유 |
|---|---|---|---|
| deep-research | 전용 강의 없음(카파시 영상의 한 부분, Claude 업무 활용 짧은 영상뿐) | https://www.youtube.com/watch?v=jv-lpIsnLOo — "Introduction to Deep Research" · OpenAI (@OpenAI) | OpenAI 공식 채널의 딥 리서치 소개 영상(출시 당시인 2025년 2월 공개로 검색 확인). 화면은 지금과 다를 수 있어요. |
| | | https://www.youtube.com/watch?v=R-KJgjIrh24 — "Getting started with research in Claude.ai" · Anthropic (@anthropic-ai) | Claude 리서치 기능을 켜고 쓰는 공식 짧은 안내. |
| | | https://www.youtube.com/watch?v=buwMJxvW7wI — "Gemini Deep Research Demo \| Using AI to learn new topics in depth" · Google (@Google) | Google 공식 채널의 시연. @Google 채널은 아직 강사 목록에 없어 허용 채널 추가가 필요해요. |
| verify-ai-output | 활용 수준에서 '검증'만 다루는 짧은 강의 없음(AI Fluency 재생목록 전체만 연결) | https://www.youtube.com/watch?v=Y0KidGr9Z2Y — "Lesson 8: A closer look at Discernment \| AI Fluency: Framework & Foundations Course" · Anthropic | AI 결과를 판단하는 '분별(Discernment)'만 다루는 레슨. 이미 연결한 AI Fluency 재생목록에 들어 있을 수 있어요(재생목록 구성은 확인 못 함). |
| | | https://www.youtube.com/watch?v=W4Ua6XFfX9w — "Lesson 2B: The 4D Framework \| AI Fluency: Framework & Foundations Course" · Anthropic | 위임·설명·분별·성실 4D 틀을 한 번에 소개해 1·6·10번을 잇기 좋아요. 같은 재생목록 중복 가능성 있음. |
| agent-safety | 프롬프트 인젝션·권한 관리를 다루는 강의 없음 | https://www.youtube.com/watch?v=6Mmevs1877A — "How AI jailbreaks work and what stops them. (GPT, DeepSeek, Llama feat. Mark Russinovich)" · Microsoft Mechanics (@MSFTMechanics) | Microsoft 공식 시연 채널에서 마크 러시노비치가 출연해 AI 탈옥이 어떻게 일어나고 무엇으로 막는지 다뤄요(제목 기준). @msftmechanics는 이미 microsoft 강사의 허용 채널이에요. |
| | | https://www.youtube.com/watch?v=QbLf2zb3oPc — "Lesson 10: A closer look at Diligence \| AI Fluency: Framework & Foundations Course" · Anthropic | 책임 있게 쓰는 태도(성실)를 다루는 레슨. 기술 보안보다는 습관 쪽이에요. |
| connect-tools-and-data | 활용(user) 수준 강의 없음(모두 실무·개발 발표) | https://www.youtube.com/watch?v=_jjSS0qGFbI — "Getting started with connectors in Claude.ai" · Anthropic (@anthropic-ai) | 비개발자가 커넥터를 연결하는 공식 안내. 사용자 수준 공백을 바로 메워요. |
| context-engineering | 실무자용 입문 강의 약함(개발자용 발표 위주) | https://www.youtube.com/watch?v=LCEmiRjPEtQ — "Andrej Karpathy: Software Is Changing (Again)" · Y Combinator (@ycombinator) | 창업자·핵심 연구자인 카파시의 강연. 내용은 시청으로 확인하지 못했어요. 넣으려면 @ycombinator를 andrej-karpathy 허용 채널로 추가해야 해요. |

공식 채널 영상을 찾지 못한 것: 컨텍스트 엔지니어링을 직접 다루는 Anthropic·Google 공식 영상(검색에 나온 것은 모두 제3자 재업로드·해설 채널이라 제외), Google 공식 프롬프트 인젝션 영상.

## 다시 확인할 것 (금방 낡는 부분)
- Gems→스킬 전환(개인 2026-11~, 개인 Gems 파일은 2026-12-17까지 내려받기 가능, 업무·학교 2027), 맞춤 GPT 종료(2026-12-11 예정, 일부 Enterprise·FedRAMP 2027-02-28) 일정은 바뀔 수 있어요. 2027년 초에 2번 스킬 문구(whyNow)를 다시 보세요. (qtO940hejdE는 3차 정비에서 제거됨)
- Anthropic 경제 지수는 분기마다 새로 나와요. 1번 스킬의 비율 문장은 다음 보고서가 나오면 갱신하세요.
