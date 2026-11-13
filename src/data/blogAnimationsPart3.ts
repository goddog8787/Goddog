import { BlogAnimationEntry } from './blogAnimationsPart1';

export const BLOG_ANIMATIONS_PART3: Record<number, BlogAnimationEntry> = {
  13: {
    title: '壓力提前 (Pressure Advance / K-Value) 90° 轉角流體動力模擬',
    subtitle: '調整 K 值 (0.000 → 0.060)，觀察高速加減速瞬間的噴嘴腔壓釋放與轉角鼓包消除',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .top > div:first-child { display: none; }
  .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .ctrl {
    display: flex; align-items: center; gap: 8px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 12px; border-radius: 10px; font-size: 11px;
  }
  .ctrl label { white-space: nowrap; }
  .ctrl input { width: 130px; accent-color: #38bdf8; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #38bdf8; min-width: 68px; text-align: right; white-space: nowrap; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .ctrl { width: 100%; justify-content: space-between; }
    .ctrl input { flex: 1; width: auto; min-width: 70px; }
    .stage { flex: none; height: 270px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>OrcaSlicer 壓力提前 (PA / Linear Advance) 轉角銳利度模擬</h2>
      <p>K 值過低轉角鼓包外凸；K 值過高轉角缺料破孔；近端高速機 PLA 甜蜜點約 0.025</p>
    </div>
    <div class="ctrl">
      <label>PA K 值設定</label>
      <input id="kSlider" type="range" min="0" max="0.06" step="0.005" value="0.000" />
      <span id="kVal" class="mono">K = 0.000</span>
    </div>
  </div>

  <div class="stage"><canvas id="paCanvas"></canvas></div>

  <div class="foot">
    <span id="paVerdict">轉角表現：<strong style="color:#fb7185">無 PA 補償：減速處腔壓溢出，轉角嚴重鼓包！</strong></span>
    <span id="paTarget">近端 PLA 建議：<strong>0.015 – 0.035</strong></span>
  </div>

<script>
(() => {
  const kSlider = document.getElementById('kSlider');
  const kVal = document.getElementById('kVal');
  const paVerdict = document.getElementById('paVerdict');
  const canvas = document.getElementById('paCanvas');

  let kValue = 0.0;

  kSlider.addEventListener('input', (e) => {
    kValue = Number(e.target.value);
    kVal.textContent = 'K = ' + kValue.toFixed(3);
  });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function frame(now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, w, h);

    const optK = 0.025;
    const diff = kValue - optK;

    if (kValue < 0.012) {
      paVerdict.innerHTML = '轉角表現：<strong style="color:#fb7185">K 值過低：減速段餘壓未釋放，直角鼓包外凸</strong>';
    } else if (kValue > 0.042) {
      paVerdict.innerHTML = '轉角表現：<strong style="color:#fbbf24">K 值過高：過度提前洩壓，轉角處抽空缺料斷裂</strong>';
    } else {
      paVerdict.innerHTML = '轉角表現：<strong style="color:#34d399">毫秒級流體同步！90° 轉角如刀切般銳利</strong>';
    }

    // Zone 1: Top-Down 90-degree Corner Path Rendering (stacked above oscilloscope on narrow screens)
    const isNarrow = w < 460;
    const p1 = isNarrow ? { x: 26, y: h * 0.45 } : { x: 54, y: h * 0.72 };
    const corner = isNarrow ? { x: w * 0.5, y: 24 } : { x: w * 0.36, y: h * 0.28 };
    const p2 = isNarrow ? { x: w - 26, y: h * 0.45 } : { x: w * 0.62, y: h * 0.72 };

    // Target blueprint dashed line
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(corner.x, corner.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw extruded path segments with dynamic width around corner
    const segs = 60;
    const baseLineW = isNarrow ? 10 : 13;
    for (let i = 0; i < segs; i++) {
      const t0 = i / segs;
      const t1 = (i + 1) / segs;
      const pt = (t) => t < 0.5
        ? { x: p1.x + (corner.x - p1.x) * (t * 2), y: p1.y + (corner.y - p1.y) * (t * 2) }
        : { x: corner.x + (p2.x - corner.x) * ((t - 0.5) * 2), y: corner.y + (p2.y - corner.y) * ((t - 0.5) * 2) };
      const a = pt(t0);
      const b = pt(t1);
      const tm = (t0 + t1) / 2;
      const distCorner = Math.abs(tm - 0.5);

      let width = baseLineW;
      if (distCorner < 0.16) {
        const weight = 1 - distCorner / 0.16;
        if (diff < 0) {
          width = baseLineW + Math.abs(diff) * (isNarrow ? 380 : 480) * weight;
        } else if (diff > 0.008) {
          width = Math.max(1.5, baseLineW - diff * 300 * weight);
        }
      }

      ctx.strokeStyle = diff < -0.01 && distCorner < 0.12 ? '#fb7185'
        : diff > 0.015 && distCorner < 0.12 ? '#fbbf24'
        : '#38bdf8';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Moving Nozzle Head along path
    const loopT = (now * 0.00038) % 1;
    const headPos = loopT < 0.5
      ? { x: p1.x + (corner.x - p1.x) * (loopT * 2), y: p1.y + (corner.y - p1.y) * (loopT * 2) }
      : { x: corner.x + (p2.x - corner.x) * ((loopT - 0.5) * 2), y: corner.y + (p2.y - corner.y) * ((loopT - 0.5) * 2) };

    ctx.beginPath();
    ctx.arc(headPos.x, headPos.y, isNarrow ? 8 : 10, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Zone 2: Velocity vs Extruder E-Step Curve Oscilloscope
    const gx = isNarrow ? 12 : w * 0.68;
    const gw = isNarrow ? w - 24 : w - gx - 18;
    const gy = isNarrow ? h * 0.54 : 22;
    const gh = isNarrow ? h - gy - 12 : h - 44;

    ctx.fillStyle = '#131c31';
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('進料補償波形 vs 移動速度', gx + gw / 2, gy + (isNarrow ? 16 : 20));

    // Draw velocity trapezoid (dashed)
    const cyMid = gy + gh * (isNarrow ? 0.68 : 0.62);
    const amp = gh * (isNarrow ? 0.24 : 0.28);
    ctx.beginPath();
    ctx.moveTo(gx + 12, cyMid);
    ctx.lineTo(gx + gw * 0.25, cyMid - amp);
    ctx.lineTo(gx + gw * 0.45, cyMid - amp);
    ctx.lineTo(gx + gw * 0.5, cyMid + 6);
    ctx.lineTo(gx + gw * 0.55, cyMid - amp);
    ctx.lineTo(gx + gw * 0.75, cyMid - amp);
    ctx.lineTo(gx + gw - 12, cyMid);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw PA Adjusted E-step curve
    const kGain = (kValue / 0.025) * (isNarrow ? 14 : 26);
    ctx.beginPath();
    ctx.moveTo(gx + 12, cyMid);
    ctx.lineTo(gx + gw * 0.25, cyMid - amp - kGain * 0.5);
    ctx.lineTo(gx + gw * 0.45, cyMid - amp);
    ctx.lineTo(gx + gw * 0.48, cyMid + kGain * 0.85);
    ctx.lineTo(gx + gw * 0.52, cyMid - amp - kGain * 0.75);
    ctx.lineTo(gx + gw * 0.75, cyMid - amp);
    ctx.lineTo(gx + gw - 12, cyMid);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('灰線：噴頭速度　藍線：E軸預先增減壓', gx + gw / 2, gy + gh - 8);

    requestAnimationFrame(frame);
  }
  if (window.self !== window.top) document.documentElement.classList.add('embedded');
  const reportHeight = () => {
    try {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: 'goddog-sim-height', height: h }, '*');
    } catch {}
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 80);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`
  },

  14: {
    title: '傳統柱狀支撐 vs. 有機樹狀支撐生長與一撕即落模擬',
    subtitle: '切換支撐結構、調整 Top Z 間隙 (0.05–0.35mm)，點擊測試「一撕即落」脫模潔淨度',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .top > div:first-child { display: none; }
  .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .ctrls { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
  .btn {
    padding: 6px 10px; border-radius: 8px; border: 1px solid #334155;
    background: #131c31; color: #cbd5e1; font-size: 11px; font-weight: 600; cursor: pointer;
  }
  .btn.active { background: #0d9488; border-color: #2dd4bf; color: #fff; }
  .peel-btn {
    padding: 6px 12px; border-radius: 8px; border: 1px solid #38bdf8;
    background: #0284c7; color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .sbox {
    display: flex; align-items: center; gap: 6px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 10px; border-radius: 8px; font-size: 11px;
  }
  .sbox label { white-space: nowrap; }
  .sbox input { width: 82px; accent-color: #2dd4bf; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #2dd4bf; min-width: 52px; text-align: right; white-space: nowrap; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .ctrls { width: 100%; }
    .btn, .peel-btn { flex: 1 1 46%; text-align: center; }
    .sbox { width: 100%; justify-content: space-between; order: 3; }
    .sbox input { flex: 1; width: auto; min-width: 70px; }
    .stage { flex: none; height: 240px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>有機樹狀支撐 (Tree Support) 省料與 Top Z 間隙脫模模擬</h2>
      <p>0.2mm 層高搭配 0.20–0.22mm 頂部 Z 軸間隙，達成一撕即落的無痕底面</p>
    </div>
    <div class="ctrls">
      <button id="modeBtn" class="btn active" type="button">樹狀有機支撐 (省料 60%)</button>
      <div class="sbox">
        <label>Top Z 間隙</label>
        <input id="gapSlider" type="range" min="0.05" max="0.35" step="0.01" value="0.21" />
        <span id="gapVal" class="mono">0.21mm</span>
      </div>
      <button id="peelBtn" class="peel-btn" type="button">點擊拆支撐</button>
    </div>
  </div>

  <div class="stage"><canvas id="supCanvas"></canvas></div>

  <div class="foot">
    <span id="matStat">支撐耗材用量：<strong>12.4 g (節省 62% 列印時間)</strong></span>
    <span id="surfStat">拆後底面評級：<strong style="color:#34d399">乾脆無痕・一撕即落</strong></span>
  </div>

<script>
(() => {
  const modeBtn = document.getElementById('modeBtn');
  const gapSlider = document.getElementById('gapSlider');
  const gapVal = document.getElementById('gapVal');
  const peelBtn = document.getElementById('peelBtn');
  const matStat = document.getElementById('matStat');
  const surfStat = document.getElementById('surfStat');
  const canvas = document.getElementById('supCanvas');

  let isTree = true;
  let topZ = 0.21;
  let peeled = false;
  let peelAnim = 0;

  modeBtn.addEventListener('click', () => {
    isTree = !isTree;
    peeled = false;
    peelAnim = 0;
    modeBtn.textContent = isTree ? '樹狀有機支撐 (省料 60%)' : '傳統柱狀網格支撐';
    modeBtn.classList.toggle('active', isTree);
    peelBtn.textContent = '點擊拆支撐';
  });

  gapSlider.addEventListener('input', (e) => {
    topZ = Number(e.target.value);
    gapVal.textContent = topZ.toFixed(2) + 'mm';
  });

  peelBtn.addEventListener('click', () => {
    peeled = !peeled;
    peelBtn.textContent = peeled ? '復原支撐預覽' : '點擊拆支撐';
  });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function frame(now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, w, h);

    peelAnim += ((peeled ? 1 : 0) - peelAnim) * 0.1;

    matStat.innerHTML = isTree
      ? '支撐耗材用量：<strong style="color:#34d399">12.4 g (節省 62% 時間與線材)</strong>'
      : '支撐耗材用量：<strong style="color:#fbbf24">32.8 g (大量柱狀實心廢料)</strong>';

    if (topZ < 0.13) {
      surfStat.innerHTML = '拆後底面評級：<strong style="color:#fb7185">過近焊死！拆支撐極易啃傷模型</strong>';
    } else if (topZ > 0.28) {
      surfStat.innerHTML = '拆後底面評級：<strong style="color:#fbbf24">間隙過大：懸垂底面明顯下垂拉絲</strong>';
    } else {
      surfStat.innerHTML = '拆後底面評級：<strong style="color:#34d399">黃金間隙：輕撥整株脫離，無痕潔淨</strong>';
    }

    const bedY = h - 22;
    ctx.fillStyle = '#334155';
    ctx.fillRect(16, bedY, w - 32, 8);

    // Printed Model: Arch / Figurine Overhang Arm (scaled cleanly to narrow screens)
    const cx = w * 0.5;
    const wingSpan = Math.min(95, w * 0.30);
    const trunkOff = Math.min(125, w * 0.37);
    const torsoHalf = Math.min(32, Math.max(22, w * 0.09));
    const armLeft = cx - wingSpan;
    const armRight = cx + wingSpan;
    const armBottom = h * 0.42;

    // Central torso pillar
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(cx - torsoHalf, armBottom - 36, torsoHalf * 2, bedY - armBottom + 36, 6);
    ctx.fill();

    // Left & Right Overhang Wings
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(armLeft, armBottom - 26, wingSpan * 2, 26);

    // Underside surface quality visualization
    if (topZ > 0.28) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      for (let x = armLeft + 6; x < cx - torsoHalf - 4; x += 13) {
        ctx.beginPath();
        ctx.arc(x + 6, armBottom, 5, 0, Math.PI);
        ctx.stroke();
      }
      for (let x = cx + torsoHalf + 4; x < armRight - 10; x += 13) {
        ctx.beginPath();
        ctx.arc(x + 6, armBottom, 5, 0, Math.PI);
        ctx.stroke();
      }
    } else if (peeled && topZ < 0.13) {
      ctx.fillStyle = '#fb7185';
      for (let x = armLeft + 8; x < cx - torsoHalf - 6; x += 15) ctx.fillRect(x, armBottom - 3, 7, 5);
      for (let x = cx + torsoHalf + 6; x < armRight - 10; x += 15) ctx.fillRect(x, armBottom - 3, 7, 5);
    }

    // Animated Support Structure peeling away
    const gapPx = topZ * 18;
    const supTop = armBottom + gapPx;

    ctx.save();
    const fallDrop = peelAnim * 110;
    const fallRot = peelAnim * 0.35;
    ctx.globalAlpha = Math.max(0.15, 1 - peelAnim * 0.85);
    ctx.translate(0, fallDrop);

    if (isTree) {
      [-1, 1].forEach((dir) => {
        ctx.save();
        const trunkX = cx + dir * trunkOff;
        const elbowX = cx + dir * wingSpan * 0.71;
        ctx.translate(trunkX, bedY);
        ctx.rotate(dir * fallRot);
        ctx.translate(-trunkX, -bedY);

        ctx.strokeStyle = '#2dd4bf';
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.min(14, Math.max(9, w * 0.035));
        ctx.beginPath();
        ctx.moveTo(trunkX, bedY);
        ctx.quadraticCurveTo(trunkX - dir * 16, (bedY + supTop) * 0.55, elbowX, supTop + 18);
        ctx.stroke();

        // Secondary branches splitting up to contact pads
        ctx.lineWidth = Math.min(6, Math.max(4, w * 0.015));
        [0.50, 0.74, 0.94].forEach((ratio) => {
          ctx.beginPath();
          ctx.moveTo(elbowX, supTop + 18);
          ctx.lineTo(cx + dir * wingSpan * ratio, supTop + 4);
          ctx.stroke();
        });

        // Concentric top interface pad
        const padW = Math.max(26, wingSpan * 0.54);
        const padX = dir > 0 ? cx + wingSpan * 0.42 : cx - wingSpan * 0.42 - padW;
        ctx.fillStyle = '#5eead4';
        ctx.fillRect(padX, supTop, padW, 4);
        ctx.restore();
      });
    } else {
      // Traditional bulky grid columns directly underneath wings
      [-1, 1].forEach((dir) => {
        const bw = Math.max(28, wingSpan - torsoHalf - 8);
        const bx = dir > 0 ? cx + torsoHalf + 4 : armLeft + 4;
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(bx, supTop, bw, bedY - supTop);
        ctx.strokeRect(bx, supTop, bw, bedY - supTop);
        for (let gx = bx + 10; gx < bx + bw; gx += 10) {
          ctx.beginPath();
          ctx.moveTo(gx, supTop);
          ctx.lineTo(gx, bedY);
          ctx.stroke();
        }
      });
    }
    ctx.restore();

    // Gap callout
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Top Z Gap = ' + topZ.toFixed(2) + ' mm', cx, armBottom - 36);

    requestAnimationFrame(frame);
  }
  if (window.self !== window.top) document.documentElement.classList.add('embedded');
  const reportHeight = () => {
    try {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: 'goddog-sim-height', height: h }, '*');
    } catch {}
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 80);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`
  },

  15: {
    title: '外壁圈數 (Walls) vs. 填充率 (Infill) 三點彎曲液壓試驗機',
    subtitle: '點擊啟動液壓負重測試，驗證「5 圈外壁 + 25% 陀螺儀」為何比「2 圈外壁 + 80% 填充」強韌兩倍',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .top > div:first-child { display: none; }
  .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .press-btn {
    border: 1px solid #38bdf8; background: #0284c7; color: #fff;
    padding: 7px 14px; border-radius: 9px; font-size: 12px; font-weight: 700; cursor: pointer;
  }
  .press-btn:active { transform: scale(0.97); }
  .grid { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 14px;
    padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; overflow: hidden;
  }
  .chead { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; font-size: 12px; font-weight: 700; }
  canvas { flex: 1; min-height: 0; width: 100%; height: 100%; display: block; }
  .cfoot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .mono { font-family: ui-monospace, monospace; font-weight: 700; white-space: nowrap; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .press-btn { width: 100%; }
    .grid { flex: none; grid-template-columns: 1fr; gap: 10px; }
    .card { min-height: 185px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>三點彎曲材料力學試驗機：外壁圈數 vs. 內部填充率</h2>
      <p>依據慣性矩原理，最外層壁面承受主要拉壓應力；陀螺儀 (Gyroid) 提供均勻各向同性支撐</p>
    </div>
    <button id="testBtn" class="press-btn" type="button">啟動液壓負重試驗 (0 → 65 kgf)</button>
  </div>

  <div class="grid">
    <div class="card">
      <div class="chead">
        <span style="color:#fbbf24">樣品 A：2 圈外壁 + 80% 網格</span>
        <span id="loadA" class="mono" style="color:#fb7185">0.0 kgf</span>
      </div>
      <canvas id="cA"></canvas>
      <div class="cfoot">
        <span>耗材消耗：48 g (高耗時)</span>
        <span id="statA" class="mono">破壞極限：28 kgf</span>
      </div>
    </div>

    <div class="card">
      <div class="chead">
        <span style="color:#38bdf8">樣品 B：5 圈外壁 + 25% 陀螺儀</span>
        <span id="loadB" class="mono" style="color:#34d399">0.0 kgf</span>
      </div>
      <canvas id="cB"></canvas>
      <div class="cfoot">
        <span>耗材消耗：29 g (省料 40%)</span>
        <span id="statB" class="mono">承受極限：62 kgf</span>
      </div>
    </div>
  </div>

<script>
(() => {
  const testBtn = document.getElementById('testBtn');
  const cA = document.getElementById('cA');
  const cB = document.getElementById('cB');
  const loadA = document.getElementById('loadA');
  const loadB = document.getElementById('loadB');
  const statA = document.getElementById('statA');
  const statB = document.getElementById('statB');

  let testStart = -1;
  let currentKgf = 0;

  testBtn.addEventListener('click', () => {
    testStart = performance.now();
  });

  function resize(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  const onResize = () => { resize(cA); resize(cB); };
  window.addEventListener('resize', onResize);
  onResize();

  function drawRig(canvas, isStrong, kgf) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const barW = Math.min(w - 50, 240);
    const leftX = cx - barW / 2;
    const rightX = cx + barW / 2;
    const baseY = h * 0.66;

    // Two support anvils underneath
    ctx.fillStyle = '#475569';
    [leftX + 18, rightX - 18].forEach((ax) => {
      ctx.beginPath();
      ctx.moveTo(ax - 10, baseY + 26);
      ctx.lineTo(ax + 10, baseY + 26);
      ctx.lineTo(ax, baseY + 6);
      ctx.closePath();
      ctx.fill();
    });

    const broken = !isStrong && kgf >= 28;
    const flex = broken ? 24 : (kgf / (isStrong ? 62 : 28)) * 16;

    // Upper hydraulic ram
    const ramY = baseY - 22 + flex * 0.7;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 8, 8, 16, Math.max(10, ramY - 14));
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(cx - 10, ramY - 14);
    ctx.lineTo(cx + 10, ramY - 14);
    ctx.lineTo(cx, ramY);
    ctx.closePath();
    ctx.fill();

    // Test Specimen Bar with FEA stress color & wall/infill interior view
    if (broken) {
      // Snapped two halves
      ctx.save();
      ctx.translate(leftX, baseY);
      ctx.rotate(0.24);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(0, -18, barW * 0.48, 22);
      ctx.restore();

      ctx.save();
      ctx.translate(rightX, baseY);
      ctx.rotate(-0.24);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-barW * 0.48, -18, barW * 0.48, 22);
      ctx.restore();
    } else {
      const stressRatio = Math.min(1, kgf / (isStrong ? 62 : 28));
      // Draw specimen curving slightly
      ctx.beginPath();
      ctx.moveTo(leftX, baseY - 18);
      ctx.quadraticCurveTo(cx, baseY - 18 + flex, rightX, baseY - 18);
      ctx.lineTo(rightX, baseY + 6);
      ctx.quadraticCurveTo(cx, baseY + 6 + flex, leftX, baseY + 6);
      ctx.closePath();

      const grad = ctx.createLinearGradient(leftX, 0, rightX, 0);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, stressRatio > 0.75 ? '#ef4444' : stressRatio > 0.4 ? '#f59e0b' : (isStrong ? '#0284c7' : '#6366f1'));
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fill();

      // Wall thickness outline
      ctx.strokeStyle = isStrong ? '#38bdf8' : '#a5b4fc';
      ctx.lineWidth = isStrong ? 5.5 : 2;
      ctx.stroke();

      // Interior pattern hint (Gyroid wave vs dense grid)
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1;
      if (isStrong) {
        ctx.beginPath();
        for (let x = leftX + 10; x < rightX - 10; x += 6) {
          const yOff = Math.sin(x * 0.16) * 5;
          const bOff = Math.sin(((x - leftX) / barW) * Math.PI) * flex * 0.5;
          if (x === leftX + 10) ctx.moveTo(x, baseY - 6 + yOff + bOff);
          else ctx.lineTo(x, baseY - 6 + yOff + bOff);
        }
        ctx.stroke();
      } else {
        for (let x = leftX + 12; x < rightX - 12; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, baseY - 15);
          ctx.lineTo(x + 6, baseY + 3);
          ctx.stroke();
        }
      }
    }
  }

  function frame(now) {
    if (testStart > 0) {
      const p = Math.min(1, (now - testStart) / 3000);
      currentKgf = p * 62;
    }

    const kgA = Math.min(28, currentKgf);
    const kgB = Math.min(62, currentKgf);

    loadA.textContent = kgA.toFixed(1) + ' kgf';
    loadB.textContent = kgB.toFixed(1) + ' kgf';

    if (currentKgf >= 28) {
      statA.textContent = '28.0 kgf 外壁撕裂斷裂！';
      statA.style.color = '#fb7185';
    } else {
      statA.textContent = '破壞極限：28 kgf';
      statA.style.color = '#94a3b8';
    }

    if (currentKgf >= 60) {
      statB.textContent = '62.0 kgf 穩固支撐通過！';
      statB.style.color = '#34d399';
    } else {
      statB.textContent = '承受極限：62 kgf';
      statB.style.color = '#94a3b8';
    }

    drawRig(cA, false, currentKgf);
    drawRig(cB, true, currentKgf);

    requestAnimationFrame(frame);
  }
  if (window.self !== window.top) document.documentElement.classList.add('embedded');
  const reportHeight = () => {
    try {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: 'goddog-sim-height', height: h }, '*');
    } catch {}
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 80);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`
  },

  16: {
    title: 'PLA 退火 (Annealing) 球晶重組微結構與 95°C 沸水耐熱實驗',
    subtitle: '拖動退火工藝進度 (0 → 45 分鐘)，觀察非定型分子鏈轉化為緻密球晶並承受滾燙沸水考驗',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .top > div:first-child { display: none; }
  .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .ctrl {
    display: flex; align-items: center; gap: 8px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 12px; border-radius: 10px; font-size: 11px;
  }
  .ctrl label { white-space: nowrap; }
  .ctrl input { width: 120px; accent-color: #f97316; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #fb923c; white-space: nowrap; }
  .grid { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .panel {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 14px;
    padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; overflow: hidden;
  }
  .phead { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; font-size: 12px; font-weight: 700; }
  canvas { flex: 1; min-height: 0; width: 100%; height: 100%; display: block; }
  .pfoot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .ctrl { width: 100%; justify-content: space-between; }
    .ctrl input { flex: 1; width: auto; min-width: 70px; }
    .grid { flex: none; grid-template-columns: 1fr; gap: 10px; }
    .panel { min-height: 185px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>PLA 恆溫 95°C 退火結晶與沸水耐熱對比實驗</h2>
      <p>利用「細砂/食鹽支撐退火」，讓分子鏈重組為 48% 高結晶球晶結構，耐熱突破 100°C</p>
    </div>
    <div class="ctrl">
      <label>退火保溫時長</label>
      <input id="minSlider" type="range" min="0" max="45" step="5" value="0" />
      <span id="minVal" class="mono">0 分鐘 (未退火)</span>
    </div>
  </div>

  <div class="grid">
    <div class="panel">
      <div class="phead">
        <span style="color:#38bdf8">高分子微結構 (電子顯微鏡視角)</span>
        <span id="crystLbl" class="mono" style="color:#fbbf24">結晶度：9%</span>
      </div>
      <canvas id="cMicro"></canvas>
      <div class="pfoot">
        <span id="microStat">狀態：無定型混亂冷凍分子鏈</span>
        <span id="shrinkLbl">尺寸補償：X/Y 0.0%</span>
      </div>
    </div>

    <div class="panel">
      <div class="phead">
        <span style="color:#fb923c">95°C 沸水浸沒實測槽</span>
        <span id="hdtLbl" class="mono" style="color:#fb7185">HDT 耐熱：58°C</span>
      </div>
      <canvas id="cBoil"></canvas>
      <div class="pfoot">
        <span id="boilStat">結果：遇到熱水瞬間軟化塌陷</span>
        <span>層間熔合強度：+0%</span>
      </div>
    </div>
  </div>

<script>
(() => {
  const minSlider = document.getElementById('minSlider');
  const minVal = document.getElementById('minVal');
  const crystLbl = document.getElementById('crystLbl');
  const microStat = document.getElementById('microStat');
  const shrinkLbl = document.getElementById('shrinkLbl');
  const hdtLbl = document.getElementById('hdtLbl');
  const boilStat = document.getElementById('boilStat');
  const cMicro = document.getElementById('cMicro');
  const cBoil = document.getElementById('cBoil');

  let mins = 0;

  minSlider.addEventListener('input', (e) => {
    mins = Number(e.target.value);
    minVal.textContent = mins === 0 ? '0 分鐘 (未退火)' : mins + ' 分鐘 (95°C 退火)';
  });

  const chains = Array.from({ length: 18 }, (_, i) => ({
    x: (i % 6) / 5,
    y: Math.floor(i / 6) / 2,
    phase: Math.random() * 6
  }));

  const bubbles = Array.from({ length: 14 }, () => ({
    x: 0.25 + Math.random() * 0.5,
    y: Math.random(),
    spd: 0.4 + Math.random() * 0.6
  }));

  function resize(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  const onResize = () => { resize(cMicro); resize(cBoil); };
  window.addEventListener('resize', onResize);
  onResize();

  function frame(now) {
    const progress = mins / 45;
    const cryst = Math.round(9 + progress * 39);
    const hdt = Math.round(58 + progress * 44);

    crystLbl.textContent = '結晶度：' + cryst + '%';
    crystLbl.style.color = cryst > 35 ? '#34d399' : '#fbbf24';
    hdtLbl.textContent = 'HDT 耐熱：' + hdt + '°C';
    hdtLbl.style.color = hdt >= 95 ? '#34d399' : '#fb7185';
    shrinkLbl.textContent = 'X/Y 收縮：-' + (progress * 1.8).toFixed(1) + '% ｜ Z +' + (progress * 1.0).toFixed(1) + '%';

    microStat.textContent = progress > 0.65 ? '狀態：緻密球晶交聯 (Spherulites)' : progress > 0.2 ? '狀態：高分子重新摺疊結晶中' : '狀態：急冷無定型混亂鏈';
    boilStat.textContent = hdt >= 95 ? '結果：沸水測試堅挺不變形！' : '結果：遇熱軟化彎曲變形';

    // 1. Micro crystal view
    const ctxM = cMicro.getContext('2d');
    const wm = cMicro.clientWidth;
    const hm = cMicro.clientHeight;
    if (wm && hm) {
      ctxM.clearRect(0, 0, wm, hm);
      chains.forEach((ch, idx) => {
        const cx = 36 + ch.x * (wm - 72);
        const cy = 36 + ch.y * (hm - 72);
        ctxM.save();
        ctxM.translate(cx, cy);
        if (progress > 0.25) {
          // Draw ordered radiating spherulite crystal rosette
          const rays = 8;
          const rad = 10 + progress * 12;
          ctxM.strokeStyle = 'rgba(56, 189, 248, ' + (0.3 + progress * 0.7) + ')';
          ctxM.lineWidth = 2;
          for (let r = 0; r < rays; r++) {
            const ang = (r / rays) * Math.PI * 2 + now * 0.0004;
            ctxM.beginPath();
            ctxM.moveTo(0, 0);
            ctxM.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
            ctxM.stroke();
          }
          ctxM.beginPath();
          ctxM.arc(0, 0, rad * 0.9, 0, Math.PI * 2);
          ctxM.strokeStyle = 'rgba(52, 211, 153, ' + (progress * 0.65) + ')';
          ctxM.lineWidth = 1.2;
          ctxM.stroke();
        }
        // Loose spaghetti tangle fades out as crystallinity rises
        if (progress < 0.85) {
          ctxM.strokeStyle = 'rgba(165, 180, 252, ' + (1 - progress * 0.85) + ')';
          ctxM.lineWidth = 2;
          ctxM.beginPath();
          for (let t = 0; t < 16; t++) {
            const sx = Math.sin(t * 0.9 + ch.phase + now * 0.002) * 14;
            const sy = Math.cos(t * 1.1 + idx) * 12;
            if (t === 0) ctxM.moveTo(sx, sy);
            else ctxM.lineTo(sx, sy);
          }
          ctxM.stroke();
        }
        ctxM.restore();
      });
    }

    // 2. Boiling 95°C Water Tank
    const ctxB = cBoil.getContext('2d');
    const wb = cBoil.clientWidth;
    const hb = cBoil.clientHeight;
    if (wb && hb) {
      ctxB.clearRect(0, 0, wb, hb);
      const tankX = 28;
      const tankW = wb - 56;
      const tankTop = 26;
      const tankBot = hb - 16;

      // Water body
      const waterGrad = ctxB.createLinearGradient(0, tankTop, 0, tankBot);
      waterGrad.addColorStop(0, 'rgba(249, 115, 22, 0.18)');
      waterGrad.addColorStop(1, 'rgba(220, 38, 38, 0.32)');
      ctxB.fillStyle = waterGrad;
      ctxB.fillRect(tankX, tankTop + 14, tankW, tankBot - tankTop - 14);
      ctxB.strokeStyle = '#64748b';
      ctxB.lineWidth = 2;
      ctxB.strokeRect(tankX, tankTop, tankW, tankBot - tankTop);

      // PLA Bracket inside boiling water
      const meltSag = (1 - progress) * 28;
      const bx = wb * 0.5 - 48;
      const by = tankBot - 22;
      ctxB.fillStyle = progress > 0.7 ? '#34d399' : '#818cf8';
      ctxB.beginPath();
      ctxB.moveTo(bx, by);
      ctxB.lineTo(bx + 18, by - 58 + meltSag * 0.8);
      ctxB.lineTo(bx + 82, by - 58 + meltSag * 1.1);
      ctxB.lineTo(bx + 96, by);
      ctxB.lineTo(bx + 76, by);
      ctxB.lineTo(bx + 68, by - 42 + meltSag * 0.8);
      ctxB.lineTo(bx + 26, by - 42 + meltSag * 0.6);
      ctxB.lineTo(bx + 18, by);
      ctxB.closePath();
      ctxB.fill();

      // Boiling bubbles
      bubbles.forEach((b) => {
        const bp = ((now * 0.0007 * b.spd + b.y) % 1);
        const px = tankX + b.x * tankW + Math.sin(bp * 8) * 3;
        const py = tankBot - 8 - bp * (tankBot - tankTop - 26);
        ctxB.beginPath();
        ctxB.arc(px, py, 2.5, 0, Math.PI * 2);
        ctxB.strokeStyle = 'rgba(255, 255, 255, ' + (1 - bp) * 0.7 + ')';
        ctxB.stroke();
      });

      ctxB.fillStyle = '#fca5a5';
      ctxB.font = 'bold 11px monospace';
      ctxB.textAlign = 'center';
      ctxB.fillText('95°C 滾燙熱水試驗', wb * 0.5, tankTop + 10);
    }

    requestAnimationFrame(frame);
  }
  if (window.self !== window.top) document.documentElement.classList.add('embedded');
  const reportHeight = () => {
    try {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: 'goddog-sim-height', height: h }, '*');
    } catch {}
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 80);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`
  },

  17: {
    title: '雙軸光學雷射測徑儀與 πr² 體積出料誤差即時監測台',
    subtitle: '切換「市售雜牌 ±0.08mm」與「神狗勾嚴選 ±0.02mm」，直擊截面積平方放大造成的出料劇烈波動',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .top > div:first-child { display: none; }
  .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn {
    padding: 6px 12px; border-radius: 9px; border: 1px solid #334155;
    background: #131c31; color: #cbd5e1; font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .btn.active-good { background: #0284c7; border-color: #38bdf8; color: #fff; }
  .btn.active-bad { background: #be123c; border-color: #fb7185; color: #fff; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .btns { width: 100%; }
    .btn { flex: 1 1 46%; text-align: center; }
    .stage { flex: none; height: 240px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>1000Hz 雙軸光學雷射測徑儀：為何 ±0.02mm 是生死線？</h2>
      <p>截面積 A = π × r²，直徑僅膨脹 +0.08mm 就造成體積流量瞬間暴增近 +10%</p>
    </div>
    <div class="btns">
      <button id="badBtn" class="btn" type="button">市售雜牌 (±0.08mm)</button>
      <button id="goodBtn" class="btn active-good" type="button">神狗勾嚴選 (±0.02mm)</button>
    </div>
  </div>

  <div class="stage"><canvas id="lasCanvas"></canvas></div>

  <div class="foot">
    <span id="diaRead">即時雷射實測線徑：<strong>1.751 mm</strong></span>
    <span id="areaErr">截面積流量誤差：<strong style="color:#34d399">+0.1% (微米級穩定)</strong></span>
  </div>

<script>
(() => {
  const badBtn = document.getElementById('badBtn');
  const goodBtn = document.getElementById('goodBtn');
  const diaRead = document.getElementById('diaRead');
  const areaErr = document.getElementById('areaErr');
  const canvas = document.getElementById('lasCanvas');

  let isGood = true;
  const waveHistory = Array.from({ length: 120 }, () => 1.75);

  badBtn.addEventListener('click', () => {
    isGood = false;
    badBtn.className = 'btn active-bad';
    goodBtn.className = 'btn';
  });
  goodBtn.addEventListener('click', () => {
    isGood = true;
    goodBtn.className = 'btn active-good';
    badBtn.className = 'btn';
  });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function frame(now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, w, h);

    // Sample diameter waveform
    const t = now * 0.005;
    const delta = isGood
      ? Math.sin(t * 1.4) * 0.009 + Math.cos(t * 2.1) * 0.006
      : Math.sin(t * 0.9) * 0.058 + Math.sin(t * 2.3) * 0.025;
    const curDia = 1.75 + delta;
    waveHistory.shift();
    waveHistory.push(curDia);

    const errPct = ((Math.pow(curDia / 1.75, 2) - 1) * 100);
    const alarm = Math.abs(curDia - 1.75) > 0.025;

    diaRead.innerHTML = '即時雷射實測線徑：<strong style="color:' + (alarm ? '#fb7185' : '#38bdf8') + '">' + curDia.toFixed(3) + ' mm</strong>';
    areaErr.innerHTML = 'πr² 體積出料誤差：<strong style="color:' + (alarm ? '#fb7185' : '#34d399') + '">' + (errPct >= 0 ? '+' : '') + errPct.toFixed(1) + '% ' + (alarm ? '(層紋波動/堵料風險！)' : '(±0.02mm 精密合格)') + '</strong>';

    // Top half: Moving Filament Strand passing through X-Y Laser Micrometer Gate
    const strandY = h * 0.30;
    const laserX = w * 0.36;

    // Laser emitter housing
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.fillRect(laserX - 28, 12, 56, 22);
    ctx.fillRect(laserX - 28, strandY + 26, 56, 20);

    // Red Laser fan beam
    ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.beginPath();
    ctx.moveTo(laserX - 18, 34);
    ctx.lineTo(laserX + 18, 34);
    ctx.lineTo(laserX + 18, strandY + 26);
    ctx.lineTo(laserX - 18, strandY + 26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(laserX, 34);
    ctx.lineTo(laserX, strandY + 26);
    ctx.stroke();

    // Draw moving filament profile matching waveHistory
    ctx.beginPath();
    for (let i = 0; i < waveHistory.length; i++) {
      const x = (i / (waveHistory.length - 1)) * w;
      const halfThick = 11 + (waveHistory[i] - 1.75) * 95;
      if (i === 0) ctx.moveTo(x, strandY - halfThick);
      else ctx.lineTo(x, strandY - halfThick);
    }
    for (let i = waveHistory.length - 1; i >= 0; i--) {
      const x = (i / (waveHistory.length - 1)) * w;
      const halfThick = 11 + (waveHistory[i] - 1.75) * 95;
      ctx.lineTo(x, strandY + halfThick);
    }
    ctx.closePath();
    ctx.fillStyle = isGood ? '#38bdf8' : '#f43f5e';
    ctx.fill();

    // Bottom half: Oscilloscope Tolerance Chart
    const isNarrow = w < 440;
    const gx = isNarrow ? 12 : 24;
    const gy = h * 0.54;
    const gw = w - gx * 2;
    const gh = h - gy - 14;

    ctx.fillStyle = '#131c31';
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 10);
    ctx.fill();
    ctx.stroke();

    // ±0.02mm tolerance band
    const midY = gy + gh / 2;
    const bandHalf = gh * 0.18;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.fillRect(gx, midY - bandHalf, gw, bandHalf * 2);

    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, midY - bandHalf);
    ctx.lineTo(gx + gw, midY - bandHalf);
    ctx.moveTo(gx, midY + bandHalf);
    ctx.lineTo(gx + gw, midY + bandHalf);
    ctx.stroke();
    ctx.setLineDash([]);

    // Waveform
    ctx.beginPath();
    for (let i = 0; i < waveHistory.length; i++) {
      const px = gx + 6 + (i / (waveHistory.length - 1)) * (gw - 12);
      const py = midY - (waveHistory[i] - 1.75) * (gh * 4.5);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = isGood ? '#38bdf8' : '#fb7185';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('+0.02mm 上限', gx + 8, midY - bandHalf - 4);
    ctx.fillText('-0.02mm 下限', gx + 8, midY + bandHalf + 11);

    requestAnimationFrame(frame);
  }
  if (window.self !== window.top) document.documentElement.classList.add('embedded');
  const reportHeight = () => {
    try {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: 'goddog-sim-height', height: h }, '*');
    } catch {}
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 80);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`
  },

  18: {
    title: 'PLA 工業堆肥 (62°C 嗜熱菌) vs. 一般土壤降解與空盤再生循環鏈',
    subtitle: '拖動時間軸 (第 0 天 → 第 90 天)，看清 PLA 生物降解科學真相與神狗勾空盤循環系統',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .top > div:first-child { display: none; }
  .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .ctrl {
    display: flex; align-items: center; gap: 8px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 12px; border-radius: 10px; font-size: 11px;
  }
  .ctrl label { white-space: nowrap; }
  .ctrl input { width: 130px; accent-color: #10b981; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #34d399; min-width: 58px; text-align: right; white-space: nowrap; }
  .grid { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .panel {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 14px;
    padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; overflow: hidden;
  }
  .phead { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; font-size: 12px; font-weight: 700; }
  canvas { flex: 1; min-height: 0; width: 100%; height: 100%; display: block; }
  .pfoot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 8px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .ctrl { width: 100%; justify-content: space-between; }
    .ctrl input { flex: 1; width: auto; min-width: 70px; }
    .grid { flex: none; grid-template-columns: 1fr; gap: 10px; }
    .panel { min-height: 185px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>PLA 生物降解科學真相對比 & 神狗勾空盤循環系統</h2>
      <p>PLA 需在 60°C + 90% RH 工業堆肥槽才能 90 天分解；常溫土壤幾乎不會分解，應落實空盤回收！</p>
    </div>
    <div class="ctrl">
      <label>經過天數</label>
      <input id="daySlider" type="range" min="0" max="90" step="1" value="45" />
      <span id="dayVal" class="mono">第 45 天</span>
    </div>
  </div>

  <div class="grid">
    <div class="panel">
      <div class="phead">
        <span style="color:#fbbf24">一般花園土壤 (25°C 常溫)</span>
        <span id="soilPct" class="mono" style="color:#fb7185">剩餘完整度：99%</span>
      </div>
      <canvas id="cSoil"></canvas>
      <div class="pfoot">
        <span>缺少嗜熱菌與水解高溫</span>
        <span>估算完全分解：數百年</span>
      </div>
    </div>

    <div class="panel">
      <div class="phead">
        <span style="color:#34d399">工業堆肥反應槽 (62°C / 90% RH)</span>
        <span id="compPct" class="mono" style="color:#34d399">剩餘完整度：50%</span>
      </div>
      <canvas id="cComp"></canvas>
      <div class="pfoot">
        <span>嗜熱微生物分解 → H₂O + CO₂</span>
        <span>第 90 天完全分解回歸自然</span>
      </div>
    </div>
  </div>

<script>
(() => {
  const daySlider = document.getElementById('daySlider');
  const dayVal = document.getElementById('dayVal');
  const soilPct = document.getElementById('soilPct');
  const compPct = document.getElementById('compPct');
  const cSoil = document.getElementById('cSoil');
  const cComp = document.getElementById('cComp');

  let days = 45;

  daySlider.addEventListener('input', (e) => {
    days = Number(e.target.value);
    dayVal.textContent = '第 ' + days + ' 天';
  });

  const microbes = Array.from({ length: 18 }, (_, i) => ({
    angle: (i / 18) * Math.PI * 2,
    dist: 24 + (i % 3) * 16,
    spd: 0.6 + Math.random() * 0.6
  }));

  function resize(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  const onResize = () => { resize(cSoil); resize(cComp); };
  window.addEventListener('resize', onResize);
  onResize();

  function frame(now) {
    const p = days / 90;
    const compIntegrity = Math.max(0, Math.round((1 - p) * 100));
    const soilIntegrity = Math.max(98, Math.round(100 - p * 1.5));

    soilPct.textContent = '剩餘完整度：' + soilIntegrity + '%';
    compPct.textContent = '剩餘完整度：' + compIntegrity + '%';

    // Soil Canvas
    const ctxS = cSoil.getContext('2d');
    const ws = cSoil.clientWidth;
    const hs = cSoil.clientHeight;
    if (ws && hs) {
      ctxS.clearRect(0, 0, ws, hs);
      // Soil layer
      ctxS.fillStyle = '#291d16';
      ctxS.fillRect(14, hs * 0.38, ws - 28, hs * 0.56);
      // Intact PLA Benchy / Gear silhouette buried in soil
      const cx = ws * 0.5;
      const cy = hs * 0.66;
      ctxS.fillStyle = '#818cf8';
      ctxS.fillRect(cx - 42, cy - 20, 84, 38);
      ctxS.fillStyle = '#a5b4fc';
      ctxS.fillRect(cx - 22, cy - 36, 44, 16);

      ctxS.fillStyle = '#94a3b8';
      ctxS.font = '11px sans-serif';
      ctxS.textAlign = 'center';
      ctxS.fillText('90 天後依舊幾乎完整保留', cx, hs * 0.24);
    }

    // Industrial Compost Canvas
    const ctxC = cComp.getContext('2d');
    const wc = cComp.clientWidth;
    const hc = cComp.clientHeight;
    if (wc && hc) {
      ctxC.clearRect(0, 0, wc, hc);
      ctxC.fillStyle = '#142b23';
      ctxC.fillRect(14, hc * 0.38, wc - 28, hc * 0.56);

      const cx = wc * 0.5;
      const cy = hc * 0.66;
      const scale = Math.max(0.05, 1 - p);

      if (compIntegrity > 2) {
        ctxC.save();
        ctxC.translate(cx, cy);
        ctxC.scale(scale, scale);
        ctxC.globalAlpha = scale;
        ctxC.fillStyle = '#2dd4bf';
        ctxC.fillRect(-42, -20, 84, 38);
        ctxC.fillRect(-22, -36, 44, 16);
        ctxC.restore();
      }

      // Thermophilic bacteria digesting polymer chains
      microbes.forEach((m, idx) => {
        const ang = m.angle + now * 0.0012 * m.spd;
        const r = m.dist * (0.4 + 0.6 * scale);
        const mx = cx + Math.cos(ang) * r;
        const my = cy + Math.sin(ang) * r * 0.6;
        ctxC.beginPath();
        ctxC.arc(mx, my, 3, 0, Math.PI * 2);
        ctxC.fillStyle = '#34d399';
        ctxC.fill();

        // Rising CO2 / H2O bubbles when decomposing
        if (p > 0.1) {
          const rise = ((now * 0.03 * m.spd + idx * 14) % 42);
          ctxC.beginPath();
          ctxC.arc(mx, cy - 22 - rise, 2, 0, Math.PI * 2);
          ctxC.fillStyle = 'rgba(186, 230, 253, ' + (1 - rise / 42) + ')';
          ctxC.fill();
        }
      });

      ctxC.fillStyle = compIntegrity === 0 ? '#34d399' : '#cbd5e1';
      ctxC.font = '11px sans-serif';
      ctxC.textAlign = 'center';
      ctxC.fillText(compIntegrity === 0 ? '已完全分解為水與二氧化碳' : '62°C 高溫水解斷鏈分解中', cx, hc * 0.24);
    }

    requestAnimationFrame(frame);
  }
  if (window.self !== window.top) document.documentElement.classList.add('embedded');
  const reportHeight = () => {
    try {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: 'goddog-sim-height', height: h }, '*');
    } catch {}
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
  setTimeout(reportHeight, 80);
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`
  }
};
