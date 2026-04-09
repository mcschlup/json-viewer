<?php

/*
 * ctifeeds include file: authentication function
 *
 */

// function to authenticate user via ldap
function authenticate($username, $password)
{
    global $ldap_uri, $ldap_base_dn, $ldap_groups, $ldap_user_attr, $ldap_bind_user, $ldap_bind_password;

    // Connect to the LDAP server
    $ldap_conn = ldap_connect($ldap_uri);
    if (!$ldap_conn) {
        throw new Exception("Could not connect to LDAP server.");
    }

    // Set LDAP options
    ldap_set_option($ldap_conn, LDAP_OPT_PROTOCOL_VERSION, 3);
    ldap_set_option($ldap_conn, LDAP_OPT_REFERRALS, 0);

    // Bind as the dedicated user
    if (!@ldap_bind($ldap_conn, $ldap_bind_user, $ldap_bind_password)) {
        ldap_close($ldap_conn);
        throw new Exception("Could not bind to LDAP server as bind user.");
    }

    // Search for the user's DN
    $filter = '(' . $ldap_user_attr . '=' . ldap_escape($username, '', LDAP_ESCAPE_FILTER) . ')';
    $search = ldap_search($ldap_conn, $ldap_base_dn, $filter, array("mail", "cn", "sn", "givenName", "fullName", "groupMembership"));
    if (!$search) {
        ldap_close($ldap_conn);
        throw new Exception("LDAP search failed.");
    }

    $entries = ldap_get_entries($ldap_conn, $search);
    if ($entries["count"] == 0) {
        ldap_close($ldap_conn);
        return false; // User not found
    }

    // Get the user's DN
    $user_dn = $entries[0]["dn"];

    // Verify the user's credentials
    if (!@ldap_bind($ldap_conn, $user_dn, $password)) {
        ldap_close($ldap_conn);
        return false; // Authentication failed
    }

    // Check if the user belongs to the specified group
    foreach ($entries[0]["groupmembership"] as $entry) {
        foreach ($ldap_groups as $group) {
            if ($entry === $group) {
                ldap_unbind($ldap_conn);
                $_SESSION["username"] = $username;
                $_SESSION["mail"] = $entries[0]['mail'][0];
                return true; // User is authenticated and in the group
            }
        }
    }

    ldap_unbind($ldap_conn);
    return false; // User is authenticated but not in the group
}
