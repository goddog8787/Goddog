import React, { useState } from 'react';
import { 
  Globe, 
  Download, 
  Server, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  ArrowRight,
  Code2,
  Cpu,
  Key
} from 'lucide-react';

export const ExportGuideView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const VERCEL_JSON = `{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const DOCKERFILE = `# 使用 Node.js 20 官方輕量映像檔
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./

EXPOSE 3000
CMD ["npm", "start"]`;

  const NGINX_CONF = `server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  const ENV_PROD = `# 正式營運環境變數配置
NODE_ENV=production
PORT=3000

# Google Gemini API 金鑰 (用於 3D 切片 AI 顧問與 CRO 智慧分析)
GEMINI_API_KEY=AIzaSy...你的正式API金鑰

# 綠界金流正式特店金鑰 (向綠界科技申請正式審核後取得)
ECPAY_MERCHANT_ID=你的正式特店代號
ECPAY_HASH_KEY=你的正式HashKey
ECPAY_HASH_IV=你的正式HashIV

# LINE Pay 正式特店金鑰 (LINE Pay Merchant Portal 取得)
LINEPAY_CHANNEL_ID=你的ChannelID
LINEPAY_CHANNEL_SECRET=你的ChannelSecret`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Globe className="w-3.5 h-3.5" />
            <span>自訂網域上線與獨立商城部署教學</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            如何將神狗勾耗材商城導出並綁定自己的網域？
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            您已經擁有自己的專屬網域（Domain），只要依循以下標準 5 步驟，即可將本專案原始碼完整下載，部署至全球高速伺服器，自動取得 HTTPS 綠色安全鎖頭，打造屬於您自己的 3D 列印獨立品牌旗艦官網！
          </p>
        </div>
      </div>

      {/* 5-Step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Step 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono font-black text-sm">
              01
            </div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              導出專案原始碼
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              點擊右上角 Settings（設定選單）選擇：
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Export to GitHub</strong>（最推薦，一鍵推送到自己的 GitHub 倉庫）
              </li>
              <li>
                <strong>Download ZIP</strong>（直接下載完整代碼壓縮包）
              </li>
            </ul>
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-mono">
              包含完整的 React 18 前端、Tailwind CSS、Express 伺服器與套件相依性
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-black text-sm">
              02
            </div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              選擇主機託管平台
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              將代碼導入現代託管平台（皆提供免費層級）：
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900">Vercel (最推薦首選)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  自動與 GitHub 連動，支援自訂網域、全自動免費 SSL、全球 Edge CDN
                </p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-900">Cloud Run / Railway / Render</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  支援全功能 Node.js 後端 API 與即時容器部署
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono font-black text-sm">
              03
            </div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              綁定已擁有的網域 (DNS 設定)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              前往您的網域註冊商（如 GoDaddy、Namecheap、Cloudflare、HiNet），新增 DNS 紀錄：
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-mono space-y-1 text-slate-700">
              <div>
                <strong>CNAME 紀錄</strong> (若用 shop.yourdomain.com):
              </div>
              <div className="text-indigo-600">名稱: shop ➔ 目標: cname.vercel-dns.com</div>
              <div className="pt-1">
                <strong>A 紀錄</strong> (若用根網域 yourdomain.com):
              </div>
              <div className="text-indigo-600">名稱: @ ➔ 數值: 76.76.21.21</div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-mono font-black text-sm">
              04
            </div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              自動核發 HTTPS 安全鎖頭
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              DNS 指向生效後（通常約 5~15 分鐘），主機平台會<strong>自動向 Let's Encrypt 申請 SSL 憑證</strong>。
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>永久自動免費更新 SSL，訪客瀏覽完全免受瀏覽器安全警告！</span>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 lg:col-span-2">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-mono font-black text-sm">
              05
            </div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <Key className="w-4 h-4 text-purple-600" />
              設定線上金流與正式環境變數
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              在託管平台（例如 Vercel 的 Settings ➔ Environment Variables）中設定正式環境金鑰，即可開始在自己的網域上真正對外營運、接單收款：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800">GEMINI_API_KEY</span>
                <div className="text-[11px] text-slate-500">
                  前往 Google AI Studio 申請個人正式 API Key
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800">ECPAY_MERCHANT_ID / HASH</span>
                <div className="text-[11px] text-slate-500">
                  綠界科技廠商後台審核通過之正式特店資料
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Generators */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              自建獨立站設定檔 (一鍵複製)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              若需要客製化伺服器或自備 VPS / Docker 部署，可直接複製以下配置檔放入專案根目錄
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Vercel rewrite config */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-[11px]">vercel.json (SPA 單頁路由重寫)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(VERCEL_JSON, 'vercel')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'vercel' ? '已複製！' : '複製代碼'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-indigo-300 leading-relaxed">
              {VERCEL_JSON}
            </pre>
          </div>

          {/* Dockerfile */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-[11px]">Dockerfile (標準容器構建檔)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(DOCKERFILE, 'docker')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'docker' ? '已複製！' : '複製代碼'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-emerald-300 leading-relaxed max-h-48">
              {DOCKERFILE}
            </pre>
          </div>

          {/* Nginx Conf */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-[11px]">nginx.conf (自有 VPS 反向代理)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(NGINX_CONF, 'nginx')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'nginx' ? '已複製！' : '複製代碼'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-amber-300 leading-relaxed max-h-48">
              {NGINX_CONF}
            </pre>
          </div>

          {/* .env.production */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-[11px]">.env.production (正式金流與環境變數)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(ENV_PROD, 'env')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'env' ? '已複製！' : '複製代碼'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-sky-300 leading-relaxed max-h-48">
              {ENV_PROD}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
