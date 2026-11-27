import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_URL, getSiteUrl, normalizeSiteUrl } from "../site";

describe("사이트 주소", () => {
  it("아무 환경 변수도 없으면 기본값", () => {
    expect(getSiteUrl({})).toBe(DEFAULT_SITE_URL);
  });
  it("NEXT_PUBLIC_SITE_URL이 가장 우선", () => {
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://guide.example.kr/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe(
      "https://guide.example.kr",
    );
  });
  it("Vercel 값은 프로토콜이 없어도 https를 붙인다", () => {
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "my-app.vercel.app" })).toBe("https://my-app.vercel.app");
  });
  it("잘못된 값은 무시하고 다음 후보로", () => {
    expect(normalizeSiteUrl("   ")).toBeNull();
    expect(normalizeSiteUrl("http://")).toBeNull();
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://", VERCEL_PROJECT_PRODUCTION_URL: "a.vercel.app" })).toBe("https://a.vercel.app");
  });
});
