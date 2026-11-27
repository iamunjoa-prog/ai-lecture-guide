# 3분 이론 사실 검증 기록 (data/theory.json)

검증일: 2026-11-27 · 검증 방식: 독립 검증자가 출처 50개(+교체·추가 후보 12개)를 `curl`로 직접 내려받아 본문을 읽고,
summary·body·analogy·tryIt 문장을 하나씩 대조했다. PDF 2개(OpenAI 에이전트 가이드, RAG 논문 전문)는 `pdftotext`로 읽었다.
WebSearch는 쓰지 않았다. "읽음 Y"는 해당 주장이 있는 부분을 직접 읽었다는 뜻이다(긴 문서는 관련 절 위주).

분류: SUPPORTED(출처 문장 확인) · SIMPLIFIED-OK(대중용으로 공정하게 줄인 말) · UNSUPPORTED · WRONG.
결과: ✅ 그대로 · ⚠️ 수정 · ❌ 출처 교체(본문 수정 포함 가능).

## 요약

| 결과 | 개수 | 개념 |
|---|---|---|
| ✅ 그대로 | 5 | context-is-working-memory, prompt-iteration, agent-loop, prompt-basic-structure(출처 주소만 갱신), reasoning-models-and-rl(따옴표 1곳) |
| ⚠️ 수정 | 15 | llm-predicts-next-word, ai-can-be-wrong, do-not-share-sensitive-info, from-chatbot-to-agent, how-ai-learns, rag-search-then-answer, tool-use-and-mcp, connect-ai-with-api, evaluate-if-it-works, guardrails-and-human-review, embeddings-meaning-as-numbers, context-engineering, cost-speed-quality, observability-eval-pipeline, transformer-and-attention |
| ❌ 출처 교체 | 3 | generative-ai-map, give-your-own-materials, no-code-ai-tools |

- 검사한 문장: 451개(summary·body·analogy·tryIt, 마침표 기준).
- 고친 문장: 약 43개(추가 문장 포함). 그중 **틀렸거나 근거가 없던 문장은 16개(약 3.5%)**, 나머지는 정확도·안전 문구 보강.
- 출처 HTTP 상태: 처음 50개 모두 200. 그중 6개는 다른 주소로 리다이렉트(아래 표시), 1개는 내용이 바뀌어 근거로 쓸 수 없었다.

---

## 입문자

### llm-predicts-next-word — ⚠️ 수정
출처: Google MLCC LLM 소개 200 (Y) · Anthropic Glossary 200 (Y) · OpenAI Why language models hallucinate 200 (Y) · **추가** OpenAI Help "How ChatGPT and our foundation models are developed" 200 (Y)
- SUPPORTED: LLM 정의("trained on vast amounts of text data"), 다음 말 예측("predict the next word, given the previous context"), 토큰("words, subwords, characters… depends on the model and the language"), 사실 확인 안 함("no 'true/false' labels").
- 변경 1 (WRONG): "답이 한 글자씩 화면에 나타나는 것도 이 때문이에요" → "답이 화면에 조금씩 이어서 나타나는 것도, 만들어지는 대로 바로 보여 주기 때문이에요". 생성 단위는 글자가 아니라 토큰("one word at a time", 토큰 단위)이고, 화면에 조금씩 뜨는 것은 스트리밍(보여 주는 방식) 때문이다.
- 변경 2 (WRONG): "AI의 답은 '가장 그럴듯한 말'입니다" → "'그럴듯한 말'을 이어 붙인 결과입니다. 고르는 과정에 무작위성이 조금 있어서, 같은 질문에도 답이 달라질 수 있어요". 근거: OpenAI Help "there is an inherent element of randomness… the same question may yield different answers"; Anthropic Glossary Temperature. 항상 '가장' 그럴듯한 말을 고르는 것은 아니다.
- 변경 3 (정확도): "말의 규칙을 익힌" → "말의 패턴을 익힌"("learning patterns"), "글을 읽는 단위" → "글을 읽고 쓰는 단위".
- 남은 위험: tryIt("너는 어떻게 답을 만들어?")에 대한 AI의 자기 설명은 부정확할 수 있다. 해롭지는 않아 그대로 뒀다.

### ai-can-be-wrong — ⚠️ 수정
출처: Anthropic Reduce hallucinations 200 (Y, 전문) · OpenAI Why language models hallucinate 200 (Y) · Google Cloud What are AI hallucinations 200 (Y)
- SUPPORTED: "confidently generates an answer that isn't true", "they still occur", "Always validate critical information", "significantly reduce hallucinations, they don't eliminate them entirely".
- 변경 1 (SIMPLIFIED→정확): "없는 책 제목이나 틀린 날짜" → "있지도 않은 논문 제목이나 틀린 생일". 출처의 실제 예시("title of the PhD dissertation… his birthday")에 맞춤.
- 변경 2 (안전 조언 불완전): "링크가 실제로 열리는지도 확인" → "링크가 실제로 열리는지, 그 안에 정말 그 내용이 있는지도 확인". 링크가 열려도 내용이 답을 받치지 않을 수 있다. 근거: "find a supporting quote… If it can't find a quote, it must retract the claim".

### prompt-basic-structure — ✅ 그대로 (출처 주소만 갱신)
출처: Anthropic Prompting best practices 200 (Y) · Microsoft Support 200, **리다이렉트** → "Get started writing prompts in Microsoft Copilot" (Y)
- SUPPORTED: Goal·Context·Source·Expectations, "all that's required is a clear goal"; "Give Claude a role"; "brilliant but new employee who lacks context… The more precisely you explain what you want, the better the result".
- SIMPLIFIED-OK: 마이크로소프트의 4요소(목표·맥락·자료·기대)와 Anthropic의 '역할'을 합쳐 '역할·상황·요청·형식'으로 묶은 것은 공정한 단순화다.
- 변경: 출처 제목·URL을 리다이렉트된 최종 페이지로 교체(내용은 같은 주제).

### do-not-share-sensitive-info — ⚠️ 수정
출처: OpenAI Data controls 200, **리다이렉트**(제목이 "Data controls in ChatGPT"로 바뀜) (Y) · Anthropic Privacy Center 200 (Y) · Gemini Apps Privacy Notice 200 (Y)
- SUPPORTED: 학습 사용 선택("choose whether your conversations help train"), 사람 검토("Human reviewers… review some of the data"), "Please don't enter confidential information…".
- 변경 1 (UNSUPPORTED/안전 조언 불완전): 4문단이 "학습 끄기 설정"만 안내해, 끄면 안전하다고 읽힐 수 있었다. 추가: "다만 학습 사용을 꺼 두어도 안전 점검 등을 위해 대화가 저장되거나 사람이 검토할 수 있어요." 근거: Gemini "Regardless of your settings, Google uses your chats to… protect… including with help from human reviewers", "Chats reviewed by human reviewers… are not deleted when you delete your history… retained for up to three years"; Anthropic "Your conversations are flagged for safety review (in which case we may use or analyze them…)".
- 변경 2 (UNSUPPORTED): 앞 판의 근거 문장("Anthropic: 설정을 꺼도 이미 시작된 학습에 남음")은 현재 페이지에 없었다. "이미 보낸 내용은 되돌리기 어려우니"는 Gemini의 3년 보관 문장으로 받친다.
- 변경 3 (과장): tryIt "내 대화가 학습에 쓰이는지 직접 확인할 수 있어요" → "학습에 쓰도록 허용돼 있는지 확인하고, 원하면 끌 수 있어요". 설정은 '허용 여부'를 보여 줄 뿐, 실제 쓰였는지를 보여 주지 않는다. 참고: 개인 ChatGPT는 "data sharing is enabled by default".
- 남은 위험: 각 회사 정책은 자주 바뀐다(OpenAI 페이지 "Updated: 7 hours ago").

### generative-ai-map — ❌ 출처 교체
출처: Google Cloud "What is generative AI?" 200이지만 **리다이렉트 → cloud.google.com/ai/generative-ai (제품 홍보 페이지)**, 생성형 AI 정의 문장이 없어 근거로 부적합 → **교체**: Google Cloud "Multimodal AI" 200 (Y) · Microsoft Learn 모듈 200, 리다이렉트(en-us 경로) (Y, 개요만 있음) · **추가** OpenAI "ChatGPT Image Inputs FAQ" 200 (Y)
- SUPPORTED: "Generative AI is an umbrella term for the use of ML models to create new content, like text, images, music, audio, and videos"; 멀티모달 "processing information from multiple modalities, including images, videos, and text"; "Upload a photo to start. Ask about objects in images".
- SIMPLIFIED-OK: "검색과 달리 새 결과물을 만든다", 음성 AI(읽어 주기·받아 적기) 설명.
- 변경 (안전): tryIt "풍경 사진" → "사람 얼굴이나 개인 정보가 없는 풍경 사진".

## 활용자

### context-is-working-memory — ✅ 그대로
출처: Anthropic Glossary 200 (Y) · Anthropic Context windows 200 (Y) · Anthropic Effective context engineering 200 (Y)
- SUPPORTED 전부: "all the text a language model can reference when generating a response", "Everything in the request counts… the system prompt… documents", "a 'working memory'", "more context isn't automatically better… context rot", compaction. "앞 이야기를 놓친다"는 "rolling 'first in, first out' basis"로도 받친다.

### prompt-iteration — ✅ 그대로
출처: Anthropic Prompting best practices 200 (Y) · Google MLCC tuning 200 (Y)
- SUPPORTED: "Examples are one of the most reliable ways…", "Include 3–5 examples", "Diverse… unintended patterns", "Chain complex prompts… inspect intermediate outputs", "context or motivation behind your instructions".

### give-your-own-materials — ❌ 출처 교체
출처: Claude Help "What are projects?" 200 (Y) · Anthropic Reduce hallucinations 200 (Y) · Anthropic news "Collaborate with Claude on Projects" 200 (Y) — 2024년 발표문으로 "Pro and Team users"만 쓸 수 있다는 등 지금과 다른 내용이 있어 **교체** → Anthropic Prompting best practices(본문 2문단 주장의 실제 출처) (Y)
- 변경 (UNSUPPORTED): "문서를 앞에, 질문을 뒤에 두는 게 좋다고 AI 회사들은 권합니다" → "…두면 답이 나아질 수 있다고 Claude를 만든 Anthropic은 안내합니다". 확인한 근거는 Anthropic 한 곳("Put long-form data at the top… Queries at the end can improve response quality")뿐이라 복수형 '회사들'은 근거가 없었다.
- SUPPORTED: 프로젝트 지식·지시("upload relevant documents… knowledge base… define project instructions"), 자료 안에서만 답하게 하기("only use information from provided documents").
- 남은 위험: 프로젝트 기능은 새 버전(beta)으로 옮겨 가는 중이다.

### from-chatbot-to-agent — ⚠️ 수정
출처: Anthropic Building effective agents 200 (Y) · Google Cloud What is an AI agent 200 (Y) · OpenAI A practical guide to building agents (PDF) 200 (Y, 전문 — 앞 판은 검색 요약만 봤음)
- SUPPORTED: workflows vs agents("predefined code paths" / "dynamically direct their own processes and tool usage"), "AI assistants are less autonomous, requiring user input", 고위험·되돌릴 수 없는 일 사람 확인("irreversible… making payments").
- 변경 1 (SIMPLIFIED 보강): "챗봇은 묻는 말에 대답하는 AI" → "챗봇은 기본적으로 …". 요즘 챗봇 다수가 검색 등 도구를 쓰기 때문.
- 변경 2 (절대 표현): "물론 연결된 도구와 허락된 권한 안에서만 움직입니다" → "…안에서만 움직이도록 만들어요". 권한 제한은 저절로 보장되는 사실이 아니라 설계해야 하는 것이다(OpenAI 가이드 "strict access controls", tool safeguards).

### how-ai-learns — ⚠️ 수정
출처: Anthropic Glossary 200 (Y) · OpenAI Help "How ChatGPT… are developed" 200 (Y) · Google MLCC tuning 200 (Y)
- SUPPORTED: 사전학습 정의, "not inherently good at answering questions or following instructions", 공개 인터넷 정보, 미세조정 정의("further training… using additional data"), RLHF("ranking… prefer outputs that are similar to the higher-ranked ones").
- 변경 1 (WRONG에 가까운 부정확): "이 과정을 '미세조정'이라고 합니다… 사람이 더 나은 것을 고르면…" → "이때 쓰는 대표적인 방법이 '미세조정'입니다… 순위가 높은 답을 닮도록 배우게 하는 방법(RLHF)도 함께 씁니다". Anthropic은 "Fine-tuning and RLHF are used to refine"로 둘을 구분하고, OpenAI는 둘째 단계를 "post-training"이라 부른다.
- 변경 2 (절대 표현): "모델은 읽은 글을 그대로 저장해 두지 않습니다" → "OpenAI는 모델이 읽은 글의 사본을 저장해 두지 않는다고 설명합니다". 출처는 한 회사의 설명("do not store or retain copies")이라 주어를 밝혔다.
- 변경 3: "크게 두 단계" → "크게 보면 두 단계"(실제로는 데이터 준비·평가 등 단계가 더 있음).

### no-code-ai-tools — ❌ 출처 교체
출처: Google Gemini Help "Use Gems in Gemini Apps" 200 (Y) — 페이지 맨 위 "Starting in November 2026, Gems will go away on personal Google accounts and automatically transition to skills" → **본문 예시가 오늘 기준으로 낡음**. 교체 → "About the transition from Gems to skills" 200 (Y) · Claude Help "What are projects?" 200 (Y) · Microsoft Learn Copilot Studio 200, **리다이렉트** → fundamentals-what-is-copilot-studio (Y)
- 변경 1 (WRONG/낡음): "Gemini의 'Gem'이나 Claude의 '프로젝트'가 그런 예입니다" → "Claude의 '프로젝트'가 그런 예입니다" + "이런 기능은 이름과 모양이 자주 바뀌니, 쓰는 서비스의 도움말을 확인하세요." (근거: Gems→skills 전환 안내, Claude 프로젝트 새 버전 beta 안내)
- 변경 2: "그 지시와 자료를 바탕으로 답합니다" → "그 공간의 대화에서 지시와 자료를 참고해 답합니다"(프로젝트 범위를 정확히).
- SUPPORTED: Copilot Studio "low-code", "create an agent by describing it in plain language, then test it before you publish", "drag-and-drop designer".
- termIds: `vibe-coding`(본문에 없음) → `project-knowledge`.
- 남은 위험: `data/glossary.json`의 `custom-assistant` 용어 이름이 "커스텀 GPT·Gems"다. 이 파일은 이번 작업 범위 밖이라 고치지 않았다(아래 '남은 위험' 참고).

## 실무자

### rag-search-then-answer — ⚠️ 수정
출처: arXiv 2005.11401 200 (Y, 초록 + PDF 전문에서 해당 절) · Anthropic Contextual retrieval 200 (Y) · Google Cloud RAG 200 (Y)
- SUPPORTED: 조각(chunks)·임베딩·벡터 DB 흐름, 재학습 없이 갱신("hot-swapped to update the model without requiring any retraining" — 앞 판은 검색 요약으로만 확인), "If your retrieved information is irrelevant, your generation could be grounded but off-topic or incorrect".
- 변경 (불완전): "낱말이 같은지보다 뜻이 비슷한지를 보는 방법을 자주 씁니다" → "뜻이 비슷한 글을 찾는 방법을 자주 쓰고, 낱말이 똑같은 글을 찾는 방법을 함께 쓰기도 합니다". 근거: "embedding models… can miss crucial exact matches… combining the embeddings and BM25"; Google "hybrid search".

### tool-use-and-mcp — ⚠️ 수정
출처: Anthropic Tool use 200 (Y) · modelcontextprotocol.io/introduction 200, **리다이렉트** → 버전이 붙은 소개 페이지 (Y) → 버전 없는 `/docs/getting-started/intro`로 갱신 · Anthropic Introducing MCP 200 (Y) · OpenAI Function calling 200 (Y)
- 변경 1 (WRONG): "AI는 원래 글만 주고받습니다" → "AI 모델은 원래 대화 속에서 답을 만들어 낼 뿐입니다". 요즘 모델은 이미지 등도 받는다(멀티모달).
- 변경 2 (WRONG, 논리 순서): "이때 쓰는 방법이 '도구 사용'입니다. 그래서 바깥 세상과 이어 줄 장치가 필요해요." — 결론이 이유보다 앞서 '이때'가 가리키는 것이 없었다. 순서를 바꿈.
- 변경 3 (정확도): "실제 실행은 프로그램이 하고" → "실제 실행은 AI가 아니라 연결된 프로그램이 맡고". 근거: "returns a structured call that your application runs (client tools) or that Anthropic runs (server tools)".
- SUPPORTED: MCP "open-source standard for connecting AI applications to external systems", USB-C 비유, "replacing fragmented integrations with a single protocol". 4문단 "읽기 전용부터"는 OpenAI 가이드의 위험도 기준("read-only vs. write access")과 맞는다(그 출처는 guardrails 개념에 달림).

### connect-ai-with-api — ⚠️ 수정
출처: Anthropic API overview 200 (Y) · OpenAI Best practices for API key safety 200 (Y, 전문) · **추가** Anthropic Pricing 200 (Y)
- SUPPORTED: "programmatic access", 키 공유 금지("against the Terms of Use"), 브라우저 금지, 저장소 커밋 금지, "rotate your key immediately", 쓴 만큼 요금(토큰당 요금표).
- 변경 (안전 조언 불완전): 지출 한도 문장 보강 — "알림만 켜 두면 사용이 멈추지 않으니, 한도에서 실제로 멈추는 설정인지도 확인하세요". 근거: "enable hard enforcement… Spend alerts alone don't stop API traffic".
- 출처 추가 이유: "쓴 만큼 요금" 문장에 직접 근거가 없었다.

### evaluate-if-it-works — ⚠️ 수정
출처: Anthropic Define success criteria 200 (Y) · Anthropic Demystifying evals 200 (Y)
- SUPPORTED: "Instead of 'good performance'…", "Don't forget to factor in edge cases!", "Prioritize volume over quality", "Automate when possible", exact match·LLM 채점·사람 채점.
- 변경 (안전/정확도 보강): "AI에게 채점을 맡길 때는 가끔 사람이 직접 보며 채점이 맞는지 살펴보세요" 추가. 근거: Model-based graders "Requires calibration with human graders for accuracy".

### guardrails-and-human-review — ⚠️ 수정
출처: OpenAI 에이전트 가이드 PDF 200 (Y, 전문) · OpenAI Safety best practices 200 (Y) · Anthropic Building effective agents 200 (Y)
- 앞 판에서 "검색 요약 기준"이던 문장(여러 겹, 실패 횟수, 고위험 작업)을 PDF 본문에서 모두 확인: "layered defense mechanism", "Exceeding failure thresholds", "High-risk actions… irreversible… making payments", "especially important early in deployment".
- 변경 (정확도): "가드레일은 여러 겹으로 둡니다" → "가드레일 하나만으로는 충분하지 않아서 여러 겹으로 둡니다". 근거: "While a single one is unlikely to provide sufficient protection…". 가드레일이 완벽하다는 인상을 줄이려는 수정.

### embeddings-meaning-as-numbers — ⚠️ 수정
출처: OpenAI Vector embeddings 200 (Y) · Google MLCC Embeddings 200 (Y) · Anthropic Embeddings 200 (Y)
- SUPPORTED: "vector (list) of floating point numbers… Small distances suggest high relatedness", 쓰임(검색·묶기·추천), 벡터 DB.
- 변경 1 (정확도): "수백 개가 넘는 숫자" → "수백에서 수천 개의 숫자"(OpenAI 1536·3072, Voyage 256~2048).
- 변경 2 (절대 표현): '강아지 사료'/'반려견 먹이' 예는 출처에 없는 설명용 예라 "보통 가까운 자리에"로 완화.
- 참고: Anthropic 문서는 "Anthropic does not offer its own embedding model"이라 밝히고 Voyage AI를 안내한다. 본문은 특정 회사를 말하지 않아 문제없다.

## 개발자

### context-engineering — ⚠️ 수정
출처: Anthropic Effective context engineering 200 (Y) · Anthropic Context windows 200 (Y)
- SUPPORTED: "curation phase happens each time we decide what to pass to the model", "context rot", "smallest possible set of high-signal tokens", compaction·note-taking·just in time.
- 변경 (termId 맞춤): termIds의 `instruction-file`이 본문에 없었다. 출처 문장("CLAUDE.md files are naively dropped into context up front")에 따라 "프로젝트 규칙을 적은 지침 파일은 처음부터 넣어 둬요"를 3문단에 추가.

### agent-loop — ✅ 그대로
출처: Claude Agent SDK 글(claude.com) 200 (Y) · Anthropic Building effective agents 200 (Y) · OpenAI Function calling 200 (Y)
- SUPPORTED 전부: "gather context -> take action -> verify work -> repeat", "difficult or impossible to predict the required number of steps", 규칙·린트 피드백, "stopping conditions (such as a maximum number of iterations)", "trade latency and cost".

### cost-speed-quality — ⚠️ 수정
출처: Anthropic Choosing the right model 200 (Y) · Reducing latency 200 (Y) · Prompt caching 200 (Y) · OpenAI Latency optimization 200 (Y) · **추가** Anthropic Pricing 200 (Y)
- SUPPORTED: "balancing capabilities, speed, and cost", "pair a lower-cost model with a frontier model", "Optimize prompt and output length", 캐싱 "resume from specific prefixes… reduces processing time and costs", 스트리밍 "perceived responsiveness".
- 변경 (UNSUPPORTED): 작은 모델이 "간단한 분류나 요약"에 맞는다 → "간단한 분류나 정보 뽑기". 출처 표현은 "classification, extraction, and routing"(요약은 없음).
- SIMPLIFIED-OK: "큰 모델은 대체로 더 느리고 비싸다"(요금표·"size of the model"이 지연에 영향).

### observability-eval-pipeline — ⚠️ 수정
출처: OpenAI Tracing 200 (Y) · Anthropic Demystifying evals 200 (Y) · **추가** Anthropic OpenTelemetry 200 (Y)
- SUPPORTED: 트레이스 내용("model responses, tool calls… inputs, outputs, duration, and status"), 회귀 시험, "read the transcripts", "genuine mistake or… graders rejected a valid solution", "Combined with production monitoring, A/B tests, user research".
- 변경 (UNSUPPORTED by 인용 출처): 앞 판은 "민감 정보" 문장을 OpenAI Tracing의 민감 데이터 옵션으로 받쳤지만, 현재 해당 페이지에는 그런 내용이 없다. Anthropic OpenTelemetry("Metadata only… The default", "Full content… Spans include model prompts and responses")로 근거를 바꾸고 문장도 "기록에 대화 내용까지 담으면 민감한 정보도 남을 수 있으니, 무엇을 남길지 미리 정해 둡니다"로 맞췄다.

### transformer-and-attention — ⚠️ 수정
출처: arXiv 1706.03762 200 (Y) · Google Research 블로그 200 (Y) · Google MLCC transformers 200 (Y)
- SUPPORTED: 2017년("Submitted on 12 Jun 2017"), self-attention 정의, 'it' 예, RNN 순차 처리·학습 속도("speeding up training by up to an order of magnitude"), 생성 모델의 단방향 어텐션.
- 변경 1 (WRONG, 본문과 모순): 비유 "모든 단어가 동시에 서로를 살펴본다" → "이 일을 여러 단어에 대해 한꺼번에 계산한다". 4문단(글 생성 모델은 앞 단어만 봄)과 어긋났다.
- 변경 2 (오해 유발): tryIt "'그녀'가 누구인지 어떻게 아는지 어텐션으로 설명해 줘" → "이 문장을 예로 들어, 어텐션이 무엇인지 쉽게 설명해 줘". 챗봇은 자기 내부 어텐션 값을 보고 답할 수 없어, 앞 질문은 AI가 자기 속을 들여다볼 수 있다는 오해를 줄 수 있다.
- 변경 3 (과장 완화): "알아내는 식" → "알아내는 데 도움을 주는 식"(출처도 "would hopefully rate"라고 조심스럽게 씀), "바로 이 구조 위에서" → "대부분 이 구조 위에서".
- 변경 4 (termId 맞춤): `neural-network`가 본문에 없어 "'트랜스포머'라는 신경망 구조"로 표기(출처 "A decoder is also an enormous neural net").

### reasoning-models-and-rl — ✅ 그대로 (표기 1곳)
출처: OpenAI Learning to reason with LLMs 200 (Y) · Anthropic Thinking 200 (Y) · OpenAI Reasoning models 200 (Y)
- SUPPORTED: "trained with reinforcement learning to perform complex reasoning", "recognize and correct its mistakes… break down tricky steps… try a different approach", "restates what is being asked, tries approaches, checks intermediate results", "billed as output tokens", effort 조절.
- SIMPLIFIED-OK: "결과가 좋으면 보상을 주는 방식"(강화학습 일반 정의, 출처에 그 문장 그대로는 없음).
- 변경(표기만): "먼저 생각하는 단계" → "먼저 '생각'하는 단계" — 사람의 생각과 같다는 인상을 줄이려 따옴표를 붙임.

---

## 전체 평가

### 오류율
- 검사 문장 451개 중 **틀리거나 근거가 없던 문장 16개(약 3.5%)**. 여기에 근거는 있지만 덜 정확하거나 안전 문구가 빠져 손본 문장이 약 27개 더 있다(합계 약 43개 수정).
- 출처 50개 중 근거로 쓸 수 없던 것 3개(제품 홍보 페이지로 리다이렉트 1, 낡은 기능 안내 1, 낡은 2024년 발표문 1), 인용한 내용이 현재 페이지에 없던 것 1개(OpenAI Tracing의 민감 데이터 옵션), 리다이렉트로 주소만 바꾼 것 5개.

### 가장 심각했던 오류 (솔직하게)
1. **개인정보 안내의 빈틈 (do-not-share-sensitive-info)**: "학습에 쓰지 않기" 설정만 안내해, 끄면 대화가 안전하다고 읽혔다. 실제로는 설정과 관계없이 안전 점검 목적의 저장·사람 검토가 있고(Gemini는 검토된 대화를 최대 3년 보관), tryIt은 "학습에 쓰이는지 직접 확인할 수 있다"고 과장했다. 대중에게 가장 영향이 큰 오류였다.
2. **낡은 제품 예시 (no-code-ai-tools)**: 오늘(2026-11-27) 기준 Gemini 'Gem'은 개인 계정에서 '스킬'로 전환 중인데 대표 예시로 안내하고 있었다.
3. **토큰·생성 방식 설명 (llm-predicts-next-word)**: "한 글자씩 나타난다", "가장 그럴듯한 말"은 핵심 개념(토큰, 무작위성)을 잘못 심을 수 있었다. 수준별 core 개념이라 노출이 많다.
4. **도구 사용 1문단의 논리 순서와 "글만 주고받는다"**(tool-use-and-mcp), **트랜스포머 비유가 본문과 모순**(transformer-and-attention).
5. 앞 판 출처 기록의 상당 부분이 [검색 확인](검색 요약)이었다. 이번에 모두 본문으로 확인했고, 그중 1건(OpenAI Tracing)은 실제 페이지에 없는 내용이었다.

### 남은 위험
- **정책·제품 변화**: 개인정보 설정, 프로젝트·Gem·Copilot Studio 같은 제품 기능은 몇 달 안에 바뀔 수 있다. 특히 do-not-share-sensitive-info, give-your-own-materials, no-code-ai-tools는 분기마다 다시 보는 것이 좋다.
- **범위 밖 파일**: `data/glossary.json`의 `custom-assistant` 용어명 "커스텀 GPT·Gems (맞춤 AI 비서)"는 Gems 전환으로 낡았다. 이번 작업에서 수정 권한이 없어 그대로 두었다.
- **긴 문서의 부분 읽기**: OpenAI Function calling(14만 자), Embeddings(18만 자), Reasoning(10만 자), Prompting best practices(6만 자)는 관련 절만 읽었다. 본문 주장과 관련된 문장은 모두 찾아 읽었다.
- **단순화의 한계**: 비유(휴대폰 다음 단어 추천, 오픈북 시험 등)는 의도적으로 단순하다. 오해를 부를 정도는 아니라고 판단했지만, 판단 자체는 검증자 한 명의 것이다.
- **검증 못 한 것**: 실제 앱 화면(설정 메뉴 이름, '생각하기' 모드 유무)은 서비스·플랜마다 달라 확인하지 않았다. 본문은 일반 표현만 쓴다.
