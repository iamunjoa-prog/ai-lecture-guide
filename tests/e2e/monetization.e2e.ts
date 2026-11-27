import { expect, RESULT_QUERY, test } from "./fixtures";

/**
 * 수익화 기본 상태(광고·제휴 꺼짐) 점검.
 * 광고용 환경 변수 없이 빌드한 결과만 검사한다.
 */
const PAGES = ["/", "/diagnosis", `/result?${RESULT_QUERY}`, "/result", "/glossary", "/privacy"];

test.describe("기본 빌드: 광고 없음", () => {
  for (const path of PAGES) {
    test(`${path}에 광고 흔적이 없다`, async ({ page }) => {
      const requested: string[] = [];
      page.on("request", (r) => requested.push(r.url()));
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".adsbygoogle, .kakao_ad_area, [aria-label=광고], [data-ad-frame]")).toHaveCount(0);
      await expect(page.locator('script[src*="ba.min.js"], script[src*="adsbygoogle"], script[src*="googlesyndication"]')).toHaveCount(0);
      expect(requested.filter((u) => /daumcdn|googlesyndication|doubleclick/.test(u))).toEqual([]);
    });
  }

  test("결과: 제휴 영역도 없고 로드맵 끝과 선별 기준 사이에 빈 틈이 없다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    await expect(page.getByText("제휴 링크")).toHaveCount(0);
    const gap = await page.evaluate(() => {
      // 광고 자리는 '추천 강의' 탭의 마지막 로드맵 단계 바로 아래 (스킬은 '다음 스킬' 탭으로 옮겼다)
      const items = document.querySelectorAll("#roadmap ol:not([aria-label]) > li");
      const last = items[items.length - 1].getBoundingClientRect();
      const sel = [...document.querySelectorAll("#roadmap section")].find((s) => s.textContent?.includes("Selection"))!.getBoundingClientRect();
      return sel.top - last.bottom;
    });
    expect(gap).toBeLessThan(40);
  });
});

test.describe("개인정보 처리방침", () => {
  test("페이지가 열리고 광고 섹션은 없으며 문의처는 개인 이메일이 아니다", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/개인정보 처리방침/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("개인정보 처리방침");
    await expect(page.getByText("시행일: 2026-11-27")).toBeVisible();
    await expect(page.getByRole("heading", { name: "광고·제휴 안내" })).toBeVisible();
    await expect(page.getByText("광고·제휴 여부는 강의 선정과 순서에 영향을 주지 않습니다.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "광고 서비스 이용" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "GitHub 저장소 이슈" })).toBeVisible();
  });

  test("랜딩·용어집·결과 바닥에서 링크된다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "개인정보 처리방침" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await page.goto("/glossary");
    await expect(page.getByRole("link", { name: "개인정보 처리방침" })).toBeVisible();
    await page.goto(`/result?${RESULT_QUERY}`);
    await expect(page.getByRole("link", { name: "개인정보 처리방침" })).toBeVisible();
  });

  test("sitemap에 포함된다", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(await res.text()).toContain("/privacy");
  });
});
