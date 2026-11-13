import { BlogAnimationEntry } from './blogAnimationsPart1';

export const BLOG_ANIMATIONS_PART2: Record<number, BlogAnimationEntry> = {
  7: {
    title: 'TPU 彈性軟料進料屈曲 (Buckling) 與近端擠出模擬',
    subtitle: '切換近端 Direct Drive 與遠端 Bowden 結構，觀察 95A/83A 硬度在高速推進下的防卡極限',
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
  .controls { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
  .btn {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #334155;
    background: #131c31;
    color: #cbd5e1;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn.active { background: #0284c7; border-color: #38bdf8; color: #fff; }
  .slider-wrap {
    display: flex; align-items: center; gap: 6px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 10px; border-radius: 8px; font-size: 11px;
  }
  .slider-wrap label { white-space: nowrap; }
  .slider-wrap input { width: 88px; accent-color: #a855f7; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #c084fc; white-space: nowrap; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .controls { width: 100%; }
    .btn { flex: 1 1 46%; text-align: center; }
    .slider-wrap { width: 100%; justify-content: space-between; }
    .slider-wrap input { flex: 1; width: auto; min-width: 70px; }
    .stage { flex: none; height: 245px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>TPU 軟膠擠出齒輪推進與喉管屈曲模擬</h2>
      <p>過高的進料速度或遠端鐵氟龍長管會導致軟質 TPU 在齒輪下方彎曲糾纏堵塞</p>
    </div>
    <div class="controls">
      <button id="driveBtn" class="btn active" type="button">近端 Direct Drive</button>
      <button id="shoreBtn" class="btn active" type="button">硬度：95A</button>
      <div class="slider-wrap">
        <label>列印速度</label>
        <input id="spdSlider" type="range" min="15" max="90" step="5" value="30" />
        <span id="spdVal" class="mono">30 mm/s</span>
      </div>
    </div>
  </div>

  <div class="stage"><canvas id="tpuCanvas"></canvas></div>

  <div class="foot">
    <span id="stateLbl">擠出狀態：<strong>線材筆直推進，出料穩定順暢</strong></span>
    <span id="limitLbl">建議速度上限：<strong>≤ 40 mm/s</strong></span>
  </div>

<script>
(() => {
  const canvas = document.getElementById('tpuCanvas');
  const driveBtn = document.getElementById('driveBtn');
  const shoreBtn = document.getElementById('shoreBtn');
  const spdSlider = document.getElementById('spdSlider');
  const spdVal = document.getElementById('spdVal');
  const stateLbl = document.getElementById('stateLbl');
  const limitLbl = document.getElementById('limitLbl');

  let isDirect = true;
  let is95A = true;
  let speed = 30;

  driveBtn.addEventListener('click', () => {
    isDirect = !isDirect;
    driveBtn.textContent = isDirect ? '近端 Direct Drive' : '遠端 Bowden 長管';
    driveBtn.classList.toggle('active', isDirect);
  });
  shoreBtn.addEventListener('click', () => {
    is95A = !is95A;
    shoreBtn.textContent = is95A ? '硬度：95A' : '硬度：83A (超軟)';
    limitLbl.innerHTML = '建議速度上限：<strong>' + (is95A ? '≤ 40 mm/s' : '≤ 22 mm/s') + '</strong>';
  });
  spdSlider.addEventListener('input', (e) => {
    speed = Number(e.target.value);
    spdVal.textContent = speed + ' mm/s';
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

  function drawGear(ctx, x, y, r, angle, teeth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const rad = i % 2 === 0 ? r : r - 4;
      const a = (i / (teeth * 2)) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, w, h);

    const safeMax = isDirect ? (is95A ? 42 : 24) : (is95A ? 18 : 10);
    const buckleSeverity = Math.max(0, Math.min(1, (speed - safeMax) / 35));

    if (buckleSeverity > 0.35) {
      stateLbl.innerHTML = '擠出狀態：<strong style="color:#fb7185">' + (isDirect ? '齒輪下方發生軟料折疊纏繞堵塞！' : '長距離 PTFE 管內壓縮屈曲，擠出完全失效！') + '</strong>';
    } else if (buckleSeverity > 0.05) {
      stateLbl.innerHTML = '擠出狀態：<strong style="color:#fbbf24">進料阻尼偏高，出料出現脈動延遲</strong>';
    } else {
      stateLbl.innerHTML = '擠出狀態：<strong style="color:#34d399">張力平衡，TPU 穩定連續擠出</strong>';
    }

    const isNarrow = w < 440;
    const cx = isNarrow ? w * 0.25 : w * 0.42;
    const gearY = h * 0.28;
    const tubeLen = isDirect ? h * 0.24 : h * 0.34;
    const hotendY = gearY + tubeLen + 14;

    // Extruder housing
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(cx - 52, gearY - 32, 104, 64, 10);
    ctx.fill();

    const spin = now * 0.002 * (speed / 30);
    drawGear(ctx, cx - 20, gearY, 18, spin, 12);
    drawGear(ctx, cx + 20, gearY, 18, -spin, 12);

    // PTFE Guide tube or Bowden gap
    const tubeTop = gearY + 22;
    const tubeBot = hotendY;
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(cx - 8, tubeTop, 16, tubeBot - tubeTop);
    ctx.strokeStyle = isDirect ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 8, tubeTop, 16, tubeBot - tubeTop);

    // Hotend block
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx - 22, hotendY, 44, 24);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx - 10, hotendY + 24);
    ctx.lineTo(cx + 10, hotendY + 24);
    ctx.lineTo(cx + 2, hotendY + 38);
    ctx.lineTo(cx - 2, hotendY + 38);
    ctx.closePath();
    ctx.fill();

    // TPU Filament Strand
    ctx.beginPath();
    ctx.moveTo(cx, 8);
    ctx.lineTo(cx, gearY + 14);
    if (buckleSeverity > 0.08) {
      const waveAmp = buckleSeverity * (isDirect ? 14 : 26);
      const waveFreq = isDirect ? 3 : 6;
      const midTop = gearY + 14;
      const steps = 28;
      for (let i = 1; i <= steps; i++) {
        const frac = i / steps;
        const py = midTop + frac * (hotendY - midTop);
        const env = Math.sin(frac * Math.PI);
        const px = cx + Math.sin(frac * Math.PI * waveFreq + now * 0.006) * waveAmp * env;
        ctx.lineTo(px, py);
      }
    } else {
      ctx.lineTo(cx, hotendY);
    }
    ctx.strokeStyle = is95A ? '#c084fc' : '#f472b6';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Extruded line onto bed below nozzle
    const bedY = h - 18;
    ctx.fillStyle = '#334155';
    ctx.fillRect(20, bedY, w - 40, 6);
    const beadAlpha = Math.max(0.15, 1 - buckleSeverity * 0.9);
    ctx.fillStyle = 'rgba(192, 132, 252, ' + beadAlpha + ')';
    ctx.fillRect(24, bedY - 5, Math.max(20, cx - 24), 5);

    // Side status annotations
    ctx.fillStyle = '#94a3b8';
    ctx.font = isNarrow ? '10px sans-serif' : '11px sans-serif';
    ctx.textAlign = 'left';
    const noteX = cx + (isNarrow ? 60 : 68);
    ctx.fillText(
      isDirect ? (isNarrow ? '近端直驅（極短導料）' : '極短導料距離 (無側向空間)') : (isNarrow ? '遠端長管（易壓縮屈曲）' : '長距離鐵氟龍管 (內部彈簧壓縮效應)'),
      noteX,
      gearY + 10
    );
    ctx.fillText(isNarrow ? '230°C 慢速熱端阻力區' : '噴嘴阻力區 (230°C 慢速熔融)', cx + 30, hotendY + 16);

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

  8: {
    title: 'ABS/ASA 封箱恆溫對流與 HEPA + 活性碳 VOC 淨化模擬',
    subtitle: '開關「機箱門」與「Nevermore 過濾循環」，觀察層間開裂應力變化與苯乙烯微粒捕獲過程',
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
  .controls { display: flex; gap: 7px; flex-wrap: wrap; }
  .btn {
    padding: 6px 11px; border-radius: 9px;
    border: 1px solid #334155; background: #131c31; color: #cbd5e1;
    font-size: 11px; font-weight: 600; cursor: pointer;
  }
  .btn.on { background: #0d9488; border-color: #2dd4bf; color: #fff; }
  .btn.warn { background: #9f1239; border-color: #fb7185; color: #fff; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .controls { width: 100%; }
    .btn { flex: 1 1 135px; text-align: center; }
    .stage { flex: none; height: 245px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>封閉保溫機箱 (Enclosure) 與 VOCs 氣體過濾動態模擬</h2>
      <p>比較開放式降溫開裂與 55°C 恆溫機箱、Nevermore 活性碳吸附苯乙烯氣體效果</p>
    </div>
    <div class="controls">
      <button id="doorBtn" class="btn on" type="button">機箱門：已密閉保溫</button>
      <button id="filterBtn" class="btn on" type="button">HEPA + 活性碳循環：開啟</button>
    </div>
  </div>

  <div class="stage"><canvas id="encCanvas"></canvas></div>

  <div class="foot">
    <span id="chamberStat">艙內溫度：<strong>56°C 恆溫</strong> ｜ 熱床：105°C</span>
    <span id="airStat">空氣品質：<strong>94% VOCs 已捕獲吸附</strong></span>
  </div>

<script>
(() => {
  const canvas = document.getElementById('encCanvas');
  const doorBtn = document.getElementById('doorBtn');
  const filterBtn = document.getElementById('filterBtn');
  const chamberStat = document.getElementById('chamberStat');
  const airStat = document.getElementById('airStat');

  let isClosed = true;
  let filterOn = true;
  let chamberTemp = 56;
  let vocLevel = 8;

  const particles = Array.from({ length: 34 }, () => ({
    x: 0.35 + Math.random() * 0.3,
    y: 0.4 + Math.random() * 0.3,
    vx: (Math.random() - 0.5) * 0.004,
    vy: -0.002 - Math.random() * 0.004,
    life: Math.random()
  }));

  doorBtn.addEventListener('click', () => {
    isClosed = !isClosed;
    doorBtn.textContent = isClosed ? '機箱門：已密閉保溫' : '機箱門：敞開漏風';
    doorBtn.className = 'btn ' + (isClosed ? 'on' : 'warn');
  });
  filterBtn.addEventListener('click', () => {
    filterOn = !filterOn;
    filterBtn.textContent = filterOn ? 'HEPA + 活性碳循環：開啟' : 'HEPA + 活性碳循環：關閉';
    filterBtn.className = 'btn ' + (filterOn ? 'on' : 'warn');
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

    const targetTemp = isClosed ? 56 : 26;
    chamberTemp += (targetTemp - chamberTemp) * 0.04;
    const targetVoc = filterOn ? 6 : (isClosed ? 92 : 68);
    vocLevel += (targetVoc - vocLevel) * 0.05;

    chamberStat.innerHTML =
      '艙內溫度：<strong style="color:' + (chamberTemp > 45 ? '#34d399' : '#fb7185') + '">' +
      Math.round(chamberTemp) + '°C ' + (isClosed ? '恆溫防裂' : '冷風對流開裂') +
      '</strong> ｜ 熱床：105°C';

    airStat.innerHTML =
      'VOCs 苯乙烯濃度：<strong style="color:' + (vocLevel < 25 ? '#34d399' : '#fb7185') + '">' +
      Math.round(vocLevel) + ' ppm (' + (filterOn ? '安全淨化中' : '警告：超標外洩') + ')</strong>';

    const boxW = Math.min(w - 24, 420);
    const boxH = h - 32;
    const bx = (w - boxW) / 2;
    const by = 16;

    // Chamber thermal aura
    const tNorm = Math.max(0, (chamberTemp - 24) / 36);
    const glow = ctx.createRadialGradient(w / 2, by + boxH * 0.72, 10, w / 2, by + boxH * 0.5, boxW * 0.6);
    glow.addColorStop(0, 'rgba(249, 115, 22, ' + (0.12 + tNorm * 0.22) + ')');
    glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(bx, by, boxW, boxH);

    // Printer Enclosure Frame
    ctx.strokeStyle = isClosed ? '#38bdf8' : '#fb7185';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + boxW, by);
    ctx.lineTo(bx + boxW, by + boxH);
    ctx.lineTo(bx, by + boxH);
    if (isClosed) ctx.closePath();
    ctx.stroke();

    if (!isClosed) {
      // Cold draft arrows entering from open left door
      const drift = (now * 0.04) % 36;
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const y = by + 48 + i * 48;
        ctx.beginPath();
        ctx.moveTo(bx - 16 + drift, y);
        ctx.lineTo(bx + 36 + drift, y + 6);
        ctx.stroke();
      }
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('室溫冷風灌入 (24°C)', bx + 10, by + 26);
    }

    // Heatbed 105°C
    const bedY = by + boxH - 24;
    const bedW = boxW * 0.6;
    const bedX = w / 2 - bedW / 2;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(bedX, bedY, bedW, 10);

    // Tall ABS part with possible delamination crack when door is open
    const partW = Math.min(96, boxW * 0.34);
    const partH = boxH * 0.42;
    const px = w / 2 - partW / 2;
    const py = bedY - partH;
    ctx.fillStyle = '#475569';
    ctx.fillRect(px, py, partW, partH);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, partW, partH);

    if (chamberTemp < 42) {
      // Delamination horizontal crack!
      const crackY = py + partH * 0.45;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(px, crackY);
      ctx.lineTo(px + partW * 0.65, crackY + 3);
      ctx.lineTo(px, crackY + 9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('熱收縮撕裂 (Delamination)', w / 2, py - 20);
    }

    // Nozzle melting ABS & releasing VOC particles
    const nozX = w / 2 + Math.sin(now * 0.002) * (partW * 0.32);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(nozX - 6, py - 14);
    ctx.lineTo(nozX + 6, py - 14);
    ctx.lineTo(nozX, py);
    ctx.closePath();
    ctx.fill();

    // Nevermore HEPA + Carbon Filter Box inside right corner of chamber
    const fW = w < 400 ? 38 : 44;
    const fX = bx + boxW - fW - 10;
    const fY = by + 22;
    ctx.fillStyle = filterOn ? '#065f46' : '#1e293b';
    ctx.strokeStyle = filterOn ? '#10b981' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.fillRect(fX, fY, fW, 66);
    ctx.strokeRect(fX, fY, fW, 66);
    ctx.fillStyle = '#ecfdf5';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEPA', fX + fW / 2, fY + 23);
    ctx.fillText('活性碳', fX + fW / 2, fY + 39);
    ctx.fillText(filterOn ? '運轉中' : '已關閉', fX + fW / 2, fY + 55);

    // VOC styrene particles motion
    particles.forEach((p) => {
      if (filterOn) {
        const tx = (fX + fW / 2) / w;
        const ty = (fY + 33) / h;
        p.x += (tx - p.x) * 0.025 + Math.sin(now * 0.003 + p.life * 6) * 0.001;
        p.y += (ty - p.y) * 0.025;
        if (Math.hypot(tx - p.x, ty - p.y) < 0.04) {
          p.x = nozX / w;
          p.y = py / h;
        }
      } else {
        p.x += p.vx;
        p.y += p.vy;
        if (!isClosed && p.x < (bx + 20) / w) {
          p.x -= 0.003;
        }
        if (p.y < 0.1 || p.x < 0.05 || p.x > 0.92) {
          p.x = nozX / w;
          p.y = py / h;
        }
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, filterOn ? 2.2 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = filterOn ? 'rgba(52, 211, 153, 0.75)' : 'rgba(251, 113, 133, 0.85)';
      ctx.fill();
    });

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

  9: {
    title: '線材受潮水分子擴散與 8 大材質烘烤溫度警戒模擬',
    subtitle: '選擇耗材種類並調整烘箱溫度，觀察 H₂O 脫水蒸發效率與超過玻璃轉移溫度 (Tg) 的料盤融毀風險',
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
  .controls { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .mat-btn {
    padding: 5px 9px; border-radius: 7px; border: 1px solid #334155;
    background: #131c31; color: #cbd5e1; font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .mat-btn.active { background: #0284c7; border-color: #38bdf8; color: #fff; }
  .slider-box {
    display: flex; align-items: center; gap: 6px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 10px; border-radius: 8px; font-size: 11px;
  }
  .slider-box label { white-space: nowrap; }
  .slider-box input { width: 96px; accent-color: #f97316; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #fb923c; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .controls { width: 100%; }
    .mat-btn { flex: 1 1 20%; text-align: center; }
    .slider-box { width: 100%; justify-content: space-between; }
    .slider-box input { flex: 1; width: auto; min-width: 70px; }
    .stage { flex: none; height: 235px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>恆溫烘烤箱：H₂O 水分子擴散逸出與 Tg 熔融警戒</h2>
      <p>烘烤溫度必須低於材質 Tg 才不會把整捲線盤烤成塑膠餅！</p>
    </div>
    <div class="controls">
      <button class="mat-btn active" data-mat="pla">PLA</button>
      <button class="mat-btn" data-mat="petg">PETG</button>
      <button class="mat-btn" data-mat="tpu">TPU</button>
      <button class="mat-btn" data-mat="pa">PA-CF 尼龍</button>
      <div class="slider-box">
        <label>烘箱溫度</label>
        <input id="ovenSlider" type="range" min="35" max="95" step="1" value="48" />
        <span id="ovenVal" class="mono">48°C</span>
      </div>
    </div>
  </div>

  <div class="stage"><canvas id="dryCanvas"></canvas></div>

  <div class="foot">
    <span id="dryRateLbl">除濕建議：<strong>45°C–50°C / 4–6 小時</strong></span>
    <span id="dryVerdict"><strong style="color:#34d399">安全恆溫脫水中</strong></span>
  </div>

<script>
(() => {
  const MATS = {
    pla: { name: 'PLA / PLA+', recMin: 45, recMax: 50, tg: 56, hours: '4–6 小時', color: '#818cf8' },
    petg: { name: 'PETG / PETG-CF', recMin: 60, recMax: 65, tg: 78, hours: '6–8 小時', color: '#2dd4bf' },
    tpu: { name: 'TPU 彈性軟料', recMin: 55, recMax: 60, tg: 72, hours: '6–10 小時', color: '#c084fc' },
    pa: { name: 'PA 尼龍 / PA-CF', recMin: 80, recMax: 90, tg: 105, hours: '8–12 小時', color: '#38bdf8' }
  };

  let curKey = 'pla';
  let ovenTemp = 48;

  const canvas = document.getElementById('dryCanvas');
  const matBtns = document.querySelectorAll('.mat-btn');
  const ovenSlider = document.getElementById('ovenSlider');
  const ovenVal = document.getElementById('ovenVal');
  const dryRateLbl = document.getElementById('dryRateLbl');
  const dryVerdict = document.getElementById('dryVerdict');

  matBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      curKey = btn.dataset.mat;
      matBtns.forEach((b) => b.classList.toggle('active', b.dataset.mat === curKey));
      const m = MATS[curKey];
      ovenTemp = Math.round((m.recMin + m.recMax) / 2);
      ovenSlider.value = String(ovenTemp);
      ovenVal.textContent = ovenTemp + '°C';
    });
  });

  ovenSlider.addEventListener('input', (e) => {
    ovenTemp = Number(e.target.value);
    ovenVal.textContent = ovenTemp + '°C';
  });

  const h2o = Array.from({ length: 28 }, (_, i) => ({
    angle: (i / 28) * Math.PI * 2,
    rad: 22 + (i % 4) * 11,
    phase: Math.random() * 10
  }));

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

    const m = MATS[curKey];
    const overTg = ovenTemp >= m.tg;
    const tooCold = ovenTemp < m.recMin - 4;

    dryRateLbl.innerHTML = m.name + ' 建議烘烤：<strong>' + m.recMin + '°C–' + m.recMax + '°C / ' + m.hours + '</strong> (Tg: ' + m.tg + '°C)';
    if (overTg) {
      dryVerdict.innerHTML = '<strong style="color:#fb7185">危險！超過玻璃轉移溫度，線材軟化沾黏報廢！</strong>';
    } else if (tooCold) {
      dryVerdict.innerHTML = '<strong style="color:#fbbf24">溫度偏低，深層結合水分子脫出緩慢</strong>';
    } else {
      dryVerdict.innerHTML = '<strong style="color:#34d399">黃金除濕溫度區間，快速釋放水氣</strong>';
    }

    // Dryer Chamber Box
    const isNarrow = w < 420;
    const boxW = Math.min(w - 24, 480);
    const boxH = h - 26;
    const bx = (w - boxW) / 2;
    const by = 13;

    ctx.fillStyle = overTg ? 'rgba(190, 18, 60, 0.16)' : 'rgba(249, 115, 22, 0.08)';
    ctx.strokeStyle = overTg ? '#fb7185' : '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 12);
    ctx.fill();
    ctx.stroke();

    // Left: Rotating Spool inside chamber
    const sx = bx + boxW * 0.30;
    const sy = by + boxH * 0.54;
    const maxR = Math.min(boxW * 0.19, boxH * 0.34);

    ctx.save();
    ctx.translate(sx, sy);
    if (overTg) {
      ctx.scale(1.12, 0.86);
    } else {
      ctx.rotate(now * 0.0008);
    }
    ctx.beginPath();
    ctx.arc(0, 0, maxR, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = maxR * 0.42;
    ctx.strokeStyle = overTg ? '#f43f5e' : m.color;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, maxR * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1120';
    ctx.fill();
    ctx.restore();

    // Water molecules escaping spool & rising to vent
    const escapeRate = overTg ? 2.4 : tooCold ? 0.35 : 1.4;
    h2o.forEach((drop) => {
      const t = ((now * 0.00035 * escapeRate + drop.phase) % 1);
      const startR = (drop.rad / 66) * maxR;
      const dist = startR + t * 50;
      const px = sx + Math.cos(drop.angle + t * 0.4) * dist * 0.7;
      const py = sy + Math.sin(drop.angle) * startR - t * (boxH * 0.38);

      ctx.beginPath();
      ctx.arc(px, Math.max(by + 16, py), 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, ' + (1 - t) + ')';
      ctx.fill();
    });

    // Right: Hygrometer + RH% Curve Readout inside oven
    const rx = bx + boxW * (isNarrow ? 0.56 : 0.61);
    const ry = by + 24;
    const rw = boxW * (isNarrow ? 0.39 : 0.34);
    ctx.fillStyle = '#131c31';
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, boxH - 48, 10);
    ctx.fill();
    ctx.stroke();

    const targetRH = tooCold ? 44 : 12;
    const pulseRH = Math.round(targetRH + Math.sin(now * 0.002) * 1.5);
    ctx.fillStyle = '#94a3b8';
    ctx.font = isNarrow ? 'bold 10px sans-serif' : 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('艙內相對濕度', rx + rw / 2, ry + 26);

    ctx.fillStyle = pulseRH < 20 ? '#34d399' : '#fbbf24';
    ctx.font = isNarrow ? 'bold 20px monospace' : 'bold 26px monospace';
    ctx.fillText(pulseRH + '%', rx + rw / 2, ry + 58);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = isNarrow ? '10px sans-serif' : '11px sans-serif';
    ctx.fillText(overTg ? '線圈軟化變形中！' : (isNarrow ? '熱風脫水中' : '熱風循環脫水運作'), rx + rw / 2, ry + 86);

    // Exhaust arrow at top of box
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('▲ 水蒸氣頂部排氣口', sx, by + 18);

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

  10: {
    title: '原子冷抽法 (Atomic Cold Pull) 五階段熱端清淤動畫',
    subtitle: '點擊步驟按鈕或啟動自動演示，觀察尼龍線材融化裹附碳化雜質並於 95°C 完整拔出錐形倒模',
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
  .steps { display: flex; flex-wrap: wrap; gap: 6px; }
  .step-btn {
    padding: 5px 9px; border-radius: 8px; border: 1px solid #334155;
    background: #131c31; color: #cbd5e1; font-size: 11px; font-weight: 600; cursor: pointer;
  }
  .step-btn.active { background: #0284c7; border-color: #38bdf8; color: #fff; }
  .auto-btn {
    padding: 5px 11px; border-radius: 8px; border: 1px solid #10b981;
    background: #059669; color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .steps { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
    .step-btn, .auto-btn { padding: 6px 4px; text-align: center; font-size: 10.5px; }
    .stage { flex: none; height: 235px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>原子冷抽法 (Cold Pull) 五階段清淤演示</h2>
      <p>不用拆整組噴頭，利用玻璃轉移點半固態彈性直接將焦黑碳化積碳整塊拉出</p>
    </div>
    <div class="steps">
      <button class="step-btn active" data-step="0">1. 堵塞狀態</button>
      <button class="step-btn" data-step="1">2. 加熱 250°C</button>
      <button class="step-btn" data-step="2">3. 降溫至 95°C</button>
      <button class="step-btn" data-step="3">4. 垂直猛力拔出</button>
      <button class="step-btn" data-step="4">5. 噴嘴暢通</button>
      <button id="autoBtn" class="auto-btn" type="button">自動循環演示</button>
    </div>
  </div>

  <div class="stage"><canvas id="cpCanvas"></canvas></div>

  <div class="foot">
    <span id="stepDesc">階段 1：<strong>噴孔內壁沉積焦黑碳化雜質，導致出料斷續跳齒</strong></span>
    <span id="tempReadout">噴嘴溫度：<strong>200°C</strong></span>
  </div>

<script>
(() => {
  const DESCS = [
    { txt: '噴孔內壁沉積焦黑碳化雜質，造成架橋堵塞與跳齒', temp: 205, color: '#fb7185' },
    { txt: '加熱至 250°C 推入純白尼龍/PLA 線材，熔融裹附所有碳化黑點', temp: 250, color: '#f97316' },
    { txt: '關閉加熱器降溫至 95°C–110°C，線材轉為半固態強韌咬合', temp: 98, color: '#38bdf8' },
    { txt: '按住卡榫垂直向上乾脆猛力拔出！整塊錐形積碳被完整拖出', temp: 95, color: '#fbbf24' },
    { txt: '檢視錐形尖端帶出黑點，噴嘴內腔恢復微米級鏡面暢通！', temp: 215, color: '#34d399' }
  ];

  let step = 0;
  let autoPlay = true;
  let stepStart = performance.now();
  let pullOffset = 0;

  const canvas = document.getElementById('cpCanvas');
  const stepBtns = document.querySelectorAll('.step-btn');
  const autoBtn = document.getElementById('autoBtn');
  const stepDesc = document.getElementById('stepDesc');
  const tempReadout = document.getElementById('tempReadout');

  function setStep(idx) {
    step = idx;
    stepStart = performance.now();
    stepBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.step) === step));
    stepDesc.innerHTML = '階段 ' + (step + 1) + '：<strong>' + DESCS[step].txt + '</strong>';
    tempReadout.innerHTML = '噴嘴溫度：<strong style="color:' + DESCS[step].color + '">' + DESCS[step].temp + '°C</strong>';
  }

  stepBtns.forEach((b) => {
    b.addEventListener('click', () => {
      autoPlay = false;
      autoBtn.textContent = '啟動自動演示';
      setStep(Number(b.dataset.step));
    });
  });

  autoBtn.addEventListener('click', () => {
    autoPlay = !autoPlay;
    autoBtn.textContent = autoPlay ? '自動循環演示' : '啟動自動演示';
    stepStart = performance.now();
  });

  setStep(0);

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

  const debrisOffsets = [
    [-4, -2], [3, -4], [-2, -7], [4, -9], [0, -1], [-3, -11]
  ];

  function frame(now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(frame); return; }

    if (autoPlay && now - stepStart > 2200) {
      setStep((step + 1) % 5);
    }

    ctx.clearRect(0, 0, w, h);
    const isNarrow = w < 440;
    const cx = isNarrow ? w * 0.23 : w * 0.40;
    const tipY = h - 32;
    const throatTop = 30;
    const blockY = tipY - 62;

    // Nozzle block & brass cone cutaway
    ctx.fillStyle = step === 1 ? '#dc2626' : step === 2 || step === 3 ? '#1e3a8a' : '#b45309';
    ctx.fillRect(cx - 38, blockY, 76, 32);

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(cx - 22, blockY + 32);
    ctx.lineTo(cx + 22, blockY + 32);
    ctx.lineTo(cx + 6, tipY);
    ctx.lineTo(cx - 6, tipY);
    ctx.closePath();
    ctx.fill();

    // Inner bore channel
    ctx.fillStyle = '#0b1120';
    ctx.beginPath();
    ctx.moveTo(cx - 9, throatTop);
    ctx.lineTo(cx + 9, throatTop);
    ctx.lineTo(cx + 9, blockY + 32);
    ctx.lineTo(cx + 3, tipY);
    ctx.lineTo(cx - 3, tipY);
    ctx.lineTo(cx - 9, blockY + 32);
    ctx.closePath();
    ctx.fill();

    // Calculate pull offset animation during step 3
    let targetPull = 0;
    if (step === 3) {
      const p = Math.min(1, (now - stepStart) / 1400);
      targetPull = p * 74;
    } else if (step === 4) {
      targetPull = 80;
    }
    pullOffset += (targetPull - pullOffset) * 0.14;

    // Draw filament mold being pushed / pulled
    if (step >= 1) {
      ctx.save();
      ctx.translate(0, -pullOffset);
      ctx.beginPath();
      ctx.moveTo(cx - 7, 10);
      ctx.lineTo(cx + 7, 10);
      ctx.lineTo(cx + 7, blockY + 32);
      ctx.lineTo(cx + 2.2, tipY - 2);
      ctx.lineTo(cx - 2.2, tipY - 2);
      ctx.lineTo(cx - 7, blockY + 32);
      ctx.closePath();
      ctx.fillStyle = step === 1 ? '#e2e8f0' : '#f8fafc';
      ctx.fill();

      if (step >= 1) {
        debrisOffsets.forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.arc(cx + dx, tipY + dy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#020617';
          ctx.fill();
        });
      }
      ctx.restore();
    }

    // Debris stuck inside nozzle in step 0
    if (step === 0) {
      debrisOffsets.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, tipY + dy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fb7185';
        ctx.fill();
      });
    }

    // Step 4 clean extrusion stream!
    if (step === 4) {
      const flowY = ((now * 0.08) % 24);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, tipY);
      ctx.lineTo(cx, tipY + 10 + flowY * 0.65);
      ctx.stroke();
    }

    // Pull upward arrow in step 3
    if (step === 3) {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 48, blockY);
      ctx.lineTo(cx + 48, 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 48, 22);
      ctx.lineTo(cx + 42, 34);
      ctx.lineTo(cx + 54, 34);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 10.5px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('垂直猛力拔出', cx + 60, 44);
    }

    // Right side thermal & inspection info box
    const infoX = cx + (isNarrow ? 50 : 72);
    const infoW = Math.max(120, Math.min(210, w - infoX - 10));
    const infoY = blockY - 12;
    ctx.fillStyle = '#131c31';
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(infoX, infoY, infoW, 84, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = DESCS[step].color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NOZZLE: ' + DESCS[step].temp + '°C', infoX + 10, infoY + 24);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = isNarrow ? '10.5px sans-serif' : '11px sans-serif';
    ctx.fillText(step === 3 || step === 4 ? '尖端呈完整倒模錐形' : step === 2 ? '半固態強韌咬合階段' : step === 1 ? '熱熔裹附碳化微粒' : '0.4mm 噴孔異物堵塞', infoX + 10, infoY + 46);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(isNarrow ? '材料：純白 PLA/尼龍' : '建議使用：純白 PLA 或尼龍清洗料', infoX + 10, infoY + 66);

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

  11: {
    title: 'Z 軸螺桿偏擺、PID 溫度震盪與線徑公差條紋 (Z-Banding) 消除器',
    subtitle: '勾選三項機械與材料校正對策，立即觀察側面週期性波浪環紋如何蛻變為鏡面光滑層壁',
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
  .toggles { display: flex; flex-wrap: wrap; gap: 6px; }
  .btn {
    padding: 6px 10px; border-radius: 8px; border: 1px solid #334155;
    background: #131c31; color: #cbd5e1; font-size: 11px; font-weight: 600; cursor: pointer;
  }
  .btn.on { background: #065f46; border-color: #10b981; color: #ecfdf5; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .toggles { width: 100%; }
    .btn { flex: 1 1 100%; text-align: left; }
    .stage { flex: none; height: 235px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>Z-Banding 機械偏擺、熱床 PID 與線徑公差交互實驗</h2>
      <p>點選開啟三項校正後，觀察圓柱模型側面層紋的微米級消除效果</p>
    </div>
    <div class="toggles">
      <button id="oldhamBtn" class="btn" type="button">1. 安裝 Oldham 浮動聯軸器</button>
      <button id="pidBtn" class="btn" type="button">2. 執行熱床 PID 溫控校準</button>
      <button id="tolBtn" class="btn" type="button">3. 採用 ±0.02mm 嚴選線材</button>
    </div>
  </div>

  <div class="stage"><canvas id="zbCanvas"></canvas></div>

  <div class="foot">
    <span id="errLbl">Z 軸側面峰谷誤差：<strong>±0.19 mm (嚴重水平條紋)</strong></span>
    <span id="verdictLbl"><strong style="color:#fb7185">層壁波浪起伏明顯</strong></span>
  </div>

<script>
(() => {
  const fix = { oldham: false, pid: false, tol: false };
  const map = [['oldhamBtn', 'oldham'], ['pidBtn', 'pid'], ['tolBtn', 'tol']];
  map.forEach(([id, key]) => {
    const b = document.getElementById(id);
    b.addEventListener('click', () => {
      fix[key] = !fix[key];
      b.classList.toggle('on', fix[key]);
    });
  });

  const canvas = document.getElementById('zbCanvas');
  const errLbl = document.getElementById('errLbl');
  const verdictLbl = document.getElementById('verdictLbl');

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

    const screwAmp = fix.oldham ? 0.4 : 7.5;
    const pidAmp = fix.pid ? 0.2 : 4.2;
    const tolAmp = fix.tol ? 0.2 : 4.5;
    const totalMm = (fix.oldham ? 0.01 : 0.09) + (fix.pid ? 0.005 : 0.05) + (fix.tol ? 0.005 : 0.05);

    errLbl.innerHTML = 'Z 軸側面峰谷誤差：<strong>±' + totalMm.toFixed(3) + ' mm</strong>';
    if (totalMm <= 0.025) {
      verdictLbl.innerHTML = '<strong style="color:#34d399">鏡面級垂直接縫！完全消除 Z-Banding</strong>';
    } else if (totalMm <= 0.08) {
      verdictLbl.innerHTML = '<strong style="color:#fbbf24">條紋大幅收斂，尚存局部微擾</strong>';
    } else {
      verdictLbl.innerHTML = '<strong style="color:#fb7185">警告：週期性螺桿條紋 + 熱床脹縮波動明顯</strong>';
    }

    // Left: Rotating Z leadscrew
    const isNarrow = w < 440;
    const screwX = isNarrow ? w * 0.16 : w * 0.24;
    const wobble = Math.sin(now * 0.004) * (fix.oldham ? 0.8 : 6.5);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(screwX, 20);
    ctx.lineTo(screwX + wobble, h - 24);
    ctx.stroke();

    // Thread notches along screw
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    for (let y = 26; y < h - 28; y += 10) {
      const f = (y - 20) / (h - 44);
      const sx = screwX + wobble * f;
      ctx.beginPath();
      ctx.moveTo(sx - 6, y);
      ctx.lineTo(sx + 6, y + 3);
      ctx.stroke();
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = isNarrow ? '10px sans-serif' : '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fix.oldham ? (isNarrow ? 'Oldham 吸收偏擺' : 'Oldham 聯軸器吸收偏擺') : (isNarrow ? '螺桿偏擺中' : 'T8 螺桿旋轉偏擺中'), screwX, h - 8);

    // Center: Printed Tower Side Profile with Layer-by-Layer Lighting & Displacement
    const towerX = isNarrow ? w * 0.45 : w * 0.56;
    const baseW = isNarrow ? Math.min(82, w * 0.22) : Math.min(130, w * 0.25);
    const layerCount = 42;
    const startY = 22;
    const endY = h - 26;
    const layerH = (endY - startY) / layerCount;

    for (let i = 0; i < layerCount; i++) {
      const y = startY + i * layerH;
      const zWave = Math.sin(i * 0.85) * screwAmp;
      const pidWave = Math.sin(i * 0.38) * pidAmp;
      const tolNoise = (Math.sin(i * 2.7) * Math.cos(i * 1.9)) * tolAmp;
      const offset = zWave + pidWave + tolNoise;
      const lw = baseW + offset * (isNarrow ? 0.9 : 1.4);

      const shade = Math.max(0, Math.min(255, Math.round(130 + offset * 9)));
      ctx.fillStyle = 'rgb(' + Math.round(shade * 0.45) + ', ' + Math.round(shade * 0.85) + ', 248)';
      ctx.beginPath();
      ctx.roundRect(towerX - lw / 2, y, lw, layerH - 0.5, 2);
      ctx.fill();
    }

    // Right: Hotbed PID Temperature Sine Graph
    const gx = isNarrow ? w * 0.64 : w * 0.76;
    const gw = Math.max(76, w - gx - 10);
    const gy = h * 0.26;
    const gh = 88;
    ctx.fillStyle = '#131c31';
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isNarrow ? '熱床 PID 曲線' : '熱床溫度 PID 穩定曲線', gx + gw / 2, gy + 16);

    ctx.beginPath();
    const pidSwing = fix.pid ? 2 : 18;
    for (let x = 8; x < gw - 8; x += 3) {
      const val = Math.sin((x + now * 0.03) * 0.14) * pidSwing;
      const py = gy + 50 + val;
      if (x === 8) ctx.moveTo(gx + x, py);
      else ctx.lineTo(gx + x, py);
    }
    ctx.strokeStyle = fix.pid ? '#34d399' : '#fb7185';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = fix.pid ? '#34d399' : '#fb7185';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(fix.pid ? '60.0°C (±0.2°C)' : '60.0°C (±4.0°C)', gx + gw / 2, gy + gh - 8);

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

  12: {
    title: '微米級 Z-Offset 第一層截面與 Flow Cube 流量校準台',
    subtitle: '拖動噴嘴第一層高度 Z-Offset (-0.12mm → +0.12mm) 與流量倍率，觀察剖面橢圓壓合度',
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
  .ctrls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .sbox {
    display: flex; align-items: center; gap: 6px;
    background: #131c31; border: 1px solid #1e293b;
    padding: 5px 10px; border-radius: 9px; font-size: 11px;
  }
  .sbox label { white-space: nowrap; }
  .sbox input { width: 95px; accent-color: #38bdf8; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #38bdf8; min-width: 58px; text-align: right; }
  .stage { flex: 1; min-height: 0; background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; overflow: hidden; }
  canvas { width: 100%; height: 100%; display: block; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums; }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .ctrls { width: 100%; }
    .sbox { width: 100%; justify-content: space-between; }
    .sbox input { flex: 1; width: auto; min-width: 70px; }
    .stage { flex: none; height: 235px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>第一層 Z-Offset 截面擠壓 & 雙壁流量 (Flow) 校正模擬</h2>
      <p>目標：將線條壓平為緊密相接的扁平橢圓，且雙壁理論 0.90mm 與實測一致</p>
    </div>
    <div class="ctrls">
      <div class="sbox">
        <label>Z-Offset</label>
        <input id="zSlider" type="range" min="-0.12" max="0.12" step="0.01" value="0.00" />
        <span id="zVal" class="mono">0.00 mm</span>
      </div>
      <div class="sbox">
        <label>Flow 倍率</label>
        <input id="fSlider" type="range" min="0.88" max="1.12" step="0.01" value="1.00" />
        <span id="fVal" class="mono">100%</span>
      </div>
    </div>
  </div>

  <div class="stage"><canvas id="zCanvas"></canvas></div>

  <div class="foot">
    <span id="zVerdict">第一層評級：<strong style="color:#34d399">黃金鏡面咬合 (線條無縫相融)</strong></span>
    <span id="cubeReadout">雙壁方塊實測厚：<strong>0.90 mm (理論 0.90 mm)</strong></span>
  </div>

<script>
(() => {
  const zSlider = document.getElementById('zSlider');
  const fSlider = document.getElementById('fSlider');
  const zVal = document.getElementById('zVal');
  const fVal = document.getElementById('fVal');
  const zVerdict = document.getElementById('zVerdict');
  const cubeReadout = document.getElementById('cubeReadout');
  const canvas = document.getElementById('zCanvas');

  let zOff = 0;
  let flow = 1.0;

  zSlider.addEventListener('input', (e) => {
    zOff = Number(e.target.value);
    zVal.textContent = (zOff > 0 ? '+' : '') + zOff.toFixed(2) + ' mm';
  });
  fSlider.addEventListener('input', (e) => {
    flow = Number(e.target.value);
    fVal.textContent = Math.round(flow * 100) + '%';
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

    // Update evaluation labels
    const wallThick = (0.9 * flow).toFixed(2);
    cubeReadout.innerHTML = '雙壁方塊實測厚：<strong style="color:' + (Math.abs(flow - 1) < 0.025 ? '#34d399' : '#fbbf24') + '">' + wallThick + ' mm (理論 0.90 mm)</strong>';

    if (zOff > 0.04) {
      zVerdict.innerHTML = '第一層評級：<strong style="color:#fb7185">噴嘴過高 (Too High)：圓柱鬆散有縫隙，一碰就翹</strong>';
    } else if (zOff < -0.04) {
      zVerdict.innerHTML = '第一層評級：<strong style="color:#fb7185">噴嘴過低 (Too Low)：刮傷底板，邊緣擠出波浪毛刺</strong>';
    } else {
      zVerdict.innerHTML = '第一層評級：<strong style="color:#34d399">完美黃金高度 (Just Right)：扁平橢圓無縫熔合</strong>';
    }

    const bedY = h * 0.74;
    const plateLeft = 28;
    const plateRight = w - 28;

    // Textured PEI plate
    ctx.fillStyle = '#b45309';
    ctx.fillRect(plateLeft, bedY, plateRight - plateLeft, 12);
    for (let x = plateLeft; x < plateRight; x += 6) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, bedY - 1.5, 3, 2);
    }

    // Cross-section of adjacent extruded lines
    const isNarrow = w < 400;
    const count = isNarrow ? 5 : 7;
    const spacing = Math.min(46, (w - 52) / count);
    const startX = w * 0.5 - ((count - 1) * spacing) / 2;

    // Squeeze geometry based on zOff & flow
    const beadH = Math.max(7, 22 + zOff * 120);
    const beadW = Math.min(spacing + 12, (spacing * 0.96 - zOff * 130) * flow);

    for (let i = 0; i < count; i++) {
      const bx = startX + i * spacing;
      const cy = bedY - beadH / 2 + (zOff > 0.04 ? (zOff - 0.04) * 80 : 0);

      ctx.beginPath();
      ctx.ellipse(bx, cy, beadW / 2, beadH / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (zOff < -0.04 || flow > 1.05) {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.moveTo(bx - beadW / 2 - 4, bedY);
        ctx.lineTo(bx - beadW / 2, bedY - beadH - 6);
        ctx.lineTo(bx - beadW / 2 + 4, bedY);
        ctx.fill();
      }
    }

    // Animated nozzle gliding above the beads
    const scanX = startX + ((Math.sin(now * 0.002) + 1) / 2) * ((count - 1) * spacing);
    const nozTipY = bedY - beadH - (zOff > 0 ? zOff * 120 : 0);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(scanX - 16, nozTipY - 38);
    ctx.lineTo(scanX + 16, nozTipY - 38);
    ctx.lineTo(scanX + 4, nozTipY);
    ctx.lineTo(scanX - 4, nozTipY);
    ctx.closePath();
    ctx.fill();

    // Dimension label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('剖面顯微放大檢視 (間距 0.45mm)', w * 0.5, bedY + 32);

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
