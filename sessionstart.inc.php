<?php

/*
 * ctifeeds include file: start session
 *
 */

// initialize custom session configuration
//ini_set('session.name', 'CTIFEEDSID');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.gc_maxlifetime', '7200');

// start session
session_start();

// check for logout
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['logout'])) {
    $_SESSION['authenticated'] = false;
}

// set and check session lifetime
if (isset($_SESSION['lastaccessed']) && (time() - $_SESSION['lastaccessed'] > 43200)) {
        session_unset();
        session_destroy();
}
$_SESSION['lastaccessed'] = time();

// regenerate session ID
if (!isset($_SESSION['created'])) {
        $_SESSION['created'] = time();
}
elseif (time() - $_SESSION['created'] > 3600) {
        session_regenerate_id(true);
        $_SESSION['created'] = time();
}

// set auth state
if (!isset($_SESSION['authenticated'])) {
    $_SESSION['authenticated'] = false;
}

// default PHP-scope auth flag (may be overridden by authcheck.inc.php)
$is_authenticated = false;

// misc stuff
date_default_timezone_set('Europe/Zurich');
