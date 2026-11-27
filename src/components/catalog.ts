/**
 * 정적 JSON 데이터를 타입이 붙은 목록으로 내보낸다.
 * JSON import는 리터럴 유니온·튜플 타입이 넓어지므로 types.ts 계약으로 단언한다.
 * (스키마 자체는 A 담당 데이터 + E 담당 점검 스크립트가 보장)
 */
import instructorsJson from "@data/instructors.json";
import videosJson from "@data/videos.json";
import type { CredentialType, Instructor, Video } from "@/types";

export const instructors = instructorsJson as unknown as Instructor[];
export const videos = videosJson as unknown as Video[];

/** 유튜브 썸네일 (영상만, 재생목록은 id가 영상이 아니라서 없음) */
export function thumbnailFor(video: Video): string | undefined {
  return video.kind === "video" ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : undefined;
}

/** 선정 기준 표시 이름 */
export const CREDENTIAL_LABELS: Record<CredentialType, string> = {
  founder: "창업자",
  core_researcher: "핵심 연구자",
  professor: "교수",
  official_channel: "공식 채널",
};

/** 강의 카드 위 작은 라벨. 예: "창업자 · 핵심 연구자" (최대 2개) */
export function credentialBadge(instructor: Instructor): string {
  return instructor.credentials
    .slice(0, 2)
    .map((c) => CREDENTIAL_LABELS[c])
    .join(" · ");
}
