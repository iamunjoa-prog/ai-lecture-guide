import { chooseSingle, expect, RESULT_QUERY, test } from "./fixtures";

const Q = {
  frequency: "ChatGPT나 Claude 같은 AI, 얼마나 자주 쓰세요?",
  prompt: "AI에게 질문할 때 어떻게 하세요?",
  work: "업무나 공부에 AI를 어떻게 쓰고 있나요?",
  automation: "API나 자동화 도구를 써본 적 있나요?",
  coding: "코딩은 어느 정도 하세요?",
  domains: "어떤 분야에 AI를 쓰고 싶으세요?",
  goal: "AI로 이루고 싶은 목표는 뭐예요?",
  language: "한국어로 들을 수 있는 강의가 좋으세요?",
};

test.describe("랜딩", () => {
  test("첫 화면이 보이고 CTA를 누르면 진단으로 간다", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AI 강의 길잡이/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("막막하셨죠?");
    await expect(page.getByText(/검증된 강사 \d+명 · 강의 \d+개/)).toBeVisible();

    const cta = page.getByRole("link", { name: /1분 진단 시작하기/ });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/diagnosis$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(Q.frequency);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("진단", () => {
  test("전체 흐름: 자동 넘김 · 최대 3개 · 뒤로 가도 답 유지 → 결과", async ({ page, consoleErrors }) => {
    await page.goto("/diagnosis");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText(Q.frequency);
    await expect(page.getByRole("progressbar")).toBeVisible();

    // 단일 선택은 고르면 자동으로 다음 질문으로 넘어간다
    await chooseSingle(page, /거의 매일 써요/, Q.prompt);
    await chooseSingle(page, /템플릿으로 만들어 둬요/, Q.work);
    await chooseSingle(page, /여러 AI 도구를 상황에 맞게/, Q.automation);
    await chooseSingle(page, /AI API를 직접 호출해 봤어요/, Q.coding);
    await chooseSingle(page, /개발이 제 일이에요/, Q.domains);

    // 다중 선택: 아무것도 안 고르면 다음으로 못 간다
    const next = page.getByRole("button", { name: "다음", exact: true });
    await expect(next).toBeDisabled();
    await page.getByRole("checkbox", { name: /^코딩/ }).click();
    await page.getByRole("checkbox", { name: /^업무 자동화/ }).click();
    await expect(h1).toHaveText(Q.domains); // 다중 선택은 자동으로 넘어가지 않는다
    await expect(next).toBeEnabled();

    // 뒤로 가도 이전 답이 남아 있다
    await page.getByRole("button", { name: "이전 단계로" }).click();
    await expect(h1).toHaveText(Q.coding);
    await expect(page.getByRole("radio", { name: /개발이 제 일이에요/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(h1).toHaveText(Q.domains);
    await expect(page.getByRole("checkbox", { name: /^코딩/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("checkbox", { name: /^업무 자동화/ })).toHaveAttribute("aria-checked", "true");

    // 최대 3개: 3개를 고르면 나머지는 비활성화
    await page.getByRole("checkbox", { name: /^데이터 분석/ }).click();
    await expect(page.getByText("(3/3)")).toBeVisible();
    const marketing = page.getByRole("checkbox", { name: /^마케팅·콘텐츠/ });
    await expect(marketing).toBeDisabled();
    await marketing.click({ force: true });
    await expect(marketing).toHaveAttribute("aria-checked", "false");
    await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(3);
    await next.click();

    await chooseSingle(page, /^나만의 에이전트 만들기/, Q.language);
    await page.getByRole("radio", { name: /영어 강의도 괜찮아요/ }).click();

    // 로딩 연출 후 결과 화면
    await expect(page.getByText("맞춤 학습 플랜을 만들고 있어요")).toBeVisible();
    await page.waitForURL(/\/result\?/, { timeout: 15_000 });
    const url = new URL(page.url());
    expect(Object.fromEntries(url.searchParams)).toEqual({
      l: "developer",
      d: "coding,automation,data",
      g: "build_agents",
      ko: "0",
    });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("개발자 맞춤 AI 학습 플랜이 준비됐어요");
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(3);
    expect(consoleErrors).toEqual([]);
  });

  test("첫 질문에서 뒤로 가기는 랜딩으로 돌아간다", async ({ page }) => {
    await page.goto("/diagnosis");
    await page.getByRole("link", { name: "이전 단계로" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("결과", () => {
  test("강의 카드마다 강사·추천 사유·얻을 것 3가지·유튜브 새 탭 링크가 있다", async ({ page, consoleErrors }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("맞춤 AI 학습 플랜이 준비됐어요");
    const cards = page.locator("article");
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < n; i++) {
      const card = cards.nth(i);
      // 강사명 (헤더의 굵은 글씨)
      await expect(card.locator("header p").first()).not.toBeEmpty();
      // 추천 사유
      const reasonBox = card.locator("div", { hasText: "이런 분께 추천해요" }).last();
      await expect(reasonBox.locator("p").nth(1)).not.toBeEmpty();
      // 강의 제목
      await expect(card.getByRole("heading", { level: 3 })).not.toBeEmpty();
      // 얻을 수 있는 것 3가지
      const takeaways = card.locator("div", { hasText: "이 강의로 얻을 수 있는 것" }).last().locator("li");
      await expect(takeaways).toHaveCount(3);
      for (let t = 0; t < 3; t++) await expect(takeaways.nth(t)).not.toBeEmpty();
      // 유튜브 링크 (새 탭)
      const link = card.getByRole("link", { name: /유튜브에서 보기/ });
      await expect(link).toHaveAttribute("href", /^https:\/\/www\.youtube\.com\/(watch\?v=|playlist\?list=)[\w-]+$/);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
    // 단계 2~3개
    const steps = page.locator("ol > li");
    expect(await steps.count()).toBeGreaterThanOrEqual(2);
    expect(consoleErrors).toEqual([]);
  });

  for (const [name, query] of [
    ["쿼리 없음", ""],
    ["알 수 없는 수준", "?l=wizard&d=coding&g=use_tools&ko=0"],
    ["분야 4개", "?l=user&d=coding,data,marketing,startup&g=use_tools&ko=1"],
    ["알 수 없는 분야", "?l=user&d=cooking&g=use_tools"],
    ["목표 없음", "?l=user&d=coding"],
    ["ko 값 이상", "?l=user&d=coding&g=use_tools&ko=yes"],
  ] as const) {
    test(`잘못된 결과 링크(${name})는 빈 상태를 보여 준다`, async ({ page, consoleErrors }) => {
      await page.goto(`/result${query}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("아직 진단 결과가 없어요");
      await expect(page.locator("article")).toHaveCount(0);
      await expect(page.getByRole("link", { name: /1분 진단 시작하기/ })).toHaveAttribute("href", "/diagnosis");
      expect(consoleErrors).toEqual([]);
    });
  }
});

test.describe("강사 선정 기준 시트", () => {
  for (const path of ["/", `/result?${RESULT_QUERY}`]) {
    test(`${path === "/" ? "랜딩" : "결과"}: 열리고 Esc·확인 버튼으로 닫힌다`, async ({ page }) => {
      await page.goto(path);
      const trigger = page.getByRole("button", { name: /강사 선정 기준 보기/ });
      const dialog = page.getByRole("dialog", { name: "이런 강사의 강의만 추천해요" });
      await expect(dialog).toBeHidden();

      await trigger.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused(); // 닫히면 트리거로 포커스가 돌아온다

      await trigger.click();
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "확인했어요" }).click();
      await expect(dialog).toBeHidden();
      // 닫힌 뒤 스크롤 잠금이 풀린다
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });
  }
});

test.describe("좁은 화면(320px)", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ["/", "/diagnosis", `/result?${RESULT_QUERY}`, "/result?l=user&d=startup,marketing,education&g=use_tools&ko=1", "/result"]) {
    test(`가로 스크롤이 생기지 않는다: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
        const cw = document.documentElement.clientWidth;
        const bad: string[] = [];
        document.querySelectorAll("body *").forEach((el) => {
          const r = el.getBoundingClientRect();
          // 마키(가로로 흐르는 강사 목록)처럼 overflow로 잘린 부모 안의 요소는 제외
          let p = el.parentElement;
          let clipped = false;
          while (p && p !== document.body) {
            const s = getComputedStyle(p);
            if (s.overflowX === "hidden" || s.overflowX === "clip" || s.overflowX === "auto") {
              clipped = true;
              break;
            }
            p = p.parentElement;
          }
          if (!clipped && r.width > 0 && r.right > cw + 1) {
            bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
          }
        });
        return { scrollWidth: document.documentElement.scrollWidth, clientWidth: cw, offenders: bad.slice(0, 5) };
      });
      expect(offenders, "화면 밖으로 넘친 요소").toEqual([]);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});

test("주요 화면에서 콘솔 에러가 없다", async ({ page, consoleErrors }) => {
  for (const path of ["/", "/diagnosis", `/result?${RESULT_QUERY}`, "/result?l=beginner&d=education&g=understand&ko=1", "/result?bad=1"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
  }
  expect(consoleErrors).toEqual([]);
});
