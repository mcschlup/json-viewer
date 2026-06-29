<?php

/*
 * include file: AI Summary fetch logic.
 * Exposes fetchAiSummary($jsonText) returning an associative array suitable
 * for json_encode. Currently returns a static stub. Replace the body once
 * the real upstream REST API is available; configuration lives in
 * $ai_summary_* variables in config.inc.php / config-local.inc.php.
 *
 * The $jsonText argument is the raw notable JSON as stored in
 * $_SESSION['json_store'][...] — pass it through to the upstream API once
 * implemented.
 */

function fetchAiSummary($jsonText) {
    global $ai_summary_url, $ai_summary_auth, $ai_summary_timeout, $ai_summary_proxy;

    // TODO: replace stub with real REST API call. Outline:
    //   $ch = curl_init($ai_summary_url);
    //   curl_setopt_array($ch, [
    //       CURLOPT_RETURNTRANSFER => true,
    //       CURLOPT_POST           => true,
    //       CURLOPT_POSTFIELDS     => $jsonText,
    //       CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    //       CURLOPT_TIMEOUT        => $ai_summary_timeout,
    //   ]);
    //   if (!empty($ai_summary_proxy)) curl_setopt($ch, CURLOPT_PROXY, $ai_summary_proxy);
    //   if (!empty($ai_summary_auth['type']) && $ai_summary_auth['type'] === 'basic') {
    //       curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
    //       curl_setopt($ch, CURLOPT_USERPWD, $ai_summary_auth['user'] . ':' . $ai_summary_auth['pass']);
    //   }
    //   $resp = curl_exec($ch); curl_close($ch);
    //   return json_decode($resp, true);

    return [
        'summary' => [
            'finding'          => 'sample data',
            'classification'   => 'TRUE POSITIVE',
            'confidence_level' => 'HIGH',
        ],
        'key_decision_points' => [],
        'immediate_actions'   => [],
        'next_steps'          => [],
        'risk_assessment' => [
            'severity'                    => 'HIGH',
            'attack_stage'                => 'Initial Access (MITRE ATT&CK T1566 - Phishing)',
            'threat_actor_sophistication' => 'MEDIUM-HIGH (coordinated multi-user campaign, infrastructure preparation, evasion of email filters)',
            'immediate_impact'            => 'Potential credential compromise, malware execution capability, lateral movement foundation',
            'organizational_scope'        => 'Multi-regional (3 market units), multi-user (4+ Helvetia employees), suggesting targeted organizational attack',
        ],
    ];
}
