// js/app.js
(function () {
  'use strict';

  // ── Utilities ──────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function tryParseJSON(str) {
    try { return { ok: true, value: JSON.parse(str) }; }
    catch (e) { return { ok: false, error: e.message }; }
  }

  function tryBase64Decode(str) {
    try { return atob(str); }
    catch (_) { return null; }
  }

  // ── Data Loading ───────────────────────────────────────────────────────────

  function loadData() {
    const raw = getParam(CONFIG.urlParam);
    if (!raw) return { data: null, error: null };

    // 1. Try plain JSON parse
    let result = tryParseJSON(raw);
    if (result.ok) return { data: result.value, error: null };

    // 2. Try URL-decode then JSON parse
    try {
      const decoded = decodeURIComponent(raw);
      result = tryParseJSON(decoded);
      if (result.ok) return { data: result.value, error: null };
    } catch (_) {}

    // 3. Try base64 decode then JSON parse
    const b64 = tryBase64Decode(raw);
    if (b64) {
      result = tryParseJSON(b64);
      if (result.ok) return { data: result.value, error: null };
    }

    return {
      data: null,
      error: 'Could not parse JSON. Ensure the <code>data</code> parameter is valid JSON, URL-encoded JSON, or base64-encoded JSON.'
    };
  }

  // ── Highlight Logic ────────────────────────────────────────────────────────

  function getHighlight(key, value) {
    for (const rule of CONFIG.keyHighlightRules) {
      if (rule.test(key)) return rule;
    }
    if (value !== null && value !== undefined && typeof value !== 'object') {
      for (const rule of CONFIG.valueHighlightRules) {
        if (rule.test(value)) return rule;
      }
    }
    return null;
  }

  // ── Value Formatting ───────────────────────────────────────────────────────

  function formatPrimitive(value) {
    if (value === null) return '<span class="val-null">null</span>';
    if (value === true || value === false) return `<span class="val-bool">${value}</span>`;
    if (typeof value === 'number') return `<span class="val-number">${value}</span>`;
    return escapeHtml(String(value));
  }

  // ── Rendering: Nested Array (inside an object table cell) ─────────────────

  function renderNestedArray(arr) {
    if (arr.length === 0) {
      return '<span class="val-empty">[ empty array ]</span>';
    }
    const items = arr.map(function (item) {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        return '<div class="nested-array-item">' + renderObjectTable(item, true) + '</div>';
      }
      if (Array.isArray(item)) {
        return '<div class="nested-array-item">' + renderNestedArray(item) + '</div>';
      }
      return '<div class="nested-array-item">' + formatPrimitive(item) + '</div>';
    }).join('');
    return '<div class="nested-array">' + items + '</div>';
  }

  // ── Rendering: Object Table ────────────────────────────────────────────────

  function renderObjectTable(obj, compact) {
    const rowClass = compact ? 'obj-row obj-row--compact' : 'obj-row';
    const rows = Object.entries(obj).map(([key, value]) => {
      const hl = getHighlight(key, value);
      const hlClass = hl ? hl.cssClass : '';
      const badge = hl ? `<span class="field-badge">${escapeHtml(hl.label)}</span>` : '';

      let valueHtml;
      if (value === null || typeof value !== 'object') {
        valueHtml = formatPrimitive(value);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          valueHtml = '<span class="val-empty">[ empty array ]</span>';
        } else if (value.every(v => v !== null && typeof v !== 'object')) {
          // Array of primitives — show inline
          valueHtml = `<span class="val-array-inline">[${value.map(formatPrimitive).join(', ')}]</span>`;
        } else {
          valueHtml = renderNestedArray(value);
        }
      } else {
        // Nested object
        valueHtml = renderObjectTable(value, true);
      }

      return `
        <div class="${rowClass} ${hlClass}">
          <div class="obj-key">${badge}${escapeHtml(key)}</div>
          <div class="obj-value">${valueHtml}</div>
        </div>`;
    }).join('');

    return `<div class="obj-viewer${compact ? ' obj-viewer--nested' : ''}">${rows}</div>`;
  }

  // ── Rendering: Array of Cards ──────────────────────────────────────────────

  function getCardSummary(item) {
    if (item === null || typeof item !== 'object') return '';
    for (const [, v] of Object.entries(item)) {
      if (typeof v === 'string' && v.trim().length > 0) {
        return v.length > 44 ? v.substring(0, 44) + '…' : v;
      }
    }
    return '';
  }

  function renderArray(arr) {
    if (arr.length === 0) {
      return '<p class="empty-msg">This array is empty.</p>';
    }

    const cards = arr.map((item, i) => {
      let bodyHtml;
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        const summary = getCardSummary(item);
        bodyHtml = `
          <div class="card-header">
            <span class="card-index"># ${i + 1}</span>
            ${summary ? `<span class="card-summary">${escapeHtml(summary)}</span>` : ''}
          </div>
          <div class="card-body">${renderObjectTable(item)}</div>`;
      } else {
        bodyHtml = `
          <div class="card-header"><span class="card-index"># ${i + 1}</span></div>
          <div class="card-body card-body--primitive"><span>${formatPrimitive(item)}</span></div>`;
      }
      return `<div class="array-card">${bodyHtml}</div>`;
    }).join('');

    return `<div class="array-grid">${cards}</div>`;
  }

  // ── Rendering: Section dispatcher ─────────────────────────────────────────

  function renderSection(value) {
    if (Array.isArray(value)) return renderArray(value);
    if (value !== null && typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        return '<p class="empty-msg">This section is empty.</p>';
      }
      return renderObjectTable(value);
    }
    return `<div class="obj-viewer"><div class="obj-row"><div class="obj-value">${formatPrimitive(value)}</div></div></div>`;
  }

  // ── Anomaly Timeline ───────────────────────────────────────────────────────

  const TZ_OFFSETS = {
    'UTC':0,'GMT':0,
    'CET':60,'CEST':120,'EET':120,'EEST':180,'WET':0,'WEST':60,
    'EST':-300,'EDT':-240,'CST':-360,'CDT':-300,
    'MST':-420,'MDT':-360,'PST':-480,'PDT':-420,
    'IST':330,'JST':540,'AEST':600,'AEDT':660
  };

  // Handles ISO strings and "YYYY-MM-DD HH:MM:SS TZ" with named timezone abbreviations
  function parseAnomalyTime(str) {
    if (!str) return NaN;
    let t = new Date(str).getTime();
    if (!isNaN(t)) return t;
    const m = str.match(/^(\d{4}-\d{2}-\d{2})[\sT](\d{2}:\d{2}:\d{2})\s*([A-Z]{1,5})?$/);
    if (m) {
      const base    = m[1] + 'T' + m[2];
      const tzName  = (m[3] || '').toUpperCase();
      const offMin  = TZ_OFFSETS[tzName];
      if (offMin !== undefined) {
        const sign = offMin >= 0 ? '+' : '-';
        const abs  = Math.abs(offMin);
        const hh   = String(Math.floor(abs / 60)).padStart(2, '0');
        const mm   = String(abs % 60).padStart(2, '0');
        t = new Date(`${base}${sign}${hh}:${mm}`).getTime();
        if (!isNaN(t)) return t;
      }
      t = new Date(base).getTime(); // fallback: treat as local
      if (!isNaN(t)) return t;
    }
    return NaN;
  }

  const SEVERITY_COLORS = {
    critical:      { fill: '#fecaca', stroke: '#ef4444' },
    high:          { fill: '#fed7aa', stroke: '#f97316' },
    medium:        { fill: '#fef08a', stroke: '#ca8a04' },
    low:           { fill: '#bbf7d0', stroke: '#16a34a' },
    informational: { fill: '#bae6fd', stroke: '#0284c7' }
  };

  function renderTimeline(arr) {
    const items = arr.filter(item => item && typeof item === 'object' && item.anomaly_time);
    if (items.length === 0) return '';

    const MS_DAY = 86_400_000;
    const DAYS = 15;
    const validTimes = items
      .map(item => parseAnomalyTime(item.anomaly_time))
      .filter(t => !isNaN(t));
    if (validTimes.length === 0) return '';

    const startTime = Math.min(...validTimes);
    const endTime   = startTime + DAYS * MS_DAY;

    // SVG layout
    const W = 800, H = 112, padL = 45, padR = 20;
    const axisY = 72, circR = 7, circY = 14; // circR=7 to fit card number inside
    const plotW = W - padL - padR;

    function tx(t) {
      return padL + ((t - startTime) / (DAYS * MS_DAY)) * plotW;
    }

    let svgBody = '';

    // Axis line
    svgBody += `<line x1="${padL}" y1="${axisY}" x2="${W - padR}" y2="${axisY}" stroke="#cbd5e1" stroke-width="1.5"/>`;

    // Day ticks and labels (label every 5 days)
    for (let d = 0; d <= DAYS; d++) {
      const x     = tx(startTime + d * MS_DAY);
      const major = d % 5 === 0;
      svgBody += `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + (major ? 8 : 5)}" stroke="#94a3b8" stroke-width="${major ? 1.5 : 1}"/>`;
      if (major) {
        const date  = new Date(startTime + d * MS_DAY);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        svgBody += `<text x="${x}" y="${axisY + 20}" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${label}</text>`;
      }
    }

    // "Now" marker (subtle, if today falls within the window)
    const nowTime = Date.now();
    if (nowTime >= startTime && nowTime <= endTime) {
      const nx = tx(nowTime);
      svgBody += `<line x1="${nx}" y1="${circY - circR}" x2="${nx}" y2="${axisY}" stroke="#6366f1" stroke-width="1" stroke-dasharray="4,3" opacity="0.5"/>`;
      svgBody += `<text x="${nx + 3}" y="${circY - circR - 2}" font-size="8" fill="#6366f1" opacity="0.7" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-weight="600">NOW</text>`;
    }

    // Anomaly markers — iterate original array so idx matches card numbers (# 1, # 2 …)
    arr.forEach((item, idx) => {
      if (!item || typeof item !== 'object') return;
      const t = parseAnomalyTime(item.anomaly_time);
      if (isNaN(t) || t < startTime || t > endTime) return;

      const x      = tx(t);
      const sev    = (item.anomaly_severity_level || '').toLowerCase();
      const status = (item.anomaly_analysis_status || '').toLowerCase();
      const colors = SEVERITY_COLORS[sev] || { fill: '#e2e8f0', stroke: '#94a3b8' };

      // Solid line for "open", dashed for "closed"
      const dashAttr = status === 'closed' ? ' stroke-dasharray="5,4"' : '';

      const escapedTime   = escapeHtml(item.anomaly_time || '');
      const escapedSev    = escapeHtml(item.anomaly_severity_level || '');
      const escapedStatus = escapeHtml(item.anomaly_analysis_status || '');
      const tipAttrs = `data-time="${escapedTime}" data-severity="${escapedSev}" data-status="${escapedStatus}"`;

      // Vertical line from below circle down to axis
      svgBody += `<line x1="${x}" y1="${circY + circR + 1}" x2="${x}" y2="${axisY - 1}" stroke="${colors.stroke}" stroke-width="2.5"${dashAttr} class="tl-marker" ${tipAttrs}/>`;

      // Circle at top: filled for "open", hollow (white fill) for "closed"
      const circleFill = status === 'closed' ? 'white' : colors.fill;
      svgBody += `<circle cx="${x}" cy="${circY}" r="${circR}" fill="${circleFill}" stroke="${colors.stroke}" stroke-width="2" class="tl-marker" ${tipAttrs}/>`;

      // Card number centered inside the circle
      svgBody += `<text x="${x}" y="${circY}" text-anchor="middle" dominant-baseline="central" font-size="7" font-weight="700" fill="${colors.stroke}" font-family="-apple-system,BlinkMacSystemFont,sans-serif" pointer-events="none">${idx + 1}</text>`;
    });

    const svgEl = `<svg viewBox="0 0 ${W} ${H}" class="timeline-svg" role="img" aria-label="Anomaly timeline — 15-day range">${svgBody}</svg>`;

    // Legend — severity colours
    const sevLegend = Object.entries(SEVERITY_COLORS).map(([name, c]) =>
      `<span class="tl-leg-item"><span class="tl-leg-dot" style="background:${c.stroke}"></span>${escapeHtml(name)}</span>`
    ).join('');

    // Legend — status shapes
    const statusLegend =
      `<span class="tl-leg-sep"></span>` +
      `<span class="tl-leg-item"><span class="tl-leg-line tl-leg-line--solid"></span>open</span>` +
      `<span class="tl-leg-item"><span class="tl-leg-line tl-leg-line--dashed"></span>closed</span>`;

    return `
      <div class="timeline-wrap">
        <div class="timeline-head">
          <span class="timeline-title">15-Day Anomaly Timeline</span>
          <div class="timeline-legend">${sevLegend}${statusLegend}</div>
        </div>
        ${svgEl}
        <div class="tl-tooltip hidden" id="tl-tooltip"></div>
      </div>`;
  }

  function initTimeline() {
    const tooltip = document.getElementById('tl-tooltip');
    if (!tooltip) return;
    const wrap = tooltip.closest('.timeline-wrap');
    if (!wrap) return;
    const svg = wrap.querySelector('.timeline-svg');
    if (!svg) return;

    svg.addEventListener('mousemove', e => {
      const marker = e.target.closest ? e.target.closest('.tl-marker') : null;
      if (!marker) { tooltip.classList.add('hidden'); return; }

      const time     = marker.getAttribute('data-time') || '';
      const severity = marker.getAttribute('data-severity') || '';
      const status   = marker.getAttribute('data-status') || '';
      const display  = time ? new Date(time).toLocaleString() : '—';

      tooltip.innerHTML =
        `<div class="tl-tip-row"><span class="tl-tip-lbl">Time</span>${escapeHtml(display)}</div>` +
        `<div class="tl-tip-row"><span class="tl-tip-lbl">Severity</span>${escapeHtml(severity) || '—'}</div>` +
        `<div class="tl-tip-row"><span class="tl-tip-lbl">Status</span>${escapeHtml(status) || '—'}</div>`;

      tooltip.classList.remove('hidden');
      const wrapRect = wrap.getBoundingClientRect();
      let left = e.clientX - wrapRect.left + 14;
      const top  = e.clientY - wrapRect.top  - 10;
      // Flip left if tooltip would overflow right edge
      if (left + tooltip.offsetWidth > wrap.offsetWidth - 8) {
        left = e.clientX - wrapRect.left - tooltip.offsetWidth - 14;
      }
      tooltip.style.left = left + 'px';
      tooltip.style.top  = top  + 'px';
    });

    svg.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
  }

  // ── Tab count badge ────────────────────────────────────────────────────────

  function sectionCount(value) {
    if (Array.isArray(value)) return value.length;
    if (value !== null && typeof value === 'object') return Object.keys(value).length;
    return null;
  }

  // ── Tab Management ─────────────────────────────────────────────────────────

  function switchTab(key) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const active = btn.dataset.tab === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.tab === key);
    });
  }

  function createTabs(data) {
    const tabBar = document.getElementById('tab-bar');
    const tabPanels = document.getElementById('tab-panels');
    const entries = Object.entries(data);

    entries.forEach(([key, value], index) => {
      // Button
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (index === 0 ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', `panel-${index}`);
      btn.dataset.tab = key;

      const count = sectionCount(value);
      const countHtml = count !== null ? `<span class="tab-count">${count}</span>` : '';
      btn.innerHTML = `${escapeHtml(key)}${countHtml}`;
      btn.addEventListener('click', () => switchTab(key));
      tabBar.appendChild(btn);

      // Panel
      const panel = document.createElement('div');
      panel.className = 'tab-panel' + (index === 0 ? ' active' : '');
      panel.id = `panel-${index}`;
      panel.setAttribute('role', 'tabpanel');
      panel.dataset.tab = key;
      const timelineHtml = (key === 'anomaly_overview' && Array.isArray(value))
        ? renderTimeline(value)
        : '';
      panel.innerHTML = timelineHtml + renderSection(value);
      tabPanels.appendChild(panel);
    });
  }

  // ── Legend ─────────────────────────────────────────────────────────────────

  function renderLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = CONFIG.keyHighlightRules.map(rule => `
      <span class="legend-item">
        <span class="legend-dot" style="background:${rule.color}"></span>${escapeHtml(rule.label)}
      </span>`).join('');
  }

  // ── Entry Point ────────────────────────────────────────────────────────────

  function showState(id) {
    ['error-state', 'empty-state', 'viewer'].forEach(s => {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  function init() {
    const { data, error } = loadData();

    if (error) {
      document.getElementById('error-message').innerHTML = error;
      showState('error-state');
      return;
    }

    if (data === null) {
      showState('empty-state');
      return;
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
      document.getElementById('error-message').textContent =
        `Expected a top-level JSON object, but got: ${Array.isArray(data) ? 'array' : typeof data}.`;
      showState('error-state');
      return;
    }

    renderLegend();
    createTabs(data);
    initTimeline();
    showState('viewer');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
