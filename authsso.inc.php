<?php

/*
 * include file: Entra ID (Azure AD) SSO authentication logic.
 * Handles two query params:
 *   ?sso=login    – redirect user to Entra ID authorize endpoint
 *   ?sso=callback – handle the redirect back, validate the ID token, log user in
 * On success sets the same session vars as the LDAP path so the rest of the app
 * does not need to distinguish between the two authentication methods.
 * Must be included after sessionstart.inc.php, config.inc.php, and authprocess.inc.php.
 */

if (!isset($_GET['sso'])) return;

require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\JWK;

if (empty($entra_tenant_id) || empty($entra_client_id) || empty($entra_redirect_uri)) {
    $auth_error = 'SSO is not configured.';
    return;
}

/* ── Step 1: redirect to Entra ID authorize endpoint ──────────────────────── */
if ($_GET['sso'] === 'login') {
    $state = bin2hex(random_bytes(16));
    $nonce = bin2hex(random_bytes(16));
    $_SESSION['sso_state'] = $state;
    $_SESSION['sso_nonce'] = $nonce;

    $params = http_build_query([
        'client_id'     => $entra_client_id,
        'response_type' => 'code',
        'redirect_uri'  => $entra_redirect_uri,
        'response_mode' => 'query',
        'scope'         => 'openid profile email',
        'state'         => $state,
        'nonce'         => $nonce,
    ]);
    header("Location: https://login.microsoftonline.com/{$entra_tenant_id}/oauth2/v2.0/authorize?{$params}");
    exit;
}

/* ── Step 2: handle callback ──────────────────────────────────────────────── */
if ($_GET['sso'] === 'callback') {

    // Bubble up errors from Entra ID itself
    if (isset($_GET['error'])) {
        $auth_error = 'SSO error: ' . ($_GET['error_description'] ?? $_GET['error']);
        return;
    }

    // CSRF: returned state must match the value we stored
    if (!isset($_GET['state'], $_SESSION['sso_state'])
        || !hash_equals($_SESSION['sso_state'], $_GET['state'])) {
        $auth_error = 'SSO state mismatch.';
        unset($_SESSION['sso_state'], $_SESSION['sso_nonce']);
        return;
    }

    if (!isset($_GET['code'])) {
        $auth_error = 'SSO callback missing code.';
        return;
    }

    // Exchange authorization code for tokens
    $tokenUrl   = "https://login.microsoftonline.com/{$entra_tenant_id}/oauth2/v2.0/token";
    $postFields = http_build_query([
        'client_id'     => $entra_client_id,
        'client_secret' => $entra_client_secret,
        'grant_type'    => 'authorization_code',
        'code'          => $_GET['code'],
        'redirect_uri'  => $entra_redirect_uri,
    ]);

    $ch = curl_init($tokenUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CAINFO         => '/etc/pki/tls/certs/ca-bundle.crt',
        CURLOPT_USERAGENT      => 'curl/7.76.1',
    ]);
    $tokenResp = curl_exec($ch);
    $tokenCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $tokenErr  = curl_error($ch);
    curl_close($ch);

    if ($tokenResp === false || $tokenErr !== '' || $tokenCode < 200 || $tokenCode >= 300) {
        $auth_error = 'SSO token exchange failed.';
        error_log("SSO token exchange failed: HTTP $tokenCode, curlError: $tokenErr, response: $tokenResp");
        return;
    }

    $tokenData = json_decode($tokenResp, true);
    if (empty($tokenData['id_token'])) {
        $auth_error = 'SSO response missing id_token.';
        return;
    }

    // Fetch Microsoft's JWKS for this tenant to verify the ID token signature
    $jwksUrl = "https://login.microsoftonline.com/{$entra_tenant_id}/discovery/v2.0/keys";
    $ch = curl_init($jwksUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CAINFO         => '/etc/pki/tls/certs/ca-bundle.crt',
        CURLOPT_USERAGENT      => 'curl/7.76.1',
    ]);
    $jwksResp = curl_exec($ch);
    curl_close($ch);

    if ($jwksResp === false) {
        $auth_error = 'Failed to fetch JWKS.';
        return;
    }

    try {
        $keys    = JWK::parseKeySet(json_decode($jwksResp, true));
        $payload = JWT::decode($tokenData['id_token'], $keys);
    } catch (Exception $e) {
        $auth_error = 'ID token validation failed: ' . $e->getMessage();
        error_log("SSO JWT decode failed: " . $e->getMessage());
        return;
    }

    // Verify aud, iss, nonce
    if (($payload->aud ?? '') !== $entra_client_id) {
        $auth_error = 'ID token audience mismatch.';
        return;
    }
    $expectedIss = "https://login.microsoftonline.com/{$entra_tenant_id}/v2.0";
    if (($payload->iss ?? '') !== $expectedIss) {
        $auth_error = 'ID token issuer mismatch.';
        return;
    }
    if (!isset($payload->nonce) || $payload->nonce !== ($_SESSION['sso_nonce'] ?? '')) {
        $auth_error = 'ID token nonce mismatch.';
        return;
    }

    // Group membership check (skipped if $entra_allowed_groups is empty)
    // Note: if a user is in >~150 groups, Entra omits the 'groups' claim and
    // emits a '_claim_names' pointer to Graph API instead — unsupported here.
    if (!empty($entra_allowed_groups)) {
        $userGroups = (array)($payload->groups ?? []);
        if (!array_intersect($entra_allowed_groups, $userGroups)) {
            $auth_error = 'User is not a member of an allowed group.';
            error_log('SSO: user not in allowed groups; got: ' . implode(',', $userGroups));
            return;
        }
    }

    // Success — set the same session state as the LDAP login path
    $_SESSION['authenticated']           = true;
    $_SESSION['mail']                    = $payload->email ?? $payload->preferred_username ?? $payload->upn ?? '';
    $_SESSION['lastsuccessfulauthtime']  = time();
    unset($_SESSION['sso_state'], $_SESSION['sso_nonce']);

    // Redirect to a clean URL (without ?sso=callback&code=...&state=...)
    header('Location: index.php');
    exit;
}
