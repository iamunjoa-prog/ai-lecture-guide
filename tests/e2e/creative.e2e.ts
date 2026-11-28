import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { DOMAIN_TITLE, GOAL_TITLE, LEVEL_TITLES, answerLevelQuestionsLow, chooseGoals, chooseSingle, expect, openSummary, submitStudy, test } from "./fixtures";

/** 데이터에서 이미지·영상 제작(creative) 분야 강의 id를 읽는다 */
const VIDEOS = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "videos.json"), "utf8")) as { id: string; domains: string[] }[];
const CREATIVE_IDS = VIDEOS.filter((v) => v.domains.includes("creative")).map((v) => v.id);

const DOMAIN_ORDER = ["업무 자동화", "마케팅·콘텐츠", "이미지·영상 제작", "코딩", "데이터 분석", "교육", "창업·비즈니스", "잘 모르겠어요"];
/** BottomCTA 위 흐림 띠 높이(px, h-6) — 목록 끝은 이만큼 이상 CTA 위에 있어야 한다 */
const FADE_PX = 24;

test.describe("이미지·영상 제작 분야", () => {
  test("분야 선택지 순서: 마케팅·콘텐츠 다음에 이미지·영상 제작, 마지막은 잘 모르겠어요", async ({ page }) => {
    await answerLevelQuestionsLow(page);
    const names = await page.getByRole("checkbox").evaluateAll((els) => els.map((e) => e.querySelector("span span")?.textContent?.trim() ?? ""));
    expect(names).toEqual(DOMAIN_ORDER);
    await expect(page.getByRole("checkbox", { name: /^이미지·영상 제작/ })).toContainText("그림·썸네일·짧은 영상");
  });

  test("이미지·영상 제작을 고르면 d=creative 결과에 creative 강의와 칩이 나온다", async ({ page, consoleErrors }) => {
    await answerLevelQuestionsLow(page);
    await page.getByRole("checkbox", { name: /^이미지·영상 제작/ }).click();
    await expect(page.getByText("(1/3)")).toBeVisible();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await chooseGoals(page, [/^업무 도구로 쓰기/]);
    await submitStudy(page, { korean: false });
    await page.getByRole("button", { name: "건너뛰기" }).click();
    await page.waitForURL(/\/result\?/, { timeout: 5_000 });
    expect(new URL(page.url()).searchParams.get("d")).toBe("creative");

    await expect(page.getByTestId("summary-toggle")).toContainText("이미지·영상 제작");
    await expect(await openSummary(page)).toContainText("이미지·영상 제작");

    const hrefs = await page.locator("article a[href*='youtube.com']").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    const creativeHits = CREATIVE_IDS.filter((id) => hrefs.some((h) => h.includes(id)));
    expect(creativeHits.length).toBeGreaterThanOrEqual(1);
    await expect(page.locator("article").filter({ hasText: "이미지·영상 제작에 AI를 적용하려는" }).first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("예전 링크와 새 링크 모두 열린다", async ({ page }) => {
    await page.goto("/result?l=user&d=marketing,creative&g=use_tools&ko=0");
    await expect(page.getByTestId("summary-toggle")).toContainText("마케팅·콘텐츠 외 1");
    const chips = await openSummary(page);
    await expect(chips).toContainText("마케팅·콘텐츠");
    await expect(chips).toContainText("이미지·영상 제작");
    await page.goto("/result?l=user&d=marketing&g=use_tools&ko=1");
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(3);
  });

  test("/practice 분야 선택에 이미지·영상 제작이 있고 ?d=creative로 문구가 바뀐다", async ({ page }) => {
    await page.goto("/practice");
    const select = page.getByTestId("domain-select");
    await expect(select.locator("option", { hasText: "이미지·영상 제작" })).toHaveCount(1);
    await select.selectOption("creative");
    await expect(page).toHaveURL(/\/practice\?d=creative$/);
    await page.reload();
    await expect(page.getByTestId("domain-select")).toHaveValue("creative");
  });
});

/** CTA 영역: 불투명 배경, 안내 문구는 CTA 안, 바로 그 자리에 선택지 글자가 겹쳐 그려지지 않는다 */
async function expectCtaOpaqueAndClear(page: Page, opts: { helper: boolean }) {
  const cta = page.locator("[data-bottom-cta]");
  await expect(cta).toBeVisible();
  const info = await cta.evaluate((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    const body = getComputedStyle(document.body).backgroundColor;
    const helper = el.querySelector("p");
    const r = el.getBoundingClientRect();
    let hit: string | null = null;
    if (helper) {
      const h = helper.getBoundingClientRect();
      const top = document.elementFromPoint(h.left + h.width / 2, h.top + h.height / 2);
      hit = top && el.contains(top) ? "cta" : (top?.outerHTML.slice(0, 80) ?? "none");
    }
    return { bg, body, top: r.top, hit, hasHelper: Boolean(helper) };
  });
  // rgba(…, 0) / transparent / 반투명이면 안 된다
  expect(info.bg).not.toMatch(/rgba\([^)]*,\s*0(\.\d+)?\)|transparent/);
  expect(info.bg).toBe(info.body);
  expect(info.hasHelper).toBe(opts.helper);
  if (opts.helper) expect(info.hit).toBe("cta");
  return info;
}

/** 맨 아래로 스크롤했을 때 마지막 선택지가 CTA(와 흐림 띠) 위에 완전히 보인다 */
async function expectLastOptionClear(page: Page, role: "checkbox" | "radio") {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const last = page.getByRole(role).last();
  await expect(last).toBeInViewport({ ratio: 1 });
  const lastBox = (await last.boundingBox())!;
  const ctaBox = (await page.locator("[data-bottom-cta]").boundingBox())!;
  expect(lastBox.y + lastBox.height).toBeLessThanOrEqual(ctaBox.y - FADE_PX + 0.5);
}

for (const scheme of ["light", "dark"] as const) {
  for (const width of [320, 390] as const) {
    test.describe(`하단 CTA 겹침 · ${scheme} · ${width}px`, () => {
      test.use({ colorScheme: scheme, viewport: { width, height: 700 } });

      test("다중 선택(분야·목표): 안내 문구는 불투명 CTA 안, 마지막 선택지는 CTA 위로 끝까지 스크롤된다", async ({ page }) => {
        await answerLevelQuestionsLow(page);
        // 스크롤 전(선택지가 CTA 뒤로 지나가는 상태)에도 안내 문구 자리에는 CTA만 그려진다
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(DOMAIN_TITLE);
        await expectCtaOpaqueAndClear(page, { helper: true });
        await expectLastOptionClear(page, "checkbox");
        await expect(page.getByRole("checkbox", { name: /^이미지·영상 제작/ })).toBeVisible();

        await page.getByRole("checkbox", { name: /^이미지·영상 제작/ }).click();
        await page.getByRole("button", { name: "다음", exact: true }).click();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(GOAL_TITLE);
        await expectCtaOpaqueAndClear(page, { helper: true });
        await expectLastOptionClear(page, "checkbox");
      });

      test("단일 선택(돌아와서 '다음' CTA가 보일 때): CTA가 선택지를 가리지 않는다", async ({ page }) => {
        await page.goto("/diagnosis");
        await chooseSingle(page, /^아직 거의 안 써 봤어요/, LEVEL_TITLES.prompt);
        await chooseSingle(page, /^궁금한 걸 바로 물어봐요/, LEVEL_TITLES.work);
        await chooseSingle(page, /^아직 안 써 봤어요/, LEVEL_TITLES.connect);
        // 선택지가 가장 많은 '활용 깊이' 질문으로 돌아온다 (이미 답해서 '다음' CTA가 보인다)
        await page.getByRole("button", { name: "이전 단계로" }).click();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(LEVEL_TITLES.work);
        await expectCtaOpaqueAndClear(page, { helper: false });
        await expectLastOptionClear(page, "radio");
        await chooseSingle(page, /^아직 안 써 봤어요/, LEVEL_TITLES.connect);
      });
    });
  }
}
