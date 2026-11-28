import type { Locator, Page } from "@playwright/test";
import { chooseSingle, DECK_KEY, expect, LEVEL_ANSWERS_LOW, SAVED_KEY, test } from "./fixtures";
import { axeCheck, expectNoOverflow } from "./helpers-saved";

/** 결과 화면 '한 장씩 보기' 카드 덱 (실습 · 준비/개념) */
const BASE = "l=user&d=marketing&g=use_tools&ko=1";
const PRACTICE = `/result?${BASE}&s=practice`;
const LECTURES = `/result?${BASE}&s=lectures`;
const THEORY = `/result?${BASE}&s=theory`;

const ready = (page: Page) => expect(page.locator('[data-testid="result-tabs"][data-ready]')).toHaveCount(1);
const journeyReady = (page: Page) => expect(page.locator('[data-testid="journey"][data-ready]')).toHaveCount(1);
const practiceDeck = (page: Page) => page.getByTestId("result-panel-practice").getByTestId("card-deck");
const prepDeck = (page: Page) => page.getByTestId("result-panel-prep").getByTestId("card-deck");
const visibleCard = (deck: Locator) => deck.locator('[data-testid="deck-card"]:not([hidden])');
const savedState = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "{}"), SAVED_KEY);

async function swipe(page: Page, deck: Locator, dx: number, dy = 0) {
  const area = deck.getByTestId("deck-cards");
  const box = (await area.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + 120;
  const base = { pointerId: 11, pointerType: "touch", isPrimary: true, bubbles: true };
  await area.dispatchEvent("pointerdown", { ...base, clientX: x, clientY: y });
  for (let i = 1; i <= 4; i++) await area.dispatchEvent("pointermove", { ...base, clientX: x + (dx * i) / 4, clientY: y + (dy * i) / 4 });
  await area.dispatchEvent("pointerup", { ...base, clientX: x + dx, clientY: y + dy });
}

test.describe("실습 카드 덱", () => {
  test("기본은 한 장씩: '실습 1 / N' · 점은 장식 · 영역 이름과 역할 설명", async ({ page, consoleErrors }) => {
    await page.goto(PRACTICE);
    const deck = practiceDeck(page);
    await expect(deck).toBeVisible();
    await expect(deck).toHaveAttribute("aria-roledescription", "카드 넘기기");
    await expect(deck).toHaveAttribute("aria-label", "오늘의 실습");
    const total = Number(await deck.getAttribute("data-total"));
    expect(total).toBeGreaterThan(1);
    await expect(deck.getByTestId("deck-counter")).toContainText(`실습 1 / ${total}`);
    await expect(deck.getByTestId("deck-counter").locator(".sr-only")).toHaveText(`${total}개 중 1번째`);
    await expect(deck.getByTestId("deck-dots")).toHaveAttribute("aria-hidden", "true");
    await expect(visibleCard(deck)).toHaveCount(1);
    await expect(deck.getByTestId("deck-prev")).toBeDisabled();
    // 버튼은 44px 이상
    for (const id of ["deck-prev", "deck-next", "deck-skip", "deck-complete", "deck-view-toggle"]) {
      expect((await deck.getByTestId(id).boundingBox())!.height, id).toBeGreaterThanOrEqual(44);
    }
    // 예전 이번 주 미션 카드는 덱이 맡는다 (목록 보기에만 있다)
    await expect(page.getByTestId("result-panel-practice").getByTestId("weekly-mission")).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test("실습 위주의 첫 카드(이번 주 미션)는 1단계 미션이고, 덱 순서 = 로드맵 단계 순서", async ({ page }) => {
    await page.goto(PRACTICE);
    const stepIds = await page
      .getByTestId("roadmap-step")
      .evaluateAll((steps) => steps.map((s) => [...s.querySelectorAll('[id^="lecture-"]')].map((e) => e.id.replace(/^lecture-/, ""))));
    const deckIds = await practiceDeck(page)
      .getByTestId("deck-card")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-id")!));
    const roadmapOrder = stepIds.flat().filter((id) => deckIds.includes(id));
    expect(deckIds).toEqual(roadmapOrder);
    const firstStepWithMission = stepIds.findIndex((ids) => ids.some((id) => deckIds.includes(id)));
    expect(stepIds[firstStepWithMission]).toContain(deckIds[0]);
    const first = visibleCard(practiceDeck(page));
    await expect(first).toHaveAttribute("data-id", deckIds[0]);
    await expect(first).toContainText(`이번 주 미션 · ${firstStepWithMission + 1}단계`);
    // 목록 보기의 이번 주 실습 미션도 같은 미션
    await practiceDeck(page).getByTestId("deck-view-toggle").click();
    await expect(page.getByTestId("weekly-mission").getByTestId("weekly-open")).toHaveAttribute("href", `#mission-${deckIds[0]}`);
  });

  test("[완료했어요 → 다음]: 완료로 저장하고 다음 카드로, 여정이 바로 바뀐다. 다음 방문의 이번 주 미션은 끝내지 않은 첫 미션", async ({ page }) => {
    await page.goto(PRACTICE);
    await journeyReady(page);
    const deck = practiceDeck(page);
    const firstId = (await visibleCard(deck).getAttribute("data-id"))!;
    await expect(page.getByTestId("journey-total")).toHaveText(/완료 0\//);
    await deck.getByTestId("deck-complete").click();
    await expect(page.getByTestId("toast")).toHaveText("실습 완료! 내 학습함에 기록했어요");
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 2 /");
    await expect(page.getByTestId("journey-total")).toHaveText(/완료 1\//);
    const saved = await savedState(page);
    expect(saved.missions).toEqual([expect.objectContaining({ videoId: firstId, status: "done" })]);
    // 완료한 카드는 점이 채워지고, 다시 가 보면 '완료한 실습이에요' + 주 버튼은 [다음]
    await expect(deck.getByTestId("deck-dots").locator("li").first()).toHaveAttribute("data-done", "");
    await deck.getByTestId("deck-prev").click();
    await expect(visibleCard(deck).getByTestId("deck-done-line")).toContainText("완료한 실습이에요");
    await expect(deck.getByTestId("deck-complete")).toHaveText("다음");
    // 기억을 지우고 다시 열면 끝내지 않은 첫 미션(2번째)부터, 그 카드가 이번 주 미션
    await page.evaluate((k) => localStorage.removeItem(k), DECK_KEY);
    await page.reload();
    await journeyReady(page);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 2 /");
    await expect(visibleCard(deck)).toContainText("이번 주 미션");
  });

  test("[건너뛰기]는 완료 표시 없이 넘긴다", async ({ page }) => {
    await page.goto(PRACTICE);
    await journeyReady(page);
    const deck = practiceDeck(page);
    await deck.getByTestId("deck-skip").click();
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 2 /");
    expect((await savedState(page)).missions ?? []).toEqual([]);
    await expect(page.getByTestId("journey-total")).toHaveText(/완료 0\//);
  });

  test("터치로 밀어 넘긴다: 왼쪽 → 다음, 오른쪽 → 이전, 세로로 움직이면 그대로", async ({ page }) => {
    await page.goto(PRACTICE);
    await ready(page);
    const deck = practiceDeck(page);
    await swipe(page, deck, -140);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 2 /");
    await swipe(page, deck, 140);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
    // 세로 스크롤 동작(세로가 큼)은 넘기지 않는다
    await swipe(page, deck, -70, 220);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
    // 짧게 움직이면 넘기지 않는다
    await swipe(page, deck, -20);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
  });

  test("키보드: 덱 안에 초점이 있으면 ←/→로 넘기고, 카드 제목으로 초점이 가며 몇 번째인지 읽어 준다", async ({ page }) => {
    await page.goto(PRACTICE);
    await ready(page);
    const deck = practiceDeck(page);
    await deck.getByTestId("deck-next").focus();
    await page.keyboard.press("ArrowRight");
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 2 /");
    await expect(visibleCard(deck).getByTestId("deck-card-title")).toBeFocused();
    await expect(deck.getByTestId("deck-live")).toHaveText("2번째 카드");
    await page.keyboard.press("ArrowLeft");
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
    await expect(deck.getByTestId("deck-live")).toHaveText("1번째 카드");
    // 덱 밖(탭 줄)의 화살표는 탭을 옮긴다
    await page.getByRole("tab", { name: "실습" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "강의" })).toHaveAttribute("aria-selected", "true");
  });

  test("끝 카드: '오늘 n개 해냈어요'와 다음에 해 볼 것 (실습 모음 · 다른 탭 · 처음부터)", async ({ page }) => {
    await page.goto(PRACTICE);
    await journeyReady(page);
    const deck = practiceDeck(page);
    const total = Number(await deck.getAttribute("data-total"));
    await deck.getByTestId("deck-complete").click();
    await deck.getByTestId("deck-complete").click();
    for (let i = 2; i < total; i++) await deck.getByTestId("deck-skip").click();
    const end = deck.getByTestId("deck-end");
    await expect(end).toBeVisible();
    await expect(end.getByRole("heading", { level: 3 })).toHaveText("오늘 2개 해냈어요");
    await expect(end.getByRole("heading", { level: 3 })).toBeFocused();
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 마무리");
    await expect(deck.getByTestId("deck-actions")).toHaveCount(0);
    await expect(end).toContainText(`${total}개 중 2개를 완료했어요`);
    await expect(end.getByRole("link", { name: "실습 모음에서 더 해 보기" })).toHaveAttribute("href", "/practice?l=user");
    await end.getByRole("button", { name: "처음 카드부터 다시 보기" }).click();
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
    // 다른 탭 링크
    await deck.getByTestId("deck-prev").focus(); // 끝 카드로 다시 가기 위해 덱 안에 초점
    for (let i = 0; i < total; i++) await page.keyboard.press("ArrowRight");
    await end.getByRole("link", { name: "강의 탭에서 관련 강의 보기" }).click();
    await expect(page.getByRole("tab", { name: "강의" })).toHaveAttribute("aria-selected", "true");
  });

  test("이어서 보기: 보던 카드를 진단마다 기억하고, '처음부터 보기'로 돌아간다", async ({ page }) => {
    await page.goto(PRACTICE);
    await ready(page);
    const deck = practiceDeck(page);
    await deck.getByTestId("deck-next").click();
    await deck.getByTestId("deck-next").click();
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 3 /");
    const id = await visibleCard(deck).getAttribute("data-id");
    await page.reload();
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 3 /");
    await expect(visibleCard(deck)).toHaveAttribute("data-id", id!);
    await expect(deck.getByTestId("deck-resumed")).toBeVisible();
    // 다른 진단(공부 방법이 다르면 다른 결과)은 따로 기억한다
    await page.goto(`/result?${BASE}&s=all#practice`);
    await ready(page);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
    await page.goto(PRACTICE);
    await deck.getByTestId("deck-resumed").getByRole("button", { name: "처음부터 보기" }).click();
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 1 /");
    await expect(deck.getByTestId("deck-resumed")).toHaveCount(0);
  });

  test("'전체 목록 보기' ↔ '한 장씩 보기'를 기억한다 (새로고침에도)", async ({ page }) => {
    await page.goto(PRACTICE);
    await ready(page);
    await practiceDeck(page).getByTestId("deck-view-toggle").click();
    const panel = page.getByTestId("result-panel-practice");
    await expect(panel.getByTestId("deck-list")).toBeVisible();
    await expect(panel.getByTestId("mission-item").first()).toBeVisible();
    await expect(panel.getByTestId("card-deck")).toHaveCount(0);
    await page.reload();
    await expect(panel.getByTestId("deck-list")).toBeVisible();
    await expect(panel.getByTestId("deck-view-toggle")).toHaveText("한 장씩 보기");
    await panel.getByTestId("deck-view-toggle").click();
    await expect(practiceDeck(page)).toBeVisible();
    await page.reload();
    await expect(practiceDeck(page)).toBeVisible();
    // 준비 탭 선택은 따로
    await page.getByRole("tab", { name: "준비" }).click();
    await expect(prepDeck(page)).toBeVisible();
  });

  test("#mission-… 딥링크는 실습 탭의 그 카드를 연다 (처음 열 때 · 강의 카드 '실습하기')", async ({ page }) => {
    await page.goto(LECTURES);
    const ids = await page
      .getByTestId("result-panel-practice")
      .getByTestId("deck-card")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-id")!));
    const target = ids[2];
    await ready(page);
    await page.goto(`${LECTURES}#mission-${target}`);
    await expect(page.getByRole("tab", { name: "실습" })).toHaveAttribute("aria-selected", "true");
    const deck = practiceDeck(page);
    await expect(visibleCard(deck)).toHaveAttribute("data-id", target);
    await expect(deck.getByTestId("deck-counter")).toContainText("실습 3 /");
    await expect(page.locator(`[id="mission-${target}"]`)).toBeInViewport();
  });
});

test.describe("준비/개념 카드 덱", () => {
  test("강의 위주: 용어(몸풀기) 4장 먼저, 그다음 개념. 용어 카드는 '뜻 보기'로 뒤집는다", async ({ page }) => {
    await page.goto(`${LECTURES}#prep`);
    await ready(page);
    const deck = prepDeck(page);
    await expect(deck).toHaveAttribute("aria-label", "강의 전 준비");
    const kinds = await deck
      .getByTestId("deck-card")
      .evaluateAll((els) => els.map((e) => (e.querySelector("[data-testid=term-card]") ? "term" : "concept")));
    expect(kinds).toEqual(["term", "term", "term", "term", "concept", "concept", "concept"]);
    const card = visibleCard(deck);
    const flip = card.getByTestId("term-flip");
    await expect(card.getByTestId("term-back")).toBeHidden();
    await expect(flip).toHaveAttribute("aria-expanded", "false");
    await flip.click();
    await expect(flip).toHaveAttribute("aria-expanded", "true");
    await expect(flip).toHaveText("뜻 가리기");
    await expect(card.getByTestId("term-back")).toBeVisible();
    await expect(card.getByTestId("term-back")).toContainText("예시");
    await expect(deck.getByTestId("deck-complete")).toHaveText("알겠어요다음");
    await deck.getByTestId("deck-complete").click();
    await expect(deck.getByTestId("deck-counter")).toContainText("카드 2 /");
  });

  test("개념 카드: 처음엔 제목·요약·첫 문단, '더 보기'로 쉽게 말하면·바로 해보기. [읽었어요 → 다음]이 읽음으로 기록", async ({ page }) => {
    await page.goto(THEORY);
    await journeyReady(page);
    const deck = prepDeck(page);
    const card = visibleCard(deck);
    const conceptId = (await card.getAttribute("data-id"))!;
    await expect(card.getByTestId("concept-more-body")).toBeHidden();
    await expect(card.getByText("쉽게 말하면", { exact: true })).toBeHidden();
    await expect(card.getByTestId("theory-sources").locator("a").first()).toHaveAttribute("target", "_blank");
    await card.getByTestId("concept-more").click();
    await expect(card.getByTestId("concept-more")).toHaveAttribute("aria-expanded", "true");
    await expect(card.getByText("쉽게 말하면", { exact: true })).toBeVisible();
    await expect(deck.getByTestId("deck-complete")).toHaveText("읽었어요다음");
    await deck.getByTestId("deck-complete").click();
    await expect(page.getByTestId("toast")).toHaveText("읽은 개념으로 기록했어요");
    await expect(deck.getByTestId("deck-counter")).toContainText("카드 2 /");
    expect((await savedState(page)).theoryRead.map((r: { id: string }) => r.id)).toEqual([conceptId]);
    // 돌아가 보면 읽은 개념 표시와 '읽음 취소'
    await deck.getByTestId("deck-prev").click();
    await expect(visibleCard(deck).getByTestId("deck-done-line")).toContainText("읽은 개념이에요");
    await visibleCard(deck).getByRole("button", { name: "읽음 취소" }).click();
    await expect(page.getByTestId("journey-total")).toHaveText(/완료 0\//);
  });

  test("끝 카드: '개념 n개 읽었어요'", async ({ page }) => {
    await page.goto(THEORY);
    await journeyReady(page);
    const deck = prepDeck(page);
    const total = Number(await deck.getAttribute("data-total"));
    await deck.getByTestId("deck-complete").click();
    await deck.getByTestId("deck-complete").click();
    for (let i = 2; i < total; i++) await deck.getByTestId("deck-skip").click();
    const end = deck.getByTestId("deck-end");
    await expect(end.getByRole("heading", { level: 3 })).toHaveText("개념 2개 읽었어요");
    await expect(end.getByRole("link", { name: "3분 이론 전체 보기" })).toHaveAttribute("href", /\/glossary\?tab=theory/);
    await expect(end.getByRole("link", { name: "실습 탭에서 직접 해 보기" })).toHaveAttribute("href", "#practice");
  });

  test("#theory-… 딥링크는 개념 탭의 그 개념 카드를 연다", async ({ page }) => {
    await page.goto(THEORY);
    const ids = await prepDeck(page)
      .getByTestId("deck-card")
      .evaluateAll((els) => els.filter((e) => e.querySelector("[data-testid=concept-card]")).map((e) => e.id));
    expect(ids[2]).toMatch(/^theory-/);
    await page.goto(LECTURES);
    await ready(page);
    await page.goto(`${LECTURES}#${ids[2]}`);
    await expect(page.getByRole("tab", { name: "준비" })).toHaveAttribute("aria-selected", "true");
    const deck = prepDeck(page);
    await expect(visibleCard(deck)).toHaveAttribute("id", ids[2]);
    await expect(page.locator(`[id="${ids[2]}"]`)).toBeInViewport();
  });
});

test.describe("진단 마지막 화면", () => {
  for (const vp of [
    { width: 390, height: 844 },
    { width: 375, height: 667 },
  ]) {
    test(`${vp.width}×${vp.height}: '결과 보기'가 흐릴 때 '하나를 골라 주세요', 고르면 사라진다 (화면 높이는 늘지 않는다)`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto("/diagnosis");
      // 앞 질문은 가장 낮은 답
      for (const a of LEVEL_ANSWERS_LOW) await chooseSingle(page, a);
      await page.getByRole("checkbox", { name: /^교육/ }).click();
      await page.getByRole("button", { name: "다음", exact: true }).click();
      await page.getByRole("checkbox", { name: /^개념 이해/ }).click();
      await page.getByRole("button", { name: "다음", exact: true }).click();
      await expect(page.getByRole("button", { name: "결과 보기" })).toBeDisabled();
      await expect(page.getByTestId("confirm-helper")).toHaveText("하나를 골라 주세요");
      const before = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(before).toBeLessThanOrEqual(vp.height + 1);
      await page.getByRole("radio", { name: /^개념부터 알고 싶어요/ }).click();
      await expect(page.getByTestId("confirm-helper")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "결과 보기" })).toBeEnabled();
      // 안내가 있을 때와 없을 때 높이가 같다 (선택지·버튼이 밀리지 않는다)
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(before);
    });
  }
});

test.describe("좁은 화면", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  test("320px: 실습·준비 덱과 끝 카드에 가로 넘침이 없다", async ({ page }) => {
    await page.goto(PRACTICE);
    await ready(page);
    await expectNoOverflow(page);
    const deck = practiceDeck(page);
    await deck.getByTestId("deck-next").click();
    await expectNoOverflow(page);
    const total = Number(await deck.getAttribute("data-total"));
    for (let i = 1; i < total; i++) await deck.getByTestId("deck-next").click();
    await expect(deck.getByTestId("deck-end")).toBeVisible();
    await expectNoOverflow(page);
    await page.getByRole("tab", { name: "준비" }).click();
    await visibleCard(prepDeck(page)).getByTestId("term-flip").click();
    await expectNoOverflow(page);
    await page.goto(THEORY);
    await ready(page);
    await visibleCard(prepDeck(page)).getByTestId("concept-more").click();
    await expectNoOverflow(page);
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 카드 덱`, () => {
    test.use({ colorScheme: scheme });
    test("실습 덱(완료 카드 포함) · 끝 카드 · 개념 카드 펼침 · 용어 카드 뒤집음 · 개념 끝 카드", async ({ page }) => {
      await page.goto(PRACTICE);
      await journeyReady(page);
      const deck = practiceDeck(page);
      await deck.getByTestId("deck-complete").click();
      await deck.getByTestId("deck-prev").click();
      await page.waitForTimeout(600);
      await axeCheck(page, `실습 덱/${scheme}`);
      const total = Number(await deck.getAttribute("data-total"));
      for (let i = 0; i < total; i++) await deck.getByTestId("deck-next").click();
      await expect(deck.getByTestId("deck-end")).toBeVisible();
      await page.waitForTimeout(600);
      await axeCheck(page, `실습 끝 카드/${scheme}`);

      await page.goto(THEORY);
      await journeyReady(page);
      const prep = prepDeck(page);
      await visibleCard(prep).getByTestId("concept-more").click();
      await page.waitForTimeout(600);
      await axeCheck(page, `개념 카드/${scheme}`);
      const n = Number(await prep.getAttribute("data-total"));
      for (let i = 0; i < n; i++) {
        const flip = visibleCard(prep).getByTestId("term-flip");
        if (await flip.count()) {
          await flip.click();
          break;
        }
        await prep.getByTestId("deck-next").click();
      }
      await page.waitForTimeout(600);
      await axeCheck(page, `용어 카드/${scheme}`);
      for (let i = 0; i < n; i++) if (await prep.getByTestId("deck-next").isEnabled()) await prep.getByTestId("deck-next").click();
      await expect(prep.getByTestId("deck-end")).toBeVisible();
      await page.waitForTimeout(600);
      await axeCheck(page, `개념 끝 카드/${scheme}`);
    });
  });
}
