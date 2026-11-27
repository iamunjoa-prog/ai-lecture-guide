import { test as base, expect, type Page } from "@playwright/test";

/** 1×1 투명 PNG */
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

/**
 * 외부 요청은 네트워크 상태와 상관없이 테스트가 같게 돌도록 가짜 응답으로 막는다.
 *  - 폰트 CSS(cdn.jsdelivr.net) → 빈 CSS
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

/** 결과 화면에 바로 들어갈 수 있는 쿼리 */
export const RESULT_QUERY = "l=developer&d=coding&g=build_agents&ko=0";

/** 단일 선택 질문에서 옵션을 고르고 다음 질문으로 자동으로 넘어갈 때까지 기다린다 */
export async function chooseSingle(page: Page, optionName: string | RegExp, nextTitle?: string | RegExp) {
  await page.getByRole("radio", { name: optionName }).click();
  if (nextTitle) await expect(page.getByRole("heading", { level: 1 })).toHaveText(nextTitle);
}
