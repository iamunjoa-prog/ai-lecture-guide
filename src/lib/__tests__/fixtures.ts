import type { DiagnosisResult, Instructor, Video } from "../../types";

export const instructors: Instructor[] = ["a", "b", "c", "d", "e"].map((x) => ({
  id: `inst-${x}`,
  name: `강사 ${x.toUpperCase()}`,
  nameEn: `Instructor ${x.toUpperCase()}`,
  title: "테스트용 강사",
  credentials: ["professor"],
  credentialNote: "테스트",
  channelUrl: "https://www.youtube.com/",
}));

type VideoInput = Pick<Video, "id" | "instructorId" | "levels" | "domains" | "goals"> &
  Partial<Video>;

export function makeVideo(v: VideoInput): Video {
  return {
    kind: "video",
    url: `https://www.youtube.com/watch?v=${v.id}`,
    title: `강의 ${v.id}`,
    language: "en",
    hasKoreanSubtitle: false,
    durationMin: 30,
    summary: "테스트 강의",
    takeaways: ["하나", "둘", "셋"],
    verifiedAt: "2026-11-27",
    ...v,
  };
}

/** 수준별로 고르게 퍼진 12개 강의 */
export const videos: Video[] = [
  // beginner
  makeVideo({ id: "B1", instructorId: "inst-a", levels: ["beginner"], domains: ["marketing"], goals: ["understand"], language: "ko", durationMin: 20 }),
  makeVideo({ id: "B2", instructorId: "inst-b", levels: ["beginner"], domains: ["automation", "data"], goals: ["use_tools"], durationMin: 15 }),
  makeVideo({ id: "B3", instructorId: "inst-c", levels: ["beginner", "user"], domains: ["marketing", "education"], goals: ["understand", "use_tools"], hasKoreanSubtitle: true, durationMin: 45 }),
  // user
  makeVideo({ id: "U1", instructorId: "inst-a", levels: ["user"], domains: ["marketing"], goals: ["use_tools"], language: "ko", durationMin: 25 }),
  makeVideo({ id: "U2", instructorId: "inst-d", levels: ["user"], domains: ["data"], goals: ["use_tools"], durationMin: 40 }),
  makeVideo({ id: "U3", instructorId: "inst-e", levels: ["user", "practitioner"], domains: ["automation", "startup"], goals: ["build_agents"], durationMin: 60 }),
  // practitioner
  makeVideo({ id: "P1", instructorId: "inst-b", levels: ["practitioner"], domains: ["automation"], goals: ["build_agents"], durationMin: 50 }),
  makeVideo({ id: "P2", instructorId: "inst-c", levels: ["practitioner"], domains: ["marketing", "data"], goals: ["use_tools"], hasKoreanSubtitle: true, durationMin: 35 }),
  makeVideo({ id: "P3", instructorId: "inst-d", levels: ["practitioner", "developer"], domains: ["coding", "startup"], goals: ["build_products"], durationMin: 90 }),
  // developer
  makeVideo({ id: "D1", instructorId: "inst-e", levels: ["developer"], domains: ["coding"], goals: ["build_agents"], durationMin: 120 }),
  makeVideo({ id: "D2", instructorId: "inst-a", levels: ["developer"], domains: ["coding", "automation"], goals: ["build_products"], durationMin: 80 }),
  makeVideo({ id: "D3", instructorId: "inst-b", levels: ["developer"], domains: ["data", "coding"], goals: ["build_agents", "build_products"], language: "ko", durationMin: 100 }),
];

export const diag = (d: Partial<DiagnosisResult> = {}): DiagnosisResult => ({
  level: "user",
  domains: ["marketing"],
  goals: ["use_tools"],
  preferKorean: false,
  ...d,
});
