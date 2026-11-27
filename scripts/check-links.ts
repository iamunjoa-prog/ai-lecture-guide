/**
 * 데이터 점검 스크립트 (E 담당) — `npm run check-links`
 *
 * 1) 스키마 점검: enum 값, instructorId 참조, takeaways 3개, id 중복, URL ↔ id 일치 등
 *    + 용어집(data/glossary.json): id 중복·형식, 필수 필드, related 참조, 강의 terms 참조
 *    + 3분 이론(data/theory.json): id 중복·형식, 수준별 core 1개, 필수 필드·길이, termIds 참조, 출처 형식
 *      (출처 URL은 형식만 본다. 네트워크 점검 대상이 아니다)
 *    + 실습 미션(data/practice.json): 강의와 1:1, 길이·개수, 자리표시자 최대 1개, domainVariants 키, needsTool 값
 *    + 주목받는 AI 스킬(data/skills.json): id 중복·형식, 수준(입문자 제외)·목표 enum, 글자 수,
 *      lectureIds/termIds/theoryIds 참조, 출처 2개 이상·https·checked 값 (최소 점검, 자세한 건 vitest)
 * 2) 링크 점검: 모든 강의 URL을 YouTube oEmbed로 호출해
 *    - 200 응답인지
 *    - 업로드 채널(author_url)이 강사의 channelUrl과 같은지,
 *      아니면 아래 THIRD_PARTY_CHANNELS(허용된 기관·행사 채널)에 있는지 확인한다.
 *
 * 옵션
 *   --schema-only   네트워크 호출 없이 스키마만 점검
 *   --concurrency N 동시 요청 수 (기본 4)
 *
 * 실패가 하나라도 있으면 표를 출력하고 exit 1.
 */
import { spawnSync } from "node:child_process";
import instructorsJson from "../data/instructors.json";
import videosJson from "../data/videos.json";
import glossaryJson from "../data/glossary.json";
import theoryJson from "../data/theory.json";
import practiceJson from "../data/practice.json";
import skillsJson from "../data/skills.json";
import type { TrendingSkill } from "../src/lib/skills";
import type { CredentialType, Domain, Goal, GlossaryTerm, Instructor, Language, Level, TheoryConcept, Video } from "../src/types";

// Node 내장 fetch는 HTTPS_PROXY를 기본으로 따르지 않는다. 프록시 환경이면
// NODE_USE_ENV_PROXY=1을 켜고 자기 자신을 다시 실행한다 (Node 22.21+ / 24+).
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --disable-warning=UNDICI-EHPA`.trim() },
  });
  process.exit(r.status ?? 1);
}

const videos = videosJson as unknown as Video[];
const instructors = instructorsJson as unknown as Instructor[];
const glossary = glossaryJson as unknown as GlossaryTerm[];
const theory = theoryJson as unknown as TheoryConcept[];
const skills = skillsJson as unknown as TrendingSkill[];

// ---------------------------------------------------------------------------
// 허용된 제3자 업로드 채널 (data/CURATION.md "강사별 선정 근거" 기준)
// 강사 본인 채널(channelUrl) 외에 이 채널에 올라온 강의도 통과시킨다.
// 값은 소문자 핸들(@ 포함) 또는 /channel/UC... 형태.
// ---------------------------------------------------------------------------
const THIRD_PARTY_CHANNELS: Record<string, { channel: string; note: string }[]> = {
  anthropic: [{ channel: "@claude", note: "Claude 제품 채널 (anthropic에 통합, 2026-11-27 PM 결정)" }],
  "andrew-ng": [{ channel: "@stanfordonline", note: "Stanford Online — 본인 강연" }],
  "sung-kim": [
    { channel: "@jccei", note: "제주창조경제혁신센터 — 본인 강연" },
    { channel: "@naver_connect", note: "네이버 커넥트재단 — 본인 강연" },
  ],
  microsoft: [{ channel: "@msftmechanics", note: "Microsoft Mechanics — Microsoft 공식 제품 시연 채널" }],
};

// ---------------------------------------------------------------------------
// enum 목록 (src/types.ts와 같아야 함)
// ---------------------------------------------------------------------------
const LEVELS: Level[] = ["beginner", "user", "practitioner", "developer"];
const DOMAINS: Domain[] = ["automation", "marketing", "coding", "data", "education", "startup"];
const GOALS: Goal[] = ["understand", "use_tools", "build_agents", "build_products"];
const LANGUAGES: Language[] = ["ko", "en"];
const CREDENTIALS: CredentialType[] = ["founder", "core_researcher", "professor", "official_channel"];

// ---------------------------------------------------------------------------
// 인자
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const schemaOnly = argv.includes("--schema-only");
const ci = argv.indexOf("--concurrency");
const CONCURRENCY = ci >= 0 ? Math.max(1, Number(argv[ci + 1]) || 4) : 4;
const TIMEOUT_MS = 10_000;
const RETRIES = 1;

// ---------------------------------------------------------------------------
// 1) 스키마 점검
// ---------------------------------------------------------------------------
interface Problem {
  where: string;
  problem: string;
}
const schemaProblems: Problem[] = [];
const bad = (where: string, problem: string) => schemaProblems.push({ where, problem });
const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

function checkEnumList<T extends string>(where: string, field: string, value: unknown, allowed: T[]) {
  if (!Array.isArray(value) || value.length === 0) return bad(where, `${field}: 비어 있거나 배열이 아님`);
  const seen = new Set<string>();
  for (const v of value) {
    if (!allowed.includes(v as T)) bad(where, `${field}: 알 수 없는 값 "${v}"`);
    if (seen.has(v)) bad(where, `${field}: 중복 값 "${v}"`);
    seen.add(v);
  }
}

// 강사
const instructorIds = new Set<string>();
for (const ins of instructors) {
  const where = `instructor:${ins.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ins.id ?? "")) bad(where, "id가 kebab-case가 아님");
  if (instructorIds.has(ins.id)) bad(where, "id 중복");
  instructorIds.add(ins.id);
  for (const f of ["name", "nameEn", "title", "credentialNote", "channelUrl"] as const) {
    if (!isNonEmptyString(ins[f])) bad(where, `${f} 누락`);
  }
  checkEnumList(where, "credentials", ins.credentials, CREDENTIALS);
  if (ins.channelUrl && !/^https:\/\/www\.youtube\.com\/(@[^/]+|channel\/UC[\w-]+)$/.test(ins.channelUrl)) {
    bad(where, `channelUrl 형식이 이상함: ${ins.channelUrl}`);
  }
}
for (const id of Object.keys(THIRD_PARTY_CHANNELS)) {
  if (!instructorIds.has(id)) bad(`allowlist:${id}`, "THIRD_PARTY_CHANNELS에 없는 강사 id");
}

// 강의
const videoIds = new Set<string>();
for (const v of videos) {
  const where = `video:${v.id}`;
  if (!isNonEmptyString(v.id)) bad(where, "id 누락");
  if (videoIds.has(v.id)) bad(where, "id 중복");
  videoIds.add(v.id);

  if (v.kind === "video") {
    if (!/^[\w-]{11}$/.test(v.id)) bad(where, "영상 id가 11자가 아님");
    if (v.url !== `https://www.youtube.com/watch?v=${v.id}`) bad(where, `url이 id와 다름: ${v.url}`);
  } else if (v.kind === "playlist") {
    if (!/^PL[\w-]+$/.test(v.id)) bad(where, "재생목록 id가 PL로 시작하지 않음");
    if (v.url !== `https://www.youtube.com/playlist?list=${v.id}`) bad(where, `url이 id와 다름: ${v.url}`);
  } else {
    bad(where, `kind가 이상함: ${String(v.kind)}`);
  }

  if (!isNonEmptyString(v.title)) bad(where, "title 누락");
  if (!isNonEmptyString(v.summary)) bad(where, "summary 누락");
  if (!instructorIds.has(v.instructorId)) bad(where, `instructorId "${v.instructorId}"인 강사가 없음`);
  if (!LANGUAGES.includes(v.language)) bad(where, `language가 이상함: ${v.language}`);
  if (typeof v.hasKoreanSubtitle !== "boolean") bad(where, "hasKoreanSubtitle가 boolean이 아님");
  if (v.language === "ko" && !v.hasKoreanSubtitle) bad(where, "한국어 강의인데 hasKoreanSubtitle=false");
  if (!Number.isInteger(v.durationMin) || v.durationMin <= 0) bad(where, `durationMin이 양의 정수가 아님: ${v.durationMin}`);

  checkEnumList(where, "levels", v.levels, LEVELS);
  checkEnumList(where, "domains", v.domains, DOMAINS);
  checkEnumList(where, "goals", v.goals, GOALS);
  if (Array.isArray(v.levels) && v.levels.length > 0) {
    const idx = v.levels.map((l) => LEVELS.indexOf(l)).sort((a, b) => a - b);
    if (idx.some((n, i) => i > 0 && n !== idx[i - 1] + 1)) bad(where, `levels가 연속이 아님: ${v.levels.join(",")}`);
  }

  if (!Array.isArray(v.takeaways) || v.takeaways.length !== 3) bad(where, "takeaways가 정확히 3개가 아님");
  else if (!v.takeaways.every(isNonEmptyString)) bad(where, "빈 takeaway가 있음");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.verifiedAt ?? "") || Number.isNaN(Date.parse(v.verifiedAt))) {
    bad(where, `verifiedAt이 YYYY-MM-DD가 아님: ${v.verifiedAt}`);
  }
}

// 용어집
const termIds = new Set<string>();
for (const t of glossary) {
  const where = `term:${t.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id ?? "")) bad(where, "id가 kebab-case가 아님");
  if (termIds.has(t.id)) bad(where, "id 중복");
  termIds.add(t.id);
  for (const f of ["term", "short", "detail"] as const) {
    if (!isNonEmptyString(t[f])) bad(where, `${f} 누락`);
  }
  if (!LEVELS.includes(t.level)) bad(where, `level이 이상함: ${t.level}`);
  checkEnumList(where, "goals", t.goals, GOALS);
}
for (const t of glossary) {
  for (const r of t.related ?? []) {
    if (r === t.id) bad(`term:${t.id}`, "related에 자기 자신이 있음");
    else if (!termIds.has(r)) bad(`term:${t.id}`, `related "${r}"인 용어가 없음`);
  }
}
for (const v of videos) {
  if (v.terms === undefined) continue;
  const where = `video:${v.id}`;
  if (!Array.isArray(v.terms)) {
    bad(where, "terms가 배열이 아님");
    continue;
  }
  if (v.terms.length < 2 || v.terms.length > 3) bad(where, `terms는 2~3개여야 함 (현재 ${v.terms.length}개)`);
  if (new Set(v.terms).size !== v.terms.length) bad(where, "terms에 중복 값이 있음");
  for (const id of v.terms) if (!termIds.has(id)) bad(where, `terms "${id}"인 용어가 없음`);
}

// 3분 이론 (출처 URL은 형식만 점검, 네트워크 호출 없음)
const theoryIds = new Set<string>();
for (const c of theory) {
  const where = `theory:${c.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id ?? "")) bad(where, "id가 kebab-case가 아님");
  if (theoryIds.has(c.id)) bad(where, "id 중복");
  theoryIds.add(c.id);
  if (!LEVELS.includes(c.level)) bad(where, `level이 이상함: ${c.level}`);
  if (typeof c.core !== "boolean") bad(where, "core가 boolean이 아님");
  checkEnumList(where, "goals", c.goals, GOALS);
  for (const f of ["title", "summary", "analogy"] as const) {
    if (!isNonEmptyString(c[f])) bad(where, `${f} 누락`);
  }
  if (isNonEmptyString(c.summary) && [...c.summary].length > 50) bad(where, `summary가 50자 초과 (${[...c.summary].length}자)`);
  if (c.tryIt !== undefined && !isNonEmptyString(c.tryIt)) bad(where, "tryIt이 빈 문자열");
  if (!Array.isArray(c.body) || c.body.length < 3 || c.body.length > 4) bad(where, "body는 3~4문단이어야 함");
  else if (!c.body.every(isNonEmptyString)) bad(where, "빈 body 문단이 있음");
  if (!Array.isArray(c.termIds) || c.termIds.length < 2 || c.termIds.length > 3) bad(where, "termIds는 2~3개여야 함");
  else {
    if (new Set(c.termIds).size !== c.termIds.length) bad(where, "termIds에 중복 값이 있음");
    for (const id of c.termIds) if (!termIds.has(id)) bad(where, `termIds "${id}"인 용어가 없음`);
  }
  if (!Array.isArray(c.sources) || c.sources.length < 2) bad(where, "sources가 2개 미만");
  else {
    const urls = new Set<string>();
    for (const src of c.sources) {
      if (!isNonEmptyString(src.title) || !isNonEmptyString(src.publisher)) bad(where, "출처 title/publisher 누락");
      let ok = false;
      try {
        const u = new URL(src.url);
        ok = u.protocol === "https:" && u.hostname.includes(".") && !u.username && !u.password;
      } catch {
        ok = false;
      }
      if (!ok) bad(where, `출처 URL이 https 형식이 아님: ${src.url}`);
      if (urls.has(src.url)) bad(where, `출처 URL 중복: ${src.url}`);
      urls.add(src.url);
    }
  }
}
for (const l of LEVELS) {
  const cores = theory.filter((c) => c.level === l && c.core).length;
  if (cores !== 1) bad(`theory-level:${l}`, `core 개념이 ${cores}개 (정확히 1개여야 함)`);
  if (theory.filter((c) => c.level === l).length < 3) bad(`theory-level:${l}`, "개념이 3개 미만");
}

// 주목받는 AI 스킬 (최소 스키마 점검, 출처 URL은 형식만)
const skillIds = new Set<string>();
const SKILL_LEVELS: Level[] = ["user", "practitioner", "developer"];
const chars = (s: unknown) => (typeof s === "string" ? [...s].length : 0);
for (const s of skills) {
  const where = `skill:${s.id}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id ?? "")) bad(where, "id가 kebab-case가 아님");
  if (skillIds.has(s.id)) bad(where, "id 중복");
  skillIds.add(s.id);
  for (const f of ["name", "tagline", "whyNow", "asOf"] as const) {
    if (!isNonEmptyString(s[f])) bad(where, `${f} 누락`);
  }
  if (chars(s.name) > 20) bad(where, `name이 20자 초과 (${chars(s.name)}자)`);
  if (chars(s.tagline) > 45) bad(where, `tagline이 45자 초과 (${chars(s.tagline)}자)`);
  checkEnumList(where, "levels", s.levels, SKILL_LEVELS);
  checkEnumList(where, "goals", s.goals, GOALS);
  if (s.domains !== undefined) checkEnumList(where, "domains", s.domains, DOMAINS);
  if (!Array.isArray(s.whatYouCanDo) || s.whatYouCanDo.length !== 3 || !s.whatYouCanDo.every(isNonEmptyString)) {
    bad(where, "whatYouCanDo가 정확히 3개가 아님");
  }
  if (!Array.isArray(s.lectureIds) || s.lectureIds.length < 1 || s.lectureIds.length > 4) bad(where, "lectureIds는 1~4개여야 함");
  else for (const id of s.lectureIds) if (!videoIds.has(id)) bad(where, `lectureIds "${id}"인 강의가 없음`);
  if (!Array.isArray(s.termIds) || s.termIds.length < 1 || s.termIds.length > 3) bad(where, "termIds는 1~3개여야 함");
  else for (const id of s.termIds) if (!termIds.has(id)) bad(where, `termIds "${id}"인 용어가 없음`);
  for (const id of s.theoryIds ?? []) if (!theoryIds.has(id)) bad(where, `theoryIds "${id}"인 개념이 없음`);
  if (!isNonEmptyString(s.firstStep?.label) || !isNonEmptyString(s.firstStep?.prompt)) bad(where, "firstStep 누락");
  else if (chars(s.firstStep.prompt) > 350) bad(where, `firstStep.prompt가 350자 초과 (${chars(s.firstStep.prompt)}자)`);
  if (!Array.isArray(s.sources) || s.sources.length < 2) bad(where, "sources가 2개 미만");
  else {
    for (const src of s.sources) {
      if (!isNonEmptyString(src.title) || !isNonEmptyString(src.publisher)) bad(where, "출처 title/publisher 누락");
      if (src.checked !== "원문 확인" && src.checked !== "검색 확인") bad(where, `출처 checked 값이 이상함: ${String(src.checked)}`);
      let ok = false;
      try {
        ok = new URL(src.url).protocol === "https:";
      } catch {
        ok = false;
      }
      if (!ok) bad(where, `출처 URL이 https 형식이 아님: ${src.url}`);
    }
  }
}

// 실습 미션 (형식만 점검. 규칙은 src/lib/practice.ts와 같다)
{
  const missions = practiceJson as unknown as Record<string, unknown>[];
  const len = (v: unknown) => (typeof v === "string" ? [...v].length : 0);
  const seen = new Set<string>();
  for (const m of missions) {
    const id = String(m.videoId);
    const where = `practice:${id}`;
    if (!videoIds.has(id)) bad(where, "videoId인 강의가 없음");
    if (seen.has(id)) bad(where, "videoId 중복");
    seen.add(id);
    for (const [f, max] of [["title", 30], ["goal", 60], ["success", 60]] as const) {
      if (!isNonEmptyString(m[f])) bad(where, `${f} 누락`);
      else if (len(m[f]) > max) bad(where, `${f}가 ${max}자 초과 (${len(m[f])}자)`);
    }
    if (m.caution !== undefined && !isNonEmptyString(m.caution)) bad(where, "caution이 빈 문자열");
    if (m.needsTool !== undefined && !["chat", "coding", "automation"].includes(String(m.needsTool))) bad(where, `needsTool이 이상함: ${String(m.needsTool)}`);
    const steps = m.steps;
    if (!Array.isArray(steps) || steps.length < 2 || steps.length > 4 || !steps.every(isNonEmptyString)) bad(where, "steps는 비어 있지 않은 문자열 2~4개여야 함");
    const prompts = m.prompts as { label?: unknown; text?: unknown; domainVariants?: Record<string, unknown> }[];
    if (!Array.isArray(prompts) || prompts.length < 1 || prompts.length > 3) {
      bad(where, "prompts는 1~3개여야 함");
      continue;
    }
    for (const p of prompts) {
      if (!isNonEmptyString(p.label)) bad(where, "prompt label 누락");
      const texts: unknown[] = [p.text, ...Object.values(p.domainVariants ?? {})];
      for (const k of Object.keys(p.domainVariants ?? {})) if (!DOMAINS.includes(k as Domain)) bad(where, `domainVariants 키가 이상함: ${k}`);
      for (const t of texts) {
        if (!isNonEmptyString(t)) bad(where, "빈 프롬프트 문구");
        else {
          if (len(t) > 350) bad(where, `프롬프트가 350자 초과 (${len(t)}자)`);
          if ((t.match(/\[[^[\]\n]+\]/g) ?? []).length > 1) bad(where, "프롬프트 자리표시자 [..]가 2개 이상");
        }
      }
    }
  }
  for (const v of videos) if (!seen.has(v.id)) bad(`practice:${v.id}`, "이 강의의 실습 미션이 없음");
}

// ---------------------------------------------------------------------------
// 2) 링크 점검
// ---------------------------------------------------------------------------
interface OEmbed {
  title?: string;
  author_name?: string;
  author_url?: string;
}
interface LinkResult {
  video: Video;
  ok: boolean;
  status: string;
  channel?: string;
  via?: string; // "본인 채널" | 허용 채널 메모
  problem?: string;
  titleDiff?: string;
}

/** "https://www.youtube.com/@Foo", "/@foo", "https://youtube.com/channel/UCx" → "@foo" / "channel/UCx" */
function channelKey(url: string): string {
  const path = url.replace(/^https?:\/\/(www\.|m\.)?youtube\.com/i, "").replace(/\/+$/, "");
  const m = path.match(/^\/(@[^/?#]+|channel\/[^/?#]+|c\/[^/?#]+|user\/[^/?#]+)/i);
  if (!m) return path.toLowerCase();
  let key = m[1];
  try {
    key = decodeURIComponent(key);
  } catch {
    /* 그대로 */
  }
  return key.startsWith("channel/") ? key : key.toLowerCase();
}

async function fetchOEmbed(url: string): Promise<{ status: number; body?: OEmbed; error?: string }> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  let last: { status: number; body?: OEmbed; error?: string } = { status: 0, error: "요청 안 함" };
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(endpoint, { signal: ctrl.signal, headers: { "user-agent": "ai-lecture-guide-link-check" } });
      if (res.status === 200) return { status: 200, body: (await res.json()) as OEmbed };
      last = { status: res.status };
      // 4xx(429 제외)는 다시 시도해도 같은 결과
      if (res.status >= 400 && res.status < 500 && res.status !== 429) return last;
    } catch (e) {
      last = { status: 0, error: (e as Error).name === "AbortError" ? `타임아웃 ${TIMEOUT_MS / 1000}s` : String(e) };
    } finally {
      clearTimeout(timer);
    }
    if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 1000));
  }
  return last;
}

const normTitle = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim();

async function checkVideo(video: Video): Promise<LinkResult> {
  const instructor = instructors.find((i) => i.id === video.instructorId);
  const r = await fetchOEmbed(video.url);
  if (r.status !== 200 || !r.body) {
    return { video, ok: false, status: r.status ? String(r.status) : "ERR", problem: r.error ?? `HTTP ${r.status}` };
  }
  const channel = r.body.author_url ? channelKey(r.body.author_url) : "";
  const result: LinkResult = { video, ok: true, status: "200", channel };
  if (r.body.title && normTitle(r.body.title) !== normTitle(video.title)) {
    result.titleDiff = r.body.title;
  }
  if (!instructor) return { ...result, ok: false, problem: "강사 없음" };
  if (channel && channel === channelKey(instructor.channelUrl)) return { ...result, via: "본인 채널" };
  const allowed = (THIRD_PARTY_CHANNELS[instructor.id] ?? []).find((a) => a.channel.toLowerCase() === channel);
  if (allowed) return { ...result, via: `허용: ${allowed.note}` };
  return {
    ...result,
    ok: false,
    problem: `업로드 채널 ${channel || "(없음)"} (${r.body.author_name ?? "?"}) ≠ 강사 채널 ${channelKey(instructor.channelUrl)}`,
  };
}

async function runPool<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

// ---------------------------------------------------------------------------
// 출력
// ---------------------------------------------------------------------------
const pad = (s: string, n: number) => {
  // 한글은 폭 2로 계산
  const w = [...s].reduce((acc, ch) => acc + (/[ᄀ-ᇿ㄰-㆏가-힣]/.test(ch) ? 2 : 1), 0);
  return s + " ".repeat(Math.max(0, n - w));
};
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

async function main() {
  console.log(`데이터 점검 — 강사 ${instructors.length}명 · 강의 ${videos.length}개 · 용어 ${glossary.length}개 · 이론 ${theory.length}개 · 실습 ${(practiceJson as unknown[]).length}개 · 스킬 ${skills.length}개\n`);

  console.log("① 스키마");
  if (schemaProblems.length === 0) console.log("  통과");
  else {
    console.log(`  ${pad("위치", 46)}문제`);
    schemaProblems.forEach((p) => console.log(`  ${pad(p.where, 46)}${p.problem}`));
  }

  let linkFailures: LinkResult[] = [];
  if (!schemaOnly) {
    console.log(`\n② 링크 (YouTube oEmbed, 동시 ${CONCURRENCY}개, 타임아웃 ${TIMEOUT_MS / 1000}s, 재시도 ${RETRIES}회)`);
    const results = await runPool(videos, CONCURRENCY, checkVideo);
    linkFailures = results.filter((r) => !r.ok);
    const thirdParty = results.filter((r) => r.ok && r.via && r.via !== "본인 채널");
    console.log(`  통과 ${results.length - linkFailures.length}/${results.length} (그중 허용된 제3자 채널 ${thirdParty.length}개)`);
    thirdParty.forEach((r) => console.log(`    · ${pad(r.video.id, 36)} ${r.channel}  ${r.via}`));

    const titleDiffs = results.filter((r) => r.titleDiff);
    if (titleDiffs.length) {
      console.log(`\n  참고: oEmbed 제목과 다른 강의 ${titleDiffs.length}개 (실패로 치지 않음)`);
      titleDiffs.forEach((r) => console.log(`    · ${pad(r.video.id, 36)} 데이터 "${cut(r.video.title, 40)}" / oEmbed "${cut(r.titleDiff!, 40)}"`));
    }

    if (linkFailures.length) {
      console.log(`\n  실패 ${linkFailures.length}건`);
      console.log(`  ${pad("id", 36)}${pad("상태", 6)}${pad("강사", 18)}문제`);
      linkFailures.forEach((r) =>
        console.log(`  ${pad(r.video.id, 36)}${pad(r.status, 6)}${pad(r.video.instructorId, 18)}${r.problem}`),
      );
    }
  }

  const failed = schemaProblems.length + linkFailures.length;
  console.log(failed ? `\n✗ 실패 ${failed}건` : "\n✓ 모두 통과");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
