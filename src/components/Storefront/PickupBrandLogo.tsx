import React from 'react';

// The store marks identify pickup providers. Only the asset filenames belong to this site.
export const PICKUP_BRANDS = {
  '7-11': { name: '7-ELEVEN', logo: 'seven-eleven' },
  familymart: { name: '全家超商', logo: 'familymart' },
  hilife: { name: '萊爾富', logo: 'hilife' },
  okmart: { name: 'OK 超商', logo: 'okmart' },
} as const;

export type PickupBrand = keyof typeof PICKUP_BRANDS;

export function PickupBrandLogo({ brand }: { brand: PickupBrand }) {
  const { logo } = PICKUP_BRANDS[brand];
  return (
    <span className="flex h-9 w-[4.1rem] shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-1.5" aria-hidden="true">
      <img src={`/images/pickup/${logo}.webp`} alt="" width={60} height={28} className="h-7 w-full object-contain" />
    </span>
  );
}
