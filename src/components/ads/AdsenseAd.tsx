"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const SCRIPT_ID = "adsense-script";

/**
 * Google AdSense 어댑터. 스니펫은 AdSense 대시보드의 최신 안내와 다를 수 있으니 가입 후 확인하세요.
 * 로더 스크립트는 페이지당 한 번만 넣고, 광고 단위마다 push를 한 번만 호출한다.
 */
export function AdsenseAd({ client, slot }: { client: string; slot: string }) {
  const ins = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      document.head.appendChild(s);
    }
    const el = ins.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* 광고 차단기·네트워크 문제는 조용히 넘어간다 */
    }
  }, [client, slot]);

  return (
    <ins
      ref={ins}
      className="adsbygoogle block w-full"
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
