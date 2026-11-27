"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://t1.daumcdn.net/kas/static/ba.min.js";

/**
 * Kakao AdFit 어댑터. 광고 단위 코드는 AdFit 대시보드의 최신 안내와 다를 수 있으니 가입 후 확인하세요.
 * 스크립트는 <ins>가 만들어진 뒤에 넣어야 광고를 찾으므로, 마운트할 때마다 컨테이너 안에 새로 붙이고
 * 언마운트할 때 걷어 낸다(페이지 이동 후 다시 들어와도 안전).
 */
export function AdfitAd({ unit, width, height }: { unit: string; width: number; height: number }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = SCRIPT_SRC;
    el.appendChild(script);
    return () => {
      script.remove();
      // 광고가 채운 내용은 비우되, 다음 마운트를 위해 <ins>는 React가 다시 만든다
      el.querySelectorAll("ins.kakao_ad_area").forEach((ins) => ins.replaceChildren());
    };
  }, [unit, width, height]);

  return (
    <div ref={box} className="flex justify-center">
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unit}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  );
}
