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
/*   ],                                                                        */
/*   'postData'   => ['key'=>'val'], // static POST fields (method=POST only)  */
/*   'passParams' => ['param1'],     // client GET params forwarded upstream   */
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
