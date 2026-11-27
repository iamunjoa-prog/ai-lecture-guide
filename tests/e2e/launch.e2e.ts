import { answerLevelQuestionsLow, chooseSingle, expect, test } from "./fixtures";

const Q = {
  domains: "어떤 분야에 AI를 쓰고 싶으세요?",
  goal: "AI로 이루고 싶은 목표는 무엇인가요?",
  language: "한국어로 들을 수 있는 강의가 좋으세요?",
};

test.describe("'잘 모르겠어요' 선택지", () => {
  test("분야: 배타 선택 — 고르면 다른 선택이 풀리고, 다른 분야를 고르면 풀린다", async ({ page }) => {
    await answerLevelQuestionsLow(page);
    const unsure = page.getByRole("checkbox", { name: /^잘 모르겠어요/ });
    const coding = page.getByRole("checkbox", { name: /^코딩/ });
    const auto = page.getByRole("checkbox", { name: /^업무 자동화/ });
    const next = page.getByRole("button", { name: "다음", exact: true });

    await expect(unsure).toBeVisible();
    await coding.click();
    await auto.click();
    await expect(page.getByText("(2/3)")).toBeVisible();

    await unsure.click();
    await expect(unsure).toHaveAttribute("aria-checked", "true");
    await expect(coding).toHaveAttribute("aria-checked", "false");
    await expect(auto).toHaveAttribute("aria-checked", "false");
    await expect(page.getByText("분야를 정하지 않고 폭넓게 추천해 드려요")).toBeVisible();
    await expect(next).toBeEnabled();

    await coding.click();
    await expect(unsure).toHaveAttribute("aria-checked", "false");
    await expect(coding).toHaveAttribute("aria-checked", "true");

    // 다시 누르면 선택이 풀리고 CTA가 꺼진다
    await unsure.click();
    await unsure.click();
    await expect(unsure).toHaveAttribute("aria-checked", "false");
    await expect(next).toBeDisabled();
  });

  test("분야·목표 모두 '잘 모르겠어요' → 분야 미정 로드맵 (로딩 건너뛰기 포함)", async ({ page, consoleErrors }) => {
    await answerLevelQuestionsLow(page);
    await page.getByRole("checkbox", { name: /^잘 모르겠어요/ }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(Q.goal);

    // 목표 선택지: '개념 이해'와 '아직 잘 모르겠어요'는 서로 다른 선택지
    await expect(page.getByRole("radio", { name: /^개념 이해/ })).toBeVisible();
    await chooseSingle(page, /^아직 잘 모르겠어요/, Q.language);
    await page.getByRole("radio", { name: /네, 한국어가 편해요/ }).click();

    // 로딩 화면 + 건너뛰기 버튼(44px 이상)
    // 로딩은 1.2초뿐이라 문구가 아니라 건너뛰기 버튼이 뜨는 순간을 기다린다
    const skip = page.getByRole("button", { name: "건너뛰기" });
    await skip.waitFor();
    const box = await skip.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    await skip.click();

    await page.waitForURL(/\/result\?/, { timeout: 5_000 });
    expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual({ l: "beginner", d: "", g: "understand", ko: "1" });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("입문자 맞춤 학습 로드맵");
    await expect(page.getByRole("list", { name: "진단 요약" })).toContainText("분야 미정");
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(3);
    // 분야 문구 없이 사유가 만들어진다
    await expect(page.locator("article").first()).not.toContainText("에 AI를 적용하려는");
    expect(consoleErrors).toEqual([]);
  });

  test("분야 미정 결과 링크(d=)는 유효하지만, d 파라미터가 아예 없으면 빈 상태", async ({ page }) => {
    await page.goto("/result?l=user&d=&g=use_tools&ko=0");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("활용자 맞춤 학습 로드맵");
    await page.goto("/result?l=user&g=use_tools&ko=0");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("아직 진단 결과가 없어요");
  });
});

test.describe("로딩 화면", () => {
  async function toLoading(page: import("@playwright/test").Page) {
    await answerLevelQuestionsLow(page);
    await page.getByRole("checkbox", { name: /^코딩/ }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await chooseSingle(page, /^개념 이해/, Q.language);
    await page.getByRole("radio", { name: /영어 강의도 괜찮아요/ }).click();
  }

  test("건너뛰지 않아도 약 1.2초 뒤 결과로 넘어간다", async ({ page }) => {
    await toLoading(page);
    const t0 = Date.now();
    await page.waitForURL(/\/result\?/, { timeout: 5_000 });
    expect(Date.now() - t0).toBeLessThan(3_500);
  });

  test("동작 줄이기 설정에서도 건너뛰기가 보이고 동작한다", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 }, locale: "ko-KR" });
    const page = await ctx.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.fulfill({ status: 204, body: "" }));
    await toLoading(page);
    await page.getByRole("button", { name: "건너뛰기" }).click();
    await page.waitForURL(/\/result\?/, { timeout: 5_000 });
    await ctx.close();
  });
});

test.describe("공유·런칭 메타데이터", () => {
  test("html lang, OG/트위터 메타(절대 URL), 아이콘·매니페스트 링크", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toMatch(/^https?:\/\/[^/]+\/og\.png$/);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /^https?:\/\/.+\/og\.png$/);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute("href", /icon/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test("/result는 noindex", async ({ page }) => {
    await page.goto("/result?l=user&d=coding&g=use_tools&ko=0");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("정적 파일이 200으로 내려온다 (og.png, manifest, robots, sitemap, 아이콘)", async ({ request }) => {
    for (const path of ["/og.png", "/manifest.webmanifest", "/robots.txt", "/sitemap.xml", "/icon.svg", "/apple-icon.png"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
    const og = await request.get("/og.png");
    expect(og.headers()["content-type"]).toContain("image/png");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/result/);
    expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const p of ["/diagnosis", "/glossary"]) expect(sitemap).toContain(p);
    expect(sitemap).not.toContain("/result");
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.name).toBe("AI 강의 길잡이");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test("존재하지 않는 주소는 404 페이지와 처음으로 돌아가는 버튼", async ({ page }) => {
    const res = await page.goto("/없는-페이지");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("페이지가 없어요");
    await page.getByRole("link", { name: "처음 화면으로" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("폰트 자체 호스팅", () => {
  test("외부 폰트 요청 없이 woff2가 같은 출처에서 200으로 내려온다", async ({ page }) => {
    const external: string[] = [];
    const fonts: { url: string; status: number }[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.hostname !== "127.0.0.1" && u.hostname !== "localhost") external.push(r.url());
    });
    page.on("response", (r) => {
      if (/\.woff2?(\?|$)/.test(r.url())) fonts.push({ url: r.url(), status: r.status() });
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(external.filter((u) => /jsdelivr|fonts\.(googleapis|gstatic)|pretendard/i.test(u))).toEqual([]);
    expect(fonts.length).toBeGreaterThan(0);
    for (const f of fonts) expect(f.status, f.url).toBe(200);
    // 동적 서브셋이라 한 화면에서 받는 폰트는 전체 92조각 중 일부뿐이다
    expect(fonts.length).toBeLessThanOrEqual(20);
    const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(family).toContain("Pretendard Variable");
  });
});
