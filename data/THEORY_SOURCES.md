# 3분 이론 출처 기록 (data/theory.json)

작성일: 2026-11-27 (같은 날 독립 사실 검증 후 갱신 — 검증 기록은 `data/THEORY_VERIFICATION.md`).
개념마다 "어떤 문장이 어떤 출처에 기대는지"를 적는다.

## 확인 방법
- 모든 출처는 2026-11-27에 `curl`로 직접 내려받아 본문에서 해당 문장을 찾아 읽었다 (**[본문 확인]**).
  이전 판의 [검색 확인] 표시는 모두 본문 확인으로 바뀌었다. PDF(OpenAI 에이전트 가이드, RAG 논문)는 `pdftotext`로 읽었다.
- 리다이렉트되는 주소는 최종 주소로 바꿔 적었다.
- 비유(analogy)와 "바로 해보기"(tryIt)는 설명 장치라 출처를 따로 달지 않는다. 다만 본문과 어긋나지 않는지, 개인정보를 넣게 하지 않는지 검사했다.
- 숫자·가격·벤치마크·제품 버전은 쓰지 않는다. 예외: 트랜스포머 논문 발표 연도(2017, 고정된 역사적 사실).
- 문단 번호는 body 배열 순서(1부터).

---

## 입문자

### llm-predicts-next-word (core) — AI는 '다음 말'을 예측하는 기계예요
- 1문단 "LLM은 많은 글로 학습, 크다(매개변수가 많다)": Anthropic Glossary LLM "many parameters… trained on vast amounts of text data"
- 2문단 "앞의 글을 보고 다음 말을 예측, 반복": Anthropic Glossary Pretraining "pretrained to predict the next word, given the previous context"; OpenAI Help "predict the next most likely word when generating a response, one word at a time"
- 2문단 "만들어지는 대로 보여 줘서 조금씩 나타남": 위 문장(한 번에 하나씩 생성) + Anthropic Reducing latency의 스트리밍 설명(cost-speed-quality 참고)
- 3문단 "토큰은 낱말 또는 조각, 언어에 따라 수가 다름": Anthropic Glossary Tokens "words, subwords, characters… depends on the model and the language"; Google MLCC LLM "Tokens… represent words, subwords, or characters"
- 4문단 "무작위성이 있어 같은 질문에도 답이 달라짐": OpenAI Help "inherent element of randomness… the same question may yield different answers"
- 4문단 "사실인지 하나하나 확인하고 말하는 것은 아님": OpenAI "Why language models hallucinate" "there are no 'true/false' labels attached to each statement"

### ai-can-be-wrong — AI도 틀려요
- 1문단 "사실 아닌 내용을 자신 있게 = 환각, 논문 제목·생일 예": OpenAI "a model confidently generates an answer that isn't true", 논문 제목·생일 예시; Google Cloud "incorrect or misleading results"; Anthropic Reduce hallucinations "factually incorrect… known as 'hallucination'"
- 2문단 "다음 말 예측에서 비롯, 아직 완전히 없애지 못함": OpenAI "originate from next-word prediction", "they still occur"
- 3문단 "중요한 정보는 확인, 출처 속 내용 확인": Anthropic "Always validate critical information"; "Verify with citations… find a supporting quote"
- 4문단 "모르면 모른다고·근거 문장, 크게 줄이지만 완전히 막지 못함": Anthropic "Allow Claude to say 'I don't know'", "direct quotes", "significantly reduce hallucinations, they don't eliminate them entirely"

### prompt-basic-structure — 좋은 질문의 기본 구조
- 2문단 "상황·요청·형식, 꼭 필요한 건 요청": Microsoft Support "Get started writing prompts in Microsoft Copilot" — Goal·Context·Source·Expectations, "all that's required is a clear goal"
- 2문단 "역할": Anthropic Prompting best practices "Give Claude a role… focuses Claude's behavior and tone"
- 4문단 "사정을 모르는 새 직원, 자세할수록 좋음": Anthropic "brilliant but new employee who lacks context… The more precisely you explain what you want, the better the result"; Microsoft "Expect some back-and-forth"

### do-not-share-sensitive-info — AI에게 넣으면 안 되는 정보
- 1문단 "서버에 저장, 설정에 따라 학습에 쓰일 수 있음, 서비스·설정마다 다름": OpenAI Data controls "choose whether your conversations help train", "data sharing is enabled by default" (개인 Free/Plus/Pro), "Available controls depend on… your plan"; Anthropic Privacy Center "if you choose to allow us"; Gemini Privacy Notice "retain your data for different periods of time"
- 2문단 "사람이 일부를 검토": Gemini "Human reviewers… review some of the data"
- 3문단 "기밀 넣지 말 것": Gemini "Please don't enter confidential information that you wouldn't want a reviewer to see"
- 4문단 "학습 끄기 설정이 있음": OpenAI "Turn off Improve the model for everyone"
- 4문단 "꺼도 안전 점검 등으로 저장·검토될 수 있음, 되돌리기 어려움": Gemini "Regardless of your settings, Google uses your chats to… protect… including with help from human reviewers", "Chats reviewed by human reviewers… are not deleted when you delete your history… retained for up to three years"; Anthropic "Your conversations are flagged for safety review (in which case we may use or analyze them…)"; OpenAI 임시 채팅 "may be retained for up to 30 days for safety purposes"
- tryIt "허용 여부를 확인하고 끌 수 있음": OpenAI Data controls 설정 경로; Anthropic Privacy Center

### generative-ai-map — 생성형 AI 지도
- 1~2문단 "생성형 AI는 글·이미지·음악·음성·영상 같은 새 콘텐츠를 만듦": Google Cloud Multimodal AI "Generative AI is an umbrella term for the use of ML models to create new content, like text, images, music, audio, and videos"; Microsoft Learn "Generative AI powers applications that can create content, answer questions, and assist with tasks"
- 3문단 "사진·음성 등 여러 입력을 함께 = 멀티모달": Google Cloud "processing information from multiple modalities, including images, videos, and text"; OpenAI Image Inputs FAQ "Upload a photo to start. Ask about objects in images"
- 4문단 "그럴듯해도 틀릴 수 있음": ai-can-be-wrong 출처와 같음

## 활용자

### context-is-working-memory (core) — 컨텍스트는 AI의 작업 기억
- 1문단 "질문·이전 대화·파일·기본 지시가 들어감": Anthropic Context windows "Everything in the request counts toward the context window: the system prompt, every message… (including tool results, images, and documents)"
- 2문단 "한계 = 컨텍스트 윈도우, 학습 데이터와 다른 작업 기억": 같은 문서·Glossary "different from the large corpus of data… a 'working memory'"
- 3문단 "많을수록 좋은 건 아님, 정확히 떠올리기 어려워짐": "more context isn't automatically better… accuracy and recall degrade… context rot… curating what's in context just as important"
- 4문단 "요약해서 새로 시작, 앞 이야기를 놓칠 때": Anthropic Effective context engineering "Compaction… summarizing its contents, and reinitiating a new context window with the summary"; Context windows "Chat interfaces such as claude.ai can also manage the context window on a rolling 'first in, first out' basis"

### prompt-iteration — 프롬프트는 다듬을수록
- 2문단 "예시가 효과적, 몇 개, 서로 다르게": Anthropic "Examples are one of the most reliable ways…", "Include 3–5 examples", "Diverse… so Claude doesn't pick up unintended patterns"; Google MLCC tuning "providing examples or instructions within the prompt"
- 3문단 "단계를 나눠 중간 결과 확인": Anthropic "Chain complex prompts… useful when you need to inspect intermediate outputs"
- 4문단 "이유도 함께": Anthropic "Providing context or motivation behind your instructions"

### give-your-own-materials — 내 자료를 주면
- 1문단 "모르면 지어내기도": ai-can-be-wrong 출처와 같음
- 2문단 "긴 문서는 앞에, 질문은 뒤에 (Anthropic 안내)": Anthropic Prompting best practices "Put long-form data at the top… Queries at the end can improve response quality"
- 3문단 "프로젝트에 자료와 지시를 모아 둠, 그 공간의 대화에서 참고": Claude Help "What are projects?" "upload relevant documents… to a project's knowledge base, which Claude will use… for your individual chats within that project", "define project instructions"
- 4문단 "자료 안에서만 답하게 하면 짐작이 줄어듦": Anthropic Reduce hallucinations "External knowledge restriction: Explicitly instruct Claude to only use information from provided documents"

### from-chatbot-to-agent — 챗봇에서 에이전트로
- 1문단 "챗봇(어시스턴트)은 사용자 지시에 반응": Google Cloud "AI assistants are less autonomous, requiring user input and direction"
- 2문단 "목표를 받아 스스로 순서·도구, 정해진 순서(워크플로)와 다름": Anthropic Building effective agents "Workflows… predefined code paths. Agents… dynamically direct their own processes and tool usage"; Google Cloud "pursue goals and complete tasks on behalf of users"
- 2문단 "중간 결과를 보고 다음 행동": Anthropic "gain 'ground truth' from the environment at each step"
- 3문단 "도구·권한 안에서 움직이도록 만듦": OpenAI 에이전트 가이드 "strict access controls", Tool safeguards (read-only vs. write access, required account permissions)
- 4문단 "되돌리기 어려운 일·결제는 사람 확인": OpenAI 가이드 "High-risk actions: Actions that are sensitive, irreversible, or have high stakes should trigger human oversight… making payments"; Anthropic "pause for human feedback at checkpoints"

### how-ai-learns — 사전학습과 미세조정
- 1문단 "크게 두 단계, 사전학습 = 다음 말 맞히기, 공개 인터넷 글 등": Anthropic Glossary Pretraining; OpenAI Help "pre-training, and post-training", "information that is publicly available on the internet"
- 2문단 "사전학습만으로는 질문 답변·지시 따르기에 서툼": Anthropic Glossary "not inherently good at answering questions or following instructions"
- 3문단 "미세조정 = 추가 자료로 더 학습": Anthropic Glossary Fine-tuning "further training a pretrained language model using additional data"; Google MLCC tuning
- 3문단 "순위를 매겨 높은 답을 닮도록(RLHF)": Anthropic Glossary RLHF "ranking a set of two or more example texts… prefer outputs that are similar to the higher-ranked ones"
- 4문단 "OpenAI 설명: 사본을 저장하지 않고 매개변수가 바뀜": OpenAI Help "These models do not store or retain copies of the data they are trained on… the values of its parameters are adjusted slightly"
- 4문단 "덕분에 대화하듯 답함": Anthropic Glossary RLHF "act more like a chatbot"

### no-code-ai-tools — 코딩 없이 만드는 AI 도구
- 2문단 "프로젝트: 지시를 적고 파일을 올림, 그 공간의 대화에서 참고": Claude Help "What are projects?" (위 문장들)
- 2문단 "이런 기능은 이름과 모양이 자주 바뀜": Google Gemini Help "About the transition from Gems to skills" "Starting in November 2026, Gems will transition to skills"; Claude Help "A new version of projects is now available in beta"
- 3문단 "Copilot Studio: 로우코드로 에이전트, 말로 설명해 만들기, 흐름 짜기, 시험 후 게시": Microsoft Learn "graphical, low-code studio for building… agents and workflows", "create an agent by describing it in plain language, then test it before you publish", "drag-and-drop designer"
- 주의: Gemini 'Gem'(2026-11부터 스킬로 전환)과 OpenAI 맞춤 GPT는 바뀌는 중이라 본문 예시에서 뺐다.

## 실무자

### rag-search-then-answer (core) — RAG
- 1문단 "검색 증강 생성 = 답하기 전에 관련 자료를 찾아 줌": Lewis et al. 2020 (arXiv 2005.11401) 초록 "retrieval-augmented generation (RAG)"; Anthropic Glossary RAG "relevant information first must be retrieved… then passed to the model along with the original query"
- 2문단 "작은 조각, 관련 조각을 질문과 함께, 뜻 비슷함 + 낱말 일치를 함께": Anthropic Contextual retrieval "Break down the knowledge base… into smaller chunks", "searching by semantic similarity", "combining the embeddings and BM25 techniques"(BM25 = exact word matches)
- 3문단 "최신·내부 자료, 재학습 없이": Lewis et al. 본문(PDF) "the retrieval index can be hot-swapped to update the model without requiring any retraining"; Anthropic Glossary "access and use information beyond its training data… up-to-date information"
- 3문단 "근거 보여 주기 쉬움": Anthropic Glossary "explicit citation of sources"
- 4문단 "엉뚱한 자료면 답도 엉뚱": Google Cloud RAG "If your retrieved information is irrelevant, your generation could be grounded but off-topic or incorrect"; Anthropic Glossary "effectiveness of RAG depends on the quality and relevance… of the knowledge that is retrieved"

### tool-use-and-mcp — 도구 사용과 MCP
- 1문단 "모델만으로는 바깥 시스템에 못 닿음 → 도구 사용(함수 호출)": OpenAI Function calling "a powerful and flexible way for OpenAI models to interface with external systems and access data outside their training data"
- 2문단 "도구와 설명 → AI가 필요할 때 요청 → 프로그램이 실행하고 결과를 돌려줌": Anthropic Tool use "Claude determines when to call a tool based on the user's request and the tool's description. It then returns a structured call that your application runs", "Your code runs the operation and sends back a tool_result"
- 3문단 "MCP = 연결 방식을 맞춘 공개 규격, 제각각이던 연결을 하나로": modelcontextprotocol.io "open-source standard for connecting AI applications to external systems"; Anthropic "universal, open standard… replacing fragmented integrations with a single protocol"
- 비유 "USB-C": modelcontextprotocol.io "Think of MCP like a USB-C port for AI applications"
- 4문단 "읽기 전용 도구부터": OpenAI 에이전트 가이드 Tool safeguards "read-only vs. write access"(위험도 평가 기준)

### connect-ai-with-api — API로 연결
- 1문단 "프로그램이 AI를 직접 부르는 창구": Anthropic API overview "provides programmatic access to Claude models"
- 3문단 "키 공유 금지, 브라우저 코드·저장소에 넣지 말 것, 유출 시 즉시 교체": OpenAI "The sharing of API keys is against the Terms of Use", "Never deploy your key in client-side environments like browsers", "Never commit your key to your repository", "rotate your key immediately"
- 4문단 "쓴 만큼 요금": Anthropic Pricing (토큰 100만 개당 요금표)
- 4문단 "지출 한도, 알림만으로는 안 멈춤": OpenAI "Set monthly spend limits… and enable hard enforcement", "Spend alerts alone don't stop API traffic"

### evaluate-if-it-works — 평가
- 1문단 "한쪽을 고치면 다른 쪽이 나빠질 수 있음": Anthropic Building effective agents "optimizing for one kind of input can hurt performance on other inputs"; Demystifying evals "hope nothing else regressed"
- 2문단 "구체적·측정 가능한 성공 기준": Anthropic Define success criteria "Specific… Instead of 'good performance'…", "Measurable"
- 3문단 "까다로운 문제, 많을수록, 자동 채점, 바꿀 때마다 같은 시험": 같은 문서 "Don't forget to factor in edge cases!", "Prioritize volume over quality", "Automate when possible"; Demystifying evals "automatically test changes against hundreds of scenarios before shipping"
- 4문단 "정답 대조·사람·다른 AI 채점, AI 채점은 사람이 가끔 확인": Define success criteria "Exact match", "LLM-based grading", "Human grading"; Demystifying evals Model-based graders "Requires calibration with human graders for accuracy"

### guardrails-and-human-review — 가드레일과 사람 검토
- 2문단 "하나로는 부족해 여러 겹, 입력 검사·출력 검사, 권한 최소": OpenAI 에이전트 가이드 "While a single one is unlikely to provide sufficient protection, using multiple, specialized guardrails together…", Safety classifier·Relevance classifier(입력), PII filter·Output validation(출력), "strict access controls"
- 2문단 "요청 검사를 별도 AI가 하면 더 잘 됨": Anthropic Building effective agents "one model instance processes user queries while another screens them… tends to perform better"
- 3문단 "돈·되돌리기 어려움·여러 번 실패 시 사람에게": OpenAI 가이드 "Exceeding failure thresholds", "High-risk actions… irreversible… making payments"; OpenAI Safety best practices "Human in the loop"; Anthropic "pause for human feedback at checkpoints"
- 4문단 "처음엔 더 자주 확인": OpenAI 가이드 "especially important early in deployment", "until confidence in the agent's reliability grows"
- 4문단 "안전한 시험 환경": Anthropic "extensive testing in sandboxed environments, along with the appropriate guardrails"

### embeddings-meaning-as-numbers — 임베딩
- 1~2문단 "글을 숫자 묶음으로, 거리가 가까우면 뜻이 가까움": OpenAI Vector embeddings "a vector (list) of floating point numbers… Small distances suggest high relatedness"; Anthropic Embeddings "numerical representations of text that let you measure semantic similarity"; Google MLCC Embeddings (비슷한 음식이 가깝게 표현되는 예)
- 1문단 "수백~수천 개": OpenAI "1536… or 3072"; Anthropic 문서 Voyage 모델 차원 표(256~2048)
- 3문단 "검색·추천·묶기, RAG가 찾을 때": OpenAI "Search… Clustering… Recommendations"; Anthropic Contextual retrieval
- 4문단 "많으면 벡터 DB": OpenAI "save it in a vector database"

## 개발자

### context-engineering (core) — 컨텍스트 엔지니어링
- 1문단 "지시·도구·기록·결과가 쌓이고, 단계마다 무엇을 담을지 정함": Anthropic Effective context engineering "system instructions, tools… message history", "context engineering is iterative and the curation phase happens each time we decide what to pass to the model"
- 2문단 "한정된 자원, 많을수록 회상 저하, 가장 적은 고신호 정보": 같은 글 "context rot", "finite attention budget", "smallest possible set of high-signal tokens"
- 3문단 "지침 파일은 처음부터, 압축, 메모, 필요할 때 불러오기": 같은 글 "CLAUDE.md files are naively dropped into context up front", Compaction, Structured note-taking, "'just in time'… maintain lightweight identifiers (file paths…)"

### agent-loop — 에이전트 루프
- 1~2문단 "정보 모으기 → 행동 → 확인 → 반복": Claude Agent SDK 글 "gather context -> take action -> verify work -> repeat"; OpenAI Function calling (도구 결과를 모델에 돌려주는 흐름)
- 2문단 "단계 수를 미리 알기 어려운 일": Anthropic Building effective agents "open-ended problems where it's difficult or impossible to predict the required number of steps"
- 3문단 "규칙 검사·테스트로 스스로 고침": Agent SDK 글 "providing clearly defined rules for an output, then explaining which rules failed", "Code linting"; Anthropic "gain 'ground truth' from the environment at each step"
- 4문단 "멈추는 조건(최대 반복), 사람에게, 시간·비용": Anthropic "stopping conditions (such as a maximum number of iterations)", "pause for human feedback", "trade latency and cost"

### cost-speed-quality — 비용·속도·품질
- 1~2문단 "능력·속도·비용 균형, 작은 모델은 빠르고 저렴(분류·정보 뽑기), 쉬운 건 작은 모델·어려운 건 큰 모델": Anthropic Choosing the right model "balancing capabilities, speed, and cost", "faster, more cost-effective model", "pair a lower-cost model with a frontier model"; Anthropic Pricing(Haiku "classification, extraction, and routing"); Anthropic Building effective agents "Routing easy/common questions to smaller, cost-efficient models"
- 3문단 "입출력 줄이면 빠르고 저렴, 프롬프트 캐싱": Anthropic Reducing latency "Optimize prompt and output length"; Prompt caching "resume from specific prefixes… reduces processing time and costs"; OpenAI Latency optimization "Generate fewer tokens", "Use fewer input tokens"
- 4문단 "스트리밍으로 기다리는 느낌을 줄임": Anthropic Reducing latency "improve the perceived responsiveness"

### observability-eval-pipeline — 관측성과 평가 파이프라인
- 2문단 "트레이스에 도구 호출·입력·출력·시간": OpenAI Tracing "A trace shows… model responses, tool calls", "each step's recorded inputs, outputs, duration, and status"; Anthropic Demystifying evals "A transcript (also called a trace…)"
- 2문단 "대화 내용까지 담으면 민감 정보, 무엇을 남길지 정함": Anthropic OpenTelemetry "Metadata only… The default", "Full content… Spans include model prompts and responses"
- 3문단 "바꿀 때마다 자동 시험, 회귀 확인": Demystifying evals "regression tests", "automatically test changes against hundreds of scenarios before shipping"
- 4문단 "기록 직접 읽기, 채점 오류와 진짜 실수 구분, 실제 사용자 반응과 함께": 같은 글 "read the transcripts", "whether the agent made a genuine mistake or whether your graders rejected a valid solution", "Combined with production monitoring, A/B tests, user research"

### transformer-and-attention — 트랜스포머와 어텐션
- 1문단 "2017년 논문, 신경망 구조, 많은 LLM의 바탕": arXiv 1706.03762 "Submitted on 12 Jun 2017"; Google MLCC "the most successful and widely used architecture for building LLMs", "A decoder is also an enormous neural net"
- 2문단 "각 단어가 다른 단어의 중요도를 매김, 'it' 예": Google MLCC "How much does each other token of input affect the interpretation of this token?", "animal is more important than street to the pronoun it"
- 3문단 "예전 방식(RNN)은 차례로, 트랜스포머는 한꺼번에 → 학습 빠름, 먼 관계": Google Research 블로그 "processing language sequentially… Reading one word at a time… words far away", "speeding up training by up to an order of magnitude"; arXiv 초록 "more parallelizable and requiring significantly less time to train"
- 4문단 "글 생성 모델은 앞 단어만 보는 어텐션": Google MLCC "applications that generate sequences token-by-token require unidirectional self-attention"

### reasoning-models-and-rl — 추론 모델과 강화학습
- 1문단 "답하기 전 생각, 쪼개기·여러 방법·중간 점검": Anthropic Thinking "restates what is being asked, tries approaches, checks intermediate results"; OpenAI Learning to reason "o1 thinks before it answers"
- 2문단 "강화학습으로 생각 방법을 다듬음": OpenAI "trained with reinforcement learning to perform complex reasoning", "learns to hone its chain of thought"; "사람이 매긴 순위를 보상으로": Anthropic Glossary RLHF
- 3문단 "수학·코딩·다단계에서 개선, 실수 인식·방법 전환": Anthropic Thinking "complex tasks such as math, coding, analysis, and long-running agentic work"; OpenAI "recognize and correct its mistakes… try a different approach"
- 4문단 "생각도 토큰을 써서 비용, 깊이 조절": Anthropic Thinking "billed as output tokens", effort로 깊이 조절; OpenAI Reasoning models "internal reasoning tokens", `reasoning.effort`

---

## 출처를 찾지 못했거나 일부러 뺀 내용
- 제품 화면 이름(설정 메뉴 이름 등)은 바뀔 수 있어 "데이터"·"개인정보" 같은 일반 표현만 썼다.
- Gemini 'Gem'(2026-11부터 '스킬'로 전환)과 OpenAI 맞춤 GPT는 바뀌는 중이라 예시로 쓰지 않는다.
- "강화학습은 결과가 좋으면 보상을 주는 방식"(reasoning 2문단)은 강화학습의 일반 정의를 쉽게 푼 것으로, 인용한 페이지에 그 문장 그대로는 없다(SIMPLIFIED).
