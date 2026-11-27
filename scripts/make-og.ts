/**
 * OG 이미지(public/og.png, 1200x630)와 애플 아이콘(src/app/apple-icon.png, 180x180) 생성.
 *   npm run og
 * scripts/og-template.html을 Playwright(Chromium)로 열어 캡처한다.
 * 폰트는 node_modules/pretendard의 woff2를 file://로 읽으므로 인터넷이 필요 없다.
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = pathToFileURL(path.join(root, "scripts", "og-template.html")).href;

const targets = [
  { mode: "og", width: 1200, height: 630, out: path.join(root, "public", "og.png") },
  { mode: "apple", width: 180, height: 180, out: path.join(root, "src", "app", "apple-icon.png") },
] as const;

async function main() {
  const font = path.join(root, "node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2");
  if (!existsSync(font)) throw new Error("pretendard 폰트가 없습니다. 먼저 `npm install`을 실행하세요.");

  const browser = await chromium.launch();
  try {
    for (const t of targets) {
      mkdirSync(path.dirname(t.out), { recursive: true });
      const page = await browser.newPage({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 1 });
      await page.goto(`${template}?mode=${t.mode}`);
      await page.evaluate(() => document.fonts.ready);
      const loaded = await page.evaluate(() => document.fonts.check('700 40px "PretendardLocal"', "AI 강의 길잡이"));
      if (t.mode === "og" && !loaded) throw new Error("Pretendard가 로드되지 않았습니다.");
      await page.screenshot({ path: t.out, clip: { x: 0, y: 0, width: t.width, height: t.height } });
      await page.close();
      console.log(`wrote ${path.relative(root, t.out)} (${t.width}x${t.height})`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
