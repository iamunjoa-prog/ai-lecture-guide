import { describe, expect, it } from "vitest";
import { findCoverageGaps } from "../coverage";
import type { Video } from "../../types";
import videosJson from "../../../data/videos.json";

const v = (p: Partial<Video>): Video =>
  ({ id: "x", levels: ["user"], domains: ["marketing"], goals: ["use_tools"], ...p }) as Video;

describe("findCoverageGaps", () => {
  it("수준·분야·목표가 모두 맞는 강의가 있으면 빈칸이 없다", () => {
    expect(findCoverageGaps({ level: "user", domains: ["marketing"], goals: ["use_tools"] }, [v({})])).toEqual([]);
  });
  it("수준이 다르면 빈칸으로 본다", () => {
    expect(findCoverageGaps({ level: "beginner", domains: ["marketing"], goals: ["use_tools"] }, [v({})])).toEqual([
      { domain: "marketing", goal: "use_tools" },
    ]);
  });
  it("분야 × 목표 조합마다 따로 본다", () => {
    const gaps = findCoverageGaps({ level: "user", domains: ["marketing", "data"], goals: ["use_tools", "build_agents"] }, [v({})]);
    expect(gaps).toHaveLength(3);
    expect(gaps).not.toContainEqual({ domain: "marketing", goal: "use_tools" });
  });
  it("분야 미정이면 빈칸을 만들지 않는다", () => {
    expect(findCoverageGaps({ level: "user", domains: [], goals: ["build_agents"] }, [])).toEqual([]);
  });
  it("실제 데이터: 입문자 이미지·영상 × 에이전트 만들기는 빈칸, 업무 도구는 채워져 있다", () => {
    const videos = videosJson as unknown as Video[];
    expect(findCoverageGaps({ level: "beginner", domains: ["creative"], goals: ["build_agents"] }, videos)).toHaveLength(1);
    expect(findCoverageGaps({ level: "beginner", domains: ["creative"], goals: ["use_tools"] }, videos)).toEqual([]);
  });
});
