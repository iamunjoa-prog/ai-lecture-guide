# 3분 이론 출처 기록 (data/theory.json)

작성일: 2026-11-27. 개념마다 "어떤 문장이 어떤 출처에 기대는지"를 적는다.

## 확인 방법
- **[본문 확인]**: 페이지를 직접 내려받아 해당 문장을 찾아 읽음 (anthropic.com, claude.com, platform.claude.com, support.claude.com).
- **[검색 확인]**: 이 세션의 네트워크에서 해당 호스트가 막혀 있어 WebSearch 결과로 URL·제목·요지를 확인함
  (developers.google.com, cloud.google.com, openai.com, help.openai.com, developers.openai.com, cdn.openai.com,
  arxiv.org, research.google, modelcontextprotocol.io, support.microsoft.com, learn.microsoft.com, support.google.com, privacy.claude.com).
- 비유(analogy)와 "바로 해보기"(tryIt)는 사실 주장이 아니라 설명 장치라 출처를 따로 달지 않는다. 다만 본문과 어긋나지 않게 썼다.
- 숫자·가격·벤치마크·제품 버전은 쓰지 않았다. 예외: 트랜스포머 논문 발표 연도(2017, 고정된 역사적 사실).
- 문단 번호는 body 배열 순서(1부터).

---

## 입문자

### llm-predicts-next-word (core) — AI는 '다음 말'을 예측하는 기계예요
- 1문단 "LLM은 아주 많은 글을 읽고 말의 규칙을 익힌 프로그램": Anthropic Glossary "LLM… trained on vast amounts of text data" [본문 확인]
- 1문단 "'대규모'는 모델이 크고 배운 글이 많다는 뜻": Google MLCC LLM 소개 "large… number of parameters… or number of words in the dataset" [검색 확인]
- 2문단 "앞의 글을 보고 다음 말을 예측, 반복": Anthropic Glossary Pretraining "pretrained to predict the next word, given the previous context"; Google MLCC "language model estimates the probability of a token… sequence" [본문/검색 확인]
- 2문단 "한 글자씩 나타나는 것도 이 때문": 위 다음 말 예측 방식의 일반적 귀결(토큰 단위 생성). 별도 수치 주장 없음
- 3문단 "토큰은 낱말 또는 낱말 조각, 언어에 따라 토큰 수가 다름": Anthropic Glossary Tokens "words, subwords, characters… depends on the model and the language"; Google MLCC "Tokens can be words, subwords, or characters" [본문/검색 확인]
- 4문단 "사실인지 하나하나 확인하고 말하는 것은 아님": OpenAI "Why language models hallucinate" — 사전학습은 참/거짓 라벨 없이 유창한 글만 본다 [검색 확인]

### ai-can-be-wrong — AI도 틀려요
- 1문단 "사실이 아닌 내용을 자신 있게 말함 = 환각": Google Cloud "AI hallucinations are incorrect or misleading results"; Anthropic Reduce hallucinations "factually incorrect or inconsistent… known as hallucinations" [검색/본문 확인]
- 2문단 "그럴듯한 말을 고르다 빈칸을 채우듯 말함, 아직 완전히 없애지 못함": OpenAI "Why language models hallucinate" (추측에 보상하는 학습·평가, 여전히 발생) [검색 확인]
- 3문단 "중요한 정보는 공식 자료로 확인": Anthropic Reduce hallucinations "Always validate critical information, especially for high-stakes decisions" [본문 확인]
- 4문단 "모르면 모른다고, 근거 문장 보여 달라 / 크게 줄이지만 완전히 막지 못함": Anthropic Reduce hallucinations — allow uncertainty, direct quotes, citations, "significantly reduce… don't eliminate them entirely" [본문 확인]

### prompt-basic-structure — 좋은 질문의 기본 구조
- 2문단 "역할·상황·요청·형식, 꼭 필요한 건 요청": Microsoft Support "Learn about Copilot prompts" — goal·context·expectations·source, "all that's required is a clear goal" [검색 확인]; Anthropic Prompting best practices "Give Claude a role", "Add context to improve performance" [본문 확인]
- 4문단 "AI는 사정을 모르는 새 직원, 자세히 말할수록 좋아짐": Anthropic Prompting best practices "brilliant but new employee who lacks context… The more precisely you explain what you want, the better the result" [본문 확인]

### do-not-share-sensitive-info — AI에게 넣으면 안 되는 정보
- 1문단 "서버에 일정 기간 저장, 설정에 따라 학습에 쓰일 수 있음, 서비스·설정마다 다름": OpenAI Data Controls FAQ (Improve the model for everyone 설정, 임시 채팅 30일 후 삭제); Anthropic Privacy Center "Is my data used for model training?" (모델 개선 공유 선택, 보관 기간이 선택에 따라 다름) [검색 확인]
- 2문단 "사람이 대화 일부를 검토하기도 함, 개인정보 안내에 적혀 있음": Gemini Apps Privacy Notice "human reviewers… review some of the data", "Please don't enter confidential information that you wouldn't want a reviewer to see" [검색 확인]
- 3문단 "기밀·개인정보 넣지 말 것": Gemini Apps Privacy Notice (위 문장) [검색 확인]
- 4문단 "학습에 쓰지 않기 설정이 있음 / 이미 쓰인 데이터는 되돌리기 어려울 수 있음": OpenAI Data Controls FAQ (opt-out 설정); Anthropic Privacy Center (설정을 꺼도 이미 시작된 학습·학습된 모델에는 남음) [검색 확인]

### generative-ai-map — 생성형 AI 지도
- 1~2문단 "생성형 AI는 글·이미지·음악·음성·영상 같은 새 콘텐츠를 만든다": Google Cloud "What is generative AI?" — "create new content such as text, images, music, audio, and video" [검색 확인]
- 3문단 "사진·음성 등 여러 입력을 함께 다룸(멀티모달), 이미지 설명·음성 받아쓰기": Google Cloud 같은 페이지 — multimodal input, image captioning, audio transcription [검색 확인]
- 1·4문단 일반 개념(LLM·프롬프트·생성형 AI 기초): Microsoft Learn "Introduction to generative AI and agents" [검색 확인]
- 4문단 "그럴듯해도 틀릴 수 있음": ai-can-be-wrong의 출처와 같음 (Google Cloud hallucinations)

## 활용자

### context-is-working-memory (core) — 컨텍스트는 AI의 작업 기억
- 1문단 "질문·이전 대화·파일·기본 지시가 들어감": Anthropic Context windows — 이전 턴이 컨텍스트에 쌓임; Prompting best practices — system prompt에 역할 설정 [본문 확인]
- 2문단 "한 번에 볼 수 있는 양의 한계 = 컨텍스트 윈도우, 학습 데이터와 다른 작업 기억": Anthropic Glossary "amount of text a language model can look back on… different from the large corpus… a 'working memory'" [본문 확인]
- 3문단 "많을수록 좋은 건 아님, 정확히 떠올리기 어려워짐, 무엇을 넣을지 고르는 게 중요": Anthropic Context windows "more context isn't automatically better… accuracy and recall degrade (context rot)… curating what's in context just as important" [본문 확인]
- 4문단 "요약해서 새로 시작": Anthropic Effective context engineering — compaction(요약 후 새 컨텍스트로 다시 시작) [본문 확인]

### prompt-iteration — 프롬프트는 다듬을수록
- 2문단 "예시가 효과 좋음, 몇 개, 서로 다르게(다양하게)": Anthropic Prompting best practices "Examples are one of the most reliable ways…", "3–5 examples", relevance and diversity [본문 확인]; Google MLCC tuning "few-shot prompting" [검색 확인]
- 3문단 "단계를 나눠 중간 결과 확인": Anthropic Prompting best practices "Chain complex prompts… useful when you need to inspect intermediate outputs" [본문 확인]
- 4문단 "이유도 함께 말하면 더 좋음": Anthropic Prompting best practices "Providing context or motivation behind your instructions" [본문 확인]

### give-your-own-materials — 내 자료를 주면
- 2문단 "긴 문서는 앞에, 질문은 뒤에": Anthropic Prompting best practices "Put long-form data at the top… Queries at the end" [본문 확인]
- 3문단 "프로젝트에 자료와 지시를 모아 둠": Claude Help "What are projects?" — "upload documents, provide context… knowledge bases"; Anthropic "Collaborate with Claude on Projects" [본문 확인]
- 4문단 "자료 안에서만 답하라고 하면 짐작이 줄어듦": Anthropic Reduce hallucinations — restrict to provided documents [본문 확인]
- 1문단 "모르면 지어내기도 함": ai-can-be-wrong 출처와 같음

### from-chatbot-to-agent — 챗봇에서 에이전트로
- 2문단 "목표를 받아 도구를 쓰며 진행, 중간 결과 보고 다음 행동": Anthropic Building effective agents — "LLM enhanced with… retrieval, tools", "gain ground truth from the environment at each step"; Google Cloud "What is an AI agent?" — pursue goals and complete tasks on behalf of users [본문/검색 확인]
- 1·2문단 "챗봇(어시스턴트)은 사용자 지시가 필요, 정해진 순서(워크플로)와 달리 AI가 길을 정함": Google Cloud (assistants less autonomous); Anthropic Building effective agents (workflows vs agents 구분) [검색/본문 확인]
- 4문단 "중요·되돌리기 어려운 일은 사람 확인": Anthropic Building effective agents "pause for human feedback at checkpoints" [본문 확인]; OpenAI A practical guide to building agents — 고위험·되돌릴 수 없는 작업 시 사람 개입 [검색 확인, 검색 요약 기준]

### how-ai-learns — 사전학습과 미세조정
- 1문단 "사전학습 = 많은 글로 다음 말 맞히기, 공개된 인터넷 글 등": Anthropic Glossary Pretraining [본문 확인]; OpenAI Help "How ChatGPT and our foundation models are developed" — 공개 인터넷 정보 등 [검색 확인]
- 2문단 "사전학습만으로는 질문 답변·지시 따르기에 서툼": Anthropic Glossary "not inherently good at answering questions or following instructions" [본문 확인]
- 3문단 "미세조정 = 추가 자료로 더 학습, 사람이 고른 더 나은 답 방향으로 학습": Anthropic Glossary Fine-tuning, RLHF ("ranking… prefer outputs similar to the higher-ranked ones"); Google MLCC tuning [본문/검색 확인]
- 4문단 "글을 그대로 저장하지 않고 숫자(파라미터)가 바뀜": OpenAI Help "do not store or retain copies… values of its parameters are adjusted slightly" [검색 확인]

### no-code-ai-tools — 코딩 없이 만드는 AI 도구
- 2문단 "Gem: 지시를 적고 파일(지식)을 추가": Google Gemini Help "Use Gems in Gemini Apps" [검색 확인]; "프로젝트: 지시와 자료": Claude Help "What are projects?" [본문 확인]
- 3문단 "Copilot Studio: 로우코드로 에이전트, 말로 설명해 만들기, 시험 후 게시": Microsoft Learn "Copilot Studio overview" [검색 확인]
- 주의: OpenAI의 맞춤 GPT는 일부 플랜에서 종료 예정이라는 안내가 있어(검색 확인) 본문 예시에서 일부러 뺐다.

## 실무자

### rag-search-then-answer (core) — RAG
- 1문단 "검색 증강 생성 = 답하기 전에 관련 자료를 찾아 줌": Lewis et al. 2020 (arXiv 2005.11401) [검색 확인]; Anthropic Glossary RAG [본문 확인]
- 2문단 "작은 조각으로 나눠 저장 → 질문 시 관련 조각 찾아 함께 전달, 뜻 비슷함(임베딩)으로 찾음": Anthropic Contextual retrieval — chunks, embedding model, vector database, semantic similarity [본문 확인]
- 3문단 "자료만 바꾸면 재학습 없이 지식 갱신": Lewis et al. "non-parametric memory can be replaced to update the models' knowledge" [검색 확인]; "근거를 보여 주기 쉬움": Anthropic Glossary "ground the model's response in evidence" [본문 확인]
- 4문단 "엉뚱한 자료를 찾으면 답도 엉뚱": Google Cloud RAG 페이지 — 관련 없는 검색 결과는 근거는 있지만 틀린 답으로 이어짐 [검색 확인]

### tool-use-and-mcp — 도구 사용과 MCP
- 2문단 "도구와 설명을 알려 주면 AI가 필요할 때 호출을 요청, 실행은 프로그램이 하고 결과를 돌려줌": Anthropic Tool use "Claude determines when to call a tool based on the user's request and the tool's description… returns a structured call that your application runs"; OpenAI Function calling — 외부 시스템 연결, 5단계 흐름 [본문/검색 확인]
- 3문단 "MCP = 연결 방식을 하나로 맞춘 공개 규격, 제각각이던 연결을 하나로": modelcontextprotocol.io "open protocol that standardizes…", USB-C 비유; Anthropic "Introducing the Model Context Protocol" — "universal, open standard… replacing fragmented integrations with a single protocol" [검색/본문 확인]
- 비유 "USB-C": modelcontextprotocol.io·Anthropic Glossary의 비유를 그대로 옮김
- 4문단 "권한을 신중히, 읽기 전용부터": 일반적인 안전 권고(사실 주장 아님)

### connect-ai-with-api — API로 연결
- 1문단 "프로그램이 AI를 직접 부르는 창구": Anthropic API overview "programmatic access to Claude models" [본문 확인]
- 3문단 "API 키는 공유 금지, 웹페이지(브라우저) 코드·저장소에 넣지 말 것, 유출 시 즉시 교체": OpenAI Help "Best Practices for API Key Safety" [검색 확인]
- 4문단 "쓴 만큼 요금, 사용 한도 설정": OpenAI 같은 글 — monthly spend limits 권고 [검색 확인]

### evaluate-if-it-works — 평가
- 2문단 "구체적·측정 가능한 성공 기준, '좋은 성능' 같은 막연한 말 대신": Anthropic Define success criteria "Specific… Instead of 'good performance'… Measurable" [본문 확인]
- 3문단 "까다로운(edge case) 문제 포함, 많을수록 좋고 자동 채점": Anthropic 같은 문서 "Don't forget edge cases!", "Prioritize volume over quality" [본문 확인]; "바꿀 때마다 같은 시험": Anthropic Demystifying evals (회귀 확인) [본문 확인]
- 4문단 "정답 대조·사람·다른 AI 채점": Anthropic Define success criteria "exact match… LLM-based grading", human grading [본문 확인]

### guardrails-and-human-review — 가드레일과 사람 검토
- 2문단 "여러 겹 안전장치": OpenAI A practical guide to building agents — layered guardrails [검색 확인, 검색 요약 기준]; "요청 검사를 별도 AI가 하면 더 잘 됨": Anthropic Building effective agents "one model instance processes user queries while another screens them… tends to perform better" [본문 확인]
- 3문단 "고위험·되돌리기 어려움·반복 실패 시 사람에게": OpenAI practical guide — failure thresholds, high-risk actions [검색 확인, 검색 요약 기준]; OpenAI Safety best practices — Human in the loop [검색 확인]; Anthropic Building effective agents "pause for human feedback at checkpoints" [본문 확인]
- 4문단 "안전한 시험 환경에서 충분히": Anthropic Building effective agents "extensive testing in sandboxed environments, along with the appropriate guardrails" [본문 확인]

### embeddings-meaning-as-numbers — 임베딩
- 1~2문단 "글을 숫자 묶음(벡터)으로, 뜻이 비슷하면 가깝고 거리가 관련성": OpenAI Vector embeddings "vector (list) of floating point numbers… small distances suggest high relatedness"; Anthropic Embeddings "numerical representations of text… semantic similarity"; Google MLCC Embeddings (비슷한 항목이 가까이) [검색/본문 확인]
- 1문단 "수백 개가 넘는 숫자": Anthropic Embeddings 문서의 모델 차원 표(256~2048) [본문 확인]
- 3문단 "검색·추천·묶기에 쓰임, RAG가 찾을 때 씀": OpenAI 같은 문서 use cases (search, clustering, recommendations); Anthropic Contextual retrieval [검색/본문 확인]
- 4문단 "많으면 벡터 DB": OpenAI 같은 문서 vector database 권고 [검색 확인]

## 개발자

### context-engineering (core) — 컨텍스트 엔지니어링
- 1문단 "지시·도구·기록·결과가 쌓이고 무엇을 담을지 설계": Anthropic Effective context engineering [본문 확인]
- 2문단 "한정된 자원, 많을수록 회상 능력 저하(context rot), 가장 적은 고신호 정보": 같은 글 "finite resource with diminishing marginal returns", "context rot", "smallest possible set of high-signal tokens"; Anthropic Context windows [본문 확인]
- 3문단 "압축·메모·필요할 때 불러오기(just in time)": 같은 글 compaction, structured note-taking, "just in time" (file paths 등 식별자만 유지) [본문 확인]

### agent-loop — 에이전트 루프
- 1~2문단 "정보 모으기 → 행동 → 확인 → 반복": Claude Agent SDK 글 "gather context -> take action -> verify work -> repeat" [본문 확인]; OpenAI Function calling — 도구 결과를 돌려주고 필요한 만큼 이어감 [검색 확인]
- 2문단 "단계 수를 미리 알기 어려운 일에 맞음": Anthropic Building effective agents "open-ended problems where it's difficult or impossible to predict the required number of steps" [본문 확인]
- 3문단 "매 단계 실제 결과 확인": Anthropic Building effective agents "gain ground truth from the environment at each step (such as tool call results or code execution)" [본문 확인]
- 4문단 "멈추는 조건(최대 반복), 사람에게 묻기, 시간·비용 증가": 같은 글 "stopping conditions (such as a maximum number of iterations)", "pause for human feedback", "trade latency and cost" [본문 확인]

### cost-speed-quality — 비용·속도·품질
- 1~2문단 "능력·속도·비용 균형, 쉬운 건 작은 모델·어려운 건 큰 모델": Anthropic Choosing the right model "balancing capabilities, speed, and cost", "pair a lower-cost model with a frontier model"; Anthropic Building effective agents (routing easy questions to smaller models) [본문 확인]
- 3문단 "입출력 줄이면 빠르고 저렴, 프롬프트 캐싱": Anthropic Reducing latency "Optimize prompt and output length"; Anthropic Prompt caching "cut costs and latency"; OpenAI Latency optimization "generate fewer tokens, use fewer input tokens" [본문/검색 확인]
- 4문단 "스트리밍으로 기다림 줄임": Anthropic Reducing latency (streaming) [본문 확인]

### observability-eval-pipeline — 관측성과 평가 파이프라인
- 2문단 "트레이스에 도구 호출·입력·출력·시간 기록, 민감 정보 주의": OpenAI Tracing (Agents) — model generations, tool calls, inputs/outputs/duration, sensitive data 옵션 [검색 확인]; Anthropic Demystifying evals "transcript (also called a trace…)" [본문 확인]
- 3문단 "바꿀 때마다 자동 시험, 회귀 확인": Anthropic Demystifying evals (regressions, test changes before shipping) [본문 확인]
- 4문단 "기록(트랜스크립트)을 직접 읽기, 실제 사용자 반응과 함께": 같은 글 "read the transcripts", "Combined with production monitoring, A/B tests, user research" [본문 확인]

### transformer-and-attention — 트랜스포머와 어텐션
- 1문단 "2017년 논문 Attention Is All You Need에서 소개": arXiv 1706.03762 [검색 확인]
- 2문단 "각 단어가 다른 단어를 살펴 중요도를 매김, '그것'이 무엇을 가리키는지": Google MLCC transformers "self-attention… how much every other token influences its interpretation"; Google Research 블로그의 "it" 예시 [검색 확인]
- 3문단 "예전 방식(RNN)은 차례로, 트랜스포머는 한꺼번에 → 학습 빠름, 먼 관계 잘 잡음": Google MLCC (RNN token by token vs whole context); Google Research 블로그 (학습 계산 감소·속도, 먼 거리 의존성) [검색 확인]
- 4문단 "글 생성 모델은 앞 단어만 보는(단방향) 어텐션": Google MLCC "decoders use unidirectional" [검색 확인]

### reasoning-models-and-rl — 추론 모델과 강화학습
- 1문단 "답하기 전에 생각, 문제를 쪼개고 여러 방법 시도·중간 점검": Anthropic Thinking "restates what is being asked, tries approaches, checks intermediate results"; OpenAI Learning to reason "break down tricky steps… try a different approach" [본문/검색 확인]
- 2문단 "강화학습으로 생각 방법을 다듬음, 보상 방식": OpenAI Learning to reason (RL이 chain of thought를 다듬음) [검색 확인]; "사람이 매긴 순위를 보상으로": Anthropic Glossary RLHF [본문 확인]
- 3문단 "수학·코딩·다단계 작업에서 개선, 실수 인식·방법 전환": Anthropic Thinking "improves performance on complex tasks such as math, coding, analysis, and long-running agentic work"; OpenAI Learning to reason "recognize and correct its mistakes" [본문/검색 확인]
- 4문단 "생각도 토큰을 써서 비용 포함, 깊이 조절": OpenAI Reasoning models (reasoning tokens billed as output, reasoning.effort); Anthropic Thinking (effort로 깊이 조절) [검색/본문 확인]

---

## 출처를 찾지 못했거나 일부러 뺀 내용
- OpenAI "A practical guide to building agents"(PDF)는 URL·제목을 검색으로 확인했지만, 사람 개입 기준(실패 횟수·고위험 작업) 문장은 검색 요약으로만 확인했다. 같은 문단을 Anthropic·OpenAI Safety best practices가 함께 받쳐 준다.
- 제품 화면 이름(설정 메뉴 이름 등)은 바뀔 수 있어 "데이터"·"개인정보" 같은 일반 표현만 썼다.
- 맞춤 GPT 예시는 종료 안내가 있어 넣지 않았다.
