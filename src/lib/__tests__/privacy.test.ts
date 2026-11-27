import { describe, expect, it } from "vitest";
import { getPrivacyFlags } from "../privacy";

describe("getPrivacyFlags", () => {
  it("기본: 광고·제휴 없음, 문의는 GitHub 이슈", () => {
    const f = getPrivacyFlags({}, 0);
    expect(f.adProvider).toBeNull();
    expect(f.hasAffiliate).toBe(false);
    expect(f.contactEmail).toBeNull();
    expect(f.repoIssuesUrl).toMatch(/^https:\/\/github\.com\/.+\/issues$/);
  });
  it("광고가 켜지면 업체 이름, 제휴 항목이 있으면 hasAffiliate", () => {
    const f = getPrivacyFlags(
      { NEXT_PUBLIC_AD_PROVIDER: "adfit", NEXT_PUBLIC_ADFIT_UNIT_RESULT: "DAN-x1" },
      2,
    );
    expect(f.adProvider).toBe("adfit");
    expect(f.hasAffiliate).toBe(true);
  });
  it("문의 이메일은 형식이 맞을 때만", () => {
    expect(getPrivacyFlags({ NEXT_PUBLIC_CONTACT_EMAIL: " a@b.kr " }, 0).contactEmail).toBe("a@b.kr");
    expect(getPrivacyFlags({ NEXT_PUBLIC_CONTACT_EMAIL: "nope" }, 0).contactEmail).toBeNull();
  });
});
