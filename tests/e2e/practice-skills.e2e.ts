import { chipLabels, expect, RESULT_QUERY, test } from "./fixtures";
import { axeCheck, expectNoOverflow, SKILLS } from "./helpers-saved";

/** 강의 보고 해보기 · 이번 주 실습 미션 · 요즘 주목받는 AI 스킬 · 결과 칩 */
const NON_BEGINNER = "l=practitioner&d=automation&g=use_tools,build_agents&ko=1";
const BEGINNER = "l=beginner&d=education&g=understand&ko=1";

test.describe("강의 보고 해보기", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("카드를 펼치면 미션이 보이고, 프롬프트 복사가 된다 (자리표시자 강조)", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const card = page.locator("article").first();
    const mission = card.getByTestId("practice-mission");
    await expect(mission).toBeHidden(); // 기본은 접힘
    await card.getByRole("button", { name: "자세히 보기" }).click();
    await expect(mission).toBeVisible();
    await expect(mission.getByText("강의 보고 해보기")).toBeVisible();
    await expect(mission.getByText("이렇게 되면 성공")).toBeVisible();
    expect(await mission.getByRole("list", { name: "해 보는 순서" }).getByRole("listitem").count()).toBeGreaterThanOrEqual(2);

    const box = mission.getByTestId("prompt-box").first();
    const expected = (await box.getByTestId("prompt-text").innerText()).trim();
    await box.getByRole("button", { name: /^프롬프트 복사/ }).click();
    await expect(page.getByTestId("toast")).toHaveText("복사했어요");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.trim()).toBe(expected);
    // 자리표시자가 있으면 강조 표시
    if (/\[[^\]]+\]/.test(expected)) await expect(box.locator("mark[data-placeholder]").first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("이번 주 실습 미션", () => {
  test("로드맵 위에 접힌 카드로 보이고, 강의 카드로 이동·펼치기가 된다", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    const weekly = page.getByTestId("weekly-mission");
    await expect(weekly).toBeVisible();
    await expect(weekly.getByRole("heading", { name: "이번 주 실습 미션" })).toBeVisible();
    const body = weekly.getByTestId("prompt-box").first();
    await expect(body).toBeHidden();
    await weekly.getByRole("button", { name: "미션 펼쳐 보기" }).click();
    await expect(body).toBeVisible();

    const href = (await weekly.getByTestId("weekly-lecture-link").getAttribute("href"))!;
    expect(href).toMatch(/^#lecture-/);
    await weekly.getByTestId("weekly-lecture-link").click();
    await expect(page.locator(`[id="${href.slice(1)}"] article`)).toBeInViewport();

    // 추천 강의 바로 보기는 그대로 로드맵 제목으로
    await page.goto(`/result?${NON_BEGINNER}`);
    await page.getByRole("link", { name: "추천 강의 바로 보기", exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: "추천 로드맵" })).toBeInViewport();
  });
});

test.describe("요즘 주목받는 AI 스킬", () => {
  test("입문자가 아니면 3개, 펼치면 근거·첫걸음·관련 강의", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    const section = page.getByTestId("skills-section");
    await expect(section.getByRole("heading", { name: "요즘 주목받는 AI 스킬" })).toBeVisible();
    await expect(section).toContainText(/\d{4}년 \d{1,2}월 기준/);
    const cards = section.getByTestId("skill-card");
    await expect(cards).toHaveCount(3);
    await cards.first().locator("summary").click();
    await expect(cards.first().getByText("왜 지금")).toBeVisible();
    await expect(cards.first().getByTestId("prompt-box")).toBeVisible();
    for (const a of await cards.first().getByTestId("skill-sources").locator("a").all()) {
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", /noopener/);
    }
    for (const a of await cards.first().getByTestId("skill-lectures").locator("a").all()) {
      const href = (await a.getAttribute("href"))!;
      if (href.startsWith("#lecture-")) await expect(page.locator(`[id="${href.slice(1)}"] article`)).toHaveCount(1);
      else expect(href).toMatch(/^https:\/\/www\.youtube\.com\//);
    }
    await expect(section.getByRole("link", { name: /스킬 전체 보기/ })).toHaveAttribute("href", "/skills");
  });

  test("입문자에게는 스킬 대신 한 줄 안내", async ({ page }) => {
    await page.goto(`/result?${BEGINNER}`);
    await expect(page.getByTestId("skills-section")).toHaveCount(0);
    await expect(page.getByTestId("skills-hint")).toHaveText("기본기를 익히면 다음 단계 스킬을 추천해 드려요.");
  });

  test("/skills: 전체 목록, 해시로 해당 스킬이 펼쳐진다, sitemap 포함", async ({ page, request, consoleErrors }) => {
    const target = SKILLS[Math.min(3, SKILLS.length - 1)];
    await page.goto(`/skills#${target.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("요즘 주목받는 AI 스킬");
    await expect(page.getByTestId("skill-card")).toHaveCount(SKILLS.length);
    await expect(page.locator(`details#${target.id}`)).toHaveAttribute("open", "");
    await page.evaluate((id) => (window.location.hash = `#${id}`), SKILLS[0].id);
    await expect(page.locator(`details#${SKILLS[0].id}`)).toHaveAttribute("open", "");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/skills");
    expect(consoleErrors).toEqual([]);
  });

  test("랜딩·용어집·이론·결과에서 /skills로 갈 수 있다", async ({ page }) => {
    for (const p of ["/", "/glossary", "/theory", `/result?${RESULT_QUERY}`]) {
      await page.goto(p);
      expect(await page.locator('a[href="/skills"]').count(), p).toBeGreaterThan(0);
    }
  });
});

test.describe("결과 칩", () => {
  test("수준·분야·목표 묶음 이름과 1순위 표시", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    const summary = page.getByRole("group", { name: "진단 요약" });
    for (const name of ["수준", "분야", "목표"]) await expect(summary.getByRole("list", { name })).toBeVisible();
    const goals = summary.getByRole("list", { name: "목표" }).getByRole("listitem");
    await expect(goals.first()).toContainText("1순위");
    expect(chipLabels(await goals.allInnerTexts())).toEqual(["업무 도구로 쓰기", "나만의 에이전트 만들기"]);
  });
});

test.describe("좁은 화면·접근성", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  test("320px: 펼친 결과 섹션·/skills에 가로 넘침이 없다", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    await page.getByTestId("weekly-mission").getByRole("button", { name: "미션 펼쳐 보기" }).click();
    await page.locator("article").first().getByRole("button", { name: "자세히 보기" }).click();
    await page.getByTestId("skills-section").locator("summary").first().click();
    await expectNoOverflow(page);
    await page.goto(`/skills#${SKILLS[0].id}`);
    await expectNoOverflow(page);
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 실습·스킬`, () => {
    test.use({ colorScheme: scheme });
    test("결과: 실습·이번 주 미션·스킬 펼침", async ({ page }) => {
      await page.goto(`/result?${NON_BEGINNER}`);
      await page.getByTestId("weekly-mission").getByRole("button", { name: "미션 펼쳐 보기" }).click();
      await page.locator("article").first().getByRole("button", { name: "자세히 보기" }).click();
      await page.getByTestId("skills-section").locator("summary").first().click();
      await page.waitForTimeout(800);
      await axeCheck(page, `결과 펼침(실습·스킬)/${scheme}`);
    });
    test("/skills (펼침)", async ({ page }) => {
      await page.goto(`/skills#${SKILLS[0].id}`);
      await page.waitForTimeout(800);
      await axeCheck(page, `/skills/${scheme}`);
    });
  });
}
