<?php
/* ── Proxy endpoints ─────────────────────────────────────────────────────── */
/* Define named proxy endpoints in config-local.inc.php (not tracked by git). */
/* Each entry: $proxyEndpoints['name'] = [                                     */
/*   'url'        => 'https://...',                                            */
/*   'method'     => 'GET',          // 'GET' or 'POST'                        */
/*   'headers'    => ['Key'=>'...'],  // request headers sent upstream          */
/*   'auth'       => [               // optional — mutually exclusive types:   */
/*     'type' => 'basic', 'user' => '...', 'pass' => '...',                   */
/*     // or: 'type' => 'bearer', 'token' => '...',                           */
/*     // or: 'type' => 'oauth2', 'token_url' => '...', 'user' => '...',      */
/*     //     'pass' => '...',  // POSTs grant_type=client_credentials via     */
/*     //     basic auth; caches access_token in session until expiry          */
/*   ],                                                                        */
/*   'postData'      => ['key'=>'val'], // static POST fields (method=POST only)  */
/*   'passParams'    => ['param1'],     // client GET params forwarded upstream   */
/*   'passPostParams'=> ['param1'],     // client POST params forwarded upstream  */
/*   'searchTemplate'=> '| savedsearch foo args.uid=##VALUE##',                  */
/*                   // if set, client sends ?value=<x>; server validates x      */
/*                   // against valuePattern, substitutes into template as        */
/*                   // 'search' POST param — client never controls the query     */
/*   'valuePattern' => '/^[\w@.\-]+$/', // regex to validate the substituted     */
/*                   // value before inserting it into searchTemplate             */
/*   'proxy'      => 'http://proxy.example.com:8080', // optional HTTP proxy   */
/* ];                                                                          */
$proxyEndpoints = [];

/* ── REST API configuration ──────────────────────────────────────────────── */
/* Override these values in config-local.inc.php (not tracked by git).        */

$api_base_url  = 'https://api.example.com/rest/notable';
$api_username  = 'apiuser';
$api_password  = 'secret';
$api_post_data = [
    'param1' => 'value1',
];

/* ── LDAP AUTH configuration ─────────────────────────────────────────────── */
/* Override these values in config-local.inc.php (not tracked by git).        */
$ldap_uri = 'ldaps://ldap.example.com';
$ldap_base_dn = "o=base";
$ldap_groups = [ 'cn=examplegroup,ou=groups,ou=example,ou=com' ];
$ldap_user_attr = 'uid';
$ldap_bind_user = 'cn=exampleuser,ou=users,ou=example,ou=com';
$ldap_bind_password = 'securepassword';

/* ── Authentication methods displayed in the header widget ───────────────── */
/* At least one should be true. Override in config-local.inc.php.             */
$auth_show_userpass = true;   // show username/password login form
$auth_show_sso      = false;  // show "SSO Sign-in" button

/* ── Entra ID (Azure AD) SSO configuration ───────────────────────────────── */
/* Set in config-local.inc.php. Only used when $auth_show_sso is true.        */
$entra_tenant_id     = '';    // tenant GUID
$entra_client_id     = '';    // app registration "Application (client) ID"
$entra_client_secret = '';    // client secret from the app registration
$entra_redirect_uri  = '';    // must match the redirect URI configured in Entra,
                              // e.g. 'https://yourhost/index.php?sso=callback'
$entra_allowed_groups = [];   // list of allowed group object IDs (GUIDs); empty = allow any
                              // requires the "groups" claim to be enabled in the app
                              // registration (Token configuration → Add groups claim)
$entra_proxy         = '';    // optional HTTP proxy for the outbound calls to
                              // login.microsoftonline.com; empty = direct

/* ── AI Summary backend ──────────────────────────────────────────────────── */
/* Consumed by aisummary.inc.php :: fetchAiSummary(). Currently the function  */
/* returns a static stub; populate these once the real REST API is wired up.  */
$ai_summary_url     = '';   // upstream POST URL that returns the summary JSON
$ai_summary_auth    = [];   // ['type'=>'basic','user'=>'...','pass'=>'...']
$ai_summary_timeout = 30;   // seconds
$ai_summary_proxy   = '';   // optional HTTP proxy; empty = direct
