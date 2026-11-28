import { test as base, expect, type Page } from "@playwright/test";

/** 1×1 투명 PNG */
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

/**
 * 외부 요청은 네트워크 상태와 상관없이 테스트가 같게 돌도록 가짜 응답으로 막는다.
 *  - 외부 스타일시트·기타 요청 → 빈 응답 (폰트는 자체 호스팅이라 외부 요청이 없어야 한다: launch.e2e.ts에서 확인)
 *  - 썸네일(i.ytimg.com) 등 이미지 → 1×1 PNG
 * 유튜브 링크는 클릭하지 않고 href만 검사한다.
 */
async function stubExternal(page: Page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => {
    const type = route.request().resourceType();
    if (type === "stylesheet") return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    if (type === "image") return route.fulfill({ status: 200, contentType: "image/png", body: PIXEL });
    return route.fulfill({ status: 204, body: "" });
  });
}

interface Fixtures {
  /** 테스트 동안 쌓인 콘솔 에러·페이지 에러 */
  consoleErrors: string[];
}

export const test = base.extend<Fixtures>({
  consoleErrors: async ({ page }, provide) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    await provide(errors);
  },
  page: async ({ page }, provide) => {
    await stubExternal(page);
    await provide(page);
  },
});

export { expect };

/** 수준 질문 제목 (순서대로). 코딩을 '전혀 안 해요'면 aiCoding은 건너뛴다 */
export const LEVEL_TITLES = {
  frequency: "AI 챗봇, 얼마나 자주 쓰세요?",
  prompt: "AI에게 부탁할 때 어떻게 말하세요?",
  work: "AI를 어디까지 써 봤나요?",
  connect: "AI를 다른 앱과 연결해 봤나요?",
  coding: "코딩은 어디까지 해 봤나요?",
  aiCoding: "코딩할 때 AI 도움을 받아 봤나요?",
} as const;
export const DOMAIN_TITLE = "어디에 AI를 쓰고 싶으세요?";
export const GOAL_TITLE = "AI로 무엇을 하고 싶으세요?";
export const STUDY_TITLE = "어떻게 배우는 게 편하세요?";

/** 수준 질문의 가장 낮은 답 (코딩 '전혀 안 해요' → AI 코딩 질문 없음, 5개) */
export const LEVEL_ANSWERS_LOW = [/^아직 거의 안 써 봤어요/, /^궁금한 걸 바로 물어봐요/, /^아직 안 써 봤어요/, /^아직 없어요/, /^전혀 안 해요/];
/** 수준 질문 6개의 가장 높은 답 (→ developer) */
export const LEVEL_ANSWERS_HIGH = [/^거의 매일 써요/, /^잘 되는 요청을 저장해/, /^AI에게 일을 통째로/, /^API를 코드로/, /^배포해 봤거나/, /^코딩 에이전트에게/];

/** 단일 선택 수준 질문을 주어진 답(기본: 가장 낮은 답)으로 넘기고 분야 질문까지 간다 */
export async function answerLevelQuestionsLow(page: Page, answers: RegExp[] = LEVEL_ANSWERS_LOW) {
  await page.goto("/diagnosis");
  const titles = Object.values(LEVEL_TITLES);
  for (let i = 0; i < answers.length; i++) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(titles[i]);
    await chooseSingle(page, answers[i]);
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(DOMAIN_TITLE);
}

/** 목표(다중 선택)를 순서대로 고르고 다음으로 */
export async function chooseGoals(page: Page, names: RegExp[]) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(GOAL_TITLE);
  for (const name of names) await page.getByRole("checkbox", { name }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(STUDY_TITLE);
}

/**
 * 마지막 화면: 공부 방법을 고르고(기본 '골고루') '한국어 강의 먼저' 체크(기본 켜짐)를 맞춘 뒤 결과 보기.
 * 결과 화면 주소가 될 때까지 기다린다.
 */
export async function finishStudy(page: Page, opts: StudyOpts = {}) {
  await submitStudy(page, opts);
  await page.waitForURL(/\/result\?/, { timeout: 10_000 });
}

type StudyOpts = { style?: RegExp; korean?: boolean };

/** finishStudy와 같지만 결과 화면을 기다리지 않는다 (로딩 화면을 검사할 때) */
export async function submitStudy(page: Page, { style = /^골고루 다 할래요/, korean = true }: StudyOpts = {}) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(STUDY_TITLE);
  await page.getByRole("radio", { name: style }).click();
  await page.getByRole("checkbox", { name: /한국어 강의를 먼저/ }).setChecked(korean);
  await page.getByRole("button", { name: "결과 보기" }).click();
}

/** 결과 화면에 바로 들어갈 수 있는 쿼리 */
export const RESULT_QUERY = "l=developer&d=coding&g=build_agents&ko=0";

/** 단일 선택 질문에서 옵션을 고르고 다음 질문으로 자동으로 넘어갈 때까지 기다린다 */
export async function chooseSingle(page: Page, optionName: string | RegExp, nextTitle?: string | RegExp) {
  await page.getByRole("radio", { name: optionName }).click();
  if (nextTitle) await expect(page.getByRole("heading", { level: 1 })).toHaveText(nextTitle);
}

/** 진단 요약 칩 글자에서 '1순위' 표시를 떼어 낸다 */
export const chipLabels = (texts: string[]) => texts.map((t) => t.replace(/^1순위\s*/, "").trim());

/** 내 학습함 저장 키 (src/lib/saved.ts와 같다) */
export const SAVED_KEY = "aig:saved:v1";

/** 결과 히어로의 요약 한 줄을 눌러 진단 요약 칩(수준·분야·목표·언어)을 펼친다 */
export async function openSummary(page: Page) {
  const toggle = page.getByTestId("summary-toggle");
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  return page.getByRole("group", { name: "진단 요약" });
}

/** 카드 덱 기억 저장 키 (src/lib/card-deck.ts와 같다) */
export const DECK_KEY = "aig:deck:v1";

/**
 * 결과 화면 실습·준비 탭을 '전체 목록 보기'로 연다 (예전 목록 동작을 검사하는 테스트).
 * 기본은 한 장씩 보는 카드 덱이다. 이미 저장된 값이 있으면 건드리지 않는다(새로고침해도 사용자가 바꾼 값 유지).
 */
export async function preferListView(page: Page, kinds: ("practice" | "prep")[] = ["practice", "prep"]) {
  await page.addInitScript(
    ([k, list]) => {
      if (!localStorage.getItem(k)) {
        localStorage.setItem(k, JSON.stringify({ version: 1, positions: {}, views: Object.fromEntries(list.map((x) => [x, "list"])) }));
      }
    },
    [DECK_KEY, kinds] as const,
  );
}
