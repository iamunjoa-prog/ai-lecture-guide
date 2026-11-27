import AxeBuilder from "@axe-core/playwright";
import { expect, RESULT_QUERY, test } from "./fixtures";

/**
 * 접근성 점검 (axe-core, WCAG 2.1 A/AA).
 * serious/critical 위반이 있으면 실패한다. 나머지(minor/moderate)는 로그로만 남긴다.
 */
const PAGES = [
  { name: "랜딩", path: "/" },
  { name: "진단", path: "/diagnosis" },
  { name: "결과", path: `/result?${RESULT_QUERY}` },
  { name: "결과(빈 상태)", path: "/result" },
  { name: "용어집", path: "/glossary" },
] as const;

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme}`, () => {
    test.use({ colorScheme: scheme });

    for (const p of PAGES) {
      test(`${p.name} (${p.path})`, async ({ page }) => {
        await page.goto(p.path);
        await page.waitForLoadState("networkidle");
        // 등장 애니메이션(fade-up)이 끝난 뒤 검사해야 색 대비가 정확하다
        await page.waitForTimeout(800);
        await check(page, `${p.name}/${scheme}`);
      });
    }

    test("진단: 분야 질문(다중 선택, 일부 비활성)", async ({ page }) => {
      await page.goto("/diagnosis");
      for (const name of [/거의 매일 써요/, /템플릿으로 만들어 둬요/, /여러 AI 도구를/, /AI API를 직접/, /개발이 제 일이에요/]) {
        await page.getByRole("radio", { name }).click();
        await page.waitForTimeout(350);
      }
      for (const name of [/^코딩/, /^업무 자동화/, /^데이터 분석/]) await page.getByRole("checkbox", { name }).click();
      await page.waitForTimeout(800);
      await check(page, `분야 질문/${scheme}`);
    });

    test("결과: 용어 행·카드 펼침", async ({ page }) => {
      await page.goto(`/result?${RESULT_QUERY}`);
      await page.getByTestId("starter-terms").locator("summary").first().click();
      const card = page.locator("article").first();
      await card.getByRole("button", { name: "자세히 보기" }).click();
      await card.locator("button[aria-pressed]").first().click();
      await page.waitForTimeout(800);
      await check(page, `결과 펼침/${scheme}`);
    });

    test("용어집: 용어 펼침", async ({ page }) => {
      await page.goto("/glossary#llm");
      await page.waitForTimeout(800);
      await check(page, `용어집 펼침/${scheme}`);
    });

    test("강사 선정 기준 시트", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /강사 선정 기준 보기/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.waitForTimeout(800);
      await check(page, `기준 시트/${scheme}`, "dialog");
    });
  });
}

async function check(page: import("@playwright/test").Page, label: string, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  for (const v of violations) {
    const targets = v.nodes.slice(0, 5).map((n) => n.target.join(" "));
    console.log(`[axe ${label}] ${v.impact} ${v.id}: ${v.help}\n    ${targets.join("\n    ")}`);
  }
  const severe = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(" ")) }));
  expect(severe, `${label}: serious/critical 접근성 위반`).toEqual([]);
}
