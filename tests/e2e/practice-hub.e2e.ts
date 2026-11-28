import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, RESULT_QUERY, SAVED_KEY, test } from "./fixtures";
import { axeCheck, expectNoOverflow } from "./helpers-saved";

/** 진단 없이 바로 가는 실습 모음(/practice)과 공통 머리글 메뉴 */
const read = <T,>(f: string): T => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", f), "utf8")) as T;
type Mission = { videoId: string; title: string; needsTool?: string; prompts: { label: string; text: string; domainVariants?: Record<string, string> }[] };
type Video = { id: string; title: string; url: string; instructorId: string; levels: string[]; goals: string[] };
const MISSIONS = read<Mission[]>("practice.json");
const VIDEOS = new Map(read<Video[]>("videos.json").map((v) => [v.id, v]));
const INSTRUCTORS = new Map(read<{ id: string; name: string }[]>("instructors.json").map((i) => [i.id, i.name]));
const tool = (m: Mission) => m.needsTool ?? "chat";
const count = (pred: (m: Mission, v: Video) => boolean) => MISSIONS.filter((m) => pred(m, VIDEOS.get(m.videoId)!)).length;

const BEGINNER = "l=beginner&d=automation&g=understand&ko=1";
const PRACTITIONER = "l=practitioner&d=automation&g=use_tools,build_agents&ko=1";

const menu = (page: Page) => page.getByRole("navigation", { name: "내 메뉴" });
const countText = (page: Page) => page.getByTestId("practice-count");
const radio = (page: Page, group: string, name: string) => page.getByRole("radiogroup", { name: group }).getByRole("radio", { name, exact: true });

test.describe("머리글 메뉴: 실습 · 용어집 · AI 스킬 · 내 학습함", () => {
  test("모든 화면에서 같은 순서, 지금 페이지 표시 (입문자 결과는 AI 스킬 없음)", async ({ page }) => {
    const cases: [string, string[], string | null][] = [
      ["/", ["실습", "용어집", "AI 스킬", "내 학습함"], null],
      ["/practice", ["실습", "용어집", "AI 스킬", "내 학습함"], "실습"],
      ["/glossary", ["실습", "용어집", "AI 스킬", "내 학습함"], "용어집"],
      ["/skills", ["실습", "용어집", "AI 스킬", "내 학습함"], "AI 스킬"],
      ["/saved", ["실습", "용어집", "AI 스킬", "내 학습함"], "내 학습함"],
      [`/result?${PRACTITIONER}`, ["실습", "용어집", "AI 스킬", "내 학습함"], null],
      [`/result?${BEGINNER}`, ["실습", "용어집", "내 학습함"], null],
    ];
    for (const [p, labels, current] of cases) {
      await page.goto(p);
      const links = menu(page).getByRole("link");
      expect((await links.allInnerTexts()).map((t) => t.trim()), p).toEqual(labels);
      await expect(menu(page).getByRole("link", { name: "실습", exact: true }), p).toHaveAttribute("href", "/practice");
      const cur = menu(page).locator('[aria-current="page"]');
      if (current) await expect(cur, p).toHaveText(current);
      else await expect(cur, p).toHaveCount(0);
    }
  });

  test.describe("320px", () => {
    test.use({ viewport: { width: 320, height: 640 } });
    test("메뉴 4개(입문자 결과 3개)가 배지와 함께 한 줄에 들어간다", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(
        ([k, v]) => localStorage.setItem(k, v),
        [SAVED_KEY, JSON.stringify({ version: 1, lectures: [], missions: [], skills: [], terms: [{ id: "llm", savedAt: "2026-11-01T00:00:00.000Z" }], theory: [] })],
      );
      for (const p of ["/", "/practice", "/glossary", "/skills", "/saved", `/result?${PRACTITIONER}`, `/result?${BEGINNER}`]) {
        await page.goto(p);
        await expect(page.getByTestId("saved-count"), p).toHaveText("1");
        const header = page.getByTestId("site-header");
        expect((await header.boundingBox())!.height, p).toBeLessThanOrEqual(64);
        const boxes = await menu(page).getByRole("link").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
        expect(new Set(boxes.map(Math.round)).size, `${p}: 한 줄`).toBe(1);
        const badge = (await page.getByTestId("saved-count").boundingBox())!;
        expect(badge.x + badge.width, p).toBeLessThanOrEqual(320);
        await expectNoOverflow(page);
      }
    });
  });
});

test.describe("/practice 실습 모음", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("히어로·전체 70개·기본 순서(입문자 챗봇 미션 먼저)·강의 없이 바로 해볼 수 있어요", async ({ page, consoleErrors }) => {
    await page.goto("/practice");
    await expect(page).toHaveTitle(/실습 모음/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("실습 모음");
    await expect(page.getByText("강의를 보지 않아도 바로 해볼 수 있는 AI 실습이에요.")).toBeVisible();
    await expect(countText(page)).toHaveText(`실습 ${MISSIONS.length}개`);
    const items = page.getByTestId("mission-item");
    await expect(items).toHaveCount(MISSIONS.length);
    const firstId = (await items.first().getAttribute("data-video-id"))!;
    expect(VIDEOS.get(firstId)!.levels).toContain("beginner");
    await expect(items.first().getByTestId("mission-ready")).toHaveText("강의 없이 바로 해볼 수 있어요");
    // 코딩 미션은 필요한 것을 말한다
    const coding = MISSIONS.find((m) => tool(m) === "coding")!;
    await expect(page.locator(`[id="mission-${coding.videoId}"]`).getByTestId("mission-ready")).toHaveText("코딩 환경과 코딩 AI가 있어야 해요");
    // 미션은 접혀 있고 펼치면 순서·프롬프트·성공 기준
    const first = items.first();
    await expect(first.getByTestId("prompt-box").first()).toBeHidden();
    await first.getByTestId("mission-more").click();
    await expect(first.getByTestId("prompt-box").first()).toBeVisible();
    await expect(first.getByText("이렇게 되면 성공")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("수준·목표·도구 필터: 함께 쓰이고 주소에 남고 뒤로 가기로 돌아간다, 빈 결과·초기화", async ({ page, consoleErrors }) => {
    await page.goto("/practice");
    await radio(page, "수준", "활용자").click();
    await expect(page).toHaveURL(/\/practice\?l=user$/);
    await expect(countText(page)).toHaveText(`실습 ${count((_, v) => v.levels.includes("user"))}개`);
    await radio(page, "목표", "업무 도구로 쓰기").click();
    await expect(page).toHaveURL(/\/practice\?l=user&g=use_tools$/);
    const userTools = count((_, v) => v.levels.includes("user") && v.goals.includes("use_tools"));
    await expect(countText(page)).toHaveText(`실습 ${userTools}개`);
    await radio(page, "필요한 도구", "챗봇만 있으면 돼요").click();
    await expect(page).toHaveURL(/\/practice\?l=user&g=use_tools&t=chat$/);
    const userToolsChat = count((m, v) => v.levels.includes("user") && v.goals.includes("use_tools") && tool(m) === "chat");
    await expect(countText(page)).toHaveText(`실습 ${userToolsChat}개`);
    await expect(page.getByTestId("mission-item")).toHaveCount(userToolsChat);
    for (const t of await page.getByTestId("mission-ready").allInnerTexts()) expect(t).toBe("강의 없이 바로 해볼 수 있어요");

    // 뒤로 가기: 직전 필터로
    await page.goBack();
    await expect(page).toHaveURL(/\/practice\?l=user&g=use_tools$/);
    await expect(radio(page, "필요한 도구", "전체")).toHaveAttribute("aria-checked", "true");
    await expect(countText(page)).toHaveText(`실습 ${userTools}개`);
    await page.goForward();
    await expect(radio(page, "필요한 도구", "챗봇만 있으면 돼요")).toHaveAttribute("aria-checked", "true");

    // 새로고침해도 유지 (서버가 같은 필터로 그린다)
    await page.reload();
    await expect(radio(page, "수준", "활용자")).toHaveAttribute("aria-checked", "true");
    await expect(countText(page)).toHaveText(`실습 ${userToolsChat}개`);

    // 키보드: 화살표로 이동하면 바로 선택
    await radio(page, "수준", "활용자").focus();
    await page.keyboard.press("ArrowRight");
    await expect(radio(page, "수준", "실무자")).toBeFocused();
    await expect(page).toHaveURL(/l=practitioner/);

    // 맞는 실습이 없으면 안내와 초기화
    await page.goto("/practice?l=beginner&t=coding");
    await expect(countText(page)).toHaveText("실습 0개");
    const empty = page.getByTestId("practice-empty");
    await expect(empty).toContainText("조건에 맞는 실습이 아직 없어요");
    await empty.getByRole("button", { name: "전체 실습 보기" }).click();
    await expect(page).toHaveURL(/\/practice$/);
    await expect(countText(page)).toHaveText(`실습 ${MISSIONS.length}개`);
    await page.goto("/practice?g=build_agents");
    await page.getByTestId("filter-reset").click();
    await expect(page).toHaveURL(/\/practice$/);
    expect(consoleErrors).toEqual([]);
  });

  test("분야를 고르면 프롬프트가 그 분야 문구로 바뀌고(?d=) 복사된다", async ({ page }) => {
    const m = MISSIONS.find((x) => x.prompts[0].domainVariants?.marketing)!;
    await page.goto(`/practice#mission-${m.videoId}`);
    const item = page.locator(`[id="mission-${m.videoId}"]`);
    await expect(item.getByTestId("mission-more")).toHaveAttribute("aria-expanded", "true");
    const text = item.getByTestId("prompt-text").first();
    await expect(text).toHaveText(m.prompts[0].text);
    await page.getByTestId("domain-select").selectOption("marketing");
    await expect(page).toHaveURL(/\/practice\?d=marketing$/);
    const variant = m.prompts[0].domainVariants!.marketing;
    await expect(text).toHaveText(variant);
    await item.getByRole("button", { name: /^프롬프트 복사/ }).first().click();
    await expect(page.getByTestId("toast")).toHaveText("복사했어요");
    expect((await page.evaluate(() => navigator.clipboard.readText())).trim()).toBe(variant.trim());
    // 새로 열어도 분야가 유지된다
    await page.goto(`/practice?d=marketing#mission-${m.videoId}`);
    await expect(page.getByTestId("domain-select")).toHaveValue("marketing");
    await expect(page.locator(`[id="mission-${m.videoId}"]`).getByTestId("prompt-text").first()).toHaveText(variant);
  });

  test("해시 딥링크: 필터에 걸러진 미션도 보이고 펼쳐지며 화면에 들어온다", async ({ page }) => {
    const chat = MISSIONS.filter((m) => tool(m) === "chat").at(-1)!;
    await page.goto(`/practice?t=coding#mission-${chat.videoId}`);
    const item = page.locator(`[id="mission-${chat.videoId}"]`);
    await expect(item.getByTestId("mission-more")).toHaveAttribute("aria-expanded", "true");
    await expect(item).toBeInViewport();
    await expect(item.getByTestId("prompt-box").first()).toBeVisible();
  });

  test("관련 강의 보기: 유튜브 새 탭 링크와 강사 이름", async ({ page }) => {
    await page.goto("/practice");
    const item = page.getByTestId("mission-item").first();
    const video = VIDEOS.get((await item.getAttribute("data-video-id"))!)!;
    const link = item.getByTestId("mission-video-link");
    await expect(link).toHaveAttribute("href", video.url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toContainText("(선택) 관련 강의 보기");
    await expect(link).toContainText(video.title);
    await expect(link).toContainText(INSTRUCTORS.get(video.instructorId)!);
    // 실습 모음에는 결과 화면용 '강의 카드로 돌아가기' 링크가 없다
    await expect(page.getByTestId("mission-lecture-link")).toHaveCount(0);
  });

  test("실습 저장·완료 → 머리글 배지와 내 학습함 실습 탭", async ({ page }) => {
    await page.goto("/practice");
    const item = page.getByTestId("mission-item").first();
    const title = (await item.getByRole("heading", { level: 3 }).innerText()).trim();
    await item.getByRole("button", { name: /^실습 저장/ }).click();
    await expect(page.getByTestId("saved-count")).toHaveText("1");
    await item.getByTestId("mission-done").click();
    await expect(item.getByTestId("mission-done")).toHaveAttribute("aria-pressed", "true");
    await menu(page).getByRole("link", { name: /^내 학습함/ }).click();
    await expect(page).toHaveURL(/\/saved$/);
    await page.getByRole("tab", { name: /^실습/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText(title);
  });

  test("내 학습함 실습 탭이 비어 있으면 실습 모음으로 안내", async ({ page }) => {
    await page.goto("/saved");
    await page.getByRole("tab", { name: /^실습/ }).click();
    await expect(page.getByRole("tabpanel").getByRole("link", { name: "실습 모음에서 골라 보기" })).toHaveAttribute("href", "/practice");
  });

  test("sitemap: /practice 포함, /theory 없음 · /theory는 넘겨주기", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/practice</loc>");
    expect(sitemap).not.toContain("/theory");
    const res = await request.get("/theory?l=user", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toMatch(/^\/glossary\?(?=.*tab=theory)(?=.*l=user)/);
  });
});

test.describe("결과 화면 실습 탭", () => {
  test("미션 카드마다 준비 표시, '실습 전체 모음 보기'는 내 수준으로 거른 /practice", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}#practice`);
    const panel = page.getByTestId("result-panel-practice");
    await expect(panel.getByTestId("card-deck")).toBeVisible();
    const items = panel.getByTestId("deck-card");
    const n = await items.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const id = (await items.nth(i).getAttribute("data-id"))!;
      const m = MISSIONS.find((x) => x.videoId === id)!;
      const ready = items.nth(i).getByTestId("mission-ready");
      await expect(ready).toHaveAttribute("data-tool", tool(m));
      if (tool(m) === "chat") await expect(ready).toHaveText("강의 없이 바로 해볼 수 있어요");
    }
    const link = panel.getByTestId("practice-all-link");
    await expect(link).toHaveAttribute("href", "/practice?l=developer");
    await link.click();
    await expect(page).toHaveURL(/\/practice\?l=developer$/);
    await expect(radio(page, "수준", "개발자")).toHaveAttribute("aria-checked", "true");
    await expect(countText(page)).toHaveText(`실습 ${count((_, v) => v.levels.includes("developer"))}개`);
  });
});

test.describe("320px · /practice", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  test("필터와 펼친 미션이 넘치지 않는다", async ({ page }) => {
    await page.goto("/practice?l=developer");
    await expectNoOverflow(page);
    await page.getByTestId("mission-more").first().click();
    await expectNoOverflow(page);
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 실습 모음·용어집 탭`, () => {
    test.use({ colorScheme: scheme });
    test("/practice 필터 선택·미션 펼침·빈 결과", async ({ page }) => {
      await page.goto("/practice");
      await radio(page, "수준", "실무자").click();
      await page.getByTestId("mission-more").first().click();
      await page.waitForTimeout(800);
      await axeCheck(page, `/practice/${scheme}`);
      await page.goto("/practice?l=beginner&t=coding");
      await page.waitForTimeout(500);
      await axeCheck(page, `/practice 빈 결과/${scheme}`);
    });
    test("/glossary 용어 탭 · 3분 이론 탭(개념 펼침)", async ({ page }) => {
      await page.goto("/glossary#llm");
      await page.waitForTimeout(800);
      await axeCheck(page, `/glossary 용어/${scheme}`);
      await page.getByRole("tab", { name: "3분 이론" }).click();
      await page.getByRole("tabpanel", { name: "3분 이론" }).getByTestId("theory-concept").first().locator("summary").click();
      await page.waitForTimeout(500);
      await axeCheck(page, `/glossary 3분 이론/${scheme}`);
    });
  });
}
