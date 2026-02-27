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

  async function loadData() {
    // Backend mode: fetch JSON from server by session ID
    if (window.__DATA_URL) {
      try {
        const resp = await fetch(window.__DATA_URL);
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          return { data: null, error: body.error || `Server returned HTTP ${resp.status}.` };
        }
        return { data: await resp.json(), error: null };
      } catch (e) {
        return { data: null, error: 'Could not load data from server: ' + e.message };
      }
    }

    // Fallback: read from URL parameter (index.html mode)
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

  // ── Field Mappings ─────────────────────────────────────────────────────────

  function getFieldMapping(key) {
    return CONFIG.fieldMappings.find(m => m.key === key) || null;
  }

  function getFieldDrillDowns(key) {
    if (!CONFIG.fieldDrillDowns) return null;
    const entry = CONFIG.fieldDrillDowns.find(e => e.key === key);
    return (entry && entry.actions && entry.actions.length) ? entry.actions : null;
  }

  function initFieldTooltips() {
    const tip = document.createElement('div');
    tip.className = 'field-tooltip hidden';
    document.body.appendChild(tip);

    document.addEventListener('mouseover', e => {
      const keyEl = e.target.closest('.field-info-icon[data-tooltip]');
      if (!keyEl) { tip.classList.add('hidden'); return; }
      tip.textContent = keyEl.getAttribute('data-tooltip');
      tip.classList.remove('hidden');
    });

    document.addEventListener('mousemove', e => {
      if (tip.classList.contains('hidden')) return;
      let left = e.clientX + 14;
      let top  = e.clientY - 10;
      if (left + tip.offsetWidth  > window.innerWidth  - 8) left = e.clientX - tip.offsetWidth  - 14;
      if (top  + tip.offsetHeight > window.innerHeight - 8) top  = e.clientY - tip.offsetHeight - 10;
      tip.style.left = left + 'px';
      tip.style.top  = top  + 'px';
    });
  }

  // ── Highlight Logic ────────────────────────────────────────────────────────

  function getHighlight(key, value) {
    if (value !== null && value !== undefined && typeof value !== 'object') {
      for (const rule of CONFIG.keyValueHighlightRules) {
        if (rule.testKey(key) && rule.testValue(value)) return rule;
      }
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
    if (typeof value === 'number') return escapeHtml(String(value));
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

  // ── Rendering: Drill-down URL fields ──────────────────────────────────────

  const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  const ICON_OPEN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

  function formatDrillDown(value) {
    const match = String(value).match(/https?:\/\/[^\s"'<>]+/);
    if (!match) return formatPrimitive(value);
    const url = match[0];
    const escapedUrl = escapeHtml(url);
    return `<div class="drill-down-wrap">
        <span class="drill-down-text">${escapeHtml(String(value))}</span>
        <span class="drill-down-actions">
          <button class="drill-down-btn drill-down-copy" data-url="${escapedUrl}" title="Copy URL">${ICON_COPY}</button>
          <button class="drill-down-btn drill-down-open" data-url="${escapedUrl}" title="Open in new tab">${ICON_OPEN}</button>
        </span>
      </div>`;
  }

  function formatFieldDrillDowns(value, actions) {
    const escapedValue = escapeHtml(String(value));
    const buttons = actions.map(entry => {
      const escapedDesc = escapeHtml(entry.description || '');
      if (entry.baseUrl === 'copyvalue') {
        return `<button class="drill-down-btn drill-down-copy" data-url="${escapedValue}" title="${escapedDesc}">${ICON_COPY}</button>`;
      } else {
        const escapedUrl = escapeHtml(entry.baseUrl + String(value));
        return `<button class="drill-down-btn drill-down-open" data-url="${escapedUrl}" title="${escapedDesc}">${ICON_OPEN}</button>`;
      }
    }).join('');
    return `<div class="drill-down-wrap">
        <span class="drill-down-text">${escapedValue}</span>
        <span class="drill-down-actions">${buttons}</span>
      </div>`;
  }

  function initDrillDown() {
    document.addEventListener('click', e => {
      const copyBtn = e.target.closest('.drill-down-copy');
      if (copyBtn) {
        navigator.clipboard.writeText(copyBtn.dataset.url).then(() => {
          copyBtn.classList.add('copied');
          setTimeout(() => copyBtn.classList.remove('copied'), 1500);
        }).catch(() => {});
        return;
      }
      const openBtn = e.target.closest('.drill-down-open');
      if (openBtn) window.open(openBtn.dataset.url, '_blank', 'noopener,noreferrer');
    });
  }

  // ── Rendering: Object Table ────────────────────────────────────────────────

  function renderObjectTable(obj, compact) {
    const rowClass = compact ? 'obj-row obj-row--compact' : 'obj-row';
    const rows = Object.entries(obj).map(([key, value]) => {
      const hl = getHighlight(key, value);
      const hlClass = hl ? hl.cssClass : '';
      const mapping = getFieldMapping(key);
      const displayKey = mapping ? escapeHtml(mapping.name) : escapeHtml(key);
      const infoIcon   = (mapping && mapping.description)
        ? `<span class="field-info-icon" data-tooltip="${escapeHtml(mapping.description)}">` +
          `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">` +
          `<circle cx="8" cy="8" r="6.5"/><line x1="8" y1="7.5" x2="8" y2="11"/><circle cx="8" cy="5" r="0.75" fill="currentColor" stroke="none"/>` +
          `</svg></span>`
        : '';

      let valueHtml;
      const fieldDrillDownActions = (value !== null && typeof value !== 'object')
        ? getFieldDrillDowns(key) : null;
      if (fieldDrillDownActions) {
        valueHtml = formatFieldDrillDowns(value, fieldDrillDownActions);
      } else if (/drill_down$/i.test(key) && value !== null && typeof value !== 'object') {
        valueHtml = formatDrillDown(value);
      } else if (value === null || typeof value !== 'object') {
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
          <div class="obj-key">${displayKey}${infoIcon}</div>
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

    const MS_DAY = 86400000;
    const validTimes = items
      .map(item => parseAnomalyTime(item.anomaly_time))
      .filter(t => !isNaN(t));
    if (validTimes.length === 0) return '';

    const minTime   = Math.min(...validTimes);
    const maxTime   = Math.max(...validTimes);
    // Most recent event always on right; extend left for minimum 5-day range if needed
    const endTime   = maxTime;
    const startTime = Math.min(minTime, maxTime - 5 * MS_DAY);
    const rangeMs   = endTime - startTime;

    // SVG layout
    const W = 800, H = 132, padL = 45, padR = 20;
    const axisY = 62, circR = 7;
    const circYAbove = 14;   // circle centre for above-axis markers (open)
    const circYBelow = 112;  // circle centre for below-axis markers (all others)
    const plotW = W - padL - padR;

    function tx(t) {
      return padL + ((t - startTime) / rangeMs) * plotW;
    }

    // Status classification helpers
    function statusIsAbove(s) { return s === 'open'; }
    function statusIsDashed(s) {
      return ['escalated_fp', 'closed_benign', 'closed_fp',
              'closed_suppressed', 'closed'].includes(s);
    }

    let svgBody = '';

    // Axis line
    svgBody += `<line x1="${padL}" y1="${axisY}" x2="${W - padR}" y2="${axisY}" stroke="#cbd5e1" stroke-width="1.5"/>`;

    // Day ticks and labels — choose a step that yields ~4–6 labels
    const totalDays = rangeMs / MS_DAY;
    const step = [1, 2, 3, 5, 7, 10, 14, 21, 30].find(s => totalDays / s <= 6) || 30;
    for (let d = 0; d * MS_DAY <= rangeMs + MS_DAY; d += step) {
      const t = startTime + d * MS_DAY;
      if (t > endTime) break;
      const x    = tx(t);
      const date = new Date(t);
      const label = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
      svgBody += `<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 8}" stroke="#94a3b8" stroke-width="1.5"/>`;
      svgBody += `<text x="${x}" y="${axisY + 20}" text-anchor="middle" font-size="10" fill="#94a3b8" font-family="-apple-system,BlinkMacSystemFont,sans-serif">${label}</text>`;
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

      const above      = statusIsAbove(status);
      const dashed     = statusIsDashed(status);
      const dashAttr   = dashed ? ' stroke-dasharray="5,4"' : '';
      const circleFill = dashed ? 'white' : colors.fill;
      const circY      = above ? circYAbove : circYBelow;

      const escapedTime   = escapeHtml(item.anomaly_time || '');
      const escapedSev    = escapeHtml(item.anomaly_severity_level || '');
      const escapedStatus = escapeHtml(item.anomaly_analysis_status || '');
      const escapedName   = escapeHtml(item.anomaly_name || '');
      const tipAttrs = `data-time="${escapedTime}" data-severity="${escapedSev}" data-status="${escapedStatus}" data-name="${escapedName}"`;

      if (above) {
        // Line from bottom of circle up to axis
        svgBody += `<line x1="${x}" y1="${circY + circR + 1}" x2="${x}" y2="${axisY - 1}" stroke="${colors.stroke}" stroke-width="2.5"${dashAttr} class="tl-marker" ${tipAttrs}/>`;
      } else {
        // Line from axis down to top of circle
        svgBody += `<line x1="${x}" y1="${axisY + 1}" x2="${x}" y2="${circY - circR - 1}" stroke="${colors.stroke}" stroke-width="2.5"${dashAttr} class="tl-marker" ${tipAttrs}/>`;
      }

      // Circle
      svgBody += `<circle cx="${x}" cy="${circY}" r="${circR}" fill="${circleFill}" stroke="${colors.stroke}" stroke-width="2" class="tl-marker" ${tipAttrs}/>`;

      // Card number centered inside the circle
      svgBody += `<text x="${x}" y="${circY}" text-anchor="middle" dominant-baseline="central" font-size="7" font-weight="700" fill="${colors.stroke}" font-family="-apple-system,BlinkMacSystemFont,sans-serif" pointer-events="none">${idx + 1}</text>`;
    });

    const svgEl = `<svg viewBox="0 0 ${W} ${H}" class="timeline-svg" role="img" aria-label="Anomaly timeline">${svgBody}</svg>`;

    // Legend — severity colours
    const sevLegend = Object.entries(SEVERITY_COLORS).map(([name, c]) =>
      `<span class="tl-leg-item"><span class="tl-leg-dot" style="background:${c.stroke}"></span>${escapeHtml(name)}</span>`
    ).join('');

    // Legend — status shapes and position
    const statusLegend =
      `<span class="tl-leg-sep"></span>` +
      `<span class="tl-leg-item"><span class="tl-leg-line tl-leg-line--solid"></span>scoring relevant</span>` +
      `<span class="tl-leg-item"><span class="tl-leg-line tl-leg-line--dashed"></span>not scoring relevant</span>` +
      `<span class="tl-leg-sep"></span>` +
      `<span class="tl-leg-item">&#9650;&nbsp;needs analysis</span>` +
      `<span class="tl-leg-item">&#9660;&nbsp;no analysis needed</span>`;

    return `
      <div class="timeline-wrap">
        <div class="timeline-head">
          <span class="timeline-title">Anomaly Timeline</span>
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
      const name     = marker.getAttribute('data-name') || '';

      tooltip.innerHTML =
        (name ? `<div class="tl-tip-row"><span class="tl-tip-lbl">Name</span>${escapeHtml(name)}</div>` : '') +
        `<div class="tl-tip-row"><span class="tl-tip-lbl">Time</span>${escapeHtml(time) || '—'}</div>` +
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

    // Sections that never show a count badge
    const NO_COUNT_SECTIONS = new Set([
      'generic', 'identity_user', 'identity_app_registration',
      'asset_host', 'asset_cloud_account'
    ]);

    // Determine which entity-specific sections to show based on generic section
    const generic = data.generic && typeof data.generic === 'object' ? data.generic : {};
    const entityType    = (generic.entity_type    || '').toLowerCase();
    const entitySubtype = (generic.entity_subtype || '').toLowerCase();

    const hiddenSections = new Set();
    if (!(entityType === 'identity' && entitySubtype === 'user'))   hiddenSections.add('identity_user');
    if (!(entityType === 'identity' && entitySubtype === 'appreg')) hiddenSections.add('identity_app_registration');
    if (!(entityType === 'asset'    && entitySubtype === 'host'))   hiddenSections.add('asset_host');
    if (!(entityType === 'asset'    && entitySubtype === 'cloud'))  hiddenSections.add('asset_cloud_account');

    let panelIndex = 0;
    let firstVisible = true;
    entries.forEach(([key, value]) => {
      if (hiddenSections.has(key)) return;

      const idx = panelIndex++;
      const isFirst = firstVisible;
      firstVisible = false;

      // Button
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (isFirst ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', isFirst ? 'true' : 'false');
      btn.setAttribute('aria-controls', `panel-${idx}`);
      btn.dataset.tab = key;

      const count = NO_COUNT_SECTIONS.has(key) ? null : sectionCount(value);
      const countHtml = count !== null ? `<span class="tab-count">${count}</span>` : '';
      const tabMapping = getFieldMapping(key);
      const tabLabel = tabMapping ? escapeHtml(tabMapping.name) : escapeHtml(key);
      btn.innerHTML = `${tabLabel}${countHtml}`;
      btn.addEventListener('click', () => switchTab(key));
      tabBar.appendChild(btn);

      // Panel
      const panel = document.createElement('div');
      panel.className = 'tab-panel' + (isFirst ? ' active' : '');
      panel.id = `panel-${idx}`;
      panel.setAttribute('role', 'tabpanel');
      panel.dataset.tab = key;
      const timelineHtml = (key === 'anomaly_overview' && Array.isArray(value))
        ? renderTimeline(value)
        : '';
      panel.innerHTML = timelineHtml + renderSection(value);
      tabPanels.appendChild(panel);
    });
  }

  // ── Floatable Tab Bar ──────────────────────────────────────────────────────

  function initScrollyTabs() {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    const wrap = document.createElement('div');
    wrap.className = 'tab-bar-sticky';
    tabBar.parentNode.insertBefore(wrap, tabBar);
    wrap.appendChild(tabBar);

    const naturalHeight = wrap.scrollHeight;
    wrap.style.maxHeight = naturalHeight + 'px';

    let lastY = window.scrollY;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      lastY = y;
      if (goingDown && y > naturalHeight) {
        wrap.style.maxHeight = '0';
      } else if (!goingDown) {
        wrap.style.maxHeight = naturalHeight + 'px';
      }
    }, { passive: true });
  }

  // ── Entry Point ────────────────────────────────────────────────────────────

  function showState(id) {
    ['error-state', 'empty-state', 'viewer'].forEach(s => {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  async function init() {
    const { data, error } = await loadData();

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

    createTabs(data);
    initTimeline();
    initDrillDown();
    initFieldTooltips();
    showState('viewer');
    initScrollyTabs();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
