import type { Page } from "@playwright/test";
import {
  answerLevelQuestionsLow,
  chooseGoals,
  chooseSingle,
  expect,
  finishStudy,
  LEVEL_TITLES,
  openSummary,
  SAVED_KEY,
  STUDY_TITLE,
  test,
} from "./fixtures";

/** 공부 방법(s=) → 탭 순서 · 기본 탭 · 히어로 한 줄 · 여정 위치, 그리고 진단 화면 한 화면 규칙 */

const BASE = "l=user&d=marketing&g=use_tools&ko=1";
const BEGINNER = "l=beginner&d=education&g=understand&ko=1";

const tabNames = (page: Page) => page.getByRole("tab").allInnerTexts();

const CASES = [
  { s: "lectures", tabs: ["강의", "실습", "준비", "스킬"], selected: "강의", panel: "lectures" },
  { s: "practice", tabs: ["실습", "강의", "준비", "스킬"], selected: "실습", panel: "practice" },
  { s: "theory", tabs: ["개념", "강의", "실습", "스킬"], selected: "개념", panel: "prep" },
  { s: "practice_theory", tabs: ["실습", "개념", "강의", "스킬"], selected: "실습", panel: "practice" },
  { s: "all", tabs: ["강의", "실습", "준비", "스킬"], selected: "강의", panel: "lectures" },
] as const;

test.describe("공부 방법별 결과 탭", () => {
  for (const c of CASES) {
    test(`s=${c.s}: 탭 순서 ${c.tabs.join("·")}, 기본 탭 ${c.selected}, 여정은 첫 탭에`, async ({ page, consoleErrors }) => {
      await page.goto(`/result?${BASE}&s=${c.s}`);
      expect(await tabNames(page)).toEqual(c.tabs);
      await expect(page.getByRole("tab", { selected: true })).toHaveText(c.selected);
      await expect(page.getByTestId(`result-panel-${c.panel}`)).toBeVisible();
      // 내 학습 여정은 기본 탭 안에 하나만
      await expect(page.getByTestId("journey")).toHaveCount(1);
      await expect(page.getByTestId(`result-panel-${c.panel}`).getByTestId("journey")).toHaveCount(1);
      await expect(page.getByTestId("style-note")).toBeVisible();
      // 진단 요약 칩에 공부 방법
      await expect(await openSummary(page)).toContainText("공부 방법");
      expect(consoleErrors).toEqual([]);
    });
  }

  test("해시가 기본 탭보다 이긴다 (실습 위주인데 #lectures)", async ({ page }) => {
    await page.goto(`/result?${BASE}&s=practice#lectures`);
    await expect(page.getByRole("tab", { selected: true })).toHaveText("강의");
    await expect(page.getByTestId("result-panel-lectures")).toBeVisible();
  });

  test("입문자는 공부 방법과 상관없이 스킬 탭이 없다", async ({ page }) => {
    await page.goto(`/result?${BEGINNER}&s=theory`);
    expect(await tabNames(page)).toEqual(["개념", "강의", "실습"]);
    await page.goto(`/result?${BEGINNER}&s=practice`);
    expect(await tabNames(page)).toEqual(["실습", "강의", "준비"]);
  });

  test("예전 링크(s 없음)는 골고루로 열리고, 모르는 s 값은 빈 상태", async ({ page }) => {
    await page.goto(`/result?${BASE}`);
    expect(await tabNames(page)).toEqual(["강의", "실습", "준비", "스킬"]);
    await expect(page.getByRole("tab", { selected: true })).toHaveText("강의");
    await expect(await openSummary(page)).toContainText("골고루");
    await page.goto(`/result?${BASE}&s=video`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("아직 진단 결과가 없어요");
  });

  test("방향키로 탭을 옮기면 화면에 보이는 순서대로 간다", async ({ page }) => {
    await page.goto(`/result?${BASE}&s=theory`);
    await expect(page.getByTestId("result-tabs")).toHaveAttribute("data-ready", "");
    await page.getByRole("tab", { name: "개념" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { selected: true })).toHaveText("강의");
    await expect(page).toHaveURL(/#lectures$/);
  });

  test("실습 위주: 첫 화면에 오늘의 실습 카드(1단계, 이번 주 미션), 여정의 '이 단계 실습 보기'는 그 단계 첫 카드로", async ({ page }) => {
    await page.goto(`/result?${BASE}&s=practice`);
    const panel = page.getByTestId("result-panel-practice");
    const deck = panel.getByTestId("card-deck");
    await expect(deck.getByTestId("deck-counter")).toBeInViewport();
    const first = deck.getByTestId("deck-card").first();
    await expect(first).toBeVisible();
    await expect(first).toContainText("이번 주 미션 · 1단계");
    await expect(panel.getByTestId("journey-hint")).toContainText("완료했어요");
    // 다른 카드로 옮긴 뒤 여정의 '이 단계 실습 보기'를 누르면 1단계 첫 카드로 돌아온다
    await expect(page.getByTestId("result-tabs")).toHaveAttribute("data-ready", "");
    await deck.getByTestId("deck-next").click();
    await expect(first).toBeHidden();
    const go = panel.getByTestId("journey-goto");
    await expect(go).toHaveText(/이 단계 실습 보기/);
    await go.click();
    await expect(page).toHaveURL(/#practice-group-1$/);
    await expect(page.getByTestId("result-panel-practice")).toBeVisible();
    await expect(first).toBeVisible();
    await expect(first).toBeInViewport();
  });

  test("개념 위주: 개념 덱이 첫 화면, 개념 4개가 먼저(이번 주 개념), '읽었어요'가 여정 진행에 들어간다", async ({ page }) => {
    await page.goto(`/result?${BASE}&s=theory`);
    const panel = page.getByTestId("result-panel-prep");
    const deck = panel.getByTestId("card-deck");
    await expect(deck.getByTestId("deck-counter")).toBeInViewport();
    // 덱 순서: 개념 4개 → 용어
    const kinds = await deck
      .getByTestId("deck-card")
      .evaluateAll((els) => els.map((e) => (e.querySelector("[data-testid=concept-card]") ? "concept" : "term")));
    expect(kinds.slice(0, 4)).toEqual(["concept", "concept", "concept", "concept"]);
    expect(kinds.slice(4).every((k) => k === "term")).toBe(true);
    // '이번 주 개념'은 따로 카드 없이 덱의 첫 안 읽은 개념에
    await expect(panel.getByTestId("weekly-concept")).toHaveCount(0);
    await expect(deck.getByTestId("deck-card").first()).toContainText("이번 주 개념");
    await expect(page.getByTestId("journey")).toHaveAttribute("data-ready", "");
    const before = await page.getByTestId("journey-total").innerText();
    await deck.getByTestId("deck-complete").click();
    await expect(page.getByTestId("journey-total")).not.toHaveText(before);
    await expect(page.getByTestId("journey-total")).toHaveText(/완료 1\//);
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "{}"), SAVED_KEY);
    expect(saved.version).toBe(2);
    expect(saved.theoryRead).toHaveLength(1);
    // 다음 카드(두 번째 개념)가 이번 주 개념이 된다
    await expect(deck.getByTestId("deck-card").nth(1)).toBeVisible();
    await expect(deck.getByTestId("deck-card").nth(1)).toContainText("이번 주 개념");
    // 목록 보기에는 3분 이론 4개 ('먼저 읽는 3분 이론')
    await deck.getByTestId("deck-view-toggle").click();
    await expect(panel.getByRole("heading", { name: "먼저 읽는 3분 이론" })).toBeVisible();
    await expect(panel.getByTestId("theory-concept")).toHaveCount(4);
  });

  test("예전 v1 저장(version 1)도 그대로 읽히고 v2로 올라간다", async ({ page }) => {
    await page.addInitScript((k) => {
      if (!localStorage.getItem(k)) {
        localStorage.setItem(k, JSON.stringify({ version: 1, lectures: [], missions: [], skills: [], terms: [{ id: "llm", savedAt: "2026-11-01T00:00:00.000Z" }], theory: [] }));
      }
    }, SAVED_KEY);
    await page.goto(`/result?${BASE}&s=theory`);
    await expect(page.getByTestId("journey")).toHaveAttribute("data-ready", "");
    await page.getByTestId("result-panel-prep").getByTestId("deck-complete").click();
    await expect(page.getByTestId("journey-total")).toHaveText(/완료 1\//);
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "{}"), SAVED_KEY);
    expect(saved.version).toBe(2);
    expect(saved.terms).toHaveLength(1);
  });
});

test.describe("진단: 공부 방법 화면", () => {
  test("목표 다음이 공부 방법, 고르기만 해서는 넘어가지 않고 '결과 보기' → s=theory&ko=1", async ({ page }) => {
    await answerLevelQuestionsLow(page);
    await page.getByRole("checkbox", { name: /^교육/ }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await chooseGoals(page, [/^개념 이해/]);
    await expect(page.getByText("공부 방법", { exact: true })).toBeVisible();
    await expect(page.getByRole("radio")).toHaveCount(5);
    await expect(page.getByRole("button", { name: "결과 보기" })).toBeDisabled();
    await finishStudy(page, { style: /^개념부터 알고 싶어요/ });
    const q = Object.fromEntries(new URL(page.url()).searchParams);
    expect(q).toMatchObject({ l: "beginner", d: "education", g: "understand", ko: "1", s: "theory" });
    await expect(page.getByRole("tab", { selected: true })).toHaveText("개념");
    await expect(page.getByTestId("style-note")).toContainText("개념 위주로 짰어요");
  });

  test("새로고침해도 공부 방법·한국어 체크가 남는다 (세션 저장)", async ({ page }) => {
    await answerLevelQuestionsLow(page);
    await page.getByRole("checkbox", { name: /^교육/ }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await chooseGoals(page, [/^개념 이해/]);
    await page.getByRole("radio", { name: /^직접 해보며 배울래요/ }).click();
    await page.getByRole("checkbox", { name: /한국어 강의를 먼저/ }).uncheck();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(STUDY_TITLE);
    await expect(page.getByRole("radio", { name: /^직접 해보며 배울래요/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("checkbox", { name: /한국어 강의를 먼저/ })).not.toBeChecked();
  });
});

/** 진단 화면을 처음부터 끝까지 돌며 각 화면에서 fn을 부른다 (코딩은 '읽고 고쳐요'로 AI 코딩 질문까지 9개) */
async function walk(page: Page, fn: (kind: "single" | "multi", title: string) => Promise<void>) {
  await page.goto("/diagnosis");
  const answers = [/^거의 매일/, /^상황과 조건/, /^요약·번역/, /^아직 없어요/, /^코드를 조금 읽고/, /^안 써 봤어요/];
  const titles = Object.values(LEVEL_TITLES);
  for (let i = 0; i < answers.length; i++) {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(titles[i]);
    await page.waitForTimeout(250); // 등장 애니메이션
    await fn("single", titles[i]);
    await chooseSingle(page, answers[i]);
  }
  for (const pickName of [/^업무 자동화/, /^업무 도구로 쓰기/]) {
    await page.getByRole("checkbox").first().waitFor();
    await page.waitForTimeout(250);
    await fn("multi", await page.getByRole("heading", { level: 1 }).innerText());
    await page.getByRole("checkbox", { name: pickName }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(STUDY_TITLE);
  await page.waitForTimeout(250);
  await fn("single", STUDY_TITLE);
}

for (const scheme of ["dark", "light"] as const) {
  test.describe(`한 화면 규칙 · 390×844 · ${scheme}`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 390, height: 844 } });
    test("단일 선택 화면: 마지막 선택지와 안내(또는 결과 보기)가 스크롤 없이 화면 안 · 다중 선택: CTA가 선택지를 가리지 않는다", async ({ page }) => {
      await walk(page, async (kind, title) => {
        const vh = 844;
        const last = page.getByRole(kind === "single" ? "radio" : "checkbox").last();
        const box = (await last.boundingBox())!;
        if (kind === "single") {
          expect(await page.evaluate(() => document.documentElement.scrollHeight), `${title}: 스크롤 없이`).toBeLessThanOrEqual(vh + 1);
          expect(box.y + box.height, `${title}: 마지막 선택지`).toBeLessThanOrEqual(vh);
          const end = page.getByTestId("auto-advance-hint").or(page.getByRole("button", { name: "결과 보기" }));
          const endBox = (await end.first().boundingBox())!;
          expect(endBox.y + endBox.height, `${title}: 안내/CTA`).toBeLessThanOrEqual(vh);
          expect(await page.evaluate(() => window.scrollY)).toBe(0);
        } else {
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          const lastBox = (await last.boundingBox())!;
          const ctaAfter = (await page.locator("[data-bottom-cta]").boundingBox())!;
          expect(lastBox.y + lastBox.height, `${title}: 끝까지 내리면 마지막 선택지가 CTA 위`).toBeLessThanOrEqual(ctaAfter.y);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      });
    });
  });
}

test.describe("한 화면 규칙 · 375×667 (iPhone SE)", () => {
  test.use({ viewport: { width: 375, height: 667 } });
  test("수준 질문(단일 선택)은 스크롤 없이 들어간다", async ({ page }) => {
    await walk(page, async (kind, title) => {
      if (kind !== "single" || title === STUDY_TITLE) return;
      expect(await page.evaluate(() => document.documentElement.scrollHeight), title).toBeLessThanOrEqual(668);
    });
  });
});
