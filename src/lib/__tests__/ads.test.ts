import { describe, expect, it } from "vitest";
import { activeAdProvider, getAdConfig } from "../ads";

const adfit = {
  NEXT_PUBLIC_AD_PROVIDER: "adfit",
  NEXT_PUBLIC_ADFIT_UNIT_RESULT: "DAN-abc123",
  NEXT_PUBLIC_ADFIT_UNIT_GLOSSARY: "DAN-def456",
};
const adsense = {
  NEXT_PUBLIC_AD_PROVIDER: "adsense",
  NEXT_PUBLIC_ADSENSE_CLIENT: "ca-pub-1234567890123456",
  NEXT_PUBLIC_ADSENSE_SLOT_RESULT: "1111111111",
  NEXT_PUBLIC_ADSENSE_SLOT_GLOSSARY: "2222222222",
};

describe("getAdConfig: 꺼짐", () => {
  it("환경 변수가 없으면 모든 자리가 꺼짐", () => {
    expect(getAdConfig({}, "result-bottom")).toBeNull();
    expect(getAdConfig({}, "glossary-bottom")).toBeNull();
  });
  it("알 수 없는 업체·빈 값은 꺼짐", () => {
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_AD_PROVIDER: "foo" }, "result-bottom")).toBeNull();
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_AD_PROVIDER: "  " }, "result-bottom")).toBeNull();
  });
  it("업체만 지정하고 ID가 없으면 꺼짐", () => {
    expect(getAdConfig({ NEXT_PUBLIC_AD_PROVIDER: "adfit" }, "result-bottom")).toBeNull();
    expect(getAdConfig({ NEXT_PUBLIC_AD_PROVIDER: "adsense" }, "glossary-bottom")).toBeNull();
  });
  it("AdFit: 한 자리의 ID만 있으면 그 자리만 켜짐", () => {
    const env = { NEXT_PUBLIC_AD_PROVIDER: "adfit", NEXT_PUBLIC_ADFIT_UNIT_RESULT: "DAN-abc123" };
    expect(getAdConfig(env, "result-bottom")).not.toBeNull();
    expect(getAdConfig(env, "glossary-bottom")).toBeNull();
  });
  it("AdFit: 형식이 틀린 ID는 꺼짐", () => {
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_ADFIT_UNIT_RESULT: "abc" }, "result-bottom")).toBeNull();
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_ADFIT_UNIT_RESULT: "DAN-" }, "result-bottom")).toBeNull();
  });
  it("AdSense: 클라이언트나 슬롯이 없거나 형식이 틀리면 꺼짐", () => {
    expect(getAdConfig({ ...adsense, NEXT_PUBLIC_ADSENSE_CLIENT: undefined }, "result-bottom")).toBeNull();
    expect(getAdConfig({ ...adsense, NEXT_PUBLIC_ADSENSE_CLIENT: "pub-123" }, "result-bottom")).toBeNull();
    expect(getAdConfig({ ...adsense, NEXT_PUBLIC_ADSENSE_SLOT_RESULT: undefined }, "result-bottom")).toBeNull();
    expect(getAdConfig({ ...adsense, NEXT_PUBLIC_ADSENSE_SLOT_GLOSSARY: "abc" }, "glossary-bottom")).toBeNull();
  });
  it("AdFit 값은 AdSense 설정으로 읽히지 않음", () => {
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_AD_PROVIDER: "adsense" }, "result-bottom")).toBeNull();
  });
});

describe("getAdConfig: 켜짐", () => {
  it("AdFit 기본 크기는 320x100", () => {
    expect(getAdConfig(adfit, "result-bottom")).toEqual({
      provider: "adfit",
      unit: "DAN-abc123",
      width: 320,
      height: 100,
      reservedHeight: 100,
    });
    expect(getAdConfig(adfit, "glossary-bottom")).toMatchObject({ unit: "DAN-def456" });
  });
  it("AdFit 크기를 바꿀 수 있고 잘못된 값은 기본값", () => {
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_ADFIT_WIDTH: "300", NEXT_PUBLIC_ADFIT_HEIGHT: "250" }, "result-bottom")).toMatchObject({
      width: 300,
      height: 250,
      reservedHeight: 250,
    });
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_ADFIT_WIDTH: "x", NEXT_PUBLIC_ADFIT_HEIGHT: "-5" }, "result-bottom")).toMatchObject({
      width: 320,
      height: 100,
    });
  });
  it("AdSense", () => {
    expect(getAdConfig(adsense, "result-bottom")).toMatchObject({ provider: "adsense", client: "ca-pub-1234567890123456", slot: "1111111111" });
    expect(getAdConfig(adsense, "glossary-bottom")).toMatchObject({ slot: "2222222222" });
  });
  it("공백·대소문자를 다듬는다", () => {
    expect(getAdConfig({ ...adfit, NEXT_PUBLIC_AD_PROVIDER: " AdFit ", NEXT_PUBLIC_ADFIT_UNIT_RESULT: " DAN-abc123 " }, "result-bottom")).not.toBeNull();
  });
});

describe("activeAdProvider", () => {
  it("꺼짐 / 켜짐", () => {
    expect(activeAdProvider({})).toBeNull();
    expect(activeAdProvider({ NEXT_PUBLIC_AD_PROVIDER: "adfit" })).toBeNull();
    expect(activeAdProvider(adfit)).toBe("adfit");
    expect(activeAdProvider(adsense)).toBe("adsense");
  });
});
