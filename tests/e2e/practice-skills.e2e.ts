import { chipLabels, expect, RESULT_QUERY, test } from "./fixtures";
import { axeCheck, expectNoOverflow, SKILLS } from "./helpers-saved";

/** 강의 보고 해보기 · 이번 주 실습 미션 · 요즘 주목받는 AI 스킬 · 결과 칩 */
const NON_BEGINNER = "l=practitioner&d=automation&g=use_tools,build_agents&ko=1";

test.describe("강의 보고 해보기", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("카드를 펼치면 미션이 보이고, 프롬프트 복사가 된다 (자리표시자 강조)", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const card = page.locator("article").first();
    const mission = card.getByTestId("practice-mission");
    await expect(mission).toBeHidden(); // 기본은 접힘
    await card.getByRole("button", { name: "자세히 보기" }).click();
    await expect(mission).toBeVisible();
    await expect(mission.getByText("강의 보고 해보기")).toBeVisible();
    await expect(mission.getByText("이렇게 되면 성공")).toBeVisible();
    expect(await mission.getByRole("list", { name: "해 보는 순서" }).getByRole("listitem").count()).toBeGreaterThanOrEqual(2);

    const box = mission.getByTestId("prompt-box").first();
    const expected = (await box.getByTestId("prompt-text").innerText()).trim();
    await box.getByRole("button", { name: /^프롬프트 복사/ }).click();
    await expect(page.getByTestId("toast")).toHaveText("복사했어요");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.trim()).toBe(expected);
    // 자리표시자가 있으면 강조 표시
    if (/\[[^\]]+\]/.test(expected)) await expect(box.locator("mark[data-placeholder]").first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("이번 주 실습 미션", () => {
  test("로드맵 위에 접힌 카드로 보이고, 강의 카드로 이동·펼치기가 된다", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    const weekly = page.getByTestId("weekly-mission");
    await expect(weekly).toBeVisible();
    await expect(weekly.getByRole("heading", { name: "이번 주 실습 미션" })).toBeVisible();
    const body = weekly.getByTestId("prompt-box").first();
    await expect(body).toBeHidden();
    await weekly.getByRole("button", { name: "미션 펼쳐 보기" }).click();
    await expect(body).toBeVisible();

    const href = (await weekly.getByTestId("weekly-lecture-link").getAttribute("href"))!;
    expect(href).toMatch(/^#lecture-/);
    await weekly.getByTestId("weekly-lecture-link").click();
    await expect(page.locator(`[id="${href.slice(1)}"] article`)).toBeInViewport();

    // 추천 강의 바로 보기는 그대로 로드맵 제목으로
    await page.goto(`/result?${NON_BEGINNER}`);
    await page.getByRole("link", { name: "추천 강의 바로 보기", exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: "추천 로드맵" })).toBeInViewport();
  });
});

test.describe("요즘 주목받는 AI 스킬", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("입문자가 아니면 '다음 스킬' 탭에 3개, 자세히 보기로 근거·첫걸음·관련 강의", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    await page.getByRole("tab", { name: "다음 스킬" }).click();
    const section = page.getByTestId("skills-section");
    await expect(section.getByRole("heading", { name: "요즘 주목받는 AI 스킬" })).toBeVisible();
    await expect(section).toContainText(/\d{4}년 \d{1,2}월 기준/);
    const cards = section.getByTestId("skill-card");
    await expect(cards).toHaveCount(3);
    const first = cards.first();
    // 접힌 상태: 이름·한 줄 소개·첫걸음 복사 버튼이 보이고, 자세한 내용은 숨어 있다
    await expect(first.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(first.getByRole("button", { name: /^첫걸음 프롬프트 복사/ })).toBeVisible();
    await expect(first.getByText("왜 지금")).toBeHidden();
    const more = first.getByTestId("skill-more");
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await more.click();
    await expect(more).toHaveAttribute("aria-expanded", "true");
    await expect(first.getByText("왜 지금")).toBeVisible();
    await expect(first.getByTestId("prompt-box")).toBeVisible();
    for (const a of await first.getByTestId("skill-sources").locator("a").all()) {
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", /noopener/);
    }
    for (const a of await first.getByTestId("skill-lectures").locator("a").all()) {
      const href = (await a.getAttribute("href"))!;
      if (href.startsWith("#lecture-")) await expect(page.locator(`[id="${href.slice(1)}"] article`)).toHaveCount(1);
      else expect(href).toMatch(/^https:\/\/www\.youtube\.com\//);
    }
    await expect(section.getByRole("link", { name: /스킬 전체 보기/ })).toHaveAttribute("href", "/skills?l=practitioner");
  });

  test("접힌 카드에서 첫걸음 프롬프트를 바로 복사한다 (결과 탭·/skills)", async ({ page }) => {
    for (const path of [`/result?${NON_BEGINNER}#skills`, "/skills"]) {
      await page.goto(path);
      const card = page.getByTestId("skill-card").first();
      const id = (await card.getAttribute("data-skill-id"))!;
      const skill = SKILLS.find((s) => s.id === id)!;
      await expect(card.getByTestId("skill-more")).toHaveAttribute("aria-expanded", "false");
      await card.getByRole("button", { name: /^첫걸음 프롬프트 복사/ }).click();
      await expect(page.getByTestId("toast")).toHaveText("복사했어요");
      expect((await page.evaluate(() => navigator.clipboard.readText())).trim(), path).toBe(skill.firstStep.prompt.trim());
      // 복사해도 카드는 접힌 그대로
      await expect(card.getByTestId("skill-more")).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("/skills: 전체 목록, 해시로 해당 스킬이 펼쳐진다, sitemap 포함", async ({ page, request, consoleErrors }) => {
    const target = SKILLS[Math.min(3, SKILLS.length - 1)];
    await page.goto(`/skills#${target.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("요즘 주목받는 AI 스킬");
    await expect(page.getByTestId("skill-card")).toHaveCount(SKILLS.length);
    await expect(page.locator(`[id="${target.id}"]`).getByTestId("skill-more")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(`[id="${target.id}"]`)).toBeInViewport();
    await page.evaluate((id) => (window.location.hash = `#${id}`), SKILLS[0].id);
    await expect(page.locator(`[id="${SKILLS[0].id}"]`).getByTestId("skill-more")).toHaveAttribute("aria-expanded", "true");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/skills");
    expect(consoleErrors).toEqual([]);
  });

  test("/skills: 수준 필터와 ?l= 주소가 맞물린다 (입문자 값은 전체 + 안내)", async ({ page, consoleErrors }) => {
    const count = (l: string) => SKILLS.filter((s) => s.levels.includes(l)).length;
    await page.goto("/skills?l=developer");
    const filters = page.getByRole("radiogroup", { name: "수준별로 보기" });
    await expect(filters.getByRole("radio")).toHaveText(["전체", "활용자", "실무자", "개발자"]);
    await expect(filters.getByRole("radio", { name: "개발자" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("skill-card")).toHaveCount(count("developer"));

    await filters.getByRole("radio", { name: "활용자" }).click();
    await expect(page).toHaveURL(/\/skills\?l=user$/);
    await expect(page.getByTestId("skill-card")).toHaveCount(count("user"));
    // 화살표 키로 옮기면 바로 고른다 (활용자 → 실무자)
    await page.keyboard.press("ArrowRight");
    await expect(filters.getByRole("radio", { name: "실무자" })).toBeFocused();
    await expect(filters.getByRole("radio", { name: "실무자" })).toHaveAttribute("aria-checked", "true");
    await expect(page).toHaveURL(/\/skills\?l=practitioner$/);
    await filters.getByRole("radio", { name: "전체" }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.getByTestId("skill-card")).toHaveCount(SKILLS.length);
    // 새로고침해도 필터가 유지된다
    await filters.getByRole("radio", { name: "개발자" }).click();
    await page.reload();
    await expect(filters.getByRole("radio", { name: "개발자" })).toHaveAttribute("aria-checked", "true");

    await page.goto("/skills?l=beginner");
    await expect(filters.getByRole("radio", { name: "전체" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("skill-card")).toHaveCount(SKILLS.length);
    const note = page.getByTestId("beginner-note");
    await expect(note).toContainText("입문자라면 기본 강의와 실습부터 시작해 보세요");
    await expect(note.getByRole("link", { name: /진단하기/ })).toHaveAttribute("href", "/diagnosis");
    expect(consoleErrors).toEqual([]);
  });

  test("머리글 'AI 스킬' 링크: 여러 화면에서 /skills로 (입문자 결과만 제외)", async ({ page }) => {
    for (const p of ["/", "/glossary", "/theory", "/privacy", "/saved", "/skills", `/result?${RESULT_QUERY}`]) {
      await page.goto(p);
      await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: "AI 스킬" }), p).toHaveAttribute("href", "/skills");
    }
    await page.goto("/skills");
    await expect(page.getByRole("navigation", { name: "내 메뉴" }).getByRole("link", { name: "AI 스킬" })).toHaveAttribute("aria-current", "page");
  });
});

test.describe("결과 칩", () => {
  test("수준·분야·목표 묶음 이름과 1순위 표시", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    const summary = page.getByRole("group", { name: "진단 요약" });
    for (const name of ["수준", "분야", "목표"]) await expect(summary.getByRole("list", { name })).toBeVisible();
    const goals = summary.getByRole("list", { name: "목표" }).getByRole("listitem");
    await expect(goals.first()).toContainText("1순위");
    expect(chipLabels(await goals.allInnerTexts())).toEqual(["업무 도구로 쓰기", "나만의 에이전트 만들기"]);
  });
});

test.describe("좁은 화면·접근성", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  test("320px: 펼친 결과 섹션·/skills에 가로 넘침이 없다", async ({ page }) => {
    await page.goto(`/result?${NON_BEGINNER}`);
    await page.getByTestId("weekly-mission").getByRole("button", { name: "미션 펼쳐 보기" }).click();
    await page.locator("article").first().getByRole("button", { name: "자세히 보기" }).click();
    await expectNoOverflow(page);
    await page.getByRole("tab", { name: "다음 스킬" }).click();
    await page.getByTestId("skills-section").getByTestId("skill-more").first().click();
    await expectNoOverflow(page);
    await page.getByRole("tab", { name: "시작 전 준비" }).click();
    await expectNoOverflow(page);
    await page.goto(`/skills?l=practitioner#${SKILLS[0].id}`);
    await expectNoOverflow(page);
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe · ${scheme} · 실습·스킬`, () => {
    test.use({ colorScheme: scheme });
    test("결과: 실습·이번 주 미션·스킬 펼침", async ({ page }) => {
      await page.goto(`/result?${NON_BEGINNER}`);
      await page.getByTestId("weekly-mission").getByRole("button", { name: "미션 펼쳐 보기" }).click();
      await page.locator("article").first().getByRole("button", { name: "자세히 보기" }).click();
      await page.waitForTimeout(800);
      await axeCheck(page, `결과 펼침(실습)/${scheme}`);
      await page.getByRole("tab", { name: "다음 스킬" }).click();
      await page.getByTestId("skills-section").getByTestId("skill-more").first().click();
      await page.waitForTimeout(800);
      await axeCheck(page, `결과 다음 스킬 탭/${scheme}`);
    });
    test("/skills (필터·펼침)", async ({ page }) => {
      await page.goto(`/skills?l=developer#${SKILLS[0].id}`);
      await page.waitForTimeout(800);
      await axeCheck(page, `/skills/${scheme}`);
    });
  });
}
