/**
 * 광고 설정. NEXT_PUBLIC_* 환경 변수만 읽는다(빌드 시점에 값이 박힌다).
 * 기본값은 "광고 꺼짐"이며, 필요한 값이 하나라도 빠진 자리는 아무것도 그리지 않는다.
 */
export type AdPlacement = "result-bottom" | "glossary-bottom";

export const AD_PLACEMENTS: readonly AdPlacement[] = ["result-bottom", "glossary-bottom"];

export type AdConfig =
  | { provider: "adfit"; unit: string; width: number; height: number; reservedHeight: number }
  | { provider: "adsense"; client: string; slot: string; reservedHeight: number };

export type AdEnv = Readonly<Record<string, string | undefined>>;

export const ADFIT_DEFAULT_SIZE = { width: 320, height: 100 } as const;
/** AdSense 반응형(auto) 광고가 들어갈 자리의 예약 높이(px) */
export const ADSENSE_RESERVED_HEIGHT = 100;

/**
 * Next.js는 `process.env.NEXT_PUBLIC_X`처럼 이름을 그대로 적은 곳만 빌드 때 값으로 바꿔 준다.
 * 그래서 동적 접근 대신 여기서 하나씩 명시해 모은다.
 */
export function readAdEnv(): AdEnv {
  return {
    NEXT_PUBLIC_AD_PROVIDER: process.env.NEXT_PUBLIC_AD_PROVIDER,
    NEXT_PUBLIC_ADFIT_UNIT_RESULT: process.env.NEXT_PUBLIC_ADFIT_UNIT_RESULT,
    NEXT_PUBLIC_ADFIT_UNIT_GLOSSARY: process.env.NEXT_PUBLIC_ADFIT_UNIT_GLOSSARY,
    NEXT_PUBLIC_ADFIT_WIDTH: process.env.NEXT_PUBLIC_ADFIT_WIDTH,
    NEXT_PUBLIC_ADFIT_HEIGHT: process.env.NEXT_PUBLIC_ADFIT_HEIGHT,
    NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    NEXT_PUBLIC_ADSENSE_SLOT_RESULT: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT,
    NEXT_PUBLIC_ADSENSE_SLOT_GLOSSARY: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GLOSSARY,
  };
}

function clean(v: string | undefined): string {
  return (v ?? "").trim();
}

function parseSize(raw: string | undefined, fallback: number): number {
  const n = Number(clean(raw));
  return Number.isInteger(n) && n >= 50 && n <= 600 ? n : fallback;
}

/** 해당 자리의 광고 설정. 꺼져 있거나 값이 모자라거나 형식이 틀리면 null */
export function getAdConfig(env: AdEnv, placement: AdPlacement): AdConfig | null {
  const provider = clean(env.NEXT_PUBLIC_AD_PROVIDER).toLowerCase();
  const isResult = placement === "result-bottom";

  if (provider === "adfit") {
    const unit = clean(isResult ? env.NEXT_PUBLIC_ADFIT_UNIT_RESULT : env.NEXT_PUBLIC_ADFIT_UNIT_GLOSSARY);
    if (!/^DAN-[A-Za-z0-9]+$/.test(unit)) return null;
    const width = parseSize(env.NEXT_PUBLIC_ADFIT_WIDTH, ADFIT_DEFAULT_SIZE.width);
    const height = parseSize(env.NEXT_PUBLIC_ADFIT_HEIGHT, ADFIT_DEFAULT_SIZE.height);
    return { provider: "adfit", unit, width, height, reservedHeight: height };
  }

  if (provider === "adsense") {
    const client = clean(env.NEXT_PUBLIC_ADSENSE_CLIENT);
    const slot = clean(isResult ? env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT : env.NEXT_PUBLIC_ADSENSE_SLOT_GLOSSARY);
    if (!/^ca-pub-\d+$/.test(client) || !/^\d+$/.test(slot)) return null;
    return { provider: "adsense", client, slot, reservedHeight: ADSENSE_RESERVED_HEIGHT };
  }

  return null;
}

/** 어느 자리든 하나라도 광고가 켜져 있으면 해당 업체 이름, 아니면 null (개인정보 처리방침 문구용) */
export function activeAdProvider(env: AdEnv): "adfit" | "adsense" | null {
  for (const p of AD_PLACEMENTS) {
    const c = getAdConfig(env, p);
    if (c) return c.provider;
  }
  return null;
}
