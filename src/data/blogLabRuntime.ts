// Included in each exported HTML file so the standalone and embedded labs behave alike.
export const labStyles = `
body { height: auto; min-height: 0; overflow: visible; line-height: 1.45; }
body > *, .grid > *, .stage > * { min-width: 0; }
.stage:has(> canvas), .canvas-wrap { flex: none; height: clamp(230px, 38vw, 320px); }
.grid, .stage:has(.chamber) { flex: none; }
:is(.chamber, .panel, .card) > canvas { flex: none; width: 100%; height: clamp(160px, 25vw, 230px); }
:is(.foot, .status-line, .metrics, .telemetry, .panel-head, .card-head, .chamber-head, .phead, .chead, .pfoot, .cfoot, .card-foot, .controls, .ctrls, .ctrl-row, .ctrl, .sbox, .slider-box, .slider-wrap, .speed-box) {
  flex-wrap: wrap; row-gap: 4px; min-width: 0; max-width: 100%;
}
body :is(label, button, .mono, .val) { white-space: normal; overflow-wrap: anywhere; }
body input[type=range] { max-width: 100%; }
.lab-notes { display: flex; flex-wrap: wrap; gap: 3px 16px; color: #cbd5e1; font: 12px/1.55 system-ui,sans-serif; overflow-wrap: anywhere; }
.lab-notes:empty { display: none; }
@media (max-width: 600px) {
  body { min-height: 0; }
  .stage:has(> canvas), .canvas-wrap { height: 245px; }
}
`;

export const labRuntime = `
  let labVisible = true;
  let labFrame = 0;
  let nextDraw;
  let lastTick;
  let labTime = performance.now();
  const labNow = () => labTime;
  const layers = new Map();

  function setLabText(element, text) {
    if (element.textContent !== text) element.textContent = text;
  }

  function drawLabLabel(ctx, value, x, y) {
    const canvas = ctx.canvas;
    let layer = layers.get(canvas);
    if (!layer) {
      const notes = document.createElement('div');
      notes.className = 'lab-notes';
      const anchor = canvas.closest('.stage:has(> canvas), .canvas-wrap') || canvas;
      anchor.after(notes);
      layer = { notes, boxes: [], captions: [] };
      layers.set(canvas, layer);
    }
    const text = String(value);
    const metrics = ctx.measureText(text);
    const box = { left: x - metrics.actualBoundingBoxLeft, right: x + metrics.actualBoundingBoxRight,
      top: y - metrics.actualBoundingBoxAscent, bottom: y + metrics.actualBoundingBoxDescent };
    const fits = box.left >= 2 && box.right <= canvas.clientWidth - 2 &&
      box.top >= 2 && box.bottom <= canvas.clientHeight - 2;
    const overlaps = layer.boxes.some(b => box.left < b.right + 3 && box.right > b.left - 3 &&
      box.top < b.bottom + 2 && box.bottom > b.top - 2);
    if (fits && !overlaps) {
      layer.boxes.push(box);
      ctx.fillText(text, x, y);
    } else {
      layer.captions.push(text);
    }
  }

  function tick(now) {
    labFrame = 0;
    if (!labVisible || document.hidden || !nextDraw) return;
    labTime += lastTick === undefined ? 0 : Math.min(64, now - lastTick);
    lastTick = now;
    const draw = nextDraw;
    nextDraw = undefined;
    for (const layer of layers.values()) {
      layer.boxes.length = 0;
      layer.captions.length = 0;
    }
    draw(labTime);
    for (const layer of layers.values()) {
      const signature = layer.captions.join('\\n');
      if (signature === layer.signature) continue;
      layer.signature = signature;
      layer.notes.replaceChildren(...layer.captions.map(text => {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
      }));
    }
  }
  function scheduleLabFrame(draw) {
    nextDraw = draw;
    if (labVisible && !document.hidden && !labFrame) labFrame = requestAnimationFrame(tick);
  }
  function updatePlayback() {
    if (!labVisible || document.hidden) {
      cancelAnimationFrame(labFrame);
      labFrame = 0;
      lastTick = undefined;
    } else if (nextDraw) scheduleLabFrame(nextDraw);
  }
  new IntersectionObserver(([entry]) => {
    labVisible = entry.isIntersecting;
    updatePlayback();
  }).observe(document.body);
  document.addEventListener('visibilitychange', updatePlayback);
  if (window.self !== window.top) {
    document.documentElement.classList.add('embedded');
    new ResizeObserver(() => window.parent.postMessage({
      type: 'goddog-sim-height', height: document.body.offsetHeight
    }, '*')).observe(document.body);
  }
`;
