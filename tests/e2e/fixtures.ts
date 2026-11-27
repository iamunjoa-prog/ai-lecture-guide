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

/** 수준 질문 제목 (순서대로) */
export const LEVEL_TITLES = {
  frequency: "AI 챗봇, 얼마나 자주 쓰세요?",
  prompt: "AI에게 무언가를 부탁할 때 어떻게 말하세요?",
  work: "업무나 공부에 AI를 어디까지 써 봤나요?",
  connect: "AI를 다른 앱이나 프로그램과 연결해 본 적 있나요?",
  coding: "코딩은 어디까지 해 봤나요?",
  aiCoding: "코드를 만들 때 AI의 도움을 받아 봤나요?",
} as const;

/** 수준 질문 6개의 가장 낮은 답 */
export const LEVEL_ANSWERS_LOW = [/^아직 거의 안 써 봤어요/, /^궁금한 걸 바로 물어봐요/, /^아직 써 본 적 없어요/, /^아직 없어요/, /^전혀 안 해요/, /^안 써 봤어요/];
/** 수준 질문 6개의 가장 높은 답 (→ developer) */
export const LEVEL_ANSWERS_HIGH = [/^거의 매일 써요/, /^잘 되는 요청을 저장해/, /^반복 업무를 AI로 자동화/, /^AI API를 코드로/, /^개발이 직업이에요/, /^코딩 에이전트에게/];

/** 단일 선택 질문 6개(수준)를 주어진 답(기본: 가장 낮은 답)으로 넘기고 분야 질문까지 간다 */
export async function answerLevelQuestionsLow(page: Page, answers: RegExp[] = LEVEL_ANSWERS_LOW) {
  await page.goto("/diagnosis");
  const titles = Object.values(LEVEL_TITLES);
  for (let i = 0; i < answers.length; i++) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(titles[i]);
    await chooseSingle(page, answers[i]);
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("어떤 분야에 AI를 쓰고 싶으세요?");
}

/** 목표(다중 선택)를 순서대로 고르고 다음으로 */
export async function chooseGoals(page: Page, names: RegExp[]) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI로 이루고 싶은 목표는 무엇인가요?");
  for (const name of names) await page.getByRole("checkbox", { name }).click();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("한국어로 들을 수 있는 강의가 좋으세요?");
}

/** 결과 화면에 바로 들어갈 수 있는 쿼리 */
export const RESULT_QUERY = "l=developer&d=coding&g=build_agents&ko=0";

/** 단일 선택 질문에서 옵션을 고르고 다음 질문으로 자동으로 넘어갈 때까지 기다린다 */
export async function chooseSingle(page: Page, optionName: string | RegExp, nextTitle?: string | RegExp) {
  await page.getByRole("radio", { name: optionName }).click();
  if (nextTitle) await expect(page.getByRole("heading", { level: 1 })).toHaveText(nextTitle);
}
