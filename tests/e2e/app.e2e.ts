import { chooseSingle, expect, LEVEL_TITLES, RESULT_QUERY, test } from "./fixtures";

const Q = {
  ...LEVEL_TITLES,
  domains: "어떤 분야에 AI를 쓰고 싶으세요?",
  goal: "AI로 이루고 싶은 목표는 무엇인가요?",
  language: "한국어로 들을 수 있는 강의가 좋으세요?",
};

test.describe("랜딩", () => {
  test("첫 화면이 보이고 CTA를 누르면 진단으로 간다", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AI 강의 길잡이/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("직접 배우세요.");
    await expect(page.locator("dl")).toContainText(/검증된 강사\s*\d+명/);
    await expect(page.locator("dl")).toContainText(/선별한 유튜브 강의\s*\d+개/);

    const cta = page.getByRole("link", { name: /\d분 진단 시작하기/ });
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
    await chooseSingle(page, /^거의 매일 써요/, Q.prompt);
    await chooseSingle(page, /^잘 되는 요청을 저장해/, Q.work);
    await chooseSingle(page, /^일에 맞게 여러 AI 도구를 골라 써요/, Q.connect);
    await chooseSingle(page, /^AI API를 코드로 직접/, Q.coding);
    await chooseSingle(page, /^개발이 직업이에요/, Q.aiCoding);
    await chooseSingle(page, /^AI 코딩 도구로 작업해 봤어요/, Q.domains);

    // 다중 선택: 아무것도 안 고르면 다음으로 못 간다
    const next = page.getByRole("button", { name: "다음", exact: true });
    await expect(next).toBeDisabled();
    await page.getByRole("checkbox", { name: /^코딩/ }).click();
    await page.getByRole("checkbox", { name: /^업무 자동화/ }).click();
    await expect(h1).toHaveText(Q.domains); // 다중 선택은 자동으로 넘어가지 않는다
    await expect(next).toBeEnabled();

    // 뒤로 가도 이전 답이 남아 있다
    await page.getByRole("button", { name: "이전 단계로" }).click();
    await expect(h1).toHaveText(Q.aiCoding);
    await expect(page.getByRole("radio", { name: /^AI 코딩 도구로 작업해 봤어요/ })).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(h1).toHaveText(Q.domains);
    await expect(page.getByRole("checkbox", { name: /^코딩/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("checkbox", { name: /^업무 자동화/ })).toHaveAttribute("aria-checked", "true");

    // 최대 3개: 3개를 고르면 나머지는 비활성화
    await page.getByRole("checkbox", { name: /^데이터 분석/ }).click();
    await expect(page.getByText("(3/3)")).toBeVisible();
    const marketing = page.getByRole("checkbox", { name: /^마케팅·콘텐츠/ });
    // 네이티브 disabled가 아니라 aria-disabled: 눌러도 선택되지 않고, 안내 문구가 잠깐 강조된다
    await expect(marketing).toHaveAttribute("aria-disabled", "true");
    await expect(marketing).not.toHaveAttribute("disabled", /.*/); // 네이티브 disabled 아님
    const helper = page.getByText(/3개를 모두 골랐어요/);
    await expect(helper).toBeVisible();
    await expect(helper).not.toHaveClass(/bg-accent-soft/);
    await marketing.click({ force: true }); // Playwright는 aria-disabled를 "눌 수 없음"으로 보므로 force
    await expect(marketing).toHaveAttribute("aria-checked", "false");
    await expect(helper).toHaveClass(/bg-accent-soft/);
    await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(3);
    await next.click();

    // 목표: 여러 개, 고른 순서 = 우선순위
    await expect(h1).toHaveText(Q.goal);
    await page.getByRole("checkbox", { name: /^나만의 에이전트 만들기/ }).click();
    await page.getByRole("checkbox", { name: /^업무 도구로 쓰기/ }).click();
    await expect(h1).toHaveText(Q.goal); // 다중 선택은 자동으로 넘어가지 않는다
    await expect(page.getByRole("checkbox", { name: /^나만의 에이전트 만들기.*1순위/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("checkbox", { name: /^업무 도구로 쓰기.*2순위/ })).toHaveAttribute("aria-checked", "true");
    await next.click();
    await expect(h1).toHaveText(Q.language);
    await page.getByRole("radio", { name: /영어 강의도 괜찮아요/ }).click();

    // 로딩 연출(약 1.2초) 후 결과 화면
    await page.waitForURL(/\/result\?/, { timeout: 10_000 });
    const url = new URL(page.url());
    expect(Object.fromEntries(url.searchParams)).toEqual({
      l: "developer",
      d: "coding,automation,data",
      g: "build_agents,use_tools",
      ko: "0",
    });
    await expect(page.getByRole("heading", { level: 1 })).toContainText("개발자 맞춤 학습 로드맵");
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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("맞춤 학습 로드맵");
    const cards = page.locator("article");
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < n; i++) {
      const card = cards.nth(i);
      // 강사 정보가 카드 맨 위(헤더)에 있다
      await expect(card.locator("header p").first()).not.toBeEmpty();
      // 추천 사유: 단계 첫 카드는 "추천 이유" 박스, 나머지는 첫 문장만 (아래 별도 테스트)
      await expect(card.locator("p").filter({ hasText: /강의예요\./ }).first()).not.toBeEmpty();
      // 강의 제목
      await expect(card.getByRole("heading", { level: 3 })).not.toBeEmpty();
      // 얻을 수 있는 것 3가지 (자세히 보기 안에 있다)
      const more = card.locator("button[aria-expanded]");
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await more.click();
      await expect(more).toHaveAttribute("aria-expanded", "true");
      const list = card.locator("div", { hasText: "이 강의로 얻을 수 있는 것" }).last().locator("ul").first().locator("li");
      await expect(list).toHaveCount(3);
      for (let t = 0; t < 3; t++) await expect(list.nth(t)).not.toBeEmpty();
      // 유튜브 링크 (새 탭)
      const link = card.getByRole("link", { name: /유튜브에서 보기/ });
      await expect(link).toHaveAttribute("href", /^https:\/\/www\.youtube\.com\/(watch\?v=|playlist\?list=)[\w-]+$/);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
    // 단계 2~3개
    const steps = page.getByTestId("roadmap-step");
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
      await expect(page.getByRole("link", { name: /\d분 진단 시작하기/ })).toHaveAttribute("href", "/diagnosis");
      expect(consoleErrors).toEqual([]);
    });
  }
});

test.describe("강사 선정 기준 시트", () => {
  for (const path of ["/", `/result?${RESULT_QUERY}`]) {
    test(`${path === "/" ? "랜딩" : "결과"}: 열리고 Esc·확인 버튼으로 닫힌다`, async ({ page }) => {
      await page.goto(path);
      const trigger = page.getByRole("button", { name: /강사 선정 기준 보기/ });
      const dialog = page.getByRole("dialog", { name: "이런 강사의 유튜브 강의만 선별합니다" });
      await expect(dialog).toBeHidden();

      await trigger.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused(); // 닫히면 트리거로 포커스가 돌아온다

      await trigger.click();
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "확인", exact: true }).click();
      await expect(dialog).toBeHidden();
      // 닫힌 뒤 스크롤 잠금이 풀린다
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    });
  }
});

test.describe("좁은 화면(320px)", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ["/", "/diagnosis", "/glossary", "/theory#transformer-and-attention", "/glossary?tab=theory", "/practice", `/result?${RESULT_QUERY}`, "/result?l=user&d=startup,marketing,education&g=use_tools&ko=1", "/result"]) {
    test(`가로 스크롤이 생기지 않는다: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
        const cw = document.documentElement.clientWidth;
        const bad: string[] = [];
        document.querySelectorAll("body *").forEach((el) => {
          const r = el.getBoundingClientRect();
          // overflow로 잘린 부모 안의 요소는 제외
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

test.describe("결과: 용어와 간결한 카드", () => {
  test("시작 전 용어는 처음 4개만 보이고 '더 보기'로 나머지를 펼친다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}#prep`);
    await expect(page.getByRole("heading", { level: 2, name: "시작 전에 알아두면 좋은 용어" })).toBeVisible();
    const rows = page.getByTestId("starter-terms").locator("details");
    await expect(rows).toHaveCount(4);
    const more = page.getByRole("button", { name: /^용어 \d+개 더 보기$/ });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    const hidden = Number((await more.innerText()).match(/\d+/)![0]);
    await more.focus();
    await page.keyboard.press("Enter");
    await expect(rows).toHaveCount(4 + hidden);
    expect(4 + hidden).toBeLessThanOrEqual(8);
    const less = page.getByRole("button", { name: "용어 접기" });
    await expect(less).toHaveAttribute("aria-expanded", "true");
    await less.click();
    await expect(rows).toHaveCount(4);

    const first = rows.first();
    await expect(first).not.toHaveAttribute("open", "");
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
    await expect(first.getByText("예시", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /용어 전체 보기/ })).toHaveAttribute("href", /^\/glossary/);
  });

  test("강의 탭은 단계 제목(작게)과 카드만: 큰 숫자·로드맵 머리·준비 안내 한 줄이 없고, 시작 강의를 안내한다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    await expect(page.getByRole("heading", { level: 2, name: /^1단계 · / })).toBeVisible();
    await expect(page.getByRole("heading", { name: "추천 로드맵" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "추천 강의 바로 보기" })).toHaveCount(0);
    await expect(page.getByTestId("prep-hint")).toHaveCount(0);
    await expect(page.getByText("1단계부터 순서대로 보세요")).toHaveCount(0);
    await expect(page.getByTestId("result-panel-lectures").getByTestId("weekly-mission")).toHaveCount(0);
    await expect(page.getByText("여기서 먼저 시작하세요")).toHaveCount(1);
  });

  test("강의 카드에 언어와 한국어 자막 여부가 쉬운 말로 표시된다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const info = page.locator("article ul[aria-label='강의 정보']");
    const texts = await info.allInnerTexts();
    expect(texts.length).toBeGreaterThan(0);
    for (const t of texts) {
      expect(t).toMatch(/(한국어|영어) 강의/);
      if (t.includes("영어 강의")) expect(t).toMatch(/한국어 자막 (있음|없음)/);
    }
  });

  test("단계의 첫 카드만 추천 이유 박스를 보여 준다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const steps = page.getByTestId("roadmap-step");
    const stepCount = await steps.count();
    for (let i = 0; i < stepCount; i++) {
      const cards = steps.nth(i).locator("article");
      await expect(cards.first().getByText("추천 이유", { exact: true })).toBeVisible();
      const c = await cards.count();
      for (let k = 1; k < c; k++) await expect(cards.nth(k).getByText("추천 이유", { exact: true })).toHaveCount(0);
    }
  });

  test("자세히 보기가 얻을 것을 펼치고, 핵심 용어 태그가 설명을 토글한다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const card = page.locator("article").first();
    const more = card.getByRole("button", { name: "자세히 보기" });
    await expect(card.getByText("이 강의로 얻을 수 있는 것")).toBeHidden();
    await more.focus();
    await page.keyboard.press("Enter");
    await expect(card.getByText("이 강의로 얻을 수 있는 것")).toBeVisible();
    await expect(card.getByRole("button", { name: "접기" })).toHaveAttribute("aria-expanded", "true");

    const tag = card.getByTestId("card-terms").locator("button[aria-pressed]").first();
    await expect(tag).toBeVisible();
    await tag.click();
    await expect(tag).toHaveAttribute("aria-pressed", "true");
    const link = card.getByRole("link", { name: /자세히 보기/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^\/glossary#[\w-]+$/);
    await tag.click();
    await expect(link).toBeHidden();
  });
});

test.describe("용어집", () => {
  test("수준별 4개 구역과 빠른 이동이 있다", async ({ page, consoleErrors }) => {
    await page.goto("/glossary");
    await expect(page).toHaveTitle(/용어집/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("용어집");
    for (const t of ["입문 용어", "활용 용어", "실무 용어", "개발 용어"]) {
      await expect(page.getByRole("heading", { level: 2, name: t })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "수준별 바로가기" }).getByRole("link")).toHaveCount(4);
    expect(await page.locator("main details").count()).toBeGreaterThanOrEqual(40);
    expect(consoleErrors).toEqual([]);
  });

  test("해시 딥링크가 해당 용어를 펼친다 (로드·hashchange)", async ({ page }) => {
    await page.goto("/glossary#llm");
    await expect(page.locator("details#llm")).toHaveAttribute("open", "");
    await page.evaluate(() => (window.location.hash = "#hallucination"));
    await expect(page.locator("details#hallucination")).toHaveAttribute("open", "");
  });

  test("결과 카드의 용어 링크로 용어집에 닿으면 펼쳐진다", async ({ page }) => {
    await page.goto(`/result?${RESULT_QUERY}`);
    const card = page.locator("article").first();
    await card.getByRole("button", { name: "자세히 보기" }).click();
    await card.getByTestId("card-terms").locator("button[aria-pressed]").first().click();
    await card.getByRole("link", { name: /자세히 보기/ }).click();
    await expect(page).toHaveURL(/\/glossary#[\w-]+$/);
    const id = new URL(page.url()).hash.slice(1);
    await expect(page.locator(`details#${id}`)).toHaveAttribute("open", "");
  });
});
