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

  function fieldLabel(key) {
    if (typeof CONFIG !== 'undefined' && CONFIG.fieldMappings) {
      const m = CONFIG.fieldMappings.find(e => e.key === key);
      if (m) return m.name;
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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

  // ── IPLocation ────────────────────────────────────────────────────────────
  // Proxy endpoint 'iplocation' must be configured in config-local.inc.php.
  // No auth required. passParams: ['ip']

  const ipLocationCache = {};

  async function fetchIPLocation(ip) {
    if (ipLocationCache[ip]) return ipLocationCache[ip];
    const url = `index.php?proxy=iplocation&ip=${encodeURIComponent(ip)}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`IPLocation proxy returned HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    if (json.response_code !== '200') throw new Error(`IPLocation: ${json.response_message}`);
    ipLocationCache[ip] = json;
    return json;
  }

  function formatIPLocation(data) {
    return [
      row('Country', esc(data.country_name)),
      row('ISP',     esc(data.isp)),
    ].join('');
  }

  registerDrillDownPopupFn('IPLocation', async (value) => {
    const data = await fetchIPLocation(value);
    return formatIPLocation(data);
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
      row('First Seen',  fmtTimestamp(r.first_timestamp)),
      row('Last Seen',   fmtTimestamp(r.last_timestamp)),
      row('Summary',     fmtTimestamp(r.summary?.description)),
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

  // ── SeclogAppData ──────────────────────────────────────────────────────────
  // Proxy endpoint 'splunk-seclog-appdata' must be configured in config-local.inc.php.
  // Same auth/url/postData as 'splunk-seclog' but with:
  //   searchTemplate: '| savedsearch crsi_get_application_data args.appname=##VALUE##'
  // The popup link URL is built from baseUrl (config fieldDrillDowns entry) with
  // result.application_leanix_id substituted for ##REPLACE##.

  const seclogAppDataCache = {};

  function formatSeclogAppData(data) {
    return [
      row('Name',                    esc(data.application_name)),
      row('ID',                      esc(data.application_id)),
      row('Market Unit',             esc(data.application_market_unit)),
      row('Owner',                   esc(data.application_owner_name)),
      row('Responsible',             esc(data.application_responsible_name)),
      row('Ops Responsible',         esc(data.application_operations_responsible_name)),
      row('Support Group',           esc(data.application_support_group_name)),
      row('Confidentiality',         esc(data.application_confidentiality)),
      row('Integrity',               esc(data.application_integrity)),
      row('Availability',            esc(data.application_availability)),
      row('Criticality',             esc(data.application_criticality)),
      row('DORA Relevancy',          esc(data.application_dora_relevancy)),
      row('LeanIX ID',               esc(data.application_leanix_id)),
    ].join('');
  }

  registerDrillDownPopupFn('SeclogAppData', async (value, key, baseUrl) => {
    let result = seclogAppDataCache[value];
    if (!result) {
      const resp = await fetch('index.php?proxy=splunk-seclog-appdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ value }),
      });
      if (!resp.ok) throw new Error(`splunk-seclog-appdata proxy returned HTTP ${resp.status}`);
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      if (!json.result) throw new Error('No result returned');
      result = json.result;
      seclogAppDataCache[value] = result;
    }

    const leanixId = result.application_leanix_id;
    const url = (baseUrl && leanixId)
      ? baseUrl.replace('##REPLACE##', encodeURIComponent(leanixId))
      : '';

    return { html: formatSeclogAppData(result), url };
  });

  // ── dynamicUpdateUserLastPwChange ─────────────────────────────────────────
  // Proxy endpoint 'splunk-seclog' must be configured in config-local.inc.php.
  // Auth type: basic. method: POST. passPostParams: ['search'].
  // postData: { output_mode: 'json', preview: 'false' }.

  registerFieldUpdateFn('dynamicUpdateUserLastPwChange', async (sourceValue) => {
    const resp = await fetch('index.php?proxy=splunk-seclog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ value: sourceValue }),
    });
    if (!resp.ok) throw new Error(`splunk-seclog proxy returned HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    if (!json.result || json.result.user_last_pwchange === undefined)
      throw new Error('No result returned');
    return json.result.user_last_pwchange;
  });

})();
