"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { cn } from "../ui/cn";
import { getAdConfig, readAdEnv, type AdConfig, type AdPlacement } from "../../lib/ads";
import { AdfitAd } from "./AdfitAd";
import { AdsenseAd } from "./AdsenseAd";

const noop = () => () => {};
/** 서버·하이드레이션 중에는 false, 브라우저에서 붙은 뒤에는 true */
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** 라벨·예약 높이가 있는 껍데기. 광고 본체(children)는 업체 어댑터가 채운다 */
export function AdFrame({ reservedHeight, className, children }: { reservedHeight: number; className?: string; children?: ReactNode }) {
  return (
    <aside
      role="complementary"
      aria-label="광고"
      data-ad-frame=""
      className={cn("mt-10 mb-2 rounded-xl border border-border bg-surface-2 px-4 pt-3 pb-4", className)}
    >
      <p className="eyebrow-ko text-fg-muted">광고</p>
      <div
        data-ad-area=""
        className="mt-2 flex w-full items-center justify-center overflow-hidden"
        style={{ minHeight: reservedHeight }}
      >
        {children}
      </div>
    </aside>
  );
}

export interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
  /** 테스트용: 환경 변수 대신 이 설정을 쓴다. null이면 강제로 끔 */
  configOverride?: AdConfig | null;
}

/** 광고가 켜진 자리에서만 그린다. 꺼져 있으면 DOM·스크립트·여백이 전혀 없다 */
export function AdSlot({ placement, className, configOverride }: AdSlotProps) {
  const mounted = useMounted();
  const config = configOverride !== undefined ? configOverride : getAdConfig(readAdEnv(), placement);
  if (!mounted || !config) return null;

  return (
    <AdFrame reservedHeight={config.reservedHeight} className={className}>
      {config.provider === "adfit" ? (
        <AdfitAd unit={config.unit} width={config.width} height={config.height} />
      ) : (
        <AdsenseAd client={config.client} slot={config.slot} />
      )}
    </AdFrame>
  );
}
