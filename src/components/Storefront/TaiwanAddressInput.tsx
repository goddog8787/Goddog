import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Check, Sparkles } from 'lucide-react';
import { TAIWAN_CITIES, CityInfo, DistrictInfo } from '../../data/taiwanDistricts';

export interface TaiwanAddressInputProps {
  value: string;
  onChange: (fullAddress: string) => void;
  memberAddress?: string;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

// Helper to decompose an address string into city, district, and street
export function parseTaiwanAddress(rawAddress: string): { city: string; district: string; street: string } {
  if (!rawAddress) return { city: '', district: '', street: '' };
  const trimmed = rawAddress.trim();

  // Try to find matching city
  for (const c of TAIWAN_CITIES) {
    if (trimmed.startsWith(c.city)) {
      const restAfterCity = trimmed.slice(c.city.length);
      for (const d of c.districts) {
        if (restAfterCity.startsWith(d.name)) {
          const street = restAfterCity.slice(d.name.length).trim();
          return { city: c.city, district: d.name, street };
        }
      }
      return { city: c.city, district: '', street: restAfterCity.trim() };
    }
  }

  return { city: '', district: '', street: trimmed };
}

export const TaiwanAddressInput: React.FC<TaiwanAddressInputProps> = ({
  value,
  onChange,
  memberAddress,
  label = '完整收件地址',
  required = true,
  className = '',
  placeholder = '請輸入街、巷、弄、門牌號碼與樓層 (例：復興南路一段100號5樓之2)',
}) => {
  const parsed = useMemo(() => parseTaiwanAddress(value), [value]);

  const [selectedCity, setSelectedCity] = useState<string>(parsed.city);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(parsed.district);
  const [streetAddress, setStreetAddress] = useState<string>(parsed.street);

  // Sync internal states when external `value` changes meaningfully from outside
  useEffect(() => {
    const p = parseTaiwanAddress(value);
    setSelectedCity(p.city);
    setSelectedDistrict(p.district);
    setStreetAddress(p.street);
  }, [value]);

  // Current city's available districts
  const currentDistricts = useMemo<DistrictInfo[]>(() => {
    if (!selectedCity) return [];
    const found = TAIWAN_CITIES.find((c) => c.city === selectedCity);
    return found ? found.districts : [];
  }, [selectedCity]);

  // Trigger change upward
  const triggerAddressChange = (city: string, district: string, street: string) => {
    const full = `${city}${district}${street}`.trim();
    onChange(full);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    setSelectedDistrict('');
    triggerAddressChange(newCity, '', streetAddress);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    triggerAddressChange(selectedCity, newDistrict, streetAddress);
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStreet = e.target.value;
    setStreetAddress(newStreet);
    triggerAddressChange(selectedCity, selectedDistrict, newStreet);
  };

  const handleUseMemberAddress = () => {
    if (!memberAddress) return;
    onChange(memberAddress);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-2">
          {memberAddress && memberAddress.trim() !== value.trim() && (
            <button
              type="button"
              onClick={handleUseMemberAddress}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>帶入會員地址</span>
            </button>
          )}
          {required && (
            <span className="text-[10px] text-rose-500 font-medium">* 必填 (請含門牌與樓層)</span>
          )}
        </div>
      </div>

      {/* City and District Dropdowns */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
            縣市 (必選)
          </label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="">-- 請選擇縣市 --</option>
            {TAIWAN_CITIES.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.region})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
            鄉鎮市區 (必選)
          </label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedCity || currentDistricts.length === 0}
            className="w-full px-2.5 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">
              {!selectedCity ? '請先選縣市' : '-- 請選擇鄉鎮市區 --'}
            </option>
            {currentDistricts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.zip} {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Street Address Input */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
          路名街巷、門牌號碼、樓層/室
        </label>
        <input
          type="text"
          value={streetAddress}
          onChange={handleStreetChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      {/* Live Address Preview Pill */}
      {value.trim() && (
        <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 shrink-0">配送完整地址：</span>
            <span className="font-bold text-slate-900 dark:text-white truncate">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
};
