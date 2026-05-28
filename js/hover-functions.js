// js/hover-functions.js
// Popup functions registered via registerDrillDownPopupFn().
// Each function receives (value, key) and must return an HTML string or a Promise<string>.

(function () {

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function row(label, value) {
    return `<div class="dd-popup-row"><span class="dd-popup-lbl">${label}</span><span>${value ?? '—'}</span></div>`;
  }

  // ── AbuseIPDB ──────────────────────────────────────────────────────────────
  // Proxy endpoint 'abuseipdb' must be configured in config-local.inc.php.

  const abuseIPDBCache = {};

  async function fetchAbuseIPDB(ip) {
    if (abuseIPDBCache[ip]) return abuseIPDBCache[ip];
    const url = `index.php?proxy=abuseipdb&ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`AbuseIPDB proxy returned HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    abuseIPDBCache[ip] = json.data;
    return json.data;
  }

  function formatAbuseIPDB(data) {
    return [
      row('Abuse Score',   `${esc(data.abuseConfidenceScore)}%`),
      row('Country',       esc(data.countryCode)),
      row('Usage Type',    esc(data.usageType)),
      row('ISP',           esc(data.isp)),
      row('Domain',        esc(data.domain)),
      row('Tor Node',      data.isTor ? 'Yes' : 'No'),
      row('Total Reports', esc(data.totalReports)),
      row('Last Reported', esc(data.lastReportedAt) || '—'),
    ].join('');
  }

  registerDrillDownPopupFn('abuseIPDB', async (value) => {
    const data = await fetchAbuseIPDB(value);
    return formatAbuseIPDB(data);
  });

  // ── Timestamp formatter ───────────────────────────────────────────────────

  function fmtTimestamp(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return esc(String(iso));
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23', timeZoneName: 'short'
    }).formatToParts(d);
    const p = {};
    parts.forEach(({ type, value }) => { p[type] = value; });
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second} ${p.timeZoneName}`;
  }

  // ── Vectra Group API ───────────────────────────────────────────────────────
  // Proxy endpoint 'vectra' must be configured in config-local.inc.php.
  // Auth type: oauth2 (client_credentials via token_url + user/pass).

  const vectraCache = {};

  async function fetchVectraGroupAPI(entityId) {
    if (vectraCache[entityId]) return vectraCache[entityId];
    const url = `index.php?proxy=vectra&entity_id=${encodeURIComponent(entityId)}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Vectra proxy returned HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    vectraCache[entityId] = json.results || [];
    return vectraCache[entityId];
  }

  function formatVectraResult(r) {
    return [
      row('Detection',   esc(r.detection)),
      row('Category',    esc(r.detection_category)),
      row('State',       esc(r.state)),
      row('Threat',      esc(r.threat)),
      row('Certainty',   esc(r.certainty)),
      row('First Seen',  fmtTimestamp(r.first_timestamp)),
      row('Last Seen',   fmtTimestamp(r.last_timestamp)),
      row('Sensor',      esc(r.sensor_name)),
    ].join('');
  }

  function formatVectraGroupAPI(results) {
    if (!results.length) return '<div class="dd-popup-row">No detections found.</div>';
    return results.map((r, i) => {
      const header = results.length > 1
        ? `<div class="dd-popup-section-hdr">#${i + 1}</div>`
        : '';
      return header + formatVectraResult(r);
    }).join('<hr class="dd-popup-sep">');
  }

  registerDrillDownPopupFn('vectraGroupAPI', async (value) => {
    const results = await fetchVectraGroupAPI(value);
    return formatVectraGroupAPI(results);
  });

})();
