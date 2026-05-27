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

  // ── Vectra Group API ───────────────────────────────────────────────────────
  // Proxy endpoint 'vectra' must be configured in config-local.inc.php.
  // Auth type: oauth2 (client_credentials via token_url + user/pass).

  const VECTRA_FIELDS = 'id,url,detection,detection_category,description,state,certainty,threat,first_timestamp,last_timestamp,sensor,sensor_name';

  const vectraCache = {};

  async function fetchVectraGroupAPI(entityId) {
    if (vectraCache[entityId]) return vectraCache[entityId];
    const url = `index.php?proxy=vectra&entity_id=${encodeURIComponent(entityId)}&fields=${encodeURIComponent(VECTRA_FIELDS)}`;
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
      row('Description', esc(r.description) || '—'),
      row('First Seen',  esc(r.first_timestamp)),
      row('Last Seen',   esc(r.last_timestamp)),
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
