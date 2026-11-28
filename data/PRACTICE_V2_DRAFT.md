# 실습 2.0 검토 초안 (PRACTICE_V2_DRAFT)

작성·검증일: 2026-11-28 · 상태: **검토용 초안** (앱 코드와 data/practice.json은 바꾸지 않았어요)

## 기획 요약 (오너와 함께 정한 내용)
- **대상**: 입문자·활용자 중심. 베타 테스터는 기술을 잘 모르는 어머니들이에요. 60세 어머니가 읽어도 이해되게, 짧은 문장으로 써요.
- **강의와 분리**: 실습은 강의와 따로 가요. 강의는 카드 끝의 "더 알고 싶다면"에만 연결해요.
- **12개 실습, 수준마다 3개**: 입문자(1–3) · 활용자(4–6) · 실무자(7–9) · 개발자(10–12).
- **생활 분야 예시 6개**: 업무 · 가족 · 살림 · 여행 · 자녀교육 · 재테크. 재테크는 정리·공부·비교만 다루고 투자 조언은 하지 않아요. 재테크 예시에는 늘 "투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요"를 붙여요.
- **앱은 사용자가 고름**: 입문·활용·실무는 ChatGPT · Claude · Gemini. 개발자는 Claude Code · Codex(OpenAI) · Gemini CLI.
- **메뉴 이름**: 한국어 + 영어 괄호. 스크린숏 없이 글로만 써요. 표 아래에 늘 "※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요."를 붙여요.
- **카드 형식**: 실습 4(오너 승인본)와 같아요. 제목 → "수준 · 유형 · 약 N분" → 얻는 것 → ① 가는 길 표 → ② 할 일(분야별 예시 6개) → ③ 확인 → ✅ 성공 → ⚠️ 주의 → 다음 실습 → 공식 도움말 → 더 알고 싶다면.
- **확인 방법**: 메뉴 경로와 기능 설명은 공식 도움말 원문을 읽고 썼어요. 원문을 못 연 곳은 '검색 확인'으로 표시했어요. 맨 아래 "검증 기록"과 "확인 필요/불확실"을 꼭 봐 주세요.


## 목차
| # | 수준 | 유형 | 실습 |
|---|---|---|---|
| 1 | 입문자 | 써보기 | AI와 첫 대화로 오늘 할 일 해결하기 |
| 2 | 입문자 | 써보기 | 사진·문서 올려서 물어보기 |
| 3 | 입문자 | 안전 | AI 답 확인하고 내 정보 지키기 |
| 4 | 활용자 | 세팅하기 | 나에 대해 알려 두기 (승인본) |
| 5 | 활용자 | 만들기 | 프로젝트로 나만의 비서 만들기 |
| 6 | 활용자 | 세팅하기 | 자주 하는 일을 스킬로 저장하기 |
| 7 | 실무자 | 연결하기 | 메일·캘린더 연결하기 |
| 8 | 실무자 | 자동화 | 반복 업무 자동화하기 |
| 9 | 실무자 | 조사 | AI에게 조사 맡기기 |
| 10 | 개발자 | 세팅하기 | API 키 발급하고 첫 호출 |
| 11 | 개발자 | 만들기 | 코딩 에이전트로 작은 앱 만들기 |
| 12 | 개발자 | 연결하기 | MCP로 내 도구 연결하기 |

---

## 실습 1 · AI와 첫 대화로 오늘 할 일 해결하기
입문자 · 써보기 · 약 5분
**이 실습으로 얻는 것** AI에게 처음으로 말을 걸고, 오늘 바로 쓸 수 있는 답을 받아 봐요.
**① AI 앱 열기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 컴퓨터: chatgpt.com / 휴대폰: ChatGPT 앱 → 아래 입력창. 로그인 없이도 쓸 수 있지만, 로그인하면 대화가 저장돼요. |
| Claude | 컴퓨터: claude.ai / 휴대폰: Claude 앱 → 로그인 → 아래 입력창. 만 18세 이상만 쓸 수 있어요. |
| Gemini | 컴퓨터: gemini.google.com / 휴대폰: Gemini 앱 → 구글 계정으로 로그인 → 아래 입력창 |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 아래 내용을 내 상황에 맞게 고쳐서 보내기** (분야별 예시 6개, [ ] 안을 바꿔 주세요)
 업무: 오늘 할 일이에요: [거래처 메일 답장, 회의 자료 정리, 출장비 정산]. 급한 순서로 줄 세우고, 일마다 걸리는 시간을 적어 주세요.
 가족: 이번 주말에 [시부모님]이 오세요. [토요일 점심, 일요일 오전]에 할 일을 시간표로 짜 주세요.
 살림: 오늘 할 집안일이에요: [빨래, 화장실 청소, 장보기, 반찬 2개]. 2시간 안에 끝나게 순서를 정해 주세요.
 여행: [다음 달 제주 2박 3일] 여행 전에 오늘 해 둘 일을 5개만 알려 주세요.
 자녀교육: [초등 3학년] 아이가 오늘 [수학 숙제와 독서록]이 있어요. 저녁 7시부터 9시까지 쉬는 시간을 넣어서 계획을 짜 주세요.
 재테크: 이번 달 할 돈 관련 일이에요: [관리비 확인, 카드값 정리, 통장 정리]. 처리 순서와 체크리스트를 만들어 주세요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 한 번 더 고쳐 달라고 하기** 답을 받은 뒤 "더 짧게 해 주세요" 또는 "표로 정리해 주세요"라고 한 번 더 보내 보세요.
**✅ 이렇게 되면 성공** 번호가 붙은 순서 목록이 나오고, 다시 부탁했을 때 더 짧거나 표로 바뀐 답이 나와요.
**⚠️ 주의** AI는 틀릴 수 있어요. 날짜·시간·가격은 꼭 다시 확인하세요. 이름·주소·전화번호는 적지 않아도 충분해요.
**다음 실습 →** 실습 2 · 사진·문서 올려서 물어보기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/6783457 · Claude https://support.claude.com/en/articles/8114491 · Gemini https://support.google.com/gemini/answer/13275745
**더 알고 싶다면: 관련 강의** 0vZ_UVLhSQQ (Getting started with Claude.ai) · EWvNQjAaOHw (How I use LLMs)

---

## 실습 2 · 사진·문서 올려서 물어보기
입문자 · 써보기 · 약 7분
**이 실습으로 얻는 것** 종이·사진·문서를 일일이 옮겨 적지 않아도, 찍어서 올리면 AI가 읽고 정리해 줘요.
**① 파일 올리는 곳 찾기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 입력창의 + → 사진 및 파일 추가(Add photos & files). 사진·문서·표는 무료 요금제도 돼요(녹음 파일은 유료만). |
| Claude | 입력창 왼쪽 아래 + → 파일 또는 사진 추가(Add files or photos). 끌어다 놓아도 돼요. 한 대화에 20개까지. |
| Gemini | 입력창의 파일 추가(Add files) → 파일 업로드(Upload files). 한 번에 10개까지(상황에 따라 달라요). |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 사진이나 파일을 올리고 아래처럼 물어보기** (분야별 예시 6개)
 업무: (회의 자료 PDF) 이 자료를 다섯 줄로 요약하고, 제가 해야 할 일만 따로 뽑아 주세요.
 가족: (부모님 약 봉투 사진) 약 이름과 먹는 시간을 표로 정리해 주세요. 표는 냉장고에 붙일 수 있게 크게요.
 살림: (냉장고 안 사진) 보이는 재료로 오늘 저녁 반찬 3가지를 추천해 주세요.
 여행: (외국 식당 메뉴판 사진) 한국어로 번역하고, 맵거나 견과류가 든 메뉴를 표시해 주세요.
 자녀교육: (학교 가정통신문 사진) 날짜, 준비물, 내야 할 서류만 목록으로 뽑아 주세요.
 재테크: (관리비 고지서 사진) 항목별 금액을 표로 정리하고, 지난달보다 늘어난 항목이 있는지 알려 주세요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 원본과 비교하기** AI가 정리한 숫자 2~3개를 원본 사진과 직접 맞춰 보세요.
**✅ 이렇게 되면 성공** 사진 속 글자가 표나 목록으로 정리되어 나오고, 원본과 숫자가 맞아요.
**⚠️ 주의** 사진 속 주민번호·카드번호·계좌번호·주소·얼굴은 가리고 올리세요. 약 복용은 AI 말만 믿지 말고 약사·의사에게 확인하세요. 글씨가 흐리면 잘못 읽을 수 있어요.
**다음 실습 →** 실습 3 · AI 답 확인하고 내 정보 지키기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/8555545 · Claude https://support.claude.com/en/articles/8241126 · Gemini https://support.google.com/gemini/answer/14903178
**더 알고 싶다면: 관련 강의** EWvNQjAaOHw (How I use LLMs)

---

## 실습 3 · AI 답 확인하고 내 정보 지키기
입문자 · 안전 · 약 10분
**이 실습으로 얻는 것** 내 대화가 AI 학습에 쓰이지 않게 끄고, AI 답을 믿기 전에 확인하는 습관을 들여요.
**① 학습 사용 끄기** (내 대화를 AI를 더 좋게 만드는 데 쓰지 않게 하는 설정)
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 프로필 → 설정 → 데이터 제어(Data controls) → "모두를 위한 모델 개선(Improve the model for everyone)" 끄기. 휴대폰: 사이드바 → 프로필 아이콘 → 데이터 제어. |
| Claude | 왼쪽 아래 내 이름 → 설정(Settings) → 개인정보(Privacy) → "AI 모델 개선에 참여(Help improve our AI models)" 끄기 |
| Gemini | gemini.google.com → 설정(Settings) → 기록(History) → "채팅 내용(텍스트·첨부 포함)(Chat content including text & uploads)" 체크 해제 → 끄기(Turn off). 예전 화면 이름은 "Gemini 앱 활동(Gemini Apps Activity)"이에요. |
**잠깐만 쓰는 대화** (기록에 안 남고 학습에도 안 쓰여요)
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 새 채팅 → 임시(Temporary) 또는 임시 채팅(Temporary chat). 안전 확인 때문에 최대 30일 보관돼요. |
| Claude | 새 채팅 화면 오른쪽 위 유령 아이콘 → 시크릿 채팅(Incognito chat). 프로젝트 안에서는 안 돼요. 30일 보관돼요. |
| Gemini | "새 채팅(New chat)" 옆 임시 채팅(Temporary chat). 개인 계정만 되고, 약 2개월 보관돼요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 개인정보 빼고 물어보고, 출처 물어보기** (분야별 예시 6개 — 괄호 안은 빼야 할 정보)
 업무: (거래처 담당자 이름·연락처 빼고) "거래처에 납품이 늦어진다고 사과하는 메일을 써 주세요."
 가족: (부모님 성함·병원 이름 빼고) "70대 어머니가 무릎 수술 후 집에서 조심할 점을 알려 주세요."
 살림: (집 주소 빼고) "아파트 윗집 누수 때 관리사무소에 알릴 내용을 정리해 주세요."
 여행: (여권번호·예약번호 빼고) "일본 여행 때 여권을 잃어버리면 할 일을 순서대로 알려 주세요."
 자녀교육: (아이 이름·학교 이름 빼고) "초등 3학년 아이가 친구와 다퉜을 때 대화하는 방법을 알려 주세요."
 재테크: (계좌번호·카드번호 빼고) "연말정산에서 신용카드와 체크카드 공제가 어떻게 다른지 쉽게 알려 주세요." (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
 그다음 이렇게 한 번 더 보내세요: **방금 답의 근거가 된 출처(기관 이름과 주소)를 알려 주세요. 확실하지 않은 부분은 "확실하지 않음"이라고 표시해 주세요.**
**③ 확인하기** 설정 화면을 다시 열어 꺼져 있는지 보세요. 출처 주소 하나를 직접 눌러, 그 페이지에 정말 그 내용이 있는지 확인하세요.
**✅ 이렇게 되면 성공** 학습 사용이 '꺼짐'으로 보이고, AI가 출처와 "확실하지 않음" 표시를 붙여 답해요.
**⚠️ 주의** 끄기 전에 이미 학습에 쓰인 내용은 되돌릴 수 없어요(Claude 공식 안내). 학습을 꺼도 대화는 안전 확인을 위해 한동안 보관될 수 있어요. Gemini는 '기록'을 통째로 끄면 메일·일정 연결(실습 7)과 예약 기능(실습 8)을 못 써요. 출처 주소는 AI가 지어낼 수도 있으니 꼭 눌러 보세요.
**다음 실습 →** 실습 4 · 나에 대해 알려 두기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/7730893 (임시 채팅 https://help.openai.com/en/articles/8914046) · Claude https://privacy.claude.com/en/articles/12109829 (시크릿 채팅 https://support.claude.com/en/articles/12260368) · Gemini https://support.google.com/gemini/answer/13278892 (임시 채팅 https://support.google.com/gemini/answer/13275745)
**더 알고 싶다면: 관련 강의** PLf2m23nhTg1NjL3-jL3s0qZCYzO07ZQPv (AI Fluency Course)

---

## 실습 4 · 나에 대해 알려 두기
활용자 · 세팅하기 · 약 5분
**이 실습으로 얻는 것** 매번 "저는 이런 사람이에요"라고 설명하지 않아도, AI가 나에게 맞춰 답해 줍니다.
**① 설정 화면 열기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 컴퓨터: 설정 → 개인 맞춤 설정(Personalization) → 맞춤형 지침 / 휴대폰 앱: 설정 → ChatGPT 맞춤 설정(Customize ChatGPT) |
| Claude | 왼쪽 아래 내 이름(이니셜) → 설정 → Your Claude(예전 화면은 "Account") → Claude 지침 |
| Gemini | gemini.google.com → 설정 및 도움말 → 개인 맥락(Personal context) → Gemini 지침(Your instructions for Gemini) |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 아래 내용을 내 상황에 맞게 고쳐서 붙여 넣기** (분야별 예시 6개)
 살림: 저는 4인 가족 살림을 맡고 있어요. 아이 한 명이 견과류 알레르기가 있어요. 평일 저녁은 30분 안에 만들 수 있는 요리를 좋아해요. 답은 짧게, 장보기 목록은 표로 정리해 주세요.
 업무: 저는 중소기업 인사팀 대리예요. 공손하지만 간결한 메일 말투를 원해요.
 자녀교육: 초등 3학년 아이를 키워요. 설명은 아이 눈높이로, 예시는 일상에서 들어 주세요.
 재테크: 가계부를 정리하는 중이에요. 투자 추천은 하지 말고, 지출 정리와 용어 설명만 해 주세요.
 가족: 저는 70대 부모님을 챙기는 맏딸이에요. 건강·병원 이야기는 쉬운 말로 설명하고, 꼭 확인할 점은 따로 표시해 주세요.
 여행: 저는 부모님과 아이가 함께하는 가족 여행을 자주 가요. 많이 걷지 않는 일정이 좋고, 일정은 시간표로 정리해 주세요.
 ※ 재테크: 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.
**③ 잘 됐는지 확인하기** 새 대화에서 "이번 주 저녁 메뉴 추천해 줘"라고만 보내 보세요. (분야별)
 업무: "휴가 신청 메일 써 줘" · 가족: "부모님 건강검진 전에 챙길 것 알려 줘" · 여행: "부산 1박 2일 일정 짜 줘" · 자녀교육: "분수가 뭔지 설명해 줘" · 재테크: "고정 지출이 뭐야?"
**✅ 이렇게 되면 성공** 내 상황을 다시 말하지 않았는데도 답이 맞춰져 나와요.
 살림: 견과류 없는 30분 요리와 장보기 표가 나와요. · 업무: 공손하고 짧은 메일이 나와요. · 가족: 쉬운 말 설명과 '꼭 확인할 점'이 따로 나와요. · 여행: 덜 걷는 일정이 시간표로 나와요. · 자녀교육: 피자 나누기처럼 생활 예시로 설명해요. · 재테크: 투자 추천 없이 뜻과 예시만 나와요.
**⚠️ 주의** 주소, 전화번호, 주민번호, 카드번호 같은 정보는 넣지 마세요. 적은 내용은 언제든 설정에서 고치거나 지울 수 있어요.
**다음 실습 →** 실습 5 · 프로젝트로 나만의 비서 만들기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/8096356 · Claude https://support.claude.com/en/articles/10185728 · Gemini https://support.google.com/gemini/answer/16413516
**더 알고 싶다면: 관련 강의** OfUn6HjwXhI (Behind the prompt: Prompting tips for Claude.ai)

---

## 실습 5 · 프로젝트로 나만의 비서 만들기
활용자 · 만들기 · 약 10분
**이 실습으로 얻는 것** 한 가지 일(예: 가족 여행 준비)만 맡는 비서 방을 만들어요. 자료와 지시를 한 번만 넣어 두면 그 방의 모든 대화에 쓰여요.
**① 프로젝트 만들기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 왼쪽 사이드바 프로젝트(Projects) 옆 + → 새 프로젝트(New project) → 이름 입력 → 프로젝트 만들기(Create project). 지시는 프로젝트 오른쪽 위 ••• → 프로젝트 설정(Project settings) → 지침(Instructions). 파일도 올릴 수 있어요(개수는 요금제마다 달라요). |
| Claude | 왼쪽 프로젝트(Projects) 또는 claude.ai/projects → + 새 프로젝트(+ New Project) → 이름 입력. 오른쪽 "프로젝트 지침 설정(Set project instructions)"에 지시를, + 로 파일을 넣어요. 무료는 프로젝트 5개까지. |
| Gemini | Gemini에는 '프로젝트' 대신 노트북(Notebooks)이 있어요 → 사이드바 열기 → "노트북" 아래 새 노트북(New notebook) → 이름 입력 → 소스 추가(Add sources)로 파일 넣기. 지시는 노트북 위쪽 더보기(More) → 노트북 설정(Notebook settings). 아직 순서대로 열리는 중이라 안 보일 수 있어요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 프로젝트 이름과 지시를 고쳐서 붙여 넣기** (분야별 예시 6개)
 업무 — 이름 "채용 비서": 저는 인사팀이에요. 이 방에서는 채용 공고, 면접 질문, 합격·불합격 안내 메일만 도와주세요. 말투는 공손하고 짧게요. (회사 채용 규정 문서를 파일로 넣기)
 가족 — 이름 "아버지 칠순 준비": 아버지 칠순 잔치를 준비해요. 손님 20명, 예산 범위 안에서 장소·순서·준비물을 정리해 주세요. 정한 내용은 매번 표로 다시 보여 주세요.
 살림 — 이름 "우리집 식단": 4인 가족, 견과류 알레르기 1명. 일주일 식단과 장보기 목록을 도와주세요. (자주 해 먹는 요리 목록을 파일로 넣기)
 여행 — 이름 "오사카 3박 4일": 부모님과 아이가 함께 가요. 하루에 1만 보 넘게 걷지 않게, 일정은 시간표로 짜 주세요. (항공·숙소 시간만 적은 메모 넣기 — 예약번호는 빼기)
 자녀교육 — 이름 "3학년 숙제 도우미": 답을 바로 알려 주지 말고, 아이가 스스로 풀게 힌트를 한 단계씩 주세요.
 재테크 — 이름 "우리집 가계부": 매달 지출을 항목별로 정리하고 용어를 쉽게 설명해 주세요. 투자 추천은 하지 마세요. (카드번호를 지운 지출 표 넣기) (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 확인하기** 그 프로젝트(노트북) 안에서 새 대화를 열고 "지난번에 정한 거 기억나요? 다음에 할 일 알려 주세요"처럼 짧게만 보내 보세요.
**✅ 이렇게 되면 성공** 설명을 다시 안 했는데도 넣어 둔 지시와 파일 내용에 맞춰 답해요. (예: 칠순 프로젝트에서 손님 20명 기준으로 답해요.)
**⚠️ 주의** 프로젝트 지시는 그 프로젝트 안에서만 쓰여요(전체 설정은 실습 4). 파일에 주민번호·계좌번호·예약번호가 있으면 지우고 넣으세요. Claude는 같은 프로젝트라도 대화끼리 내용을 나누지 않아요 — 기억해야 할 건 프로젝트 지식(파일)에 넣으세요.
**다음 실습 →** 실습 6 · 자주 하는 일을 스킬로 저장하기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/10169521 · Claude https://support.claude.com/en/articles/9519177 · Gemini https://support.google.com/gemini/answer/16972047
**더 알고 싶다면: 관련 강의** t2Zo3YAJdj4 (Five brand new ways to use Claude at work) · PLOjSa4kyvo_M (Getting Started with ChatGPT Work)

---

## 실습 6 · 자주 하는 일을 스킬로 저장하기
활용자 · 세팅하기 · 약 10분
**이 실습으로 얻는 것** 매번 똑같이 부탁하던 일(예: 장보기 목록 만들기)을 '스킬'(저장해 두는 일하는 방법)로 만들어, 어느 대화에서든 꺼내 써요.
**① 스킬 만드는 곳 찾기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | **개인 요금제(무료·Go·Plus·Pro)에는 스킬 기능이 없어요.** 회사·학교용(Business·Enterprise·Edu)만 돼요: 사이드바 플러그인(Plugins) → 스킬(Skills) 탭 → 추가(Add) → 대화로 만들기(Create with chat). → 개인 요금제는 대신 실습 5의 프로젝트 지침에 같은 내용을 넣으세요. ('GPT 만들기'는 2026년 12월 11일에 종료돼요. 새로 만들지 마세요.) |
| Claude | 무료도 돼요. 먼저 설정(Settings) → 기능(Capabilities) → "코드 실행 및 파일 생성(Code execution and file creation)"(새 화면 이름 "파일 만들기 및 편집(Create and edit files)") 켜기 → 사용자 지정(Customize) → 스킬(Skills) → + → 스킬 만들기(+ Create skill) → 스킬 올리기(Upload a skill)에 ZIP 파일 올리기. ZIP은 ②처럼 Claude에게 만들어 달라고 하면 돼요. |
| Gemini | 만 18세 이상. 사이드바 사용자 지정(Customize)(안 보이면 더보기(More) 먼저) → 위쪽 스킬(Skills) → 만들기(Create) → Gemini와 함께 만들기(Create with Gemini) 또는 직접 만들기(Create manually) → 이름·설명·지시 입력 → 만들기(Create). 예전 'Gem'은 2026년 11월 17일부터 읽기 전용이 되었고 12월 17일에 없어져요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 스킬 내용 만들기** — 아래를 고쳐서 Gemini는 지시 칸에 붙여 넣고, Claude는 "아래 내용을 스킬로 만들어 ZIP 파일로 주세요"라고 앞에 붙여 보내세요. (분야별 예시 6개)
 업무 — "회의록 정리": 회의 메모를 주면 ①결정된 것 ②할 일(담당자·마감) ③다음 회의 안건으로 나눠 표로 정리해요.
 가족 — "가족 단톡방 공지": 내용을 주면 어르신도 읽기 쉽게 세 줄 이내 공지로 바꾸고, 날짜·시간·장소를 맨 위에 써요.
 살림 — "주간 장보기": 이번 주 메뉴를 주면 재료를 채소·고기·양념으로 나눈 장보기 표를 만들고, 견과류가 든 재료는 표시해요.
 여행 — "여행 짐 목록": 여행지·날짜·인원을 주면 날씨를 생각한 짐 목록을 사람별 체크리스트로 만들어요.
 자녀교육 — "받아쓰기 문제": 학년과 단원을 주면 받아쓰기 10문제와 정답, 틀리기 쉬운 글자 설명을 만들어요.
 재테크 — "월말 가계부 정리": 지출 목록을 주면 항목별 합계와 지난달 대비 변화를 표로 정리하고, 투자 추천은 하지 않아요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 스킬 불러 써 보기** 새 대화에서 / 를 누르고 스킬 이름을 골라(Claude·Gemini) 재료만 보내 보세요. 예: "/주간 장보기 이번 주는 카레, 된장찌개, 불고기".
**✅ 이렇게 되면 성공** 길게 설명하지 않아도 저장한 형식(표, 순서, 표시)대로 결과가 나와요.
**⚠️ 주의** 다른 사람이 만든 스킬 파일은 믿을 수 있는 곳에서 받은 것만 올리세요(스킬 안에 프로그램이 들어 있을 수 있어요). Gemini 스킬은 '기록'이 꺼져 있으면 메일·드라이브를 못 써요. 개인정보는 스킬에 넣지 마세요.
**다음 실습 →** 실습 7 · 메일·캘린더 연결하기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/20001066 (GPT 종료 안내 https://help.openai.com/en/articles/20001519) · Claude https://support.claude.com/en/articles/12512180 · Gemini https://support.google.com/gemini/answer/17094296 (Gem 전환 https://support.google.com/gemini/answer/18560919)
**더 알고 싶다면: 관련 강의** bjdBVZa66oU (What are skills?)

---

## 실습 7 · 메일·캘린더 연결하기
실무자 · 연결하기 · 약 10분
**이 실습으로 얻는 것** 메일함과 달력을 AI에 연결하면, 복사·붙여넣기 없이 "오늘 온 메일 정리해 줘"가 돼요.
**① 메일·캘린더 연결하기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 설정 → 플러그인(Plugins) → Gmail 또는 Google Calendar(Outlook도 있어요) → 설치(Install plugin)/연결(Connect) → 구글 로그인 → 권한 확인. 대화에서 @ 를 치고 앱을 골라 써요. 요금제·지역에 따라 안 보일 수 있어요. |
| Claude | 사용자 지정(Customize) → 커넥터(Connectors) → Gmail, Google Calendar 연결 → 구글 로그인. 무료 포함 모든 사용자가 웹·데스크톱 앱에서 쓸 수 있어요. |
| Gemini | 먼저 설정 → 기록(History)이 켜져 있어야 해요(실습 3 참고). 사이드바 사용자 지정(Customize) → 커넥터(Connectors) → Google Workspace 연결. 대화에서 @ 를 치고 Gmail·Calendar를 골라요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 먼저 '읽기만' 하는 부탁부터 보내기** (분야별 예시 6개)
 업무: 오늘 받은 메일 중 답장이 필요한 것 3개만 골라 한 줄씩 요약해 주세요. 보내지는 마세요.
 가족: 이번 달 달력에서 가족 행사와 병원 예약만 날짜순으로 보여 주세요.
 살림: 지난 일주일 택배 배송 메일을 찾아 무엇이 언제 오는지 표로 정리해 주세요.
 여행: 항공권·호텔 예약 확인 메일을 찾아 날짜별 일정표를 만들어 주세요. 예약번호는 빼고요.
 자녀교육: 학교·학원에서 온 메일에서 이번 주 준비물과 마감일만 뽑아 주세요.
 재테크: 카드사 명세서 메일에서 이번 달 결제 예정 금액만 정리해 주세요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 일정 하나 넣어 보기** "다음 주 화요일 오후 3시에 '치과' 일정을 넣어 주세요"라고 보내고, AI가 묻는 확인 창을 읽은 뒤 승인하세요. 달력 앱에서 직접 확인하세요.
**✅ 이렇게 되면 성공** 답에 실제 메일·일정이 출처로 붙어 나오고, 달력 앱에 새 일정이 보여요.
**⚠️ 주의** 처음엔 읽기만 시키세요. 메일 보내기·삭제·일정 바꾸기는 AI가 묻는 확인 창을 꼭 읽고 직접 누르세요(Claude는 기본으로 매번 물어봐요). AI가 예전 메일을 최신으로 착각할 수 있어 출처를 눌러 확인하세요. 공용 컴퓨터에서는 연결하지 마세요. 연결은 같은 설정 화면에서 언제든 끊을 수 있어요.
**다음 실습 →** 실습 8 · 반복 업무 자동화하기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/11487775 (구글 데이터 안내 https://help.openai.com/en/articles/10408842) · Claude https://support.claude.com/en/articles/10166901 · Gemini https://support.google.com/gemini/answer/15229592
**더 알고 싶다면: 관련 강의** _jjSS0qGFbI (Getting started with connectors in Claude.ai)

---

## 실습 8 · 반복 업무 자동화하기
실무자 · 자동화 · 약 15분
**이 실습으로 얻는 것** "매일 아침 8시에 오늘 일정 정리"처럼 반복되는 일을 한 번 설정하면 AI가 알아서 해 줘요.
**① 예약 기능 찾기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 사이드바 예약됨(Scheduled) → 새 작업(New task), 또는 대화에서 "매일 아침 8시에 …해 줘"라고 부탁. 무료는 3개까지, 하루 1번까지, 시간은 '아침·오후·밤'처럼 대략만 돼요. "메일이 오면" 같은 작업은 Plus 이상에서 Work 화면으로만 돼요(무료·Go 불가). |
| Claude | **유료(Pro 이상)만 돼요.** 새 Claude 화면이면 대화에서 "매주 월요일 오전 9시에 …"라고 부탁, Cowork 화면이면 왼쪽 예약됨(Scheduled) → 새 작업(New task). 컴퓨터를 꺼도 돌아가요. → 무료는 아래 Zapier 같은 도구를 쓰세요. |
| Gemini | 대화에서 "매일 아침 7시에 …해 줘"라고 보내면 일정(Schedule)이 만들어져요. 사이드바 예약됨(Scheduled)에서 멈춤·수정. 10개까지, 기록(History)이 켜져 있어야 해요. 아직 순서대로 열리는 중이에요. 입력창 아래 작업(Task)을 쓰면, 한국은 구독 없이도 하루 1번 시간대 예약이 되고 "메일이 오면" 감시는 Google AI Pro·Ultra만 돼요. |
| 메신저로 받기 | 세 앱 모두 기본은 앱 알림·이메일로 알려 줘요. 카카오톡·슬랙 같은 메신저로 보내려면 Zapier 같은 노코드 도구(코딩 없이 앱끼리 잇는 서비스)를 써요. 예: "Gmail 새 메일 → ChatGPT로 요약 → Slack으로 보내기" 템플릿. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 아래 부탁을 고쳐서 보내기** (분야별 예시 6개, 메일·달력이 필요한 건 실습 7 먼저)
 업무: 평일 아침 8시에 오늘 일정과 답장할 메일 3개를 요약해 알려 주세요.
 가족: 매주 일요일 저녁에 다음 주 가족 일정과 챙길 생일·기념일을 알려 주세요.
 살림: 매주 금요일 오후에 주말 날씨와 그에 맞는 빨래·청소 계획을 알려 주세요.
 여행: 여행 출발 3일 전 아침에 여행지 날씨와 짐 체크리스트를 보내 주세요.
 자녀교육: 매일 저녁 7시에 초등 3학년 수준 수학 문제 3개를 내 주세요.
 재테크: 매달 1일 아침에 지난달 카드 명세서 메일을 항목별로 정리해 주세요. 투자 추천은 하지 마세요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 확인하기** 예약 목록(Scheduled)에 작업이 보이는지 확인하고, 첫 결과가 오면 내용을 직접 읽어 보세요. "지금 한 번 실행해 줘"로 바로 시험해도 돼요(앱에 따라).
**✅ 이렇게 되면 성공** 정한 시간에 알림이 오고, 열어 보면 부탁한 형식으로 정리돼 있어요.
**⚠️ 주의** 처음엔 진짜 메일 대신 연습용 메일(내가 나에게 보낸 메일)로 시험하세요. 권한은 꼭 필요한 것만 주세요. 자동으로 '보내기·삭제'하는 작업은 만들지 마세요. 예약 작업도 요금제 사용량을 써요. 미리 준비해 두는 방식이라 주가처럼 빨리 바뀌는 정보는 최신이 아니에요. Zapier 같은 외부 도구는 내 메일을 그 회사에도 맡기는 것이니 약관과 요금을 확인하세요.
**다음 실습 →** 실습 9 · AI에게 조사 맡기기
**공식 도움말** ChatGPT https://help.openai.com/en/articles/10291617 · Claude https://support.claude.com/en/articles/13854387 · Gemini https://support.google.com/gemini/answer/16316416 (작업 예약 https://support.google.com/gemini/answer/17094710) · Zapier https://zapier.com/blog/generate-email-summaries-with-ai/
**더 알고 싶다면: 관련 강의** tYOI-WoLS_o (Delegate and schedule tasks in Claude Cowork) · AkUUeePtbe4 (Build custom AI agents in Workspace Studio)

---

## 실습 9 · AI에게 조사 맡기기
실무자 · 조사 · 약 15분 (보고서 기다리는 시간 따로 5~10분 이상)
**이 실습으로 얻는 것** 여러 사이트를 직접 뒤지지 않아도, AI가 수십 곳을 찾아보고 출처가 달린 비교 보고서를 만들어 줘요.
**① 조사 기능 켜기**
| 앱 | 가는 길 |
|---|---|
| ChatGPT | 입력창의 + → 심층 리서치(Deep research), 또는 /Deepresearch 입력. 조사 계획이 먼저 나오면 고친 뒤 시작해요. 요금제마다 횟수 제한이 있어요(화면에 남은 횟수 표시). |
| Claude | **유료(Pro 이상)만 돼요.** 웹 검색이 켜져 있어야 해요 → 입력창 왼쪽 아래 + → 리서치(Research) → 파란 표시가 보이면 켜진 것. → 무료는 웹 검색을 켜고 같은 질문을 하면 짧은 조사는 돼요. |
| Gemini | 만 18세 이상, 무료도 돼요. 입력창의 파일 추가(Add files) 메뉴 → Deep Research → 질문 보내기 → 계획 수정(Edit plan) → 조사 시작(Start research). 하루 횟수 제한이 있어요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 비교 보고서 부탁하기** — 모양: "[무엇]을 [기준]으로 비교해 표로 정리해 주세요. 출처를 붙이고, 확인 날짜와 확실하지 않은 부분을 표시해 주세요." (분야별 예시 6개)
 업무: 직원 20명 회사가 쓸 화상회의 서비스 3곳을 가격, 무료 범위, 한국어 지원으로 비교해 주세요.
 가족: 70대 부모님 건강검진 때 나이별로 권하는 검사 항목을 공공기관 자료 위주로 정리해 주세요.
 살림: 4인 가족용 식기세척기 종류(빌트인·카운터형)의 장단점, 전기·물 사용, 설치 조건을 비교해 주세요.
 여행: 3월 아이와 가기 좋은 여행지 오키나와·다낭·제주를 날씨, 비행시간, 아이 시설로 비교해 주세요.
 자녀교육: 초등 영어 학원 고를 때 볼 기준(수업 방식, 반 인원, 레벨 테스트, 비용 공개)을 정리하고 상담 때 물어볼 질문 10개를 만들어 주세요.
 재테크: 정기예금, 적금, CMA가 각각 무엇인지, 이자 방식과 예금자 보호 여부를 공식 자료로 비교해 주세요. 상품 추천은 하지 마세요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 출처 확인하기** 보고서의 출처 링크 3개를 직접 눌러, 숫자와 날짜가 보고서와 같은지 확인하세요.
**✅ 이렇게 되면 성공** 비교표와 출처 목록이 있는 보고서가 나오고, 눌러 본 출처의 내용이 보고서와 맞아요.
**⚠️ 주의** 가격·금리·운영 시간은 자주 바뀌어요. 결정하기 전에 공식 사이트에서 다시 확인하세요. 오래된 글이나 광고 글이 섞일 수 있어요. 조사는 사용량을 많이 써요. 메일·드라이브를 조사 대상에 넣으면 개인 자료가 보고서에 들어갈 수 있으니 주의하세요.
**다음 실습 →** 실습 10 · API 키 발급하고 첫 호출 (개발자 과정)
**공식 도움말** ChatGPT https://help.openai.com/en/articles/10500283 · Claude https://support.claude.com/en/articles/11088861 · Gemini https://support.google.com/gemini/answer/15719111
**더 알고 싶다면: 관련 강의** R-KJgjIrh24 (Getting started with research in Claude.ai) · YkCDVn3_wiw (Introduction to Deep Research)

---

## 실습 10 · API 키 발급하고 첫 호출
개발자 · 세팅하기 · 약 20분
**이 실습으로 얻는 것** API 키(내 프로그램이 AI를 부를 때 쓰는 비밀번호)를 안전하게 만들고, 터미널(명령어 창)에서 AI에게 첫 요청을 보내요.
**① 키 만들기와 지출 한도 정하기** (코딩 에이전트별로 쓰는 API)
| 앱 | 가는 길 |
|---|---|
| Codex(OpenAI API) | platform.openai.com → API 키(API keys) → 새 키 만들기. 키는 만료일을 정해 만드는 게 좋아요. 프로젝트 설정에서 지출 한도(spend limits)를 정하세요. |
| Claude Code(Claude API) | platform.claude.com(Claude Console) → API 키 만들기. 지출 한도는 설정 → 지출 한도(Spend limits, platform.claude.com/settings/spend-limits). |
| Gemini CLI(Gemini API) | Google AI Studio → API 키 받기(Get API key). 지출 한도는 AI Studio 지출(Spend) 페이지 → 월 지출 한도(Monthly spend cap) → 한도 수정(Edit spend cap). |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
※ API 사용료는 ChatGPT·Claude·Gemini 구독료와 따로 나가요.
**② 키를 환경 변수(컴퓨터에 이름 붙여 저장해 두는 값)로 넣고 첫 요청 보내기** (macOS·Linux 예시)
```bash
export OPENAI_API_KEY="여기에_키"      # 또는 ANTHROPIC_API_KEY / GEMINI_API_KEY
# OpenAI (공식 빠른 시작 형식, 2026-11-28 기준 모델 이름)
curl https://api.openai.com/v1/responses -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model": "gpt-6.2-astra", "input": "아래 질문에 세 줄로 답해 주세요: [질문]"}'
# Claude (공식 Get started 형식)
curl https://api.anthropic.com/v1/messages -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2026-10-21" \
  -d '{"model": "claude-opus-5-5", "max_tokens": 500, "messages": [{"role": "user", "content": "[질문]"}]}'
# Gemini: 공식 빠른 시작(ai.google.dev)의 REST 예시를 그대로 복사하세요(x-goog-api-key 헤더 사용).
```
 [질문]에 넣을 분야별 예시 6개:
 업무: "신입 사원 첫 주 교육 일정을 다섯 줄로 짜 주세요." · 가족: "부모님 결혼기념일 축하 문자 3개를 써 주세요." · 살림: "냉장고 정리 순서를 다섯 단계로 알려 주세요." · 여행: "여행 짐 싸기 체크리스트 10개를 주세요." · 자녀교육: "초등 3학년용 분수 문제 3개와 정답을 주세요." · 재테크: "고정 지출과 변동 지출의 차이를 예시로 설명해 주세요." (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 확인하기** 터미널에 JSON(중괄호로 된 결과) 안에 한국어 답이 보이는지 보고, 콘솔의 사용량(Usage) 화면에 요청 1건이 찍혔는지 확인하세요.
**✅ 이렇게 되면 성공** 답 글이 보이고, 사용량 화면에 아주 작은 금액이 찍혀요. 401 오류가 나면 키가 잘못 들어간 거예요.
**⚠️ 주의** 키는 절대 남에게 보내지 말고, 채팅·코드·GitHub·스크린숏에 넣지 마세요. 웹페이지나 휴대폰 앱 코드 안에 키를 넣으면 남이 가져가 쓸 수 있어요. 새어 나간 것 같으면 바로 키를 지우고(Revoke) 새로 만드세요. 지출 한도는 꼭 먼저 정하세요. 모델 이름은 자주 바뀌니 공식 빠른 시작의 최신 이름을 쓰세요.
**다음 실습 →** 실습 11 · 코딩 에이전트로 작은 앱 만들기
**공식 도움말** OpenAI https://developers.openai.com/api/docs/quickstart (키 안전 https://help.openai.com/en/articles/5112595) · Claude https://platform.claude.com/docs/en/get-started (한도 https://platform.claude.com/docs/en/api/rate-limits) · Gemini https://ai.google.dev/gemini-api/docs/quickstart (요금·한도 https://ai.google.dev/gemini-api/docs/billing)
**더 알고 싶다면: 관련 강의** ysPbXH0LpIE (Prompting 101 | Code w/ Claude)

---

## 실습 11 · 코딩 에이전트로 작은 앱 만들기
개발자 · 만들기 · 약 30분
**이 실습으로 얻는 것** 말로 설명만 하면 코딩 에이전트(내 컴퓨터에서 코드를 직접 쓰고 고치는 AI)가 브라우저에서 열리는 작은 가계부 앱을 만들어 줘요.
**① 설치하고 시작하기** (먼저 빈 폴더를 만들고 그 폴더에서 터미널을 여세요)
| 앱 | 가는 길 |
|---|---|
| Claude Code | macOS·Linux: `curl -fsSL https://claude.ai/install.sh \| bash` / Windows PowerShell: `irm https://claude.ai/install.ps1 \| iex` → 폴더에서 `claude` → 로그인. Claude 유료 구독(Pro 이상) 또는 Claude Console(선불 API) 계정이 필요해요. 터미널이 낯설면 데스크톱 앱·웹에서도 써요. |
| Codex | 터미널이 낯설면 ChatGPT 데스크톱 앱의 Codex 모드를 쓰세요. CLI: `npm install -g @openai/codex` → 폴더에서 `codex` → ChatGPT로 로그인(Sign in with ChatGPT). 무료·Go 포함 모든 ChatGPT 요금제에 들어 있어요(사용 한도는 요금제마다 달라요). |
| Gemini CLI | **주의: 개인 계정(무료·Google AI Pro·Ultra)은 2026년 6월 18일부터 Gemini CLI 대신 Antigravity CLI(명령어 `agy`)를 쓰도록 바뀌었어요(검색 확인).** Gemini CLI는 유료 Gemini API 키로 계속 쓸 수 있어요: `npm install -g @google/gemini-cli`(Node.js 20 이상) → `export GEMINI_API_KEY=...` → `gemini`. 개인 계정은 Antigravity CLI 공식 설치 안내를 따르세요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 이렇게 부탁하기** — 기본: "이 폴더에 index.html 파일 하나로 된 [앱]을 만들어 주세요. 서버나 설치 없이 브라우저에서 열리게, 데이터는 브라우저에만 저장하고, 글씨는 크게, 한국어로 해 주세요. 만들기 전에 계획을 먼저 보여 주세요." (분야별 [앱] 예시 6개)
 업무: 연차 계산기 (입사일을 넣으면 올해 남은 연차 표시)
 가족: 가족 생일·기념일 달력 (음력 표시 칸 포함, 다가오는 순서로 보기)
 살림: 냉장고 유통기한 관리표 (3일 안에 지나는 건 빨간색)
 여행: 여행 경비 나누기 계산기 (누가 얼마 냈는지 넣으면 정산 금액 표시)
 자녀교육: 구구단 퀴즈 (10문제, 맞힌 개수 표시)
 재테크: 가계부 (날짜·항목·금액 입력, 월별·항목별 합계 표) (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 열어 보고 한 가지 고쳐 달라기** 폴더의 index.html을 두 번 눌러 브라우저로 열고, 써 본 뒤 "합계를 맨 위에 크게 보여 주세요"처럼 하나만 더 부탁하세요.
**✅ 이렇게 되면 성공** 브라우저에서 앱이 열리고, 입력한 값이 새로고침 뒤에도 남아 있고, 두 번째 부탁이 반영돼요.
**⚠️ 주의** 꼭 새 빈 폴더에서 시작하세요(다른 파일을 고치거나 지울 수 있어요). 에이전트가 명령 실행·파일 수정 허락을 물으면 읽고 누르세요. 실제 카드번호·계좌번호는 넣지 마세요. 만든 앱을 인터넷에 올릴 때는 키나 개인정보가 들어 있지 않은지 확인하세요. 사용량이 요금제 한도에서 빠져요.
**다음 실습 →** 실습 12 · MCP로 내 도구 연결하기
**공식 도움말** Claude Code https://code.claude.com/docs/en/quickstart · Codex https://help.openai.com/en/articles/11369540 (CLI https://developers.openai.com/codex/cli) · Gemini CLI https://geminicli.com/docs/get-started/ (Antigravity CLI https://antigravity.google/docs/cli/install)
**더 알고 싶다면: 관련 강의** 6eBSHbLKuN0 (Mastering Claude Code in 30 minutes) · ff3j4olCUig (Build Your Own App In Just 30 Minutes!)

---

## 실습 12 · MCP로 내 도구 연결하기
개발자 · 연결하기 · 약 20분
**이 실습으로 얻는 것** MCP(AI 앱과 바깥 도구를 잇는 공통 규격, 'AI용 USB-C')로 코딩 에이전트에 내 폴더를 연결해, 그 안의 파일을 찾아 읽고 정리하게 해요.
**① 연습용 폴더 하나만 연결하기** (Node.js가 필요해요. 먼저 `~/ai-practice` 폴더를 만들고 연습 파일 몇 개를 넣으세요)
| 앱 | 가는 길 |
|---|---|
| Claude Code | `claude mcp add --transport stdio files -- npx -y @modelcontextprotocol/server-filesystem ~/ai-practice` → 확인: `claude mcp list` 또는 Claude Code 안에서 `/mcp` |
| Codex | 설정 파일 `~/.codex/config.toml`에 `[mcp_servers.files]` 표를 만들고 `command = "npx"`, `args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/내이름/ai-practice"]`를 적어요. 원격 서버는 `codex mcp add 이름 --url 주소`로도 돼요. |
| Gemini CLI | `gemini mcp add files npx -y @modelcontextprotocol/server-filesystem ~/ai-practice` (설정은 `~/.gemini/settings.json`의 `mcpServers`에 저장) → Gemini CLI 안에서 `/mcp`로 확인. 개인 계정은 실습 11의 Antigravity CLI 안내를 먼저 보세요. |
※ 앱마다 메뉴 이름이 바뀔 수 있어요. 안 보이면 아래 공식 도움말을 눌러 주세요.
**② 연결한 폴더로 일 시키기** (분야별 예시 6개 — 폴더에 해당 연습 파일을 넣어 두세요)
 업무: ai-practice 폴더의 회의록 파일들을 읽고, 할 일만 모아 todo.md로 저장해 주세요.
 가족: 폴더의 가족 행사 메모들을 날짜순으로 합쳐 family-calendar.md를 만들어 주세요.
 살림: 폴더의 레시피 파일들에서 재료를 모아 장보기 목록 shopping.md를 만들어 주세요.
 여행: 폴더의 여행 메모에서 날짜별 일정표 trip.md를 만들어 주세요. 예약번호는 넣지 마세요.
 자녀교육: 폴더의 받아쓰기 기록에서 자주 틀린 낱말 10개를 뽑아 주세요.
 재테크: 폴더의 지출 CSV 파일을 읽어 항목별 합계 표를 만들어 주세요. (※ 투자 판단은 본인 몫이고 AI 답은 꼭 확인하세요.)
**③ 확인하기** `/mcp`(또는 목록 명령)에서 files 서버가 연결됨으로 보이는지, ai-practice 폴더에 새 파일이 생겼는지 확인하세요.
**✅ 이렇게 되면 성공** 에이전트가 MCP 도구로 폴더 파일을 읽었다고 표시하고, 새 정리 파일이 폴더에 생겨요. 다른 폴더는 건드리지 못해요.
**⚠️ 주의** 믿을 수 있는 MCP 서버만 연결하세요. 바깥 글을 읽어 오는 서버는 그 글에 숨은 지시에 AI가 속을 수 있어요(프롬프트 주입). 폴더는 꼭 필요한 것 하나만 여세요(홈 폴더 전체 금지). 서버에 넣는 토큰·비밀번호는 설정 파일에 저장되니, 그 파일을 GitHub에 올리지 마세요.
**다음 실습 →** 처음으로 돌아가 다른 앱으로 실습 7~9를 해 보세요.
**공식 도움말** MCP https://modelcontextprotocol.io/docs/getting-started/intro · Claude Code https://code.claude.com/docs/en/mcp · Codex https://developers.openai.com/codex/mcp · Gemini CLI https://geminicli.com/docs/tools/mcp-server/
**더 알고 싶다면: 관련 강의** PLyCki2K0Lg (Why we built—and donated—the Model Context Protocol) · DRghWwm3dt8 (운영자의 시간을 아끼는 AI 에이전트 2부 - MCP 부터 Agent 설계까지)

---

## 검증 기록
2026-11-28에 확인했어요. **원문 확인** = curl로 공식 페이지를 받아 해당 문장을 직접 읽음. **검색 확인** = 이 환경에서 열 수 없어 WebSearch 결과로만 확인.

| 카드 | 앱 | 주장 | 출처 | 확인 |
|---|---|---|---|---|
| 1 | ChatGPT | 로그인 없이 쓰기 가능(로그아웃 사용 설정 존재) | https://help.openai.com/en/articles/7730893 | 원문 확인 |
| 1 | Claude | 웹·데스크톱·모바일, 만 18세 이상 | https://support.claude.com/en/articles/8114491 | 원문 확인 |
| 1 | Gemini | gemini.google.com, 로그인 | https://support.google.com/gemini/answer/13275745 | 원문 확인 |
| 2 | ChatGPT | + → Add photos & files, 문서·이미지 무료 가능, 오디오는 유료 | https://help.openai.com/en/articles/8555545 | 원문 확인 |
| 2 | Claude | + → Add files or photos, 대화당 20개, 지원 형식 | https://support.claude.com/en/articles/8241126 | 원문 확인 |
| 2 | Gemini | Add files → Upload Files, 최대 10개(상황에 따라) | https://support.google.com/gemini/answer/14903178 | 원문 확인 |
| 3 | ChatGPT | Settings → Data controls → Improve the model for everyone; 모바일 경로 | https://help.openai.com/en/articles/7730893 | 원문 확인 |
| 3 | ChatGPT | Temporary chat: 기록·학습 제외, 최대 30일 보관 | https://help.openai.com/en/articles/8914046 | 원문 확인 |
| 3 | Claude | Settings → Privacy → Help improve our AI models 토글; 이미 시작된 학습엔 남음 | https://privacy.claude.com/en/articles/12109829 | 원문 확인 |
| 3 | Claude | Incognito: 유령 아이콘, 학습 제외, 30일 보관, 프로젝트 안 불가 | https://support.claude.com/en/articles/12260368 | 원문 확인 |
| 3 | Gemini | Settings → History, "Chat content including text & uploads" 체크로 학습 제어, History 끄면 연결 앱 제한 | https://support.google.com/gemini/answer/13278892 | 원문 확인 |
| 3 | Gemini | Temporary chat: New chat 옆, 개인 계정만, 학습 제외, 약 2개월 보관 | https://support.google.com/gemini/answer/13275745 · https://support.google.com/gemini/answer/13594961 | 원문 확인 |
| 4 | ChatGPT | Settings → Personalization / 모바일 Customize ChatGPT, 무료 1,500자 | https://help.openai.com/en/articles/8096356 | 원문 확인 |
| 4 | Claude | 이니셜 → Settings → Your Claude(예전 Account) → Instructions | https://support.claude.com/en/articles/10185728 | 원문 확인 |
| 4 | Gemini | Settings → Personal context, "Your instructions for Gemini", 18세 미만 불가 | https://support.google.com/gemini/answer/16413516 | 원문 확인 |
| 5 | ChatGPT | Projects + → New project → Create project; ••• → Project settings → Instructions | https://help.openai.com/en/articles/10169521 | 원문 확인 |
| 5 | Claude | claude.ai/projects → + New Project → Set project instructions; 무료 5개; 대화끼리 공유 안 됨 | https://support.claude.com/en/articles/9519177 · https://support.claude.com/en/articles/9517075 | 원문 확인 |
| 5 | Gemini | Notebooks: New notebook → Add sources; More → Notebook settings; 점진 배포 | https://support.google.com/gemini/answer/16972047 | 원문 확인 |
| 6 | ChatGPT | Skills는 Business·Enterprise·Healthcare·Edu만; Plugins → Skills → Add → Create with chat | https://help.openai.com/en/articles/20001066 | 원문 확인 |
| 6 | ChatGPT | 커스텀 GPT 2026-12-11 종료, 플러그인으로 이전 | https://help.openai.com/en/articles/20001519 | 원문 확인 |
| 6 | Claude | 무료 포함, Capabilities에서 코드 실행 켜기, Customize → Skills → + → Create skill → Upload a skill(ZIP) | https://support.claude.com/en/articles/12512180 | 원문 확인 |
| 6 | Gemini | Customize → Skills → Create → Create with Gemini / Create manually, 18세 이상 | https://support.google.com/gemini/answer/17094296 | 원문 확인 |
| 6 | Gemini | Gems: 2026-11-17 읽기 전용, 12-17 삭제(개인 계정) | https://support.google.com/gemini/answer/18560919 | 원문 확인 |
| 7 | ChatGPT | Settings → Plugins → 앱 → Connect, @ 로 사용, 요금제·지역에 따라 다름 | https://help.openai.com/en/articles/11487775 | 원문 확인 |
| 7 | ChatGPT | 연결된 구글 앱 데이터로 학습하지 않음 | https://help.openai.com/en/articles/10408842 | 원문 확인 |
| 7 | Claude | Customize → Connectors; Gmail·Calendar·Drive 모든 사용자, 행동 전 승인 | https://support.claude.com/en/articles/11176164 · https://support.claude.com/en/articles/10166901 | 원문 확인 |
| 7 | Gemini | History 켜기 필요, Customize → Connectors, @ 로 서비스 선택 | https://support.google.com/gemini/answer/15229592 · https://support.google.com/gemini/answer/13695044 | 원문 확인 |
| 8 | ChatGPT | Scheduled → New task; 무료 3개·하루 1번·대략 시간; 이벤트 작업 Plus 이상·Work | https://help.openai.com/en/articles/10291617 | 원문 확인 |
| 8 | Claude | 예약 작업 유료 전용, Scheduled → New task, 클라우드 실행 | https://support.claude.com/en/articles/13854387 | 원문 확인 |
| 8 | Gemini | 대화로 일정 만들기, Scheduled 관리, 10개, History 필요, 점진 배포 | https://support.google.com/gemini/answer/16316416 | 원문 확인 |
| 8 | Gemini | Tasks 예약: 한국 구독 없이 가능(하루 1번 시간대), Gmail 감시는 Pro·Ultra | https://support.google.com/gemini/answer/17094710 | 원문 확인 |
| 8 | Zapier | Gmail 새 메일 → ChatGPT 요약 → Slack 템플릿 | https://zapier.com/blog/generate-email-summaries-with-ai/ | 검색 확인 |
| 9 | ChatGPT | + → Deep research 또는 /Deepresearch, 계획 수정, 요금제별 사용량 | https://help.openai.com/en/articles/10500283 | 원문 확인 |
| 9 | Claude | Research는 유료 전용, 웹 검색 필요, + → Research | https://support.claude.com/en/articles/11088861 | 원문 확인 |
| 9 | Gemini | 18세 이상, Add files → Deep Research, Edit plan → Start research, 하루 제한, 5~10분 | https://support.google.com/gemini/answer/15719111 | 원문 확인 |
| 10 | OpenAI | 대시보드에서 키 생성, OPENAI_API_KEY, Responses curl 형식, 모델 gpt-6.2-astra | https://developers.openai.com/api/docs/quickstart | 원문 확인 |
| 10 | OpenAI | 키 공유 금지, 만료일, 클라이언트 노출 금지, 저장소 커밋 금지 | https://help.openai.com/en/articles/5112595 | 원문 확인 |
| 10 | OpenAI | 프로젝트 지출 한도(spend limits) | https://help.openai.com/en/articles/9186755 | 원문 확인 |
| 10 | Claude API | Console에서 키, x-api-key, anthropic-version 2026-10-21, claude-opus-5-5 | https://platform.claude.com/docs/en/get-started | 원문 확인 |
| 10 | Claude API | 지출 한도 platform.claude.com/settings/spend-limits | https://platform.claude.com/docs/en/api/rate-limits | 원문 확인 |
| 10 | Gemini API | x-goog-api-key 헤더, GEMINI_API_KEY | https://ai.google.dev/gemini-api/docs/quickstart | 검색 확인 |
| 10 | Gemini API | AI Studio Spend → Monthly spend cap → Edit spend cap | https://ai.google.dev/gemini-api/docs/billing | 검색 확인 |
| 11 | Claude Code | 설치 명령, 구독(Pro 이상) 또는 Console 계정 필요 | https://docs.anthropic.com/en/docs/claude-code/quickstart (→ code.claude.com) | 원문 확인 |
| 11 | Codex | 무료·Go 포함 모든 요금제, CLI에서 codex 실행 후 ChatGPT 로그인 | https://help.openai.com/en/articles/11369540 | 원문 확인 |
| 11 | Codex | npm install -g @openai/codex | https://developers.openai.com/codex/cli | 검색 확인 |
| 11 | Gemini CLI | npm 설치, Node.js 20+ | https://geminicli.com/docs/get-started/installation/ | 검색 확인 |
| 11 | Gemini CLI | 개인 계정 2026-06-18 Antigravity CLI로 전환, 유료 API 키는 계속 | https://github.com/google-gemini/gemini-cli/discussions/27274 · https://geminicli.com/docs/resources/quota-and-pricing/ | 검색 확인 |
| 12 | MCP | 정의('AI용 USB-C'), filesystem 서버 예시 | https://modelcontextprotocol.io/docs/getting-started/intro · https://modelcontextprotocol.io/docs/develop/connect-local-servers | 원문 확인 |
| 12 | Claude Code | claude mcp add --transport stdio 이름 -- 명령, claude mcp list, /mcp, 신뢰·프롬프트 주입 경고 | https://docs.anthropic.com/en/docs/claude-code/mcp (→ code.claude.com) | 원문 확인 |
| 12 | Codex | ~/.codex/config.toml [mcp_servers.이름] command/args, codex mcp add --url | https://developers.openai.com/codex/mcp | 검색 확인 |
| 12 | Gemini CLI | gemini mcp add 이름 명령 인자, ~/.gemini/settings.json mcpServers | https://geminicli.com/docs/tools/mcp-server/ | 검색 확인 |

## 확인 필요/불확실
1. **Gemini CLI가 승인 목록에 있지만, 개인 계정(무료·Google AI Pro·Ultra)은 2026-06-18부터 Antigravity CLI(`agy`)로 바뀐 것으로 보여요**(검색 확인; GitHub 공지·geminicli.com 안내). 개발자 앱 목록을 "Antigravity CLI"로 바꿀지 오너가 정해 주세요. Antigravity CLI의 설치·MCP 설정 방법(설정 파일 위치 등)은 출처끼리 달라서 카드에 자세히 쓰지 않았어요.
2. **Gemini 메뉴 이름이 바뀌는 중이에요.** 같은 Google 도움말 안에서도 "기록(History)"과 "활동 유지(Keep Activity)/Gemini 앱 활동"이 섞여 있어요. 학습 체크박스 이름도 "text & attachments"와 "text & uploads"가 함께 보여요. 카드에는 새 이름(History)을 앞에, 예전 이름을 괄호로 썼어요.
3. **실습 4 승인본의 Gemini 경로**: 도움말 원문은 "Settings → Personal context"이고, 지침 토글 이름은 "Your instructions for Gemini"예요. 승인본의 "설정 및 도움말"·"Gemini 지침"은 화면 표기와 조금 다를 수 있어요(승인본이라 고치지 않았어요).
4. **ChatGPT Gmail·Google Calendar 연결의 요금제별 제공 범위**(무료 포함 여부)는 원문에 "요금제·지역에 따라 다름"으로만 있어요. 무료 계정에서 직접 확인이 필요해요.
5. **Claude 스킬을 대화만으로 바로 저장하는 방법**은 원문에서 확인하지 못했어요. 확인된 길은 "ZIP 올리기"예요. 그래서 카드에는 "Claude에게 ZIP을 만들어 달라고 한 뒤 올리기"로 썼어요. 실제로 해 보고 더 쉬운 길이 있으면 바꿔 주세요. (녹화로 스킬 만들기는 Mac의 Cowork, Pro·Max·Ultra·Team만 돼요.)
6. **Gemini Deep Research 시작 위치**: 원문은 "Add Files → Deep Research"로 적혀 있어 실제 화면과 다를 수 있어요(도구 메뉴일 가능성).
7. **Codex 설치 명령**: 공식 문서는 별도 설치 스크립트를 권하고 npm은 여러 방법 중 하나라는 검색 결과만 있어요(developers.openai.com/codex는 이 환경에서 403으로 열리지 않음). `codex mcp add`로 로컬(stdio) 서버를 넣는 정확한 문법도 확인 못 해서 config.toml 방식만 적었어요. Codex 안의 MCP 확인 명령(`/mcp`)도 미확인이에요.
8. **Gemini API curl 예시와 모델 이름**은 원문을 못 열어(ai.google.dev) 카드에 적지 않고 "공식 빠른 시작에서 복사"로 안내했어요. OpenAI·Claude 모델 이름(gpt-6.2-astra, claude-opus-5-5)과 anthropic-version(2026-10-21)은 오늘 원문 기준이라 곧 바뀔 수 있어요.
9. **Gemini 일정(Schedules) 요금제**: 데스크톱 도움말 원문은 개인 계정 전체로 점진 배포라고 하고, 일부 지역판·예전판은 Google AI Pro·Ultra 전용이라고 해요. 한국 계정에서 무료로 보이는지 확인이 필요해요.
10. **메신저로 보내기**: Zapier의 Slack 템플릿만 검색으로 확인했어요. 카카오톡이 Zapier·Make에서 되는지는 확인하지 못했어요. Make는 확인하지 않았어요.
11. **"API 사용료는 앱 구독료와 따로"**: Claude Code 문서의 "Console(선불 API)"·Codex의 "API 키는 표준 API 요금" 설명에 근거했고, 세 회사 모두에 대한 한 문장짜리 공식 문구는 따로 확인하지 않았어요.
12. **ChatGPT 휴대폰 앱의 임시 채팅·플러그인 메뉴 위치**, **Claude 휴대폰 앱의 커넥터 위치**는 원문이 웹 위주라 휴대폰 화면은 확인하지 못했어요.
13. 관련 강의는 data/videos.json의 제목·요약으로만 골랐고 영상은 보지 않았어요.
