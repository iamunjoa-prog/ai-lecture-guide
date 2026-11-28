import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, RESULT_QUERY, SAVED_KEY, test } from "./fixtures";
import { axeCheck, expectNoOverflow, GLOSSARY, lectureWithMissionAndSkill } from "./helpers-saved";

/** 내 학습함: 저장 버튼 · 배지 · /saved 탭 · 내보내기/가져오기 · 전체 삭제 · 저장 불가 */

const now = "2026-11-20T00:00:00.000Z";
function seed() {
  const { videoId, skill } = lectureWithMissionAndSkill();
  return {
    videoId,
    skill,
    state: {
      version: 1,
      lectures: [{ id: videoId, status: "want", savedAt: now, updatedAt: now }],
      missions: [],
      skills: [{ id: skill.id, savedAt: now }],
      terms: GLOSSARY.slice(0, 2).map((t) => ({ id: t.id, savedAt: now })),
      theory: [],
      lastDiagnosis: { href: `/result?${RESULT_QUERY}`, savedAt: now },
    },
  };
}

test.describe("저장 버튼과 내 학습함", () => {
  test("결과에서 강의 저장 → 배지 개수 → /saved에 나온다 (새로고침에도 유지)", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const badge = page.getByTestId("saved-count");
    await expect(badge).toHaveCount(0);
    const card = page.locator("article").first();
    const title = (await card.locator("h3").innerText()).trim();
    const save = card.getByRole("button", { name: /^강의 저장/ });
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("toast")).toContainText("저장했어요");
    await expect(badge).toHaveText("1");
    await page.reload();
    await expect(page.locator("article").first().getByRole("button", { name: /^강의 저장/ })).toHaveAttribute("aria-pressed", "true");

    await page.getByTestId("saved-link").click();
    await expect(page).toHaveURL(/\/saved$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("내 학습함");
    await expect(page.getByTestId("lectures-want")).toContainText(title);
    await expect(page.getByTestId("saved-summary")).toContainText("강의 0/1 완료");
    // 결과 화면을 봤으니 최근 진단이 기억된다
    await expect(page.getByRole("link", { name: /최근 진단 결과 다시 보기/ })).toHaveAttribute("href", /^\/result\?/);
    expect(consoleErrors).toEqual([]);
  });

  test("용어·이론·스킬 저장 버튼도 서로 다른 화면에서 같은 상태를 보인다", async ({ page }) => {
    await page.goto("/glossary#llm");
    const termSave = page.getByRole("button", { name: /^용어 저장: / }).first();
    await termSave.click();
    await expect(termSave).toHaveAttribute("aria-pressed", "true");
    await page.goto("/theory");
    await page.getByRole("button", { name: /^이론 저장: / }).first().click();
    await page.goto(`/skills`);
    await page.getByRole("button", { name: /^스킬 저장: / }).first().click();
    await expect(page.getByTestId("saved-count")).toHaveText("3");
    await page.goto("/saved");
    await page.getByRole("tab", { name: /^용어/ }).click();
    await expect(page.getByTestId("saved-term")).toHaveCount(1);
    await page.getByRole("tab", { name: /^이론/ }).click();
    await expect(page.getByTestId("saved-theory")).toHaveCount(1);
    await page.getByRole("tab", { name: /^스킬/ }).click();
    await expect(page.getByTestId("saved-skill")).toHaveCount(1);
  });

  test("상태 바꾸기 → '다 봤어요' 넛지 → 실습 탭 → 완료 → 스킬 넛지, 스킬 진행도", async ({ page }) => {
    const { videoId, skill, state } = seed();
    await page.goto("/");
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, JSON.stringify(state)]);
    await page.goto("/saved");
    const item = page.getByTestId("lectures-want").getByTestId("saved-lecture");
    await expect(item).toHaveCount(1);
    const group = item.getByRole("radiogroup");
    await expect(group.getByRole("radio", { name: "보고 싶어요" })).toHaveAttribute("aria-checked", "true");
    // 키보드: 오른쪽 화살표 → 보는 중
    await group.getByRole("radio", { name: "보고 싶어요" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("lectures-watching").getByRole("radio", { name: "보는 중" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("lectures-watching").getByRole("radio", { name: "보는 중" })).toBeFocused();
    await page.getByTestId("lectures-watching").getByRole("radio", { name: "다 봤어요" }).click();
    const done = page.getByTestId("lectures-done");
    await expect(done.getByTestId("saved-lecture")).toHaveCount(1);
    await expect(page.getByTestId("saved-summary")).toContainText("강의 1/1 완료");

    // 스킬 진행도에 반영
    await page.getByRole("tab", { name: /^스킬/ }).click();
    await expect(page.getByTestId("skill-progress")).toContainText(/강의 1\/\d+ 다 봤어요/);
    await page.getByRole("tab", { name: /^강의/ }).click();

    await page.getByTestId("lecture-mission-nudge").click();
    await expect(page.getByRole("tab", { name: /^실습/ })).toHaveAttribute("aria-selected", "true");
    const mission = page.locator(`[data-testid="saved-mission"][data-video-id="${videoId}"]`);
    await expect(mission).toBeVisible();
    await expect(mission.getByRole("heading", { level: 3 })).toBeFocused();
    await expect(mission.getByTestId("prompt-box").first()).toBeVisible(); // 펼쳐져 있다

    await mission.getByRole("radio", { name: "완료" }).click();
    const nudge = mission.getByTestId("mission-skill-nudge");
    await expect(nudge).toBeVisible();
    await expect(nudge.getByRole("link", { name: new RegExp(skill.name) })).toHaveAttribute("href", `/skills#${skill.id}`);
    await expect(page.getByTestId("saved-summary")).toContainText("실습 1개 완료");
  });

  test("용어 탭: 뜻 가리고 복습하기", async ({ page }) => {
    const { state } = seed();
    await page.goto("/");
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, JSON.stringify(state)]);
    await page.goto("/saved");
    await page.getByRole("tab", { name: /^용어/ }).click();
    const first = page.getByTestId("saved-term").first();
    const meaning = first.getByTestId("term-meaning");
    await expect(meaning).toBeVisible();
    const quiz = page.getByRole("button", { name: "뜻 가리고 복습하기" });
    await quiz.click();
    await expect(quiz).toHaveAttribute("aria-pressed", "true");
    await expect(meaning).toBeHidden();
    const reveal = first.getByRole("button", { name: "뜻 보기" });
    await expect(reveal).toHaveAttribute("aria-expanded", "false");
    await reveal.click();
    await expect(meaning).toBeVisible();
    await expect(first.getByRole("button", { name: "뜻 가리기" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("saved-term").nth(1).getByTestId("term-meaning")).toBeHidden();
    await quiz.click();
    await expect(page.getByTestId("saved-term").nth(1).getByTestId("term-meaning")).toBeVisible();
  });

  test("탭: 화살표 키로 이동, 빈 탭은 할 일 안내", async ({ page }) => {
    await page.goto("/saved");
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(5);
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: /^실습/ })).toBeFocused();
    await expect(page.getByRole("tab", { name: /^실습/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("저장한 실습이 없어요");
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: /^용어/ })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /^강의/ }).click();
    await expect(page.getByTestId("saved-empty").getByRole("link", { name: "진단하기" })).toHaveAttribute("href", "/diagnosis");
  });

  test("내보내기 → 전체 삭제 → 가져오기 왕복", async ({ page }) => {
    const { state } = seed();
    await page.goto("/");
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, JSON.stringify(state)]);
    await page.goto("/saved");
    // /saved에서도 머리글에 내 학습함(지금 페이지)이 보인다
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: /^내 학습함/ })).toHaveAttribute("aria-current", "page");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "내보내기" }).click()]);
    expect(download.suggestedFilename()).toMatch(/^ai-lecture-guide-saved-\d{4}-\d{2}-\d{2}\.json$/);
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "aig-saved-")), "saved.json");
    await download.saveAs(file);
    const exported = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(exported.version).toBe(2);
    expect(exported.lectures).toHaveLength(1);

    await page.getByRole("button", { name: "전체 삭제" }).click();
    await page.getByRole("button", { name: "모두 지우기" }).click();
    await expect(page.getByTestId("saved-empty")).toBeVisible();
    await expect(page.getByRole("button", { name: "전체 삭제" })).toBeFocused();
    expect(JSON.parse((await page.evaluate((k) => localStorage.getItem(k), SAVED_KEY))!).lectures).toEqual([]);

    await page.getByTestId("import-input").setInputFiles(file);
    const n = 1 + state.skills.length + state.terms.length;
    await expect(page.getByTestId("toast")).toHaveText(`${n}개 항목을 가져왔어요`);
    await expect(page.getByTestId("saved-lecture")).toHaveCount(1);
    // 같은 파일을 다시 가져오면 중복되지 않는다
    await page.getByTestId("import-input").setInputFiles(file);
    await expect(page.getByTestId("toast")).toHaveText("새로 가져올 항목이 없어요");

    // 잘못된 파일
    await page.getByTestId("import-input").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{oops") });
    await expect(page.getByTestId("toast")).toContainText("가져올 수 없는 파일이에요");
  });

  test("망가진 저장값·없어진 id가 있어도 화면은 열리고 정리된다", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await page.evaluate(
      (k) =>
        localStorage.setItem(
          k,
          JSON.stringify({ version: 1, lectures: [{ id: "removed-video-id", status: "done" }, { id: 5 }], terms: [{ id: "llm" }] }),
        ),
      SAVED_KEY,
    );
    await page.goto("/saved");
    await expect(page.getByRole("tab", { name: /^강의/ })).toContainText("0");
    await expect(page.getByRole("tab", { name: /^용어/ })).toContainText("1");
    await expect
      .poll(async () => JSON.parse((await page.evaluate((k) => localStorage.getItem(k), SAVED_KEY))!).lectures.length)
      .toBe(0);
    await page.evaluate((k) => localStorage.setItem(k, "{{not json"), SAVED_KEY);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("내 학습함");
    expect(consoleErrors).toEqual([]);
  });

  test("다른 탭에서 저장하면 배지가 따라온다", async ({ page, context }) => {
    await page.goto("/glossary");
    const other = await context.newPage();
    await other.goto("/glossary");
    await other.getByRole("button", { name: /^용어 저장: / }).first().click();
    await expect(page.getByTestId("saved-count")).toHaveText("1");
    await other.close();
  });
});

test.describe("저장할 수 없는 브라우저", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
  });

  test("저장 버튼은 안내만 하고, 화면은 그대로 동작한다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const save = page.locator("article").first().getByRole("button", { name: /^강의 저장/ });
    await save.click();
    await expect(page.getByTestId("toast")).toHaveText("이 브라우저에서는 저장할 수 없어요");
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await page.goto("/saved");
    await expect(page.getByTestId("saved-unavailable")).toBeVisible();
    await expect(page.getByRole("button", { name: "내보내기" })).toBeDisabled();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("좁은 화면", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  test("320px: /saved 모든 탭에 가로 넘침이 없다", async ({ page }) => {
    const { state, videoId } = seed();
    state.missions = [{ videoId, status: "done", savedAt: now, updatedAt: now }] as never;
    await page.goto("/");
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, JSON.stringify(state)]);
    await page.goto("/saved");
    for (const t of ["강의", "실습", "스킬", "이론", "용어"]) {
      await page.getByRole("tab", { name: new RegExp(`^${t}`) }).click();
      if (t === "실습") await page.getByRole("button", { name: "미션 보기" }).first().click();
      await expectNoOverflow(page);
    }
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 내 학습함`, () => {
    test.use({ colorScheme: scheme });
    test("/saved 탭마다", async ({ page }) => {
      const { state, videoId } = seed();
      state.missions = [{ videoId, status: "done", savedAt: now, updatedAt: now }] as never;
      await page.goto("/");
      await page.evaluate(([k, v]) => localStorage.setItem(k, v), [SAVED_KEY, JSON.stringify(state)]);
      await page.goto("/saved");
      await page.waitForTimeout(800);
      await axeCheck(page, `/saved 강의/${scheme}`);
      await page.getByRole("tab", { name: /^실습/ }).click();
      await page.getByRole("button", { name: "미션 보기" }).first().click();
      await page.waitForTimeout(500);
      await axeCheck(page, `/saved 실습/${scheme}`);
      await page.getByRole("tab", { name: /^용어/ }).click();
      await page.getByRole("button", { name: "뜻 가리고 복습하기" }).click();
      await page.waitForTimeout(500); // 색 전환이 끝난 뒤
      await axeCheck(page, `/saved 용어/${scheme}`);
      await page.goto("/saved");
      await page.evaluate((k) => localStorage.removeItem(k), SAVED_KEY);
      await page.reload();
      await page.waitForTimeout(800);
      await axeCheck(page, `/saved 빈 상태/${scheme}`);
    });
  });
}
