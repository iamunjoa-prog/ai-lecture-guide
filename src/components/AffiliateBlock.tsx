import type { AffiliateItem } from "@/lib/affiliate";
import { AFFILIATE_DEFAULT_DISCLOSURE } from "@/lib/affiliate";
import { IconArrowUpRight } from "@/components/ui";

/** 결과 화면 하단 제휴 링크. 무료 유튜브 강의 추천과 구분되도록 라벨·고지문을 항상 보여 준다 */
export function AffiliateBlock({ items }: { items: AffiliateItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="affiliate-title" className="mt-10 rounded-xl border border-dashed border-border-strong px-5 py-6">
      <p className="eyebrow-ko text-fg-muted">제휴</p>
      <h2 id="affiliate-title" className="mt-1 text-[19px] font-bold tracking-[-0.02em] text-fg">
        더 깊이 배우고 싶다면 (제휴 링크)
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">
        위의 유튜브 강의는 무료입니다. 아래는 참고용 추천이며, 강의 선정과는 별개입니다.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={it.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="block rounded-lg bg-surface-2 px-4 py-4 transition-colors duration-200 hover:bg-surface-sunken"
            >
              <span className="eyebrow-ko text-fg-muted">
                {it.label} · {it.merchant}
              </span>
              <span className="mt-1 flex items-start justify-between gap-3">
                <span className="text-[16px] font-semibold tracking-[-0.015em] text-fg">{it.title}</span>
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-fg-muted">
                  <IconArrowUpRight size={16} />
                </span>
              </span>
              <span className="mt-1 block text-[14px] leading-relaxed text-fg-muted">{it.description}</span>
              <span className="sr-only">(새 창에서 열리는 제휴 링크)</span>
            </a>
            {it.disclosure && <p className="mt-1.5 px-1 text-[12px] leading-relaxed text-fg-muted">{it.disclosure}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-relaxed text-fg-muted">{AFFILIATE_DEFAULT_DISCLOSURE}</p>
    </section>
  );
}
