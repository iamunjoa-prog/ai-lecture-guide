/**
 * 로드맵 리포트 (E 담당).
 *
 * 여러 페르소나(수준 4 × 목표 조합(단일 4 + 다중 6) × 분야 조합 × 한국어 선호 × 공부 방법)에 대해 buildRoadmap 결과를 출력하고,
 * 태그 품질을 가늠할 수 있는 경고를 모은다.
 *
 *   npm run report               # 전체 페르소나 + 경고 요약
 *   npm run report -- --summary  # 경고 요약과 커버리지 표만
 *   npm run report -- --level developer --goal build_agents --domains coding
 *   npm run report -- --level user --goal use_tools,build_agents --domains marketing   # 다중 목표(우선순위 순)
 *   npm run report -- --level user --goal understand --domains none   # 분야 미정
 *   npm run report -- --style practice   # 공부 방법 하나만 (기본: all · practice · theory — 추천이 달라지는 세 가지)
 *
 * 경고 종류
 *  - FEW     : 추천이 MIN_TOTAL(3)개 미만
 *  - WEAK    : 분야도 목표도 맞지 않는 강의 (수준만 맞거나 빈칸 채우기로 들어옴)
 *  - OFFGOAL : 고른 목표 어느 것과도 맞지 않는 강의가 "실전 활용"에 들어옴 (정보용)
 *  - MISSGOAL: 고른 목표에 맞는 현재 수준 강의가 있는데 "실전 활용"에 그 목표 강의가 하나도 없음
 *  - NOBASE  : 다중 목표인데 "기초 다지기"에 고른 목표와 맞는 강의가 하나도 없음 (정보용)
 */
import instructorsJson from "../data/instructors.json";
import videosJson from "../data/videos.json";
import practiceJson from "../data/practice.json";
import { buildRoadmap, scoreBreakdown, STEP_LABELS } from "../src/lib/recommend";
import { DOMAINS, GOALS, LEVELS } from "../src/lib/questions";
import type { DiagnosisResult, Domain, Goal, Instructor, Level, StudyStyle, Video } from "../src/types";

const videos = videosJson as unknown as Video[];
const instructors = instructorsJson as unknown as Instructor[];
const easyPracticeIds = new Set(
  (practiceJson as { videoId: string; needsTool?: string }[]).filter((m) => !m.needsTool || m.needsTool === "chat").map((m) => m.videoId),
);

/** 목표 조합 (앞쪽이 우선순위) */
const GOAL_SETS: Goal[][] = [
  ...GOALS.map((g) => [g]),
  ["use_tools", "build_agents"],
  ["build_agents", "use_tools"],
  ["understand", "use_tools"],
  ["build_products", "build_agents"],
  ["use_tools", "build_agents", "build_products"],
  ["understand", "use_tools", "build_agents", "build_products"],
];

const DOMAIN_SETS: Domain[][] = [
  [], // "잘 모르겠어요" (분야 미정)
  ["coding"],
  ["automation"],
  ["marketing"],
  ["data"],
  ["education"],
  ["startup"],
  ["creative"],
  ["automation", "marketing", "data"],
  ["marketing", "creative"],
  ["creative", "education", "startup"],
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
const goalArg = opt("goal");
const onlyGoals = goalArg ? (goalArg.split(",") as Goal[]) : undefined;
const domainsArg = opt("domains"); // "none" 또는 빈 값 = 분야 미정
const onlyDomains = domainsArg === undefined ? undefined : domainsArg === "none" || domainsArg === "" ? [] : (domainsArg.split(",") as Domain[]);
const onlyKo = opt("ko");
const styleArg = opt("style") as StudyStyle | undefined;
// lectures는 all과, practice_theory는 practice와 추천이 같아서 기본으로는 세 가지만 돈다
const styles: StudyStyle[] = styleArg ? [styleArg] : ["all", "practice", "theory"];

const levels = onlyLevel ? [onlyLevel] : [...LEVELS];
const goalSets = onlyGoals ? [onlyGoals] : GOAL_SETS;
const domainSets = onlyDomains ? [onlyDomains] : DOMAIN_SETS;
const koValues = onlyKo ? [onlyKo === "true"] : [false, true];

// --- 실행 ---------------------------------------------------------------
interface Warning {
  persona: string;
  kind: "FEW" | "WEAK" | "OFFGOAL" | "MISSGOAL" | "NOBASE";
  detail: string;
}
const warnings: Warning[] = [];
const appearance = new Map<string, number>();
let personaCount = 0;

const short = (s: string, n = 52) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

for (const level of levels) {
  for (const goals of goalSets) {
    for (const domains of domainSets) {
      for (const preferKorean of koValues) for (const studyStyle of styles) {
        personaCount++;
        const d: DiagnosisResult = { level, goals, domains, preferKorean, studyStyle };
        const persona = `${level}/${goals.join(">")}/${domains.join("+") || "none"}/${preferKorean ? "ko" : "any"}/${studyStyle}`;
        const r = buildRoadmap(d, videos, instructors, { easyPracticeIds });
        const items = r.steps.flatMap((s) => s.items);
        if (items.length < 3) warnings.push({ persona, kind: "FEW", detail: `${items.length}개` });
        const practice = r.steps.find((s) => s.label === STEP_LABELS.practice)?.items ?? [];
        const practiceLevel = level === "beginner" ? "user" : level;
        for (const g of goals) {
          const available = videos.some((v) => v.levels.includes(practiceLevel) && v.goals.includes(g));
          if (available && !practice.some((it) => it.video.goals.includes(g))) {
            warnings.push({ persona, kind: "MISSGOAL", detail: g });
          }
        }
        if (goals.length > 1) {
          const base = r.steps.find((s) => s.label === STEP_LABELS.foundation)?.items ?? [];
          if (base.length > 0 && !base.some((it) => goals.some((g) => it.video.goals.includes(g)))) {
            warnings.push({ persona, kind: "NOBASE", detail: `${base.length}개` });
          }
        }

        if (!summaryOnly) console.log(`\n■ ${persona}  (${items.length}개)`);
        for (const step of r.steps) {
          for (const it of step.items) {
            appearance.set(it.video.id, (appearance.get(it.video.id) ?? 0) + 1);
            const b = scoreBreakdown(d, it.video);
            const marks = [
              b.levelMatch ? "L" : "-",
              b.matchedDomains.length ? `D${b.matchedDomains.length}` : "--",
              b.matchedGoals.length ? `G${b.matchedGoals.length}` : "--",
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
for (const k of ["FEW", "WEAK", "MISSGOAL", "NOBASE", "OFFGOAL"] as const) {
  const ws = byKind(k);
  console.log(`\n[${k}] ${ws.length}건`);
  const limit = k === "OFFGOAL" || k === "NOBASE" ? 15 : 40;
  ws.slice(0, limit).forEach((w) => console.log(`  ${w.persona.padEnd(46)} ${w.detail}`));
  if (ws.length > limit) console.log(`  … 외 ${ws.length - limit}건`);
}

if (!onlyLevel && !onlyGoals && !onlyDomains) {
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

if (flag("strict") && (byKind("FEW").length > 0 || byKind("MISSGOAL").length > 0)) process.exit(1);
