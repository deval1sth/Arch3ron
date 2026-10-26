(() => {
  'use strict';

  const instances = new WeakMap();
  const DAY = 86400000;
  const pad = n => String(n).padStart(2, '0');
  const localToday = () => {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };
  const serial = key => {
    if (!/^\d{4}-\d\d-\d\d$/.test(key || '')) return NaN;
    const n = Date.parse(key + 'T00:00:00Z');
    return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === key ? n / DAY : NaN;
  };
  const dateKey = n => new Date(n * DAY).toISOString().slice(0, 10);
  const dateLabel = key => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  };
  const fullDate = key => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  const score = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null;
  const fmt = n => n == null ? 'no data' : String(Math.round(n));
  const safe = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const tie = (you, riv) => Math.abs(you - riv) <= Math.max(you, riv, 1) * 0.05;
  const lead = (you, riv) => tie(you, riv) ? 0 : you > riv ? 1 : -1;

  function prepare(data) {
    const rows = Array.isArray(data) ? data : [];
    let end = NaN;
    for (let i = rows.length - 1; i >= 0; i--) {
      const v = rows[i] && serial(rows[i].d);
      if (Number.isFinite(v)) { end = v; break; }
    }
    if (!Number.isFinite(end)) end = serial(localToday());
    const byDay = new Map();
    rows.forEach(row => {
      if (!row || !Number.isFinite(serial(row.d))) return;
      byDay.set(row.d, { d: row.d, you: score(row.you), riv: score(row.riv) });
    });
    return Array.from({ length: 30 }, (_, i) => {
      const d = dateKey(end - 29 + i);
      return byDay.get(d) || { d, you: null, riv: null };
    });
  }

  function pathRuns(days, key, x, y) {
    const out = [];
    let run = [];
    days.forEach((d, i) => {
      if (d[key] == null) {
        if (run.length) out.push(run);
        run = [];
      } else run.push([x(i), y(d[key])]);
    });
    if (run.length) out.push(run);
    return out.map(points => 'M' + points.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' L'));
  }

  function leadPaths(days, key, x, y) {
    const paths = [];
    for (let i = 0; i < days.length - 1; i++) {
      const a = days[i], b = days[i + 1];
      if (a.you == null || a.riv == null || b.you == null || b.riv == null) continue;
      if (lead(a.you, a.riv) === 0 || lead(b.you, b.riv) === 0) continue;
      const count = 12;
      for (let j = 0; j < count; j++) {
        const t0 = j / count, t1 = (j + 1) / count, tm = (t0 + t1) / 2;
        const mix = (u, k) => a[k] + (b[k] - a[k]) * u;
        const who = lead(mix(tm, 'you'), mix(tm, 'riv'));
        if (who !== key) continue;
        const coords = [t0, t1].map(t => {
          const px = x(i + t);
          return [px, y(mix(t, 'you')), y(mix(t, 'riv'))];
        });
        paths.push('M' + coords[0][0].toFixed(2) + ',' + coords[0][1].toFixed(2) + ' L' + coords[1][0].toFixed(2) + ',' + coords[1][1].toFixed(2) + ' L' + coords[1][0].toFixed(2) + ',' + coords[1][2].toFixed(2) + ' L' + coords[0][0].toFixed(2) + ',' + coords[0][2].toFixed(2) + ' Z');
      }
    }
    return paths.join(' ');
  }

  function makeShell(el) {
    const root = document.createElement('section');
    root.className = 'rc-chart';
    root.innerHTML = '<div class="rc-head"><h3>You vs Onur</h3><span>Last 30 days · neurons</span></div><svg class="rc-svg" role="img" aria-label="You vs Onur over the last 30 days" xmlns="http://www.w3.org/2000/svg"></svg><div class="rc-key"><span><i class="rc-key-you"></i>You</span><span><i class="rc-key-riv"></i>Onur</span><span class="rc-live-note">Today · live</span></div><div class="rc-sr" tabindex="0" role="slider" aria-label="Explore daily neuron totals. Use the left and right arrow keys." aria-valuemin="1" aria-valuemax="30" aria-valuenow="30" aria-valuetext="Today"></div>';
    el.replaceChildren(root);
    const state = { root, svg: root.querySelector('.rc-svg'), slider: root.querySelector('.rc-sr'), lastLength: -1, selected: 29, hovered: false, pinned: false, keyboard: false };
    state.svg.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const rect = state.svg.getBoundingClientRect();
      if (!rect.width) return;
      state.hovered = true;
      const p = (e.clientX - rect.left) / rect.width * state.layout.width;
      state.selected = Math.max(0, Math.min(29, Math.round((p - state.layout.left) / state.layout.plotW * 29)));
      showTip(state);
    });
    state.svg.addEventListener('pointerleave', e => {
      if (e.pointerType !== 'touch') {
        state.hovered = false;
        if (!state.pinned && !state.keyboard) hideTip(state);
      }
    });
    state.svg.addEventListener('click', e => {
      const rect = state.svg.getBoundingClientRect();
      if (!rect.width) return;
      const p = (e.clientX - rect.left) / rect.width * state.layout.width;
      state.selected = Math.max(0, Math.min(29, Math.round((p - state.layout.left) / state.layout.plotW * 29)));
      state.pinned = e.pointerType === 'touch' || e.pointerType === 'pen';
      showTip(state);
    });
    state.slider.addEventListener('focus', () => { state.keyboard = true; showTip(state); });
    state.slider.addEventListener('blur', () => {
      state.keyboard = false;
      if (!state.hovered && !state.pinned) hideTip(state);
    });
    state.slider.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      if (e.key === 'Home') state.selected = 0;
      else if (e.key === 'End') state.selected = 29;
      else state.selected = Math.max(0, Math.min(29, state.selected + (e.key === 'ArrowRight' ? 1 : -1)));
      showTip(state);
    });
    instances.set(el, state);
    return state;
  }

  function hideTip(state) {
    const tip = state.svg.querySelector('.rc-tip');
    if (tip) tip.setAttribute('display', 'none');
  }

  function showTip(state) {
    const tip = state.svg.querySelector('.rc-tip');
    const day = state.days && state.days[state.selected];
    if (!tip || !day) return;
    const text = tip.querySelectorAll('text');
    text[0].textContent = fullDate(day.d);
    text[1].textContent = 'You: ' + fmt(day.you) + '  ·  Onur: ' + fmt(day.riv);
    if (state.tipTransform) tip.setAttribute('transform', state.tipTransform(state.selected));
    tip.setAttribute('display', 'block');
    state.slider.setAttribute('aria-valuenow', String(state.selected + 1));
    state.slider.setAttribute('aria-valuetext', fullDate(day.d) + '. You: ' + fmt(day.you) + '. Onur: ' + fmt(day.riv) + '.');
  }

  function render(state, days, animate) {
    state.days = days;
    const elWidth = state.root.getBoundingClientRect().width || 360;
    const width = Math.max(320, Math.round(elWidth));
    const height = 252, left = 38, right = 11, top = 25, bottom = 34;
    const plotW = width - left - right, plotH = height - top - bottom;
    const maxVal = Math.max(0, ...days.flatMap(d => [d.you, d.riv]).filter(n => n != null));
    const maxY = Math.max(10, Math.ceil(maxVal * 1.15 / 10) * 10);
    const x = i => left + plotW * i / 29;
    const y = n => top + plotH * (1 - n / maxY);
    const valid = days.filter(d => d.you != null && d.riv != null);
    const yours = valid.filter(d => lead(d.you, d.riv) === 1).length;
    const rivals = valid.filter(d => lead(d.you, d.riv) === -1).length;
    const tied = valid.length - yours - rivals;
    const missing = days.length - valid.length;
    const summary = 'Over these 30 days, you led ' + yours + ' days and Onur led ' + rivals + (tied ? '; ' + tied + ' tied' : '') + (missing ? '; ' + missing + ' days missing' : '') + '.';
    const ticks = [0, Math.ceil(maxY / 2), maxY].map(n => '<g class="rc-y-tick"><line x1="' + left + '" y1="' + y(n) + '" x2="' + (width - right) + '" y2="' + y(n) + '"/><text x="' + (left - 7) + '" y="' + (y(n) + 4) + '" text-anchor="end">' + n + '</text></g>').join('');
    const xTicks = [0, 7, 14, 21, 29].map(i => '<text class="rc-x-tick" x="' + x(i) + '" y="' + (height - 10) + '" text-anchor="' + (i === 0 ? 'start' : i === 29 ? 'end' : 'middle') + '">' + safe(dateLabel(days[i].d)) + '</text>').join('');
    const markerX = x(29);
    const live = '<line class="rc-today" x1="' + markerX + '" y1="' + (top - 2) + '" x2="' + markerX + '" y2="' + (height - bottom + 1) + '"/><text class="rc-live" x="' + Math.max(left + 22, markerX - 2) + '" y="14" text-anchor="end">LIVE</text>';
    const area = '<path class="rc-area rc-area-you" d="' + leadPaths(days, 1, x, y) + '"/><path class="rc-area rc-area-riv" d="' + leadPaths(days, -1, x, y) + '"/>';
    const lines = ['you', 'riv'].map(key => pathRuns(days, key, x, y).map(d => '<path class="rc-line rc-line-' + key + (animate ? ' rc-line-draw' : '') + '" pathLength="1" d="' + d + '"/>').join('')).join('');
    const today = days[29];
    const dots = ['you', 'riv'].map(key => today[key] == null ? '' : '<circle class="rc-dot rc-dot-' + key + '" cx="' + markerX + '" cy="' + y(today[key]) + '" r="3.5"/>').join('');
    const initialIndex = Math.max(0, Math.min(29, state.selected));
    state.tipTransform = index => {
      const day = days[index];
      const values = [day.you, day.riv].filter(v => v != null);
      const pointY = values.length ? Math.min(...values.map(y)) : height;
      const tipX = Math.max(3, Math.min(width - 161, x(index) - 78));
      const tipY = Math.max(5, Math.min(height - 53, pointY - 49));
      return 'translate(' + tipX + ' ' + tipY + ')';
    };
    const tip = '<g class="rc-tip" display="none" transform="' + state.tipTransform(initialIndex) + '"><rect width="158" height="45" rx="7"/><text x="9" y="17"></text><text x="9" y="35"></text></g>';
    state.svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    state.layout = { width, left, plotW };
    state.svg.setAttribute('aria-label', summary);
    state.svg.innerHTML = '<title>You vs Onur, last 30 days</title><desc>' + safe(summary) + ' The vertical scale shows neurons per day. Missing days appear as gaps. Select or tap a day for both values.</desc><text class="rc-axis-title" x="' + left + '" y="14">Neurons</text>' + ticks + '<g class="rc-leads">' + area + '</g>' + live + '<g class="rc-lines">' + lines + dots + '</g>' + xTicks + '<rect class="rc-hit" x="' + left + '" y="' + top + '" width="' + plotW + '" height="' + plotH + '"/><g class="rc-tips">' + tip + '</g>';
    state.slider.setAttribute('aria-valuemax', '30');
    state.slider.setAttribute('aria-valuenow', String(initialIndex + 1));
    state.slider.setAttribute('aria-valuetext', fullDate(days[initialIndex].d) + '. You: ' + fmt(days[initialIndex].you) + '. Onur: ' + fmt(days[initialIndex].riv) + '.');
    if (state.hovered || state.pinned || state.keyboard || state.slider === document.activeElement) showTip(state);
  }

  function mount(el, data) {
    if (!el || typeof el.replaceChildren !== 'function') return;
    let state = instances.get(el);
    if (!state) state = makeShell(el);
    const days = prepare(data);
    const animate = state.lastLength < 0 || state.lastLength !== (Array.isArray(data) ? data.length : 0);
    state.lastLength = Array.isArray(data) ? data.length : 0;
    render(state, days, animate);
  }

  globalThis.RIVALCHART = Object.freeze({ mount });
})();
