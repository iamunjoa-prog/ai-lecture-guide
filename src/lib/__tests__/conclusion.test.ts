import { describe, expect, it } from "vitest";
import { buildConclusion, CONCLUSION_NEXT, CONCLUSION_NOW } from "../conclusion";
import { GOALS, LEVELS } from "../questions";

const emoji = /\p{Extended_Pictographic}/u;
const HYPE = /완벽|최고|무조건|단숨에|혁신|마스터|!/;

describe("buildConclusion", () => {
  for (const level of LEVELS) {
    for (const goal of GOALS) {
      it(`${level} × ${goal}: 지금 할 수 있는 것 + 다음 한 걸음, 짧고 과장 없이`, () => {
        const c = buildConclusion({ level, goals: [goal] });
        expect(c.now).toBe(CONCLUSION_NOW[level]);
        expect(c.next).toBe(CONCLUSION_NEXT[level][goal]);
        expect(c.next.startsWith("다음 단계는 ")).toBe(true);
        expect(c.next.endsWith("거예요.")).toBe(true);
        for (const line of [c.now, c.next]) {
          expect([...line].length).toBeLessThanOrEqual(60);
          expect(emoji.test(line)).toBe(false);
          expect(HYPE.test(line), line).toBe(false);
        }
      });
    }
  }

  it("다음 한 걸음은 수준·목표마다 모두 다르다", () => {
    const all = LEVELS.flatMap((l) => GOALS.map((g) => CONCLUSION_NEXT[l][g]));
    expect(new Set(all).size).toBe(all.length);
  });

  it("목표 여러 개면 1순위 목표 기준", () => {
    expect(buildConclusion({ level: "practitioner", goals: ["use_tools", "build_agents"] }).next).toBe(
      "다음 단계는 자주 하는 일을 AI에게 맡기는 흐름을 만들어 보는 거예요.",
    );
    expect(buildConclusion({ level: "practitioner", goals: ["build_agents", "use_tools"] }).next).toBe(
      CONCLUSION_NEXT.practitioner.build_agents,
    );
  });

  it("목표가 비어 있으면 개념 이해로", () => {
    expect(buildConclusion({ level: "user", goals: [] }).next).toBe(CONCLUSION_NEXT.user.understand);
  });
});
