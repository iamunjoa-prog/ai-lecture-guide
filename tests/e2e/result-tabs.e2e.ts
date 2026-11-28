import type { Page } from "@playwright/test";
import { expect, LEVEL_TITLES, openSummary, RESULT_QUERY, SAVED_KEY, test } from "./fixtures";
import { axeCheck, expectNoOverflow } from "./helpers-saved";

/** 결과 화면: 짧은 히어로 · 탭(강의 · 실습 · 준비 · 스킬) · 내 학습 여정 */
const BEGINNER = "l=beginner&d=automation&g=understand&ko=1";
const PRACTITIONER = "l=practitioner&d=automation&g=use_tools,build_agents&ko=1";
const BY_LEVEL = {
  beginner: { q: BEGINNER, now: "입문자", next: "활용자" },
  user: { q: "l=user&d=marketing&g=use_tools&ko=1", now: "활용자", next: "실무자" },
  practitioner: { q: PRACTITIONER, now: "실무자", next: "개발자" },
  developer: { q: "l=developer&d=coding&g=build_agents&ko=0", now: "개발자", next: "AI 제품을 이끄는 단계" },
} as const;

/** 하이드레이션이 끝날 때까지 (그 전에 해시만 바꾸면 Next 라우터의 첫 replaceState가 해시를 지운다) */
const ready = (page: Page) => expect(page.locator('[data-testid="result-tabs"][data-ready]')).toHaveCount(1);
/** 내 학습함을 읽은 뒤 (여정 진행이 채워진 뒤) */
const journeyReady = (page: Page) => expect(page.locator('[data-testid="journey"][data-ready]')).toHaveCount(1);

const tab = (page: Page, name: string) => page.getByRole("tablist", { name: "결과 보기" }).getByRole("tab", { name, exact: true });

/** 강의 탭의 단계별 강의 id (화면 순서) */
async function stepLectureIds(page: Page): Promise<string[][]> {
  return page.getByTestId("roadmap-step").evaluateAll((steps) =>
    steps.map((s) => [...s.querySelectorAll('[id^="lecture-"]')].map((e) => e.id.replace(/^lecture-/, ""))),
  );
}

test.describe("결과 탭", () => {
  test("기본은 '강의', 탭을 누르면 패널과 주소 해시가 바뀌고 뒤로 가기로 돌아간다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const tabs = page.getByRole("tablist", { name: "결과 보기" }).getByRole("tab");
    await expect(tabs).toHaveText(["강의", "실습", "준비", "스킬"]);
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("result-panel-lectures")).toBeVisible();
    for (const id of ["practice", "prep", "skills"]) await expect(page.getByTestId(`result-panel-${id}`)).toBeHidden();
    // 탭은 44px 이상이고 패널과 연결돼 있다
    for (const t of await tabs.all()) {
      expect((await t.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const controls = (await t.getAttribute("aria-controls"))!;
      await expect(page.locator(`[id="${controls}"]`)).toHaveAttribute("role", "tabpanel");
    }

    await tab(page, "실습").click();
    await expect(page).toHaveURL(/#practice$/);
    // 실습 탭은 한 장씩 보는 카드 덱이 기본
    await expect(page.getByTestId("result-panel-practice").getByTestId("card-deck")).toBeVisible();

    await tab(page, "준비").click();
    await expect(page).toHaveURL(/#prep$/);
    await expect(tab(page, "준비")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("result-panel-prep").getByTestId("card-deck")).toBeVisible();
    await expect(page.getByTestId("result-panel-prep").getByTestId("deck-counter")).toContainText("카드 1 /");
    await expect(page.getByTestId("result-panel-lectures")).toBeHidden();

    await tab(page, "스킬").click();
    await expect(page).toHaveURL(/#skills$/);
    await expect(page.getByTestId("skills-section")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/#prep$/);
    await expect(tab(page, "준비")).toHaveAttribute("aria-selected", "true");
    await page.goBack();
    await expect(tab(page, "실습")).toHaveAttribute("aria-selected", "true");
    await page.goBack();
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await page.goForward();
    await expect(tab(page, "실습")).toHaveAttribute("aria-selected", "true");

    // 새로고침해도 같은 탭
    await page.reload();
    await expect(tab(page, "실습")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("result-panel-practice")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("키보드: 화살표·Home·End로 탭을 옮기고 고른다 (선택된 탭만 Tab 순서에)", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await tab(page, "강의").focus();
    await expect(tab(page, "실습")).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "실습")).toBeFocused();
    await expect(tab(page, "실습")).toHaveAttribute("aria-selected", "true");
    await expect(tab(page, "실습")).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("End");
    await expect(tab(page, "스킬")).toBeFocused();
    await expect(page).toHaveURL(/#skills$/);
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "강의")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tab(page, "스킬")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
  });

  test("스크롤하면 탭 줄이 화면 위에 붙어 있고, 탭을 바꾸면 패널 처음부터 보인다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await page.mouse.wheel(0, 3000);
    await expect.poll(async () => (await page.getByTestId("result-tabs").boundingBox())!.y).toBeLessThanOrEqual(1);
    await tab(page, "준비").click();
    await expect(page.getByTestId("result-panel-prep").getByTestId("deck-counter")).toBeInViewport();
  });

  test("첫 화면에 여정과 1단계 제목이 보이고, 첫 강의 카드는 1.3화면 안에서 시작한다", async ({ page }) => {
    for (const q of [BEGINNER, PRACTITIONER]) {
      await page.goto(`/result?${q}`);
      await expect(page.getByTestId("journey-steps"), q).toBeInViewport();
      await expect(page.getByRole("heading", { level: 2, name: /^1단계 · / }), q).toBeInViewport();
      const y = await page.evaluate(() => document.querySelector('[data-tab-panel="lectures"] article')!.getBoundingClientRect().top + window.scrollY);
      expect(y, q).toBeLessThan(844 * 1.3);
    }
  });

  test("입문자: 탭 3개, 스킬 탭·머리글 'AI 스킬'·스킬 링크가 없다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${BEGINNER}`);
    await expect(page.getByRole("tablist", { name: "결과 보기" }).getByRole("tab")).toHaveText(["강의", "실습", "준비"]);
    await expect(page.getByTestId("skills-section")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: "AI 스킬" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: "용어집" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: /내 학습함/ })).toBeVisible();
    await expect(page.locator('a[href^="/skills"]')).toHaveCount(0);
    const text = (await page.locator("body").textContent()) ?? "";
    for (const phrase of ["다음 스킬", "AI 스킬", "주목받는", "다음 단계 스킬"]) expect(text, phrase).not.toContain(phrase);
    // 스킬 탭 해시로 들어와도 기본 탭
    await ready(page);
    await page.goto(`/result?${BEGINNER}#skills`);
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    expect(consoleErrors).toEqual([]);
  });

  test("예전 해시: #roadmap·#lecture-… → 강의 탭, #prep·#skills는 그대로", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const anchors = (await stepLectureIds(page)).flat();
    await ready(page);
    await page.goto(`/result?${PRACTITIONER}#skills`);
    await expect(tab(page, "스킬")).toHaveAttribute("aria-selected", "true");
    await ready(page);
    await page.goto(`/result?${PRACTITIONER}#prep`);
    await expect(tab(page, "준비")).toHaveAttribute("aria-selected", "true");
    await ready(page);
    await page.goto(`/result?${PRACTITIONER}#roadmap`);
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await ready(page);
    const last = anchors[anchors.length - 1];
    await page.goto(`/result?${PRACTITIONER}#lecture-${last}`);
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="lecture-${last}"] article`)).toBeInViewport();
    // 다른 탭을 보던 중 주소 해시만 바뀌어도 (hashchange) 그 카드로
    await tab(page, "준비").click();
    await page.evaluate((id) => (window.location.hash = `#lecture-${id}`), anchors[0]);
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="lecture-${anchors[0]}"] article`)).toBeInViewport();
  });

  test("스킬 탭의 '내 로드맵에 있어요' 강의 링크는 강의 탭의 카드로", async ({ page }) => {
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
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="${href.slice(1)}"] article`)).toBeInViewport();
  });

  test("하이드레이션 경고 없이 해시 탭으로 열린다", async ({ page, consoleErrors }) => {
    for (const h of ["#practice", "#prep", "#skills", "#roadmap", ""]) {
      await page.goto(`/result?${RESULT_QUERY}${h}`);
      await page.waitForLoadState("networkidle");
    }
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("짧은 히어로", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("결론 두 줄 · 요약 한 줄(펼치면 칩) · 공유 · 다시 진단, 바닥 고정 줄과 바로 보기 버튼은 없다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("실무자 맞춤 학습 로드맵");
    await expect(page.getByRole("region", { name: "진단 결론" })).toBeVisible();
    await expect(page.getByTestId("hero-teaser")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "추천 강의 바로 보기" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "링크 복사하기" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "다시 진단하기" })).toHaveCount(0);
    // 화면 아래에 붙은 요소가 없다
    const stickyBottom = await page.evaluate(
      () => [...document.querySelectorAll("body *")].filter((el) => {
        const s = getComputedStyle(el);
        return (s.position === "sticky" || s.position === "fixed") && s.bottom !== "auto" && el.getBoundingClientRect().height > 0;
      }).length,
    );
    expect(stickyBottom).toBe(0);

    const toggle = page.getByTestId("summary-toggle");
    await expect(toggle).toHaveText(/^진단 요약: 실무자 · 업무 자동화 · 목표 2개$/);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("diagnosis-summary")).toBeHidden();
    const summary = await openSummary(page);
    for (const name of ["수준", "분야", "목표", "언어"]) await expect(summary.getByRole("list", { name })).toBeVisible();
    await expect(summary.getByRole("list", { name: "목표" }).getByRole("listitem").first()).toContainText("1순위");
    await expect(summary).toContainText("한국어 우선");
    await toggle.click();
    await expect(page.getByTestId("diagnosis-summary")).toBeHidden();

    // 공유: 지금 주소를 복사
    await page.getByRole("button", { name: /^공유/ }).click();
    await expect(page.getByTestId("toast")).toHaveText("링크를 복사했어요");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
    expect(consoleErrors).toEqual([]);
  });

  test("다시 진단: 진단 기록을 지우고 첫 질문으로", async ({ page }) => {
    await page.goto(`/result?${BEGINNER}`);
    // 진단 중간 기록이 남아 있어도 첫 질문부터 다시 시작한다
    await page.evaluate(() => sessionStorage.setItem("ai-lecture-guide:progress", JSON.stringify({ index: 3, answers: {} })));
    await page.getByRole("button", { name: "다시 진단", exact: true }).click();
    await expect(page).toHaveURL(/\/diagnosis$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(LEVEL_TITLES.frequency);
  });
});

test.describe("내 학습 여정", () => {
  for (const [level, { q, now, next }] of Object.entries(BY_LEVEL)) {
    test(`${level}: 지금 → 로드맵 단계 → 다음 위치(${next})`, async ({ page }) => {
      await page.goto(`/result?${q}`);
      const steps = page.getByTestId("journey-steps");
      await expect(steps).toHaveJSProperty("tagName", "OL");
      const stepTitles = await page.getByTestId("roadmap-step").locator("h2").allInnerTexts();
      expect(stepTitles.length).toBeGreaterThanOrEqual(2);
      // 노드 = 지금 + 단계 수 + 다음 위치
      await expect(steps.locator(":scope > li")).toHaveCount(stepTitles.length + 2);
      await expect(steps.locator('[data-node="now"]')).toContainText(now);
      await expect(page.getByTestId("journey-next")).toContainText(next);
      const nodes = page.getByTestId("journey-step");
      for (let i = 0; i < stepTitles.length; i++) {
        const label = stepTitles[i].replace(/^\d단계 · /, "");
        await expect(nodes.nth(i)).toContainText(`${i + 1}단계`);
        await expect(nodes.nth(i)).toContainText(label);
      }
      // 처음에는 1단계가 지금 할 단계
      await expect(steps.locator(':scope > li[aria-current="step"]')).toHaveCount(1);
      await expect(steps.locator(':scope > li[aria-current="step"]')).toContainText("1단계");
      await expect(page.getByTestId("journey-detail")).toContainText(`1단계 · ${stepTitles[0].replace(/^\d단계 · /, "")}`);
      await expect(page.getByTestId("journey-detail-line")).toHaveText(/^강의 \d+( · 용어 \d+)?( · 실습 \d+)? · 완료 0\/\d+$/);
      await expect(page.getByTestId("journey-hint")).toBeVisible();
    });
  }

  test("단계 노드를 누르면 상세가 바뀌고, '이 단계 강의 보기'가 그 단계로 스크롤한다 (키보드 포함)", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await journeyReady(page);
    const nodes = page.getByTestId("journey-step");
    const n = await nodes.count();
    const last = nodes.nth(n - 1);
    await last.focus();
    await page.keyboard.press("Enter");
    await expect(last).toHaveAttribute("aria-pressed", "true");
    await expect(nodes.first()).toHaveAttribute("aria-pressed", "false");
    const title = (await page.getByTestId("roadmap-step").nth(n - 1).locator("h2").innerText()).trim();
    await expect(page.getByTestId("journey-detail")).toContainText(title);
    await page.getByTestId("journey-goto").click();
    await expect(page).toHaveURL(new RegExp(`#step-${n}$`));
    await expect(page.getByRole("heading", { level: 2, name: title })).toBeInViewport();
    // 다음 위치 노드: 안내만
    await page.getByTestId("journey-next").click();
    await expect(page.getByTestId("journey-detail")).toContainText("다음 위치 · 개발자");
  });

  test("강의 '다 봤어요'와 실습 '완료'가 여정 진행을 바로 바꾼다 (새로고침에도 유지)", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await journeyReady(page);
    const ids = await stepLectureIds(page);
    const firstStep = page.getByTestId("roadmap-step").first();
    const line = page.getByTestId("journey-detail-line");
    const total = Number((await line.innerText()).match(/완료 0\/(\d+)/)![1]);

    await firstStep.getByTestId("lecture-done").first().click();
    await expect(firstStep.getByTestId("lecture-done").first()).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("toast")).toHaveText("다 본 강의로 기록했어요");
    await expect(line).toContainText(`완료 1/${total}`);
    await expect(page.getByTestId("journey-total")).toContainText("완료 1/");
    await expect(page.getByTestId("journey-hint")).toHaveCount(0);
    // 강의도 함께 저장된다 (북마크 켜짐)
    await expect(page.locator(`[id="lecture-${ids[0][0]}"]`).getByRole("button", { name: /^강의 저장/ })).toHaveAttribute("aria-pressed", "true");

    // 실습 탭 카드 덱에서 첫 미션 완료 → 여정에 반영
    await tab(page, "실습").click();
    await page.getByTestId("result-panel-practice").getByTestId("deck-complete").click();
    await tab(page, "강의").click();
    await expect(line).toContainText(`완료 2/${total}`);

    await page.reload();
    await journeyReady(page);
    await expect(page.getByTestId("journey-detail-line")).toContainText(`완료 2/${total}`);
    // 다시 누르면 되돌린다
    await page.getByTestId("roadmap-step").first().getByTestId("lecture-done").first().click();
    await expect(page.getByTestId("journey-detail-line")).toContainText(`완료 1/${total}`);
    expect(consoleErrors).toEqual([]);
  });

  test("1단계를 모두 마치면 2단계가 지금 할 단계, 모두 마치면 다음 위치가 켜지고 다시 진단을 권한다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    const ids = await stepLectureIds(page);
    const missionIds = await page
      .getByTestId("result-panel-practice")
      .getByTestId("deck-card")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-id")!));
    const seed = (lectures: string[]) => {
      const now = new Date().toISOString();
      return JSON.stringify({
        version: 1,
        lectures: lectures.map((id) => ({ id, status: "done", savedAt: now, updatedAt: now })),
        missions: missionIds.filter((id) => lectures.includes(id)).map((videoId) => ({ videoId, status: "done", savedAt: now, updatedAt: now })),
        skills: [],
        terms: [],
        theory: [],
      });
    };
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, seed(ids[0])]);
    await page.reload();
    await journeyReady(page);
    const steps = page.getByTestId("journey-steps");
    await expect(steps.locator(':scope > li[data-node="step"]').first()).toHaveAttribute("data-complete", "");
    await expect(steps.locator(':scope > li[aria-current="step"]')).toContainText("2단계");
    await expect(page.getByTestId("journey-detail")).toContainText("지금 할 단계");

    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, seed(ids.flat())]);
    await page.reload();
    await journeyReady(page);
    await expect(steps.locator('[data-node="next"]')).toHaveAttribute("data-lit", "");
    await expect(steps.locator(':scope > li[aria-current="step"]')).toHaveAttribute("data-node", "next");
    const done = page.getByTestId("journey-done");
    await expect(done).toContainText("다시 진단해서 다음 로드맵을 받아 보세요");
    await done.getByRole("button", { name: "다시 진단하기" }).click();
    await expect(page).toHaveURL(/\/diagnosis$/);
  });

  test("강의 카드의 '실습하기'는 실습 탭으로 바꾸고 그 미션 카드를 연다, 카드의 관련 강의 링크는 강의 카드로 돌아온다", async ({ page }) => {
    await page.goto(`/result?${PRACTITIONER}`);
    await ready(page);
    // 두 번째 이후 미션도 열리는지 보기 위해 마지막 '실습하기'
    const link = page.getByTestId("lecture-practice-link").last();
    const href = (await link.getAttribute("href"))!;
    expect(href).toMatch(/^#mission-/);
    await link.click();
    await expect(tab(page, "실습")).toHaveAttribute("aria-selected", "true");
    const mission = page.locator(`[id="${href.slice(1)}"]`);
    await expect(mission).toBeVisible();
    await expect(mission).toBeInViewport();
    await expect(page.getByTestId("result-panel-practice").getByTestId("deck-card").filter({ visible: true })).toHaveCount(1);
    await expect(mission.getByTestId("prompt-box").first()).toBeVisible();
    await expect(mission.getByText("이렇게 되면 성공")).toBeVisible();

    const back = mission.getByTestId("deck-lecture-link");
    const lectureHref = (await back.getAttribute("href"))!;
    expect(lectureHref).toBe(`#lecture-${href.replace("#mission-", "")}`);
    await back.click();
    await expect(tab(page, "강의")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(`[id="${lectureHref.slice(1)}"] article`)).toBeInViewport();
  });
});

test.describe("결과 탭 · 좁은 화면과 움직임 줄이기", () => {
  test.use({ viewport: { width: 320, height: 640 }, reducedMotion: "reduce" });
  test("320px: 탭(한 줄)·머리글·여정이 넘치지 않는다", async ({ page }) => {
    for (const q of [BEGINNER, PRACTITIONER, BY_LEVEL.developer.q]) {
      await page.goto(`/result?${q}`);
      await expectNoOverflow(page);
      const header = page.getByTestId("site-header");
      expect((await header.boundingBox())!.height, q).toBeLessThanOrEqual(64);
      expect((await page.getByRole("tablist", { name: "결과 보기" }).boundingBox())!.height, q).toBeLessThanOrEqual(64);
      const journey = (await page.getByTestId("journey-steps").boundingBox())!;
      expect(journey.x + journey.width, q).toBeLessThanOrEqual(320);
      for (const name of ["실습", "준비", "강의"]) {
        await tab(page, name).click();
        await expectNoOverflow(page);
      }
    }
    for (const p of ["/", "/glossary", "/glossary?tab=theory", "/skills", "/saved", "/practice"]) {
      await page.goto(p);
      await expectNoOverflow(page);
      expect((await page.getByTestId("site-header").boundingBox())!.height, p).toBeLessThanOrEqual(64);
    }
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 결과 탭`, () => {
    test.use({ colorScheme: scheme });
    test("탭 4개와 각 패널 (요약 펼침·미션 펼침·진행 있음)", async ({ page }) => {
      await page.goto(`/result?${PRACTITIONER}`);
      await journeyReady(page);
      await page.getByTestId("lecture-done").first().click();
      await openSummary(page);
      await page.waitForTimeout(800);
      await axeCheck(page, `결과 탭(강의)/${scheme}`);
      await tab(page, "실습").click();
      await page.waitForTimeout(500);
      await axeCheck(page, `결과 탭(실습)/${scheme}`);
      for (const name of ["준비", "스킬"]) {
        await tab(page, name).click();
        await page.waitForTimeout(300);
        await axeCheck(page, `결과 탭(${name})/${scheme}`);
      }
    });
    test("입문자 결과 (탭 3개)", async ({ page }) => {
      await page.goto(`/result?${BEGINNER}`);
      await page.waitForTimeout(800);
      await axeCheck(page, `입문자 결과/${scheme}`);
      await tab(page, "실습").click();
      await page.waitForTimeout(300);
      await axeCheck(page, `입문자 실습/${scheme}`);
    });
  });
}
