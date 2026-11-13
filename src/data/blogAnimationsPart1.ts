export interface BlogAnimationEntry {
  title: string;
  subtitle: string;
  html: string;
}

export const BLOG_ANIMATIONS_PART1: Record<number, BlogAnimationEntry> = {
  1: {
    title: 'PLA vs. PETG 熱變形與落球衝擊雙腔實驗台',
    subtitle: '拖動環境溫度滑桿並觸發衝擊測試，觀察玻璃轉移溫度 (Tg) 與材料脆韌差異',
    html: `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  button { font-family: inherit; color: #e2e8f0; }
  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', system-ui, -apple-system, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 10px;
  }
  .embedded .title-group { display: none; }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }
  .title-group h2 {
    font-size: 13px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: 0.01em;
  }
  .title-group p {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .slider-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #131c31;
    border: 1px solid #1e293b;
    padding: 6px 12px;
    border-radius: 10px;
  }
  .slider-box label { font-size: 11px; color: #cbd5e1; white-space: nowrap; }
  .slider-box input[type="range"] {
    width: 110px;
    accent-color: #f59e0b;
    cursor: pointer;
  }
  .temp-val {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-variant-numeric: tabular-nums;
    font-size: 13px;
    font-weight: 700;
    color: #fbbf24;
    min-width: 44px;
    text-align: right;
  }
  .btn {
    border: 1px solid #38bdf8;
    background: #0284c7;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    padding: 7px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.12s ease, background 0.15s ease;
    white-space: nowrap;
  }
  .btn:hover { background: #0369a1; }
  .btn:active { transform: scale(0.97); }
  .stage {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .chamber {
    background: radial-gradient(circle at 50% 25%, #16223b 0%, #0d1526 100%);
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  .chamber-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 12px;
    z-index: 2;
  }
  .mat-name { font-weight: 700; font-size: 13px; }
  .mat-pla { color: #818cf8; }
  .mat-petg { color: #2dd4bf; }
  .tg-note {
    font-family: ui-monospace, monospace;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    color: #94a3b8;
  }
  canvas {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    display: block;
  }
  .status-line {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding-top: 6px;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
    color: #cbd5e1;
    font-variant-numeric: tabular-nums;
  }
  .warn { color: #fb7185; font-weight: 700; }
  .ok { color: #34d399; font-weight: 700; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .controls { width: 100%; justify-content: space-between; gap: 8px; }
    .slider-box { flex: 1; min-width: 0; padding: 6px 10px; }
    .slider-box input[type="range"] { flex: 1; width: auto; min-width: 60px; }
    .stage { flex: none; grid-template-columns: 1fr; gap: 10px; }
    .chamber { min-height: 192px; padding: 10px; }
    .status-line { flex-wrap: wrap; gap: 4px; }
    .title-group p { display: none; }
  }
</style>
</head>
<body>
  <div class="topbar">
    <div class="title-group">
      <h2>PLA vs. PETG 熱變形 (Tg) 與耐衝擊物理實驗台</h2>
      <p>調整環境溫度觀察 58°C / 80°C 軟化臨界點，並點擊鋼球衝擊測試觀察脆裂與高韌性變形</p>
    </div>
    <div class="controls">
      <div class="slider-box">
        <label for="tempRange">環境溫度</label>
        <input id="tempRange" type="range" min="25" max="100" value="28" />
        <span id="tempVal" class="temp-val">28°C</span>
      </div>
      <button id="impactBtn" class="btn" type="button">執行落球衝擊測試</button>
    </div>
  </div>

  <div class="stage">
    <div class="chamber">
      <div class="chamber-head">
        <span class="mat-name mat-pla">High-Speed PLA 支架</span>
        <span class="tg-note">Tg = 58°C</span>
      </div>
      <canvas id="cPla"></canvas>
      <div class="status-line">
        <span id="plaState" class="ok">狀態：高剛性穩固</span>
        <span id="plaDroop">形變量：0.0 mm</span>
      </div>
    </div>

    <div class="chamber">
      <div class="chamber-head">
        <span class="mat-name mat-petg">High-Speed PETG 支架</span>
        <span class="tg-note">Tg = 80°C</span>
      </div>
      <canvas id="cPetg"></canvas>
      <div class="status-line">
        <span id="petgState" class="ok">狀態：高韌性耐候</span>
        <span id="petgDroop">形變量：0.0 mm</span>
      </div>
    </div>
  </div>

<script>
(() => {
  const tempRange = document.getElementById('tempRange');
  const tempVal = document.getElementById('tempVal');
  const impactBtn = document.getElementById('impactBtn');
  const cPla = document.getElementById('cPla');
  const cPetg = document.getElementById('cPetg');
  const plaState = document.getElementById('plaState');
  const petgState = document.getElementById('petgState');
  const plaDroopEl = document.getElementById('plaDroop');
  const petgDroopEl = document.getElementById('petgDroop');

  let temp = 28;
  let impactTime = -1;
  let plaDroop = 0;
  let petgDroop = 0;
  let plaShatter = 0;
  let petgFlex = 0;

  const shards = Array.from({ length: 12 }, (_, i) => ({
    dx: (i - 5.5) * 8 + (Math.random() - 0.5) * 14,
    dy: (Math.random() - 0.3) * 26,
    rot: (Math.random() - 0.5) * 2.5,
    size: 4 + Math.random() * 5
  }));

  function resizeCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function resizeAll() {
    resizeCanvas(cPla);
    resizeCanvas(cPetg);
  }
  window.addEventListener('resize', resizeAll);
  resizeAll();

  tempRange.addEventListener('input', (e) => {
    temp = Number(e.target.value);
    tempVal.textContent = temp + '°C';
    tempVal.style.color = temp >= 75 ? '#fb7185' : temp >= 55 ? '#fbbf24' : '#38bdf8';
  });

  impactBtn.addEventListener('click', () => {
    impactTime = performance.now();
  });

  function drawChamber(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    // Thermal background glow
    const heatAlpha = Math.max(0, (temp - 35) / 80) * 0.25;
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, 'rgba(239, 68, 68, ' + heatAlpha + ')');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Heat wave lines when hot
    if (temp > 50) {
      const tSec = performance.now() * 0.003;
      ctx.strokeStyle = 'rgba(251, 146, 60, ' + Math.min(0.45, (temp - 50) / 90) + ')';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        const xBase = w * (0.2 + i * 0.2);
        ctx.beginPath();
        for (let y = h - 10; y > 24; y -= 8) {
          const xOff = Math.sin(y * 0.08 - tSec * 2 + i) * 4;
          if (y === h - 10) ctx.moveTo(xBase + xOff, y);
          else ctx.lineTo(xBase + xOff, y);
        }
        ctx.stroke();
      }
    }

    // Clamp base on the left
    const clampX = 22;
    const midY = h * 0.44;
    ctx.fillStyle = '#334155';
    ctx.fillRect(clampX - 10, midY - 26, 18, 52);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(clampX + 4, midY - 14, 10, 28);

    // Cantilever bracket
    const startX = clampX + 12;
    const beamLen = Math.min(w - 56, 185);
    const sag = opts.droop + opts.flexOffset;

    if (opts.shatterProgress > 0.25) {
      // Intact left stub
      ctx.beginPath();
      ctx.moveTo(startX, midY - 7);
      ctx.lineTo(startX + beamLen * 0.45, midY - 7 + sag * 0.25);
      ctx.lineTo(startX + beamLen * 0.42, midY + 7 + sag * 0.25);
      ctx.lineTo(startX, midY + 7);
      ctx.closePath();
      ctx.fillStyle = opts.color;
      ctx.fill();

      // Shattered flying tip & shards
      const fall = Math.min(1, (opts.shatterProgress - 0.25) / 0.75);
      ctx.save();
      ctx.translate(startX + beamLen * 0.55 + fall * 18, midY + sag * 0.4 + fall * fall * (h * 0.36));
      ctx.rotate(fall * 0.9);
      ctx.fillStyle = opts.color;
      ctx.fillRect(0, -6, beamLen * 0.48, 12);
      ctx.restore();

      shards.forEach((s) => {
        ctx.save();
        ctx.translate(startX + beamLen * 0.5 + s.dx * fall * 2.2, midY + s.dy * fall + fall * fall * 45);
        ctx.rotate(s.rot * fall);
        ctx.fillStyle = opts.highlight;
        ctx.globalAlpha = Math.max(0, 1 - fall * 0.7);
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size * 0.7);
        ctx.restore();
      });
    } else {
      ctx.beginPath();
      ctx.moveTo(startX, midY - 7);
      ctx.quadraticCurveTo(startX + beamLen * 0.55, midY - 7 + sag * 0.35, startX + beamLen, midY - 7 + sag);
      ctx.lineTo(startX + beamLen, midY + 7 + sag);
      ctx.quadraticCurveTo(startX + beamLen * 0.55, midY + 7 + sag * 0.35, startX, midY + 7);
      ctx.closePath();
      ctx.fillStyle = opts.color;
      ctx.fill();
      ctx.strokeStyle = opts.highlight;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 500g Weight block at tip
      const tipX = startX + beamLen - 16;
      const tipY = midY + 7 + sag;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(tipX + 8, tipY);
      ctx.lineTo(tipX + 8, tipY + 12);
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.fillRect(tipX - 6, tipY + 12, 28, 18);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('500g', tipX + 8, tipY + 24);
    }

    // Steel impact ball animation
    if (opts.ballProgress >= 0 && opts.ballProgress <= 1) {
      const p = opts.ballProgress;
      const targetX = startX + beamLen * 0.72;
      const impactY = midY - 12 + sag * 0.7;
      let ballY;
      if (p < 0.32) {
        const t = p / 0.32;
        ballY = 14 + (impactY - 14) * (t * t);
      } else {
        const bounce = Math.sin(((p - 0.32) / 0.68) * Math.PI);
        ballY = impactY - bounce * (opts.isBrittle ? 14 : 42);
      }
      ctx.beginPath();
      ctx.arc(targetX, ballY, 10, 0, Math.PI * 2);
      const bGrad = ctx.createRadialGradient(targetX - 3, ballY - 3, 1, targetX, ballY, 10);
      bGrad.addColorStop(0, '#f8fafc');
      bGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = bGrad;
      ctx.fill();

      // Shockwave ring on hit
      if (p >= 0.3 && p < 0.65) {
        const r = ((p - 0.3) / 0.35) * 32;
        ctx.beginPath();
        ctx.arc(targetX, impactY + 4, r, 0, Math.PI * 2);
        ctx.strokeStyle = opts.isBrittle ? 'rgba(251, 113, 133, ' + (1 - (p - 0.3) / 0.35) + ')' : 'rgba(45, 212, 191, ' + (1 - (p - 0.3) / 0.35) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  function frame(now) {
    // Thermal droop calculation
    const targetPlaDroop = temp > 55 ? Math.min(58, Math.pow((temp - 55) / 10, 1.45) * 14) : 0;
    const targetPetgDroop = temp > 78 ? Math.min(34, Math.pow((temp - 78) / 10, 1.35) * 9) : 0;
    plaDroop += (targetPlaDroop - plaDroop) * 0.1;
    petgDroop += (targetPetgDroop - petgDroop) * 0.1;

    let ballProgress = -1;
    if (impactTime > 0) {
      ballProgress = (now - impactTime) / 1400;
      if (ballProgress > 1) {
        impactTime = -1;
        ballProgress = -1;
        plaShatter = 0;
        petgFlex = 0;
      }
    }

    if (ballProgress >= 0.32) {
      const hitAge = (ballProgress - 0.32) / 0.68;
      plaShatter = Math.min(1, hitAge * 2.2);
      petgFlex = Math.sin(hitAge * Math.PI * 3) * Math.exp(-hitAge * 3) * 18;
    } else {
      plaShatter = 0;
      petgFlex = 0;
    }

    drawChamber(cPla, {
      droop: plaDroop,
      flexOffset: plaShatter > 0 ? 4 : 0,
      shatterProgress: plaShatter,
      ballProgress,
      isBrittle: true,
      color: '#6366f1',
      highlight: '#a5b4fc'
    });

    drawChamber(cPetg, {
      droop: petgDroop,
      flexOffset: petgFlex,
      shatterProgress: 0,
      ballProgress,
      isBrittle: false,
      color: '#0d9488',
      highlight: '#5eead4'
    });

    // Update readouts
    if (plaShatter > 0.25) {
      plaState.textContent = '狀態：高應力脆性斷裂';
      plaState.className = 'warn';
    } else if (temp >= 58) {
      plaState.textContent = '狀態：已達玻璃轉移軟化區';
      plaState.className = 'warn';
    } else {
      plaState.textContent = '狀態：高剛性穩固支撐';
      plaState.className = 'ok';
    }

    if (ballProgress >= 0.32 && ballProgress < 0.85) {
      petgState.textContent = '狀態：彈性吸能回彈中';
      petgState.className = 'ok';
    } else if (temp >= 80) {
      petgState.textContent = '狀態：高溫微軟化區';
      petgState.className = 'warn';
    } else {
      petgState.textContent = '狀態：高韌性耐高溫穩定';
      petgState.className = 'ok';
    }

    plaDroopEl.textContent = '形變量：' + (plaDroop * 0.45).toFixed(1) + ' mm';
    petgDroopEl.textContent = '形變量：' + ((petgDroop + Math.abs(petgFlex)) * 0.45).toFixed(1) + ' mm';

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

  2: {
    title: '噴嘴熱腔壓力、回抽 (Retraction) 與受潮氣泡牽絲模擬器',
    subtitle: '即時調整噴嘴溫度、回抽距離與擦嘴設定，觀察塑料黏度與滲料拉絲物理行為',
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
  .embedded .header > div:first-child { display: none; }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .header h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .header p { font-size: 11px; color: #94a3b8; }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
  }
  .ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #131c31;
    border: 1px solid #1e293b;
    padding: 5px 10px;
    border-radius: 9px;
    font-size: 11px;
  }
  .ctrl label { white-space: nowrap; }
  .ctrl input[type="range"] { width: 82px; accent-color: #38bdf8; cursor: pointer; }
  .val { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; color: #38bdf8; min-width: 42px; text-align: right; }
  .toggle-btn {
    padding: 6px 10px;
    border-radius: 9px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #cbd5e1;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .toggle-btn.active { background: #0d9488; border-color: #2dd4bf; color: #fff; }
  .toggle-btn.wet { background: #be123c; border-color: #fb7185; color: #fff; }
  .canvas-wrap {
    flex: 1;
    min-height: 0;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    position: relative;
    overflow: hidden;
  }
  canvas { width: 100%; height: 100%; display: block; }
  .telemetry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 11px;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
    padding: 2px 4px;
  }
  .telemetry strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .controls { width: 100%; }
    .ctrl { flex: 1 1 135px; justify-content: space-between; }
    .ctrl input[type="range"] { flex: 1; width: auto; min-width: 54px; }
    .toggle-btn { flex: 1 1 135px; text-align: center; }
    .canvas-wrap { flex: none; height: 245px; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h2>雙塔空跑牽絲 (Stringing) 物理即時模擬</h2>
      <p>調整 PETG 噴嘴溫度、回抽與除濕狀態，對比兩座測試塔間的微絲生成量</p>
    </div>
    <div class="controls">
      <div class="ctrl">
        <label>溫度</label>
        <input id="tempSlider" type="range" min="225" max="260" value="252" />
        <span id="tempLbl" class="val">252°C</span>
      </div>
      <div class="ctrl">
        <label>回抽</label>
        <input id="retSlider" type="range" min="0" max="1.6" step="0.1" value="0.2" />
        <span id="retLbl" class="val">0.2mm</span>
      </div>
      <button id="wipeBtn" class="toggle-btn" type="button">擦嘴 Wipe: 關</button>
      <button id="wetBtn" class="toggle-btn wet" type="button">狀態: 線材受潮</button>
    </div>
  </div>

  <div class="canvas-wrap">
    <canvas id="simCanvas"></canvas>
  </div>

  <div class="telemetry">
    <span id="pressureText">熔膠腔殘餘壓力：<strong>高壓滲料</strong></span>
    <span id="stringText">牽絲風險評估：<strong style="color:#fb7185">嚴重蛛網拉絲</strong></span>
  </div>

<script>
(() => {
  const canvas = document.getElementById('simCanvas');
  const tempSlider = document.getElementById('tempSlider');
  const retSlider = document.getElementById('retSlider');
  const tempLbl = document.getElementById('tempLbl');
  const retLbl = document.getElementById('retLbl');
  const wipeBtn = document.getElementById('wipeBtn');
  const wetBtn = document.getElementById('wetBtn');
  const pressureText = document.getElementById('pressureText');
  const stringText = document.getElementById('stringText');

  let temp = 252;
  let retract = 0.2;
  let wipe = false;
  let isWet = true;

  tempSlider.addEventListener('input', (e) => {
    temp = Number(e.target.value);
    tempLbl.textContent = temp + '°C';
  });
  retSlider.addEventListener('input', (e) => {
    retract = Number(e.target.value);
    retLbl.textContent = retract.toFixed(1) + 'mm';
  });
  wipeBtn.addEventListener('click', () => {
    wipe = !wipe;
    wipeBtn.textContent = wipe ? '擦嘴 Wipe: 開' : '擦嘴 Wipe: 關';
    wipeBtn.classList.toggle('active', wipe);
  });
  wetBtn.addEventListener('click', () => {
    isWet = !isWet;
    wetBtn.textContent = isWet ? '狀態: 線材受潮' : '狀態: 乾燥完成 (<15%RH)';
    wetBtn.classList.toggle('wet', isWet);
    wetBtn.classList.toggle('active', !isWet);
  });

  const steamBubbles = Array.from({ length: 16 }, (_, i) => ({
    offset: Math.random(),
    phase: i * 0.7,
    r: 1.5 + Math.random() * 2.5
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function getStringSeverity() {
    const heatFactor = Math.max(0, (temp - 235) / 25);
    const retRelief = Math.min(1, retract / 1.0);
    const wipeFactor = wipe ? 0.35 : 1.0;
    const wetPenalty = isWet ? 0.55 : 0;
    return Math.max(0, Math.min(1, (heatFactor * 0.65 + (1 - retRelief) * 0.65) * wipeFactor + wetPenalty));
  }

  function frame(now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, w, h);

    // Bed surface
    const bedY = h - 18;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, bedY, w - 40, 8);

    // Two retraction test towers
    const t1X = w * 0.24;
    const t2X = w * 0.76;
    const towerW = Math.min(68, w * 0.16);
    const towerH = Math.min(126, Math.max(52, h - 108));
    const topY = bedY - towerH;

    // Draw towers with horizontal layer lines
    [t1X, t2X].forEach((tx) => {
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(tx - towerW / 2, topY, towerW, towerH);
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      for (let ly = topY + 6; ly < bedY; ly += 6) {
        ctx.beginPath();
        ctx.moveTo(tx - towerW / 2, ly);
        ctx.lineTo(tx + towerW / 2, ly);
        ctx.stroke();
      }
    });

    const severity = getStringSeverity();

    // Update telemetry text
    if (severity > 0.6) {
      pressureText.innerHTML = '熔膠腔殘餘壓力：<strong>高壓溢流' + (isWet ? ' + 水氣爆裂推擠' : '') + '</strong>';
      stringText.innerHTML = '牽絲風險評估：<strong style="color:#fb7185">嚴重蛛網拉絲 (' + Math.round(severity * 100) + '%)</strong>';
    } else if (severity > 0.22) {
      pressureText.innerHTML = '熔膠腔殘餘壓力：<strong>微幅正壓滲出</strong>';
      stringText.innerHTML = '牽絲風險評估：<strong style="color:#fbbf24">微量細絲 (' + Math.round(severity * 100) + '%)</strong>';
    } else {
      pressureText.innerHTML = '熔膠腔殘餘壓力：<strong>負壓鎖液平衡</strong>';
      stringText.innerHTML = '牽絲風險評估：<strong style="color:#34d399">潔淨零牽絲 (' + Math.round(severity * 100) + '%)</strong>';
    }

    // Draw accumulated strings between towers
    const stringCount = Math.round(severity * 14);
    for (let i = 0; i < stringCount; i++) {
      const sy = topY + 12 + (i / Math.max(1, stringCount)) * (towerH - 22);
      const sag = 3 + (i % 3) * 2.5;
      ctx.beginPath();
      ctx.moveTo(t1X + towerW / 2, sy);
      ctx.quadraticCurveTo(w * 0.5, sy + sag, t2X - towerW / 2, sy + (i % 2 ? 2 : -1));
      ctx.strokeStyle = 'rgba(186, 230, 253, ' + (0.25 + severity * 0.55) + ')';
      ctx.lineWidth = isWet ? 1.5 : 0.9;
      ctx.stroke();
    }

    // Animate nozzle travelling back and forth across gap
    const cycle = (now * 0.00045) % 2;
    const goingRight = cycle < 1;
    const p = goingRight ? cycle : 2 - cycle;
    const smoothP = p * p * (3 - 2 * p);
    const nozX = t1X + (t2X - t1X) * smoothP;
    const nozTipY = topY - 4;

    // Retraction state during travel
    const isTravelling = p > 0.14 && p < 0.86;
    const meniscusPull = isTravelling ? Math.min(18, retract * 11) : 0;

    // Draw Hotend Cutaway
    ctx.save();
    ctx.translate(nozX, nozTipY);

    // Heatsink fins
    ctx.fillStyle = '#334155';
    ctx.fillRect(-16, -78, 32, 24);
    for (let fy = -74; fy <= -58; fy += 5) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-20, fy, 40, 2);
    }

    // Heater block (color shifts with temp)
    const heatMix = (temp - 225) / 35;
    ctx.fillStyle = heatMix > 0.65 ? '#dc2626' : heatMix > 0.35 ? '#ea580c' : '#d97706';
    ctx.fillRect(-18, -46, 36, 24);

    // Brass nozzle cone
    ctx.beginPath();
    ctx.moveTo(-11, -22);
    ctx.lineTo(11, -22);
    ctx.lineTo(3, 0);
    ctx.lineTo(-3, 0);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    // Inner melt channel
    ctx.beginPath();
    ctx.moveTo(-5, -54);
    ctx.lineTo(5, -54);
    ctx.lineTo(5, -22);
    ctx.lineTo(1.5, -meniscusPull * 0.45);
    ctx.lineTo(-1.5, -meniscusPull * 0.45);
    ctx.lineTo(-5, -22);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Steam micro-bubbles when wet
    if (isWet) {
      steamBubbles.forEach((b) => {
        const bp = ((now * 0.002 + b.offset) % 1);
        const bx = Math.sin(b.phase + now * 0.01) * 2.8;
        const by = -42 + bp * 40;
        ctx.beginPath();
        ctx.arc(bx, by, b.r * (0.7 + bp * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - bp) * 0.85 + ')';
        ctx.fill();
      });
    }

    // Active stretching molten thread from nozzle tip while travelling
    if (isTravelling && severity > 0.15) {
      const originX = goingRight ? (t1X + towerW / 2 - nozX) : (t2X - towerW / 2 - nozX);
      ctx.beginPath();
      ctx.moveTo(originX, 4);
      ctx.quadraticCurveTo(originX * 0.45, 7, 0, 1);
      ctx.strokeStyle = 'rgba(125, 211, 252, ' + Math.min(0.95, severity) + ')';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Droplet hanging when wet or low retract
      if (severity > 0.55) {
        ctx.beginPath();
        ctx.arc(0, 3, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#7dd3fc';
        ctx.fill();
      }
    }

    ctx.restore();

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

  3: {
    title: '600mm/s 熔融流變學與體積流速比較儀',
    subtitle: '拉高列印速度滑桿，對比傳統 PLA 缺料發白與神狗勾 Hyper PLA 高流動熔體表現',
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
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .speed-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    background: #131c31;
    border: 1px solid #1e293b;
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 11px;
  }
  .speed-box label { white-space: nowrap; }
  .speed-box input { width: 120px; accent-color: #38bdf8; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; }
  .grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .panel {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: hidden;
  }
  .panel-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 12px;
    font-weight: 700;
  }
  canvas { flex: 1; min-height: 0; width: 100%; height: 100%; display: block; }
  .bar-bg {
    height: 7px;
    background: #1e293b;
    border-radius: 99px;
    overflow: hidden;
  }
  .bar-fill { height: 100%; transition: width 0.15s ease, background 0.15s ease; }
  .foot {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 10px;
    font-size: 11px;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .speed-box { width: 100%; justify-content: space-between; }
    .speed-box input { flex: 1; width: auto; min-width: 80px; }
    .grid { flex: none; grid-template-columns: 1fr; gap: 10px; }
    .panel { min-height: 185px; padding: 9px 10px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>高剪切流速對比：傳統 PLA vs 神狗勾 Hyper PLA</h2>
      <p>0.4mm 噴嘴 × 0.2mm 層高實際測試｜觀察線材進入加熱區後的熱傳導與擠出完整度</p>
    </div>
    <div class="speed-box">
      <label for="spdSlider">直線速度</label>
      <input id="spdSlider" type="range" min="60" max="600" step="10" value="380" />
      <span id="spdVal" class="mono" style="color:#38bdf8; min-width:74px;">380 mm/s</span>
      <span id="flowVal" class="mono" style="color:#fbbf24; min-width:78px;">30.4 mm³/s</span>
    </div>
  </div>

  <div class="grid">
    <div class="panel">
      <div class="panel-head">
        <span style="color:#94a3b8">市售普通 PLA (極限 ~15 mm³/s)</span>
        <span id="stdRatio" class="mono" style="color:#fb7185">流動壓力過載</span>
      </div>
      <canvas id="cStd"></canvas>
      <div class="bar-bg"><div id="stdBar" class="bar-fill" style="width:95%; background:#f43f5e"></div></div>
      <div class="foot">
        <span id="stdBead">擠出狀態：冷心欠料・發白粗糙</span>
        <span>層間結合：42%</span>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <span style="color:#38bdf8">神狗勾 Hyper PLA (極限 32 mm³/s)</span>
        <span id="hypRatio" class="mono" style="color:#34d399">順暢高速熔融</span>
      </div>
      <canvas id="cHyp"></canvas>
      <div class="bar-bg"><div id="hypBar" class="bar-fill" style="width:65%; background:#10b981"></div></div>
      <div class="foot">
        <span id="hypBead">擠出狀態：均勻光澤・稜角銳利</span>
        <span id="hypBond">層間結合：94%</span>
      </div>
    </div>
  </div>

<script>
(() => {
  const spdSlider = document.getElementById('spdSlider');
  const spdVal = document.getElementById('spdVal');
  const flowVal = document.getElementById('flowVal');
  const cStd = document.getElementById('cStd');
  const cHyp = document.getElementById('cHyp');
  const stdRatio = document.getElementById('stdRatio');
  const hypRatio = document.getElementById('hypRatio');
  const stdBar = document.getElementById('stdBar');
  const hypBar = document.getElementById('hypBar');
  const stdBead = document.getElementById('stdBead');
  const hypBead = document.getElementById('hypBead');
  const hypBond = document.getElementById('hypBond');

  let speed = 380;
  let scrollX = 0;

  function resize(c) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }
  const onResize = () => { resize(cStd); resize(cHyp); };
  window.addEventListener('resize', onResize);
  onResize();

  spdSlider.addEventListener('input', (e) => {
    speed = Number(e.target.value);
    updateLabels();
  });

  function getVolumetricFlow() {
    // 0.42mm width * 0.2mm layer height * speed * ~0.95
    return speed * 0.08;
  }

  function updateLabels() {
    const flow = getVolumetricFlow();
    spdVal.textContent = speed + ' mm/s';
    flowVal.textContent = flow.toFixed(1) + ' mm³/s';

    const stdLoad = Math.min(100, (flow / 16) * 100);
    const hypLoad = Math.min(100, (flow / 34) * 100);

    stdBar.style.width = stdLoad + '%';
    hypBar.style.width = hypLoad + '%';

    if (flow > 16) {
      stdBar.style.background = '#f43f5e';
      stdRatio.textContent = '超過極限 (+' + Math.round(((flow - 16) / 16) * 100) + '%)';
      stdRatio.style.color = '#fb7185';
      stdBead.textContent = '擠出狀態：冷心供料不足・跳齒發白';
    } else {
      stdBar.style.background = '#10b981';
      stdRatio.textContent = '負載 ' + Math.round(stdLoad) + '%';
      stdRatio.style.color = '#34d399';
      stdBead.textContent = '擠出狀態：正常出料・表面平滑';
    }

    if (flow > 33) {
      hypBar.style.background = '#f59e0b';
      hypRatio.textContent = '高負載臨界';
      hypRatio.style.color = '#fbbf24';
      hypBead.textContent = '擠出狀態：接近高流上限・微霧光';
      hypBond.textContent = '層間結合：86%';
    } else {
      hypBar.style.background = '#0ea5e9';
      hypRatio.textContent = '高效暢流 (' + Math.round(hypLoad) + '%)';
      hypRatio.style.color = '#34d399';
      hypBead.textContent = '擠出狀態：超微晶快速導熱・高強度';
      hypBond.textContent = '層間結合：' + (flow < 20 ? '97%' : '93%');
    }
  }
  updateLabels();

  function drawNozzleSim(canvas, maxFlow, isHyper, now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    const flow = getVolumetricFlow();
    const overload = Math.max(0, (flow - maxFlow) / maxFlow);
    const cx = w * 0.5;
    const bedY = h - 28;
    const tipY = bedY - 12;

    // Moving build plate stripes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, bedY, w - 20, 8);

    // Extruded filament bead trailing to the left
    const beadStart = cx;
    const beadLen = cx - 16;
    const step = 6;
    for (let x = beadStart; x > 16; x -= step) {
      const dist = beadStart - x;
      const phase = dist + scrollX;
      let thick = 9;
      let color = isHyper ? '#38bdf8' : '#818cf8';
      if (overload > 0.08) {
        const skip = Math.sin(phase * 0.14) + Math.cos(phase * 0.07);
        if (skip > 0.9 - Math.min(0.8, overload * 0.65)) {
          thick = 2.5;
          color = '#e2e8f0'; // under-extruded white craze marks
        } else {
          thick = Math.max(3.5, 8.5 - overload * 4);
          color = isHyper ? '#7dd3fc' : '#cbd5e1';
        }
      }
      ctx.fillStyle = color;
      ctx.fillRect(x - step, bedY - thick, step - (overload > 0.2 ? 1.5 : 0), thick);
    }

    // Heater block & nozzle
    const nozTop = tipY - 56;
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(cx - 26, nozTop + 10, 52, 26);

    ctx.beginPath();
    ctx.moveTo(cx - 14, nozTop + 36);
    ctx.lineTo(cx + 14, nozTop + 36);
    ctx.lineTo(cx + 3, tipY);
    ctx.lineTo(cx - 3, tipY);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Inner filament core showing melt profile
    ctx.beginPath();
    ctx.moveTo(cx - 7, 10);
    ctx.lineTo(cx + 7, 10);
    ctx.lineTo(cx + 7, nozTop + 34);
    ctx.lineTo(cx + 2, tipY);
    ctx.lineTo(cx - 2, tipY);
    ctx.lineTo(cx - 7, nozTop + 34);
    ctx.closePath();

    const meltGrad = ctx.createLinearGradient(0, nozTop, 0, tipY);
    if (isHyper) {
      meltGrad.addColorStop(0, '#0284c7');
      meltGrad.addColorStop(0.35, '#fb923c');
      meltGrad.addColorStop(1, '#fbbf24');
    } else {
      meltGrad.addColorStop(0, '#4f46e5');
      meltGrad.addColorStop(Math.min(0.9, 0.55 + overload * 0.35), '#6366f1'); // cold core penetrates deep!
      meltGrad.addColorStop(1, overload > 0.1 ? '#f97316' : '#fbbf24');
    }
    ctx.fillStyle = meltGrad;
    ctx.fill();

    // Flowing polymer particles inside channel
    const particleSpd = (speed / 600) * 2.8;
    for (let i = 0; i < 6; i++) {
      const py = ((now * 0.05 * particleSpd + i * 16) % (tipY - 16)) + 14;
      const spread = py > nozTop + 36 ? 1.5 : 3.5;
      const px = cx + Math.sin(i * 2.1 + now * 0.004) * spread;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = (now - last) / 1000;
    last = now;
    scrollX += speed * dt * 0.35;

    drawNozzleSim(cStd, 16, false, now);
    drawNozzleSim(cHyp, 33, true, now);

    requestAnimationFrame(loop);
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
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`
  },

  4: {
    title: '熱收縮應力 vs. PEI 底板抓地力抗翹邊 (Warping) 模擬器',
    subtitle: '模擬大面積列印時的冷卻收縮張力，即時啟用洗碗精清潔、外緣 Brim 與關閉前 3 層風扇',
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
  .embedded .head > div:first-child { display: none; }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .head h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .head p { font-size: 11px; color: #94a3b8; }
  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .chk {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #131c31;
    border: 1px solid #334155;
    color: #e2e8f0;
    padding: 6px 11px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
  }
  .chk.on {
    background: #065f46;
    border-color: #10b981;
    color: #ecfdf5;
  }
  .stage {
    flex: 1;
    min-height: 0;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    position: relative;
    overflow: hidden;
  }
  canvas { width: 100%; height: 100%; display: block; }
  .metrics {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: #94a3b8;
    line-height: 1.4;
  }
  .metrics strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .toggles { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .chk { padding: 7px 8px; font-size: 11px; line-height: 1.25; }
    .stage { flex: none; height: 245px; }
  }
</style>
</head>
<body>
  <div class="head">
    <div>
      <h2>熱收縮應力向量 & PEI 底板抗翹邊模擬器</h2>
      <p>勾選下方對應實戰對策，即時觀察底板附著力 (F_adh) 如何壓制收縮張力 (F_warp)</p>
    </div>
    <div class="toggles">
      <button id="btnWash" class="chk" type="button">1. 洗碗精洗淨 PEI 油膜</button>
      <button id="btnZ" class="chk" type="button">2. 校準黃金 Z-Offset</button>
      <button id="btnBrim" class="chk" type="button">3. 開啟 8mm 外緣 Brim</button>
      <button id="btnFan" class="chk" type="button">4. 關閉前 3 層風扇</button>
    </div>
  </div>

  <div class="stage">
    <canvas id="warpCanvas"></canvas>
  </div>

  <div class="metrics">
    <span id="forceReadout">底板抓地力：<strong>22 N</strong> ｜ 上層冷卻拉扯應力：<strong>68 N</strong></span>
    <span id="warpVerdict" style="color:#fb7185; font-weight:700;">邊角嚴重翹曲脫離！</span>
  </div>

<script>
(() => {
  const state = { wash: false, z: false, brim: false, fan: false };
  const buttons = [
    ['btnWash', 'wash'],
    ['btnZ', 'z'],
    ['btnBrim', 'brim'],
    ['btnFan', 'fan']
  ];
  buttons.forEach(([id, key]) => {
    const btn = document.getElementById(id);
    btn.addEventListener('click', () => {
      state[key] = !state[key];
      btn.classList.toggle('on', state[key]);
    });
  });

  const canvas = document.getElementById('warpCanvas');
  const forceReadout = document.getElementById('forceReadout');
  const warpVerdict = document.getElementById('warpVerdict');

  let currentCurl = 28;

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

    const adhesionForce = 22 + (state.wash ? 34 : 0) + (state.z ? 24 : 0) + (state.brim ? 26 : 0);
    const shrinkStress = state.fan ? 34 : 68;
    const targetCurl = Math.max(0, (shrinkStress - adhesionForce) * 0.72);
    currentCurl += (targetCurl - currentCurl) * 0.1;

    forceReadout.innerHTML =
      '底板抓地力：<strong>' + adhesionForce + ' N</strong> ｜ 上層冷卻拉扯應力：<strong>' + shrinkStress + ' N</strong>';

    if (currentCurl < 1.2) {
      warpVerdict.textContent = '完美服貼：邊角平貼零翹曲';
      warpVerdict.style.color = '#34d399';
    } else if (currentCurl < 14) {
      warpVerdict.textContent = '輕微邊角應力集中，建議加開 Brim 或清潔鋼板';
      warpVerdict.style.color = '#fbbf24';
    } else {
      warpVerdict.textContent = '警告：收縮力大於抓地力，邊角嚴重翹邊！';
      warpVerdict.style.color = '#fb7185';
    }

    const bedY = h * 0.74;
    const plateW = Math.min(w - 32, 480);
    const leftX = (w - plateW) / 2;

    // Heated magnetic bed
    ctx.fillStyle = '#334155';
    ctx.fillRect(leftX, bedY + 8, plateW, 12);
    // Golden Textured PEI sheet
    const peiGrad = ctx.createLinearGradient(leftX, bedY, leftX + plateW, bedY);
    peiGrad.addColorStop(0, '#b45309');
    peiGrad.addColorStop(0.5, '#f59e0b');
    peiGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = peiGrad;
    ctx.fillRect(leftX, bedY, plateW, 8);

    // Oil sheen overlay if unwashed
    if (!state.wash) {
      const sheenW = Math.min(64, plateW * 0.22);
      ctx.fillStyle = 'rgba(251, 113, 133, 0.38)';
      ctx.fillRect(leftX + 18, bedY - 2, sheenW, 3);
      ctx.fillRect(leftX + plateW - 18 - sheenW, bedY - 2, sheenW, 3);
      ctx.fillStyle = '#fda4af';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      if (w < 420) {
        ctx.fillText('手指油膜殘留區（底板抓地力大幅下降）', w * 0.5, bedY + 34);
      } else {
        ctx.fillText('手指油膜殘留區 (低抓地力)', leftX + 72, bedY + 34);
        ctx.fillText('手指油膜殘留區', leftX + plateW - 72, bedY + 34);
      }
    } else {
      ctx.fillStyle = '#34d399';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PEI 微米粗糙顆粒已徹底脫脂潔淨', w * 0.5, bedY + 34);
    }

    // Printed multi-layer model warping at left & right edges
    const modelW = plateW * 0.68;
    const modelH = Math.min(76, h * 0.30);
    const mLeft = (w - modelW) / 2;
    const mRight = mLeft + modelW;

    // Brim flaps if enabled
    if (state.brim) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(mLeft - 20, bedY - 3 - currentCurl * 0.25, 20, 3);
      ctx.fillRect(mRight, bedY - 3 - currentCurl * 0.25, 20, 3);
    }

    // Draw layered warped body
    const layers = 14;
    for (let l = 0; l < layers; l++) {
      const ly = bedY - 3 - (l / layers) * modelH;
      const frac = 1 - l / layers;
      const curlEdge = currentCurl * (0.4 + 0.6 * frac);
      const t = l / layers;

      ctx.beginPath();
      ctx.moveTo(mLeft, ly - curlEdge);
      ctx.quadraticCurveTo(w * 0.5, ly + curlEdge * 0.1, mRight, ly - curlEdge);
      ctx.strokeStyle = state.fan
        ? 'rgb(' + Math.round(56 + t * 120) + ',' + Math.round(189 - t * 40) + ',248)'
        : 'rgb(' + Math.round(100 + t * 140) + ',' + Math.round(116 + (1 - t) * 70) + ',240)';
      ctx.lineWidth = modelH / layers + 0.5;
      ctx.stroke();
    }

    // Cooling fan airflow if not turned off for first 3 layers
    if (!state.fan) {
      const fPulse = (now * 0.004) % 1;
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const ax = Math.max(14, mLeft - 24) + i * 14;
        const ay = Math.max(24, bedY - 76) + fPulse * 48;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 15, ay + 12);
        ctx.stroke();
      }
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('強風急速冷卻收縮', w * 0.5, 16);
    }

    // Force vectors on left corner
    const cornerX = mLeft + 10;
    const cornerY = bedY - currentCurl;
    // Shrink upward arrow
    ctx.strokeStyle = '#fb7185';
    ctx.fillStyle = '#fb7185';
    ctx.lineWidth = 2.2;
    const upLen = Math.min(42, shrinkStress * 0.58);
    ctx.beginPath();
    ctx.moveTo(cornerX, cornerY - 6);
    ctx.lineTo(cornerX, cornerY - 6 - upLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cornerX, cornerY - 12 - upLen);
    ctx.lineTo(cornerX - 5, cornerY - 4 - upLen);
    ctx.lineTo(cornerX + 5, cornerY - 4 - upLen);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('收縮拉力 ' + shrinkStress + 'N', Math.max(10, cornerX - 24), Math.max(30, cornerY - 16 - upLen));

    // Adhesion downward arrow on right corner
    const rCornerX = mRight - 10;
    const rCornerY = bedY - currentCurl;
    ctx.strokeStyle = '#34d399';
    ctx.fillStyle = '#34d399';
    const downLen = Math.min(40, adhesionForce * 0.36);
    ctx.beginPath();
    ctx.moveTo(rCornerX, rCornerY - 22 - downLen);
    ctx.lineTo(rCornerX, rCornerY - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rCornerX, rCornerY - 8);
    ctx.lineTo(rCornerX - 5, rCornerY - 16);
    ctx.lineTo(rCornerX + 5, rCornerY - 16);
    ctx.closePath();
    ctx.fill();
    ctx.textAlign = 'right';
    ctx.fillText('抓地力 ' + adhesionForce + 'N', Math.min(w - 10, rCornerX + 24), Math.max(30, rCornerY - 26 - downLen));

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

  5: {
    title: '碳纖維 (PLA-CF / PA-CF) 噴嘴內壁顯微磨損演化模擬',
    subtitle: '拖動累計列印克數 (0g → 1000g)，觀察高硬度短切碳纖維如何快速刮蝕黃銅與硬化鋼噴嘴',
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
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .ctrl-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #131c31;
    border: 1px solid #1e293b;
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 11px;
  }
  .ctrl-row label { white-space: nowrap; }
  .ctrl-row input { width: 130px; accent-color: #f59e0b; cursor: pointer; }
  .mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-weight: 700; }
  .grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: hidden;
  }
  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 8px;
    font-size: 12px;
    font-weight: 700;
  }
  canvas { flex: 1; min-height: 0; width: 100%; height: 100%; display: block; }
  .card-foot {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 8px;
    font-size: 11px;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .ctrl-row { width: 100%; justify-content: space-between; }
    .ctrl-row input { flex: 1; width: auto; min-width: 70px; }
    .grid { flex: none; grid-template-columns: 1fr; gap: 10px; }
    .card { min-height: 188px; padding: 9px 10px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>碳纖維短切微粒 (50–150μm) 噴嘴磨損顯微鏡</h2>
      <p>標稱孔徑 0.40 mm｜比較莫氏硬度 3 黃銅噴嘴與洛氏硬度 HRC60 硬化鋼噴嘴的壽命差距</p>
    </div>
    <div class="ctrl-row">
      <label>已列印碳纖耗材量</label>
      <input id="gramSlider" type="range" min="0" max="1000" step="20" value="480" />
      <span id="gramVal" class="mono" style="color:#fbbf24; min-width:54px;">480 g</span>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <span style="color:#fbbf24">原廠黃銅噴嘴 (Brass HV120)</span>
        <span id="brassDia" class="mono" style="color:#fb7185">實測孔徑：0.56 mm</span>
      </div>
      <canvas id="cBrass"></canvas>
      <div class="card-foot">
        <span id="brassStatus">狀態：內壁嚴重擴孔磨耗</span>
        <span id="brassFlow" class="mono">溢料誤差：+96%</span>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <span style="color:#38bdf8">硬化鋼噴嘴 (Hardened Steel HRC60)</span>
        <span id="steelDia" class="mono" style="color:#34d399">實測孔徑：0.40 mm</span>
      </div>
      <canvas id="cSteel"></canvas>
      <div class="card-foot">
        <span id="steelStatus">狀態：微米級抗磨幾何完整</span>
        <span id="steelFlow" class="mono">溢料誤差：+0%</span>
      </div>
    </div>
  </div>

<script>
(() => {
  const gramSlider = document.getElementById('gramSlider');
  const gramVal = document.getElementById('gramVal');
  const cBrass = document.getElementById('cBrass');
  const cSteel = document.getElementById('cSteel');
  const brassDia = document.getElementById('brassDia');
  const steelDia = document.getElementById('steelDia');
  const brassStatus = document.getElementById('brassStatus');
  const steelStatus = document.getElementById('steelStatus');
  const brassFlow = document.getElementById('brassFlow');
  const steelFlow = document.getElementById('steelFlow');

  let grams = 480;

  const fibers = Array.from({ length: 24 }, (_, i) => ({
    ySeed: Math.random(),
    xOff: (Math.random() - 0.5) * 2,
    angle: (Math.random() - 0.5) * 0.9,
    speed: 0.7 + Math.random() * 0.6,
    len: 7 + Math.random() * 6
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
  const onResize = () => { resize(cBrass); resize(cSteel); };
  window.addEventListener('resize', onResize);
  onResize();

  gramSlider.addEventListener('input', (e) => {
    grams = Number(e.target.value);
    gramVal.textContent = grams + ' g';
  });

  function drawNozzleCutaway(canvas, isSteel, now) {
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const wearFactor = isSteel ? (grams / 1000) * 0.025 : (grams / 1000) * 0.92;
    const boreHalf = 7 + wearFactor * 16; // 7px represents 0.40mm
    const topBoreHalf = 22;
    const throatY = h * 0.48;
    const exitY = h * 0.80;

    // Outer nozzle cone walls
    ctx.fillStyle = isSteel ? '#475569' : '#d97706';
    ctx.beginPath();
    ctx.moveTo(cx - 58, 18);
    ctx.lineTo(cx + 58, 18);
    ctx.lineTo(cx + 24, exitY);
    ctx.lineTo(cx - 24, exitY);
    ctx.closePath();
    ctx.fill();

    // Inner eroded melt cavity
    ctx.fillStyle = '#0b1120';
    ctx.beginPath();
    ctx.moveTo(cx - topBoreHalf, 16);
    ctx.lineTo(cx + topBoreHalf, 16);
    ctx.lineTo(cx + topBoreHalf, throatY);
    ctx.lineTo(cx + boreHalf, exitY + 2);
    ctx.lineTo(cx - boreHalf, exitY + 2);
    ctx.lineTo(cx - topBoreHalf, throatY);
    ctx.closePath();
    ctx.fill();

    // Molten polymer fill inside cavity
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fill();

    // Rough abrasive wall highlight for worn brass
    if (!isSteel && wearFactor > 0.15) {
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(cx - topBoreHalf, throatY);
      ctx.lineTo(cx - boreHalf, exitY);
      ctx.moveTo(cx + topBoreHalf, throatY);
      ctx.lineTo(cx + boreHalf, exitY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Flowing short chopped carbon fibers tumbling through melt
    fibers.forEach((f, idx) => {
      const p = (f.ySeed + now * 0.00045 * f.speed) % 1;
      const y = 18 + p * (h - 26);
      let maxSpread = topBoreHalf - 4;
      if (y > throatY && y <= exitY) {
        const t = (y - throatY) / (exitY - throatY);
        maxSpread = topBoreHalf * (1 - t) + boreHalf * t - 2;
      } else if (y > exitY) {
        maxSpread = boreHalf - 1;
      }
      const x = cx + Math.sin(f.xOff * 3 + p * 6 + idx) * Math.max(1, maxSpread);
      const ang = y > throatY ? f.angle * 0.3 : f.angle + p * 2;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-f.len / 2, 0);
      ctx.lineTo(f.len / 2, 0);
      ctx.stroke();
      ctx.restore();

      // Metal abrasion spark on worn brass wall
      if (!isSteel && grams > 60 && y > throatY && y < exitY && Math.abs(x - cx) > maxSpread - 2.5) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.fill();
      }
    });

    // Extruded line width indicator below nozzle
    const outW = boreHalf * 2;
    ctx.fillStyle = isSteel ? '#64748b' : '#f43f5e';
    ctx.fillRect(cx - outW / 2, exitY + 1, outW, h - exitY - 6);

    // Bore measurement caliper arrows
    const arrowY = exitY + 14;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - boreHalf, arrowY);
    ctx.lineTo(cx + boreHalf, arrowY);
    ctx.stroke();
  }

  function loop(now) {
    const brassMm = 0.4 + (grams / 1000) * 0.34;
    const steelMm = 0.4 + (grams / 1000) * 0.01;
    const brassAreaErr = Math.round((Math.pow(brassMm / 0.4, 2) - 1) * 100);
    const steelAreaErr = Math.round((Math.pow(steelMm / 0.4, 2) - 1) * 100);

    brassDia.textContent = '實測孔徑：' + brassMm.toFixed(2) + ' mm';
    brassDia.style.color = brassMm > 0.46 ? '#fb7185' : '#fbbf24';
    brassFlow.textContent = '溢料誤差：+' + brassAreaErr + '%';
    brassStatus.textContent = brassMm > 0.5 ? '狀態：嚴重擴孔失真・層紋崩壞' : brassMm > 0.43 ? '狀態：孔壁出現顯著磨耗' : '狀態：尚未嚴重磨損';

    steelDia.textContent = '實測孔徑：' + steelMm.toFixed(2) + ' mm';
    steelFlow.textContent = '溢料誤差：+' + steelAreaErr + '%';

    drawNozzleCutaway(cBrass, false, now);
    drawNozzleSimCall(now);
    requestAnimationFrame(loop);
  }
  function drawNozzleSimCall(now) {
    drawNozzleCutaway(cSteel, true, now);
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
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`
  },

  6: {
    title: '拓竹 Bambu Lab AMS 四通道切換與沖刷廢料最佳化引擎',
    subtitle: '點擊切換 4 色線盤進退料，調整「沖刷倍率與沖刷到填充」即時精算廢料節省比率',
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
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .top h2 { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .top p { font-size: 11px; color: #94a3b8; }
  .controls {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
  }
  .slot-btn {
    border: 1px solid #334155;
    background: #131c31;
    color: #e2e8f0;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .slot-btn.active { border-color: #38bdf8; background: #1e293b; box-shadow: 0 0 0 1px #38bdf8 inset; }
  .swatch { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .opt-btn {
    border: 1px solid #334155;
    background: #131c31;
    color: #cbd5e1;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }
  .opt-btn.on { background: #065f46; border-color: #10b981; color: #ecfdf5; }
  .stage {
    flex: 1;
    min-height: 0;
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    overflow: hidden;
  }
  canvas { width: 100%; height: 100%; display: block; }
  .foot {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 11px;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
  }
  .foot strong { color: #f8fafc; }
  @media (max-width: 600px) {
    body { height: auto; min-height: 100%; overflow-x: hidden; padding: 10px 12px; gap: 8px; }
    .controls { width: 100%; }
    .slot-btn { flex: 1 1 20%; justify-content: center; padding: 6px 6px; }
    .opt-btn { width: 100%; text-align: center; }
    .stage { flex: none; height: 240px; }
  }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h2>AMS 五通選料機構與換色沖刷減廢系統</h2>
      <p>點擊切換槽位 A1–A4 模擬切刀換色與沖刷排料過程</p>
    </div>
    <div class="controls">
      <button class="slot-btn active" data-slot="0"><span class="swatch" style="background:#f8fafc"></span>A1 白</button>
      <button class="slot-btn" data-slot="1"><span class="swatch" style="background:#ef4444"></span>A2 紅</button>
      <button class="slot-btn" data-slot="2"><span class="swatch" style="background:#38bdf8"></span>A3 藍</button>
      <button class="slot-btn" data-slot="3"><span class="swatch" style="background:#1e293b; border:1px solid #64748b"></span>A4 黑</button>
      <button id="optBtn" class="opt-btn on" type="button">沖刷減量 (0.6x + 填入填充)</button>
    </div>
  </div>

  <div class="stage">
    <canvas id="amsCanvas"></canvas>
  </div>

  <div class="foot">
    <span id="phaseLbl">系統狀態：<strong>A1 白色料線進料就緒</strong></span>
    <span id="wasteLbl">單次換色廢料：<strong style="color:#34d399">0.28 g (已省 71% 廢料)</strong></span>
  </div>

<script>
(() => {
  const canvas = document.getElementById('amsCanvas');
  const slotBtns = document.querySelectorAll('.slot-btn');
  const optBtn = document.getElementById('optBtn');
  const phaseLbl = document.getElementById('phaseLbl');
  const wasteLbl = document.getElementById('wasteLbl');

  const colors = ['#f8fafc', '#ef4444', '#38bdf8', '#334155'];
  const names = ['A1 象牙白', 'A2 烈焰紅', 'A3 寶石藍', 'A4 消光黑'];
  let activeSlot = 0;
  let prevSlot = 0;
  let optimized = true;
  let switchTime = -1;
  let purgeDrops = [];

  slotBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = Number(btn.dataset.slot);
      if (next === activeSlot) return;
      prevSlot = activeSlot;
      activeSlot = next;
      slotBtns.forEach((b) => b.classList.toggle('active', Number(b.dataset.slot) === activeSlot));
      switchTime = performance.now();
    });
  });

  optBtn.addEventListener('click', () => {
    optimized = !optimized;
    optBtn.classList.toggle('on', optimized);
    optBtn.textContent = optimized ? '沖刷減量 (0.6x + 填入填充)' : '原廠預設沖刷 (1.0x)';
    updateWasteText();
  });

  function updateWasteText() {
    const isDarkToLight = prevSlot === 3 && activeSlot === 0;
    const baseGrams = isDarkToLight ? 1.15 : 0.95;
    const finalGrams = optimized ? (baseGrams * 0.29) : baseGrams;
    if (optimized) {
      wasteLbl.innerHTML = '單次換色排料：<strong style="color:#34d399">' + finalGrams.toFixed(2) + ' g (已省 71% 廢料)</strong>';
    } else {
      wasteLbl.innerHTML = '單次換色排料：<strong style="color:#fb7185">' + finalGrams.toFixed(2) + ' g (預設高耗料)</strong>';
    }
  }
  updateWasteText();

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

    let stageProgress = 1;
    let phase = 'ready'; // cut -> retract -> feed -> purge -> ready
    if (switchTime > 0) {
      const elapsed = now - switchTime;
      stageProgress = elapsed / 2600;
      if (stageProgress >= 1) {
        switchTime = -1;
        stageProgress = 1;
      } else if (stageProgress < 0.2) phase = 'cut';
      else if (stageProgress < 0.45) phase = 'retract';
      else if (stageProgress < 0.7) phase = 'feed';
      else phase = 'purge';
    }

    if (phase === 'cut') phaseLbl.innerHTML = '系統狀態：<strong>1. 工具頭切刀切斷舊線材...</strong>';
    else if (phase === 'retract') phaseLbl.innerHTML = '系統狀態：<strong>2. AMS 馬達將 ' + names[prevSlot] + ' 退回料盤...</strong>';
    else if (phase === 'feed') phaseLbl.innerHTML = '系統狀態：<strong>3. 五通閥導入 ' + names[activeSlot] + ' 至噴頭...</strong>';
    else if (phase === 'purge') phaseLbl.innerHTML = '系統狀態：<strong>4. ' + (optimized ? '轉向模型內部填充進行低耗能沖刷...' : '大量擠出廢料塔沖刷清洗噴嘴...') + '</strong>';
    else phaseLbl.innerHTML = '系統狀態：<strong>' + names[activeSlot] + ' 高速列印供料中</strong>';

    // Draw 4 Spools in AMS on left
    const isNarrow = w < 440;
    const amsX = isNarrow ? 10 : 20;
    const amsY = isNarrow ? 16 : 22;
    const amsW = isNarrow ? w * 0.48 : Math.min(w * 0.44, 290);
    const spoolSpacing = (amsW - (isNarrow ? 14 : 30)) / 4;
    const spR = Math.min(22, Math.max(10, spoolSpacing * 0.34));
    const headX = w - (isNarrow ? 44 : 80);
    const hubX = amsX + amsW + (headX - amsX - amsW) * 0.44;
    const hubY = h * 0.52;
    const headY = h * 0.44;

    // AMS outer chassis
    ctx.fillStyle = '#131c31';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(amsX, amsY, amsW, h - amsY * 2, 12);
    ctx.fill();
    ctx.stroke();

    // Draw each spool & PTFE tube to 5-way hub
    for (let i = 0; i < 4; i++) {
      const sx = amsX + (isNarrow ? 8 : 16) + i * spoolSpacing + spoolSpacing / 2;
      const sy = amsY + 52;
      const isCur = i === activeSlot && phase !== 'retract' && phase !== 'cut';
      const isRet = i === prevSlot && (phase === 'retract' || phase === 'cut');

      // PTFE tube path from spool to hub
      const tubeMidX = (sx + hubX) * 0.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy + spR + 4);
      ctx.bezierCurveTo(sx, hubY, tubeMidX, hubY, hubX - 14, hubY + (i - 1.5) * 5);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = isNarrow ? 4 : 6;
      ctx.stroke();

      // Filament inside tube
      let fillFrac = 0.08;
      if (isCur) fillFrac = phase === 'feed' ? (stageProgress - 0.45) / 0.25 : 1;
      else if (isRet) fillFrac = phase === 'cut' ? 1 : 1 - (stageProgress - 0.2) / 0.25;

      if (fillFrac > 0.02) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy + spR + 4);
        ctx.bezierCurveTo(sx, hubY, tubeMidX, hubY, hubX - 14, hubY + (i - 1.5) * 5);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2.4;
        ctx.setLineDash([fillFrac * 260, 400]);
        ctx.stroke();
        ctx.restore();
      }

      // Spool circle rotating when active
      ctx.save();
      ctx.translate(sx, sy);
      if (isCur || isRet) {
        ctx.rotate((isRet ? -1 : 1) * now * 0.004);
      }
      ctx.beginPath();
      ctx.arc(0, 0, spR, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.lineWidth = Math.max(4, spR * 0.32);
      ctx.strokeStyle = colors[i];
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(4, spR * 0.36), 0, Math.PI * 2);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      // Slot number label
      ctx.fillStyle = isCur ? '#38bdf8' : '#94a3b8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('A' + (i + 1), sx, amsY + 18);
    }

    // 5-way Filament Hub
    const hubW = isNarrow ? 26 : 36;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(hubX - hubW / 2, hubY - 18, hubW, 36, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('五通閥', hubX, hubY + 30);

    // Main PTFE line from Hub to Toolhead
    ctx.beginPath();
    ctx.moveTo(hubX + hubW / 2, hubY);
    ctx.bezierCurveTo(hubX + 26, hubY, headX - 28, headY - 26, headX, headY - 26);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = isNarrow ? 4 : 6;
    ctx.stroke();

    const activeFeedColor = (phase === 'cut' || phase === 'retract') ? colors[prevSlot] : colors[activeSlot];
    ctx.beginPath();
    ctx.moveTo(hubX + hubW / 2, hubY);
    ctx.bezierCurveTo(hubX + 26, hubY, headX - 28, headY - 26, headX, headY - 26);
    ctx.strokeStyle = activeFeedColor;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Toolhead
    const thW = isNarrow ? 34 : 44;
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(headX - thW / 2, headY - 26, thW, 42, 6);
    ctx.fill();
    // Nozzle tip
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(headX - 6, headY + 16);
    ctx.lineTo(headX + 6, headY + 16);
    ctx.lineTo(headX + 2, headY + 29);
    ctx.lineTo(headX - 2, headY + 29);
    ctx.closePath();
    ctx.fill();

    // Purge chute / infill purge visualization
    if (phase === 'purge') {
      if (Math.random() < (optimized ? 0.25 : 0.7)) {
        purgeDrops.push({
          x: headX + (Math.random() - 0.5) * 6,
          y: headY + 31,
          vy: 1.8 + Math.random() * 1.4,
          color: Math.random() > 0.4 ? colors[activeSlot] : colors[prevSlot]
        });
      }
    }

    // Printed part / infill block below toolhead
    const partY = h - 38;
    const partW = isNarrow ? 64 : 78;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(headX - partW / 2, partY, partW, 22);
    ctx.strokeStyle = colors[activeSlot];
    ctx.lineWidth = 2;
    ctx.strokeRect(headX - partW / 2, partY, partW, 22);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.fillText(optimized ? (isNarrow ? '填入填充' : '廢料匯入內部填充') : (isNarrow ? '排泄廢料' : '外部排泄廢料塊'), headX, partY + 14);

    purgeDrops = purgeDrops.filter((d) => d.y < partY);
    purgeDrops.forEach((d) => {
      d.y += d.vy;
      ctx.beginPath();
      ctx.arc(d.x, d.y, optimized ? 2.2 : 3.6, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
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
  }
};
