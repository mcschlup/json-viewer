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
          valueHtml = `<span class="val-meta">[ Array — ${value.length} item${value.length !== 1 ? 's' : ''} ]</span>`;
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
    if (value !== null && typeof value === 'object') return renderObjectTable(value);
    return `<div class="obj-viewer"><div class="obj-row"><div class="obj-value">${formatPrimitive(value)}</div></div></div>`;
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
      panel.innerHTML = renderSection(value);
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
    showState('viewer');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
