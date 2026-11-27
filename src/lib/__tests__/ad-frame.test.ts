import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdFrame, AdSlot } from "../../components/ads/AdSlot";

describe("AdFrame / AdSlot", () => {
  it("껍데기는 '광고' 라벨, aria-label, 예약 높이를 가진다", () => {
    const html = renderToStaticMarkup(createElement(AdFrame, { reservedHeight: 100 }));
    expect(html).toContain('aria-label="광고"');
    expect(html).toContain('role="complementary"');
    expect(html).toContain(">광고</p>");
    expect(html).toContain("min-height:100px");
  });
  it("AdSlot은 서버 렌더에서 아무것도 그리지 않는다(하이드레이션 안전)", () => {
    const cfg = { provider: "adfit" as const, unit: "DAN-x", width: 320, height: 100, reservedHeight: 100 };
    expect(renderToStaticMarkup(createElement(AdSlot, { placement: "result-bottom", configOverride: cfg }))).toBe("");
    expect(renderToStaticMarkup(createElement(AdSlot, { placement: "result-bottom" }))).toBe("");
  });
});
