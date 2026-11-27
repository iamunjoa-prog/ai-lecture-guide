/**
 * 로드맵 리포트 (E 담당).
 *
 * 여러 페르소나(수준 4 × 목표 4 × 분야 조합 × 한국어 선호)에 대해 buildRoadmap 결과를 출력하고,
 * 태그 품질을 가늠할 수 있는 경고를 모은다.
 *
 *   npm run report               # 전체 페르소나 + 경고 요약
 *   npm run report -- --summary  # 경고 요약과 커버리지 표만
 *   npm run report -- --level developer --goal build_agents --domains coding
 *   npm run report -- --level user --goal understand --domains none   # 분야 미정
 *
 * 경고 종류
 *  - FEW     : 추천이 MIN_TOTAL(3)개 미만
 *  - WEAK    : 분야도 목표도 맞지 않는 강의 (수준만 맞거나 빈칸 채우기로 들어옴)
 *  - OFFGOAL : 목표가 맞지 않는 강의가 "실전 활용"에 들어옴 (정보용)
 */
import instructorsJson from "../data/instructors.json";
import videosJson from "../data/videos.json";
import { buildRoadmap, scoreBreakdown } from "../src/lib/recommend";
import { DOMAINS, GOALS, LEVELS } from "../src/lib/questions";
import type { DiagnosisResult, Domain, Goal, Instructor, Level, Video } from "../src/types";

const videos = videosJson as unknown as Video[];
const instructors = instructorsJson as unknown as Instructor[];

const DOMAIN_SETS: Domain[][] = [
  [], // "잘 모르겠어요" (분야 미정)
  ["coding"],
  ["automation"],
  ["marketing"],
  ["data"],
  ["education"],
  ["startup"],
  ["automation", "marketing", "data"],
  ["coding", "startup"],
  ["education", "data"],
];

// --- 인자 ---------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const summaryOnly = flag("summary");
const onlyLevel = opt("level") as Level | undefined;
const onlyGoal = opt("goal") as Goal | undefined;
const domainsArg = opt("domains"); // "none" 또는 빈 값 = 분야 미정
const onlyDomains = domainsArg === undefined ? undefined : domainsArg === "none" || domainsArg === "" ? [] : (domainsArg.split(",") as Domain[]);
const onlyKo = opt("ko");

const levels = onlyLevel ? [onlyLevel] : [...LEVELS];
const goals = onlyGoal ? [onlyGoal] : [...GOALS];
const domainSets = onlyDomains ? [onlyDomains] : DOMAIN_SETS;
const koValues = onlyKo ? [onlyKo === "true"] : [false, true];

// --- 실행 ---------------------------------------------------------------
interface Warning {
  persona: string;
  kind: "FEW" | "WEAK" | "OFFGOAL";
  detail: string;
}
const warnings: Warning[] = [];
const appearance = new Map<string, number>();
let personaCount = 0;

const short = (s: string, n = 52) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

for (const level of levels) {
  for (const goal of goals) {
    for (const domains of domainSets) {
      for (const preferKorean of koValues) {
        personaCount++;
        const d: DiagnosisResult = { level, goal, domains, preferKorean };
        const persona = `${level}/${goal}/${domains.join("+") || "none"}/${preferKorean ? "ko" : "any"}`;
        const r = buildRoadmap(d, videos, instructors);
        const items = r.steps.flatMap((s) => s.items);
        if (items.length < 3) warnings.push({ persona, kind: "FEW", detail: `${items.length}개` });

        if (!summaryOnly) console.log(`\n■ ${persona}  (${items.length}개)`);
        for (const step of r.steps) {
          for (const it of step.items) {
            appearance.set(it.video.id, (appearance.get(it.video.id) ?? 0) + 1);
            const b = scoreBreakdown(d, it.video);
            const marks = [
              b.levelMatch ? "L" : "-",
              b.matchedDomains.length ? `D${b.matchedDomains.length}` : "--",
              b.goalMatch ? "G" : "-",
              b.koreanMatch ? "K" : "-",
            ].join("");
            if (!b.goalMatch && b.matchedDomains.length === 0) {
              warnings.push({ persona, kind: "WEAK", detail: `[${step.label}] ${short(it.video.title)}` });
            } else if (!b.goalMatch && step.label === "실전 활용") {
              warnings.push({ persona, kind: "OFFGOAL", detail: `[${step.label}] ${short(it.video.title)}` });
            }
            if (!summaryOnly) {
              console.log(
                `  ${step.label.padEnd(6)} ${String(it.score).padStart(2)} ${marks}  ${short(it.video.title)}  — ${it.instructor.nameEn} [${it.video.levels.join(",")}]`,
              );
            }
          }
        }
      }
    }
  }
}

// --- 요약 ---------------------------------------------------------------
const byKind = (k: Warning["kind"]) => warnings.filter((w) => w.kind === k);
console.log("\n==================== 요약 ====================");
console.log(`페르소나 ${personaCount}개 · 강의 ${videos.length}개`);
for (const k of ["FEW", "WEAK", "OFFGOAL"] as const) {
  const ws = byKind(k);
  console.log(`\n[${k}] ${ws.length}건`);
  const limit = k === "OFFGOAL" ? 15 : 40;
  ws.slice(0, limit).forEach((w) => console.log(`  ${w.persona.padEnd(46)} ${w.detail}`));
  if (ws.length > limit) console.log(`  … 외 ${ws.length - limit}건`);
}

if (!onlyLevel && !onlyGoal && !onlyDomains) {
  console.log("\n[노출 횟수] 한 번도 추천되지 않은 강의");
  const never = videos.filter((v) => !appearance.has(v.id));
  if (never.length === 0) console.log("  없음");
  never.forEach((v) => console.log(`  ${v.id}  ${short(v.title)}`));

  console.log("\n[커버리지] level × goal (강의 수)");
  console.log("  " + "".padEnd(13) + GOALS.map((g) => g.padStart(15)).join(""));
  for (const l of LEVELS) {
    const row = GOALS.map((g) =>
      String(videos.filter((v) => v.levels.includes(l) && v.goals.includes(g)).length).padStart(15),
    );
    console.log("  " + l.padEnd(13) + row.join(""));
  }
  console.log(
    "\n[커버리지] 분야별: " +
      DOMAINS.map((d) => `${d} ${videos.filter((v) => v.domains.includes(d)).length}`).join(" · "),
  );
  const koCount = videos.filter((v) => v.language === "ko" || v.hasKoreanSubtitle).length;
  console.log(`[커버리지] 한국어 친화 강의 ${koCount}개`);
}

if (flag("strict") && byKind("FEW").length > 0) process.exit(1);
