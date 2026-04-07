<?php
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
