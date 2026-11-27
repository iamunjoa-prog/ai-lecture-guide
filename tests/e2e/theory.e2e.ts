import { expect, RESULT_QUERY, test } from "./fixtures";

/** 결과 화면 '시작 전 준비' 탭의 '강의 보기 전 3분 이론'과 /theory 페이지 */
test.describe("결과: 3분 이론", () => {
  test("개념 3개, 첫 개념만 펼쳐져 있고 다른 개념도 펼칠 수 있다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${RESULT_QUERY}#prep`);
    await expect(page.getByRole("heading", { level: 2, name: "강의 보기 전 3분 이론" })).toBeVisible();
    const items = page.getByTestId("theory-list").getByTestId("theory-concept");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveAttribute("open", "");
    await expect(items.nth(1)).not.toHaveAttribute("open", "");
    await expect(items.nth(2)).not.toHaveAttribute("open", "");

    // 첫 개념: 본문 · 쉽게 말하면 · 강의 · 출처
    const first = items.nth(0);
    await expect(first.getByText("쉽게 말하면", { exact: true })).toBeVisible();
    await expect(first.getByText("이 개념이 나오는 강의", { exact: true })).toBeVisible();
    expect(await first.locator("p.leading-\\[1\\.75\\]").count()).toBeGreaterThanOrEqual(3);

    // 키보드로 두 번째 개념 펼치기
    const second = items.nth(1);
    await second.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("open", "");
    await expect(second.getByText("쉽게 말하면", { exact: true })).toBeVisible();
    // 다시 접기
    await second.locator("summary").click();
    await expect(second).not.toHaveAttribute("open", "");
    expect(consoleErrors).toEqual([]);
  });

  test("강의 링크: 로드맵 강의는 '추천 강의' 탭으로 바꿔 카드로 이동, 아니면 유튜브 새 탭", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}#prep`);
    const items = page.getByTestId("theory-list").getByTestId("theory-concept");
    let internal = 0;
    for (let i = 0; i < 3; i++) {
      const links = items.nth(i).getByTestId("theory-lectures").locator("a");
      const n = await links.count();
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(2);
      for (let k = 0; k < n; k++) {
        const href = (await links.nth(k).getAttribute("href"))!;
        if (href.startsWith("#lecture-")) {
          internal++;
          await expect(page.locator(`[id="${href.slice(1)}"] article`)).toHaveCount(1);
        } else {
          expect(href).toMatch(/^https:\/\/www\.youtube\.com\/(watch\?v=|playlist\?list=)[\w-]+$/);
          await expect(links.nth(k)).toHaveAttribute("target", "_blank");
          await expect(links.nth(k)).toHaveAttribute("rel", /noopener/);
        }
      }
    }
    expect(internal).toBeGreaterThan(0);

    // 첫 개념의 로드맵 강의 링크를 누르면 '추천 강의' 탭으로 바뀌고 해당 카드가 화면에 보인다
    const inRoadmap = page.getByTestId("theory-list").locator('a[href^="#lecture-"]').first();
    const target = (await inRoadmap.getAttribute("href"))!;
    await inRoadmap.click();
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.getByRole("tab", { name: "추천 강의" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("result-panel-prep")).toBeHidden();
    await expect(page.locator(`[id="${target.slice(1)}"] article`)).toBeInViewport();
    // 뒤로 가기: 다시 '시작 전 준비'
    await page.goBack();
    await expect(page.getByRole("tab", { name: "시작 전 준비" })).toHaveAttribute("aria-selected", "true");
  });

  test("출처는 새 탭 외부 링크(rel noopener)이고 개념마다 2개 이상", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}#prep`);
    const items = page.getByTestId("theory-list").getByTestId("theory-concept");
    for (let i = 0; i < 3; i++) {
      const links = items.nth(i).getByTestId("theory-sources").locator("a");
      expect(await links.count()).toBeGreaterThanOrEqual(2);
      for (const a of await links.all()) {
        await expect(a).toHaveAttribute("href", /^https:\/\//);
        await expect(a).toHaveAttribute("target", "_blank");
        await expect(a).toHaveAttribute("rel", /noopener/);
      }
    }
  });

  test("'이론 전체 보기'는 /theory로, 추천 강의 바로 보기는 '추천 강의' 탭의 로드맵으로", async ({ page }) => {
    await page.goto(`/result?l=beginner&d=education&g=understand&ko=1#prep`);
    await expect(page.getByRole("link", { name: /이론 전체 보기/ })).toHaveAttribute("href", "/theory?l=beginner");
    // 이론 아래 '이론은 나중에' 링크도 추천 강의 탭으로 보낸다
    await page.getByRole("link", { name: /이론은 나중에, 추천 강의 바로 보기/ }).click();
    await expect(page.getByRole("heading", { level: 2, name: "추천 로드맵" })).toBeInViewport();
    await page.getByRole("tab", { name: "시작 전 준비" }).click();
    const jump = page.getByRole("link", { name: "추천 강의 바로 보기", exact: true });
    await jump.click();
    await expect(page).toHaveURL(/#roadmap$/);
    await expect(page.getByRole("heading", { level: 2, name: "추천 로드맵" })).toBeInViewport();
  });

  test("수준마다 다른 개념이 나온다 (입문자는 '다음 말' 개념이 먼저)", async ({ page }) => {
    await page.goto(`/result?l=beginner&d=education&g=use_tools&ko=1#prep`);
    const first = page.getByTestId("theory-list").getByTestId("theory-concept").first();
    await expect(first.locator("summary")).toContainText("다음 말");
  });
});

test.describe("/theory", () => {
  test("수준별 4개 구역과 빠른 이동, 개념 23개", async ({ page, consoleErrors }) => {
    await page.goto("/theory");
    await expect(page).toHaveTitle(/3분 이론/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("3분 이론");
    for (const t of ["입문 이론", "활용 이론", "실무 이론", "개발 이론"]) {
      await expect(page.getByRole("heading", { level: 2, name: t })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "수준별 바로가기" }).getByRole("link")).toHaveCount(4);
    await expect(page.getByTestId("theory-concept")).toHaveCount(23);
    expect(consoleErrors).toEqual([]);
  });

  test("해시 딥링크가 해당 개념을 펼친다 (로드·hashchange)", async ({ page }) => {
    await page.goto("/theory#rag-search-then-answer");
    await expect(page.locator("details#rag-search-then-answer")).toHaveAttribute("open", "");
    await expect(page.locator("details#rag-search-then-answer summary")).toBeInViewport();
    await page.evaluate(() => (window.location.hash = "#agent-loop"));
    await expect(page.locator("details#agent-loop")).toHaveAttribute("open", "");
  });

  test("랜딩과 용어집 바닥글에서 /theory로 갈 수 있다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "바닥글" }).getByRole("link", { name: "3분 이론" })).toHaveAttribute("href", "/theory");
    await page.goto("/glossary");
    await expect(page.getByRole("link", { name: "3분 이론" })).toHaveAttribute("href", "/theory");
  });
});
