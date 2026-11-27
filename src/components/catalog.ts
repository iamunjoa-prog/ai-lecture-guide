/**
 * 정적 JSON 데이터를 타입이 붙은 목록으로 내보낸다.
 * JSON import는 리터럴 유니온·튜플 타입이 넓어지므로 types.ts 계약으로 단언한다.
 * (스키마 자체는 A 담당 데이터 + E 담당 점검 스크립트가 보장)
 */
import instructorsJson from "@data/instructors.json";
import videosJson from "@data/videos.json";
import type { Instructor, Video } from "@/types";

export const instructors = instructorsJson as unknown as Instructor[];
export const videos = videosJson as unknown as Video[];

/** 유튜브 썸네일 (영상만, 재생목록은 id가 영상이 아니라서 없음) */
export function thumbnailFor(video: Video): string | undefined {
  return video.kind === "video" ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : undefined;
}
