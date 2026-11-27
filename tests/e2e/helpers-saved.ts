import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** 데이터는 바뀔 수 있으므로 테스트는 실제 JSON에서 id를 고른다 */
const read = <T,>(f: string): T => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", f), "utf8")) as T;
export const SKILLS = read<{ id: string; name: string; lectureIds: string[] }[]>("skills.json");
export const PRACTICE = read<{ videoId: string; title: string }[]>("practice.json");
export const VIDEOS = read<{ id: string; title: string }[]>("videos.json");
export const GLOSSARY = read<{ id: string; term: string; short: string }[]>("glossary.json");

/** 미션이 있고, 그 강의를 쓰는 스킬도 있는 강의 */
export function lectureWithMissionAndSkill() {
  const missionIds = new Set(PRACTICE.map((m) => m.videoId));
  const videoIds = new Set(VIDEOS.map((v) => v.id));
  for (const s of SKILLS) for (const id of s.lectureIds) if (missionIds.has(id) && videoIds.has(id)) return { videoId: id, skill: s };
  throw new Error("미션과 스킬이 함께 있는 강의가 없습니다");
}

export async function expectNoOverflow(page: Page) {
  const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const bad: string[] = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
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
      if (!clipped && r.width > 0 && r.right > cw + 1) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
    });
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: cw, offenders: bad.slice(0, 5) };
  });
  expect(offenders, "화면 밖으로 넘친 요소").toEqual([]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

export async function axeCheck(page: Page, label: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  for (const v of violations) {
    console.log(`[axe ${label}] ${v.impact} ${v.id}: ${v.help}\n    ${v.nodes.slice(0, 5).map((n) => n.target.join(" ")).join("\n    ")}`);
  }
  const severe = violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id);
  expect(severe, `${label}: serious/critical 접근성 위반`).toEqual([]);
}
