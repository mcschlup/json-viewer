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
