import type { CSSProperties } from "react";
import type { Instructor } from "@/types";
import styles from "./Marquee.module.css";

function Row({ items, reverse, duration }: { items: Instructor[]; reverse?: boolean; duration: number }) {
  // 같은 목록을 두 번 이어 붙이고 -50%만큼 흘려서 끊김 없이 반복한다
  const pill = (ins: Instructor, dup: boolean) => (
    <li
      key={`${dup ? "dup-" : ""}${ins.id}`}
      aria-hidden={dup || undefined}
      className={`${dup ? styles.duplicate : ""} mx-1 my-1 shrink-0 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-fg shadow-sm`}
    >
      {ins.name}
    </li>
  );
  return (
    <div className={styles.viewport}>
      <ul
        className={`${styles.track} ${reverse ? styles.reverse : ""}`}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {items.map((i) => pill(i, false))}
        {items.map((i) => pill(i, true))}
      </ul>
    </div>
  );
}

/** 랜딩의 강사 이름 띠 (두 줄, 반대 방향) */
export function InstructorMarquee({ instructors }: { instructors: Instructor[] }) {
  const half = Math.ceil(instructors.length / 2);
  const first = instructors.slice(0, half);
  const second = instructors.slice(half);
  return (
    <div className="-mx-5 flex flex-col gap-1">
      <Row items={first} duration={38} />
      {second.length > 0 && <Row items={second} reverse duration={44} />}
    </div>
  );
}
