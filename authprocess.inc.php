<?php

/*
 * include file: authentication logic (no HTML output)
 * Sets $is_authenticated, $auth_failed, $auth_error.
 * Must be included after authfunction.inc.php.
 */

$auth_failed = false;
$auth_error  = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        if (authenticate($username, $password)) {
            $_SESSION['authenticated'] = true;
            $_SESSION['lastsuccessfulauthtime'] = time();
        } else {
            $_SESSION['authenticated'] = false;
            $auth_failed = true;
        }
    } catch (Exception $e) {
        $_SESSION['authenticated'] = false;
        $auth_error = $e->getMessage();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    $_SESSION['authenticated'] = false;
    unset($_SESSION['mail']);
}

$is_authenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
