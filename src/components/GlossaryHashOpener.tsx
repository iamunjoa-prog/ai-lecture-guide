"use client";

import { useEffect } from "react";

/** URL 해시(#term-id)와 일치하는 용어를 펼친다. `?l=<level>`이면 그 수준 구역으로 스크롤한다 */
export function GlossaryHashOpener() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) {
        const el = document.getElementById(id);
        if (el instanceof HTMLDetailsElement) {
          el.open = true;
          el.scrollIntoView({ block: "start" });
        } else if (el) {
          el.scrollIntoView({ block: "start" });
        }
        return;
      }
      const level = new URLSearchParams(window.location.search).get("l");
      if (level) document.getElementById(`level-${level}`)?.scrollIntoView({ block: "start" });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
