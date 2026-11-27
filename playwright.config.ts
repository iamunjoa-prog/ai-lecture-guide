import os from "node:os";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * E2E 설정 (E 담당) — `npm run e2e`
 *  - 프로덕션 빌드를 띄워서 테스트한다. 이미 빌드했다면 E2E_SKIP_BUILD=1로 빌드를 건너뛴다.
 *  - 기본 뷰포트는 모바일(390×844).
 *  - 외부 요청(폰트 CSS·유튜브 썸네일)은 tests/e2e/fixtures.ts에서 가짜 응답으로 막아 둔다.
 */
const PORT = Number(process.env.E2E_PORT ?? 3500);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const skipBuild = process.env.E2E_SKIP_BUILD === "1";

export default defineConfig({
  testDir: "tests/e2e",
  // vitest 기본 패턴(*.test.ts, *.spec.ts)과 겹치지 않도록 *.e2e.ts만 쓴다.
  testMatch: /.*\.e2e\.ts$/,
  outputDir: path.join(os.tmpdir(), "ai-lecture-guide-playwright"),
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    ...devices["Pixel 7"],
    viewport: { width: 390, height: 844 },
    locale: "ko-KR",
    trace: "off",
  },
  projects: [{ name: "mobile-chromium" }],
  webServer: {
    command: `${skipBuild ? "" : "npm run build && "}npx next start -p ${PORT} -H 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
