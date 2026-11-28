import AxeBuilder from "@axe-core/playwright";
import { GOAL_TITLE, LEVEL_TITLES, answerLevelQuestionsLow, chipLabels, chooseGoals, chooseSingle, expect, openSummary, submitStudy, test } from "./fixtures";

/** 진단 v2: 용어 한 입 · 세분화된 수준 질문 · 목표 다중 선택 · 진단 결론 */

test.describe("용어 한 입", () => {
  test("질문 아래에 용어 설명이 보이고, 선택지 묶음이 aria-describedby로 연결된다", async ({ page }) => {
    await page.goto("/diagnosis");
    const box = page.getByTestId("term-hints");
    await expect(box).toBeVisible();
    await expect(box).toContainText("챗봇");
    await expect(box).toContainText("대화하듯 묻고 답을 받는 AI예요");

    const group = page.getByRole("radiogroup");
    const describedBy = (await group.getAttribute("aria-describedby")) ?? "";
    const boxId = await box.getAttribute("id");
    expect(describedBy.split(" ")).toContain(boxId);
    // 스크린리더가 실제로 읽는 설명에 용어가 들어간다
    await expect(group).toHaveAccessibleDescription(/챗봇/);
  });

  test("'더 알아보기'는 용어집을 새 탭으로 열고, 진단 화면은 그대로 남는다 (44px 터치 영역)", async ({ page, context }) => {
    await page.goto("/diagnosis");
    const link = page.getByRole("link", { name: /더 알아보기.*챗봇/ });
    await expect(link).toHaveAttribute("href", "/glossary#chatbot");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    const [popup] = await Promise.all([context.waitForEvent("page"), link.click()]);
    await popup.waitForLoadState();
    await expect(popup).toHaveURL(/\/glossary#chatbot$/);
    await expect(popup.locator("details#chatbot")).toHaveAttribute("open", "");
    await expect(page).toHaveURL(/\/diagnosis$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(LEVEL_TITLES.frequency);
    await popup.close();
  });

  test("수준 질문 6개 모두 용어 한 입이 있고(처음엔 1개, 나머지는 '용어 더 보기'), 코딩 질문은 선택지 5개", async ({ page }) => {
    await page.goto("/diagnosis");
    const titles = Object.values(LEVEL_TITLES);
    const firstOptions = [/^거의 매일 써요/, /^상황과 조건을/, /^내 자료를 올려/, /^챗봇에 메일/, /^직접 프로그램을 만들어요/];
    for (let i = 0; i < titles.length; i++) {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(titles[i]);
      const box = page.getByTestId("term-hints");
      await expect(box).toBeVisible();
      await expect(box.getByRole("listitem")).toHaveCount(1);
      if (titles[i] === LEVEL_TITLES.coding) {
        await expect(page.getByRole("radio")).toHaveCount(5);
        await expect(box).toContainText("배포");
      }
      if (titles[i] === LEVEL_TITLES.prompt) {
        const more = page.getByTestId("term-hints-more");
        await expect(more).toHaveAttribute("aria-expanded", "false");
        await expect(box).not.toContainText("역할 지정");
        await more.click();
        await expect(more).toHaveAttribute("aria-expanded", "true");
        await expect(box).toContainText("역할 지정");
      }
      if (i < firstOptions.length) await chooseSingle(page, firstOptions[i]);
    }
    await expect(page.getByTestId("term-hints")).toContainText("코딩 에이전트");
    await expect(page.getByText("AI 활용 수준 · 6/6")).toBeVisible();
  });

  test("코딩을 '전혀 안 해요'면 AI 코딩 질문 없이 분야로 간다 (질문 8개)", async ({ page }) => {
    await page.goto("/diagnosis");
    await expect(page.getByText("1 / 9")).toBeVisible();
    await answerLevelQuestionsLow(page);
    await expect(page.getByText("6 / 8")).toBeVisible();
    await page.getByRole("button", { name: "이전 단계로" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(LEVEL_TITLES.coding);
    await expect(page.getByText("AI 활용 수준 · 5/5")).toBeVisible();
    // 코딩 답을 바꾸면 AI 코딩 질문이 다시 생긴다
    await chooseSingle(page, /^코드를 조금 읽고/, LEVEL_TITLES.aiCoding);
    await expect(page.getByText("6 / 9")).toBeVisible();
  });
});

test.describe("목표 다중 선택", () => {
  test("최대 4개 · 고른 순서 표시 · '아직 잘 모르겠어요'는 단독 선택", async ({ page }) => {
    await answerLevelQuestionsLow(page);
    await page.getByRole("checkbox", { name: /^마케팅·콘텐츠/ }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(GOAL_TITLE);

    const next = page.getByRole("button", { name: "다음", exact: true });
    const unsure = page.getByRole("checkbox", { name: /^아직 잘 모르겠어요/ });
    const tools = page.getByRole("checkbox", { name: /^업무 도구로 쓰기/ });
    const agents = page.getByRole("checkbox", { name: /^나만의 에이전트 만들기/ });
    const understand = page.getByRole("checkbox", { name: /^개념 이해/ });
    const products = page.getByRole("checkbox", { name: /^AI 제품 만들기/ });
    await expect(next).toBeDisabled();

    await tools.click();
    await agents.click();
    await expect(tools).toHaveAccessibleName(/1순위/);
    await expect(agents).toHaveAccessibleName(/2순위/);
    await expect(page.getByText("먼저 고른 목표가 1순위예요")).toBeVisible();

    // 1순위를 해제하면 순서가 당겨진다
    await tools.click();
    await expect(agents).toHaveAccessibleName(/1순위/);
    await tools.click();
    await understand.click();
    await products.click();
    await expect(page.getByText("(4/4)")).toBeVisible();

    // '아직 잘 모르겠어요'는 4개를 고른 뒤에도 누를 수 있고, 다른 선택을 모두 지운다
    await expect(unsure).not.toHaveAttribute("aria-disabled", "true");
    await unsure.click();
    await expect(unsure).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(1);
    await expect(page.getByText("AI가 무엇인지부터 차근차근 알려 드려요")).toBeVisible();
    await expect(next).toBeEnabled();

    // 다른 목표를 고르면 '아직 잘 모르겠어요'가 풀린다
    await products.click();
    await expect(unsure).toHaveAttribute("aria-checked", "false");
    await agents.click();
    await next.click();
    await submitStudy(page, { korean: false });
    await page.waitForURL(/\/result\?/, { timeout: 10_000 });
    expect(new URL(page.url()).searchParams.get("g")).toBe("build_products,build_agents");

    // 결과: 목표마다 칩 하나, 고른 순서대로
    const texts = await (await openSummary(page)).getByRole("listitem").allInnerTexts().then(chipLabels);
    expect(texts.indexOf("AI 제품 만들기")).toBeGreaterThan(-1);
    expect(texts.indexOf("AI 제품 만들기")).toBeLessThan(texts.indexOf("나만의 에이전트 만들기"));
  });

  test("여러 목표 전체 흐름 → 결론 · 칩 · 로드맵", async ({ page, consoleErrors }) => {
    await answerLevelQuestionsLow(page, [/^거의 매일 써요/, /^역할·예시·형식을/, /^AI에게 일을 통째로/, /^자동화 도구로 앱을/, /^전혀 안 해요/]);
    await page.getByRole("checkbox", { name: /^업무 자동화/ }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await chooseGoals(page, [/^업무 도구로 쓰기/, /^나만의 에이전트 만들기/]);
    await submitStudy(page);
    await page.waitForURL(/\/result\?/, { timeout: 10_000 });
    expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual({
      l: "practitioner",
      d: "automation",
      g: "use_tools,build_agents",
      ko: "1",
      s: "all",
    });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("실무자 맞춤 학습 로드맵");
    const conclusion = page.getByRole("region", { name: "진단 결론" });
    await expect(conclusion).toBeVisible();
    await expect(conclusion).toContainText("AI를 업무에 꾸준히 쓰고 계세요.");
    await expect(conclusion).toContainText("다음 단계는 자주 하는 일을 AI에게 맡기는 흐름을 만들어 보는 거예요.");
    // 요약은 한 줄로 접혀 있고, 누르면 칩이 펼쳐진다
    await expect(page.getByTestId("summary-toggle")).toHaveText(/실무자 · 업무 자동화 · 목표 2개/);
    const summary = await openSummary(page);
    await expect(summary).toContainText("업무 도구로 쓰기");
    await expect(summary).toContainText("나만의 에이전트 만들기");
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(3);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("결과 링크 하위 호환 · 결론", () => {
  test("예전 단일 목표 링크(g=use_tools)도 열린다", async ({ page, consoleErrors }) => {
    await page.goto("/result?l=user&d=marketing&g=use_tools&ko=1");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("활용자 맞춤 학습 로드맵");
    await expect(await openSummary(page)).toContainText("업무 도구로 쓰기");
    await expect(page.getByRole("region", { name: "진단 결론" })).toContainText(
      "다음 단계는 잘 되는 요청을 양식으로 만들어 내 자료와 함께 다시 쓰는 거예요.",
    );
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(3);
    expect(consoleErrors).toEqual([]);
  });

  test("목표 여러 개 링크: 목표마다 칩, 결론은 1순위 기준, 첫 화면에 여정과 첫 단계", async ({ page }) => {
    await page.goto("/result?l=developer&d=coding&g=build_products,build_agents,understand&ko=0");
    await expect(page.getByTestId("summary-toggle")).toHaveText(/개발자 · 코딩 · 목표 3개/);
    const chips = await (await openSummary(page)).getByRole("listitem").allInnerTexts().then(chipLabels);
    expect(chips).toEqual(expect.arrayContaining(["AI 제품 만들기", "나만의 에이전트 만들기", "개념 이해"]));
    expect(chips.indexOf("AI 제품 만들기")).toBeLessThan(chips.indexOf("개념 이해"));
    await expect(page.getByRole("region", { name: "진단 결론" })).toContainText("비용·속도·품질");
    // 결론이 있어도 학습 여정과 1단계 제목은 첫 화면에 있다
    await expect(page.getByTestId("journey-steps")).toBeInViewport();
    await expect(page.getByRole("heading", { level: 2, name: /^1단계 · / })).toBeInViewport();
  });

  for (const [name, query] of [
    ["목표에 모르는 값", "?l=user&d=coding&g=use_tools,get_rich&ko=0"],
    ["빈 목표", "?l=user&d=coding&g=&ko=0"],
  ] as const) {
    test(`잘못된 목표 링크(${name})는 빈 상태`, async ({ page }) => {
      await page.goto(`/result${query}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("아직 진단 결과가 없어요");
    });
  }
});

test("랜딩: 질문 수·예상 시간이 데이터와 맞는다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/질문 8~9개 · 약 2분/)).toBeVisible();
  await expect(page.getByRole("link", { name: /2분 진단 시작하기/ })).toBeVisible();
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 진단 v2`, () => {
    test.use({ colorScheme: scheme });
    test("수준 질문(용어 한 입) · 목표 다중 선택(순번)", async ({ page }) => {
      await page.goto("/diagnosis");
      await page.waitForTimeout(800);
      await check(page, `용어 한 입/${scheme}`);
      await answerLevelQuestionsLow(page);
      await page.getByRole("checkbox", { name: /^코딩/ }).click();
      await page.getByRole("button", { name: "다음", exact: true }).click();
      await page.getByRole("checkbox", { name: /^업무 도구로 쓰기/ }).click();
      await page.getByRole("checkbox", { name: /^AI 제품 만들기/ }).click();
      await page.waitForTimeout(800);
      await check(page, `목표 다중 선택/${scheme}`);
    });
    test("결과 상단 결론", async ({ page }) => {
      await page.goto("/result?l=practitioner&d=automation&g=use_tools,build_agents&ko=1");
      await page.waitForTimeout(800);
      await check(page, `결론/${scheme}`);
    });
  });
}

async function check(page: import("@playwright/test").Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const severe = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target.join(" ")) }));
  expect(severe, `${label}: serious/critical 접근성 위반`).toEqual([]);
}
