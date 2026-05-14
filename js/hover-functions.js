// js/hover-functions.js
// Hover popup functions registered via registerDrillDownHoverFn().
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

  const ABUSEIPDB_API_KEY = 'YOUR_API_KEY_HERE';
  const abuseIPDBCache = {};

  async function fetchAbuseIPDB(ip) {
    if (abuseIPDBCache[ip]) return abuseIPDBCache[ip];
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`;
    const resp = await fetch(url, {
      headers: { 'Key': ABUSEIPDB_API_KEY, 'Accept': 'application/json' }
    });
    if (!resp.ok) throw new Error(`AbuseIPDB returned HTTP ${resp.status}`);
    const json = await resp.json();
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

  registerDrillDownHoverFn('abuseIPDB', async (value) => {
    const data = await fetchAbuseIPDB(value);
    return formatAbuseIPDB(data);
  });

})();
