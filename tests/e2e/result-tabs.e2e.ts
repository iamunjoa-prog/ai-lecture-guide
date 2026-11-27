import { expect, RESULT_QUERY, test } from "./fixtures";
import { axeCheck, expectNoOverflow } from "./helpers-saved";

/** 결과 화면 탭: 추천 강의(기본) · 시작 전 준비 · 다음 스킬(입문자 제외) */
const BEGINNER = "l=beginner&d=automation&g=understand&ko=1";
const PRACTITIONER = "l=practitioner&d=automation&g=use_tools,build_agents&ko=1";

/** 하이드레이션이 끝날 때까지 (그 전에 해시만 바꾸면 Next 라우터의 첫 replaceState가 해시를 지운다) */
const ready = (page: import("@playwright/test").Page) => expect(page.locator('[data-testid="result-tabs"][data-ready]')).toHaveCount(1);

const tab = (page: import("@playwright/test").Page, name: string) => page.getByRole("tablist", { name: "결과 보기" }).getByRole("tab", { name });

test.describe("결과 탭", () => {
  test("기본은 '추천 강의', 탭을 누르면 패널과 주소 해시가 바뀌고 뒤로 가기로 돌아간다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const tabs = page.getByRole("tablist", { name: "결과 보기" }).getByRole("tab");
    await expect(tabs).toHaveText(["추천 강의", "시작 전 준비", "다음 스킬"]);
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("result-panel-lectures")).toBeVisible();
    await expect(page.getByTestId("result-panel-prep")).toBeHidden();
    await expect(page.getByTestId("result-panel-skills")).toBeHidden();
    // 탭은 44px 이상이고 패널과 연결돼 있다
    for (const t of await tabs.all()) {
      expect((await t.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const controls = (await t.getAttribute("aria-controls"))!;
      await expect(page.locator(`[id="${controls}"]`)).toHaveAttribute("role", "tabpanel");
    }

    await tab(page, "시작 전 준비").click();
    await expect(page).toHaveURL(/#prep$/);
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { level: 2, name: "시작 전에 알아두면 좋은 용어" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "강의 보기 전 3분 이론" })).toBeVisible();
    await expect(page.getByTestId("result-panel-lectures")).toBeHidden();

    await tab(page, "다음 스킬").click();
    await expect(page).toHaveURL(/#skills$/);
    await expect(page.getByTestId("skills-section")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/#prep$/);
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("aria-selected", "true");
    await page.goBack();
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
    await page.goForward();
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("aria-selected", "true");

    // 새로고침해도 같은 탭
    await page.reload();
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("result-panel-prep")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("키보드: 화살표·Home·End로 탭을 옮기고 고른다 (선택된 탭만 Tab 순서에)", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await tab(page, "추천 강의").focus();
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "시작 전 준비")).toBeFocused();
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("aria-selected", "true");
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("End");
    await expect(tab(page, "다음 스킬")).toBeFocused();
    await expect(page).toHaveURL(/#skills$/);
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "추천 강의")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tab(page, "다음 스킬")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
  });

  test("스크롤하면 탭 줄이 화면 위에 붙어 있고, 탭을 바꾸면 패널 처음부터 보인다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await page.mouse.wheel(0, 3000);
    await expect.poll(async () => (await page.getByTestId("result-tabs").boundingBox())!.y).toBeLessThanOrEqual(1);
    await tab(page, "시작 전 준비").click();
    await expect(page.getByRole("heading", { level: 2, name: "시작 전에 알아두면 좋은 용어" })).toBeInViewport();
  });

  test("기본 탭에서 로드맵이 1.5화면 안에서 시작한다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const y = await page.evaluate(() => document.getElementById("roadmap-title")!.getBoundingClientRect().top + window.scrollY);
    expect(y).toBeLessThan(844 * 1.5);
  });

  test("입문자: 탭 2개, 스킬 탭·스킬 안내·머리글 'AI 스킬'·스킬 링크가 없다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${BEGINNER}`);
    await expect(page.getByRole("tablist", { name: "결과 보기" }).getByRole("tab")).toHaveText(["추천 강의", "시작 전 준비"]);
    await expect(page.getByTestId("hero-teaser")).toHaveCount(0);
    await expect(page.getByTestId("skills-section")).toHaveCount(0);
    await expect(page.getByTestId("skills-hint")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: "AI 스킬" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: "용어집" })).toBeVisible();
    await expect(page.locator('a[href^="/skills"]')).toHaveCount(0);
    const text = (await page.locator("body").textContent()) ?? "";
    for (const phrase of ["다음 스킬", "AI 스킬", "주목받는", "다음 단계 스킬"]) expect(text, phrase).not.toContain(phrase);
    // 스킬 탭 해시로 들어와도 기본 탭
    await ready(page);
    await page.goto(`/result?${BEGINNER}#skills`);
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
    expect(consoleErrors).toEqual([]);
  });

  test("입문자가 아니면 결론 아래 스킬 한 줄이 '다음 스킬' 탭을 연다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const teaser = page.getByTestId("hero-teaser");
    await expect(teaser).toBeInViewport();
    await expect(teaser).toHaveText(/^다음에 익히면 좋은 스킬: .+ 외 2개$/);
    const first = ((await page.getByTestId("result-panel-skills").getByTestId("skill-card").first().locator("h3").textContent()) ?? "").trim();
    await expect(teaser).toContainText(first);
    await teaser.click();
    await expect(page).toHaveURL(/#skills$/);
    await expect(tab(page, "다음 스킬")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { level: 2, name: "요즘 주목받는 AI 스킬" })).toBeInViewport();
  });

  test("숨은 패널 안 강의 앵커로 바로 들어오면 그 탭을 열고 카드로 스크롤한다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const anchors = await page.locator('[data-tab-panel="lectures"] [id^="lecture-"]').evaluateAll((els) => els.map((e) => e.id));
    const target = anchors[anchors.length - 1];
    await ready(page);
    // 다른 탭에 있다가 강의 앵커 주소로 들어온다
    await page.goto(`/result?${PRACTITIONER}#skills`);
    await expect(tab(page, "다음 스킬")).toHaveAttribute("aria-selected", "true");
    await ready(page);
    await page.goto(`/result?${PRACTITIONER}#${target}`);
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="${target}"] article`)).toBeInViewport();
    // 다른 탭을 보던 중 주소 해시만 바뀌어도 (hashchange) 그 카드로
    await tab(page, "시작 전 준비").click();
    await page.evaluate((id) => (window.location.hash = `#${id}`), anchors[0]);
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="${anchors[0]}"] article`)).toBeInViewport();
  });

  test("다음 스킬 탭의 '내 로드맵에 있어요' 강의 링크는 추천 강의 탭의 카드로", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}#skills`);
    const cards = page.getByTestId("skills-section").getByTestId("skill-card");
    let link = null;
    for (const card of await cards.all()) {
      const internal = card.locator('[data-testid="skill-lectures"] a[href^="#lecture-"]');
      if ((await internal.count()) > 0) {
        await card.getByTestId("skill-more").click();
        link = internal.first();
        break;
      }
    }
    test.skip(!link, "로드맵과 겹치는 스킬 강의가 없다");
    const href = (await link!.getAttribute("href"))!;
    await link!.click();
    await expect(tab(page, "추천 강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="${href.slice(1)}"] article`)).toBeInViewport();
  });

  test("로드맵 위 '시작 전 준비' 한 줄이 준비 탭을 연다", async ({ page }) => {
    await page.goto(`/result?${BEGINNER}`);
    const hint = page.getByTestId("prep-hint");
    await expect(hint).toHaveText(/^강의 전에 용어 \d+개·개념 \d+개를 훑어 보세요$/);
    await hint.click();
    await expect(page).toHaveURL(/#prep$/);
    await expect(tab(page, "시작 전 준비")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { level: 2, name: "시작 전에 알아두면 좋은 용어" })).toBeInViewport();
  });

  test("하이드레이션 경고 없이 해시 탭으로 열린다", async ({ page, consoleErrors }) => {
    for (const h of ["#prep", "#skills", "#roadmap", ""]) {
      await page.goto(`/result?${RESULT_QUERY}${h}`);
      await page.waitForLoadState("networkidle");
    }
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("결과 탭 · 좁은 화면과 움직임 줄이기", () => {
  test.use({ viewport: { width: 320, height: 640 }, reducedMotion: "reduce" });
  test("320px: 탭·머리글이 넘치지 않는다", async ({ page }) => {
    for (const q of [BEGINNER, PRACTITIONER]) {
      await page.goto(`/result?${q}`);
      await expectNoOverflow(page);
      const header = page.getByTestId("site-header");
      expect((await header.boundingBox())!.height, q).toBeLessThanOrEqual(64);
      for (const name of ["추천 강의", "시작 전 준비"]) {
        await tab(page, name).click();
        await expectNoOverflow(page);
      }
    }
    for (const p of ["/", "/glossary", "/skills", "/saved"]) {
      await page.goto(p);
      await expectNoOverflow(page);
      expect((await page.getByTestId("site-header").boundingBox())!.height, p).toBeLessThanOrEqual(64);
    }
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 결과 탭`, () => {
    test.use({ colorScheme: scheme });
    test("탭 3개와 각 패널", async ({ page }) => {
      await page.goto(`/result?${PRACTITIONER}`);
      await page.waitForTimeout(800);
      await axeCheck(page, `결과 탭(추천 강의)/${scheme}`);
      for (const name of ["시작 전 준비", "다음 스킬"]) {
        await tab(page, name).click();
        await page.waitForTimeout(300);
        await axeCheck(page, `결과 탭(${name})/${scheme}`);
      }
    });
    test("입문자 결과 (탭 2개)", async ({ page }) => {
      await page.goto(`/result?${BEGINNER}`);
      await page.waitForTimeout(800);
      await axeCheck(page, `입문자 결과/${scheme}`);
    });
  });
}
