import { StoreAnnouncementConfig } from '../types';

export const STORE_ANNOUNCEMENT_KEY = 'printcore_store_announcement_config';

export const DEFAULT_ANNOUNCEMENT_CONFIG: StoreAnnouncementConfig = {
  isEnabled: true,
  text: '🚀 全館狂歡！全家/7-11 超商滿 NT$999 免運，工作日 15:00 前下單當日急速出貨！加入會員即贈 100 點紅利。',
  type: 'promotion',
  linkUrl: '#storefront-product-grid',
  storeStatus: 'open',
  statusNotice: '全線耗材每日出貨正常進行中。',
  contactLineId: '@printcore3d',
  contactEmail: 'support@goddog.space',
  contactPhone: '02-2788-9918',
  storeAddress: '台北市南港區軟體園區二期創客研發中心 B 棟 4F',
  businessHours: '週一至週五 09:30 - 18:30 (國定假日除外)',
  taxIdNumber: '91823746',
  taxCompanyName: '神狗勾數位科技股份有限公司',
  updatedAt: new Date().toISOString(),
};

export function getStoreAnnouncementConfig(): StoreAnnouncementConfig {
  try {
    const raw = localStorage.getItem(STORE_ANNOUNCEMENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_ANNOUNCEMENT_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Failed to parse store announcement config from localStorage:', e);
  }
  return DEFAULT_ANNOUNCEMENT_CONFIG;
}

export function saveStoreAnnouncementConfig(config: StoreAnnouncementConfig): void {
  try {
    localStorage.setItem(STORE_ANNOUNCEMENT_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('printcore_announcement_updated'));
  } catch (e) {
    console.warn('Failed to save store announcement config to localStorage:', e);
  }
}
