import { expect, test } from "@playwright/test";

/** 콘텐츠 빈칸 비고: 고른 분야 × 목표에 맞는 수준별 공식 강의가 없을 때만 보인다 */
test.describe("결과 화면 비고", () => {
  test("빈칸 조합이면 비고가 보인다", async ({ page }) => {
    await page.goto("/result?l=beginner&d=creative&g=build_agents&ko=0");
    const note = page.getByTestId("coverage-note");
    await expect(note).toBeVisible();
    await expect(note).toContainText("이미지·영상 제작");
    await expect(note).toContainText("아직 찾지 못했어요");
  });

  test("채워진 조합이면 비고가 없다", async ({ page }) => {
    await page.goto("/result?l=beginner&d=creative&g=use_tools&ko=0");
    await expect(page.getByTestId("roadmap-steps")).toBeVisible();
    await expect(page.getByTestId("coverage-note")).toHaveCount(0);
  });
});
