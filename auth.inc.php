<?php

/*
 * include file: authentication display (no logic)
 * Reads $is_authenticated, $auth_failed, $auth_error set by authprocess.inc.php.
 */

if ($is_authenticated) {
    echo '<span class="auth-user">' . htmlspecialchars($_SESSION['mail'], ENT_QUOTES) . '</span>'
       . '<form class="auth-logout-form" method="post">'
       . '<input type="hidden" name="logout" value="1">'
       . '<button class="auth-btn auth-btn--logout" type="submit">Logout</button>'
       . '</form>';
} elseif ($auth_error !== null) {
    echo '<span class="auth-msg auth-msg--error">Error: ' . htmlspecialchars($auth_error, ENT_QUOTES) . '</span>';
} elseif ($auth_failed) {
    echo '<form class="auth-login-form" method="post">'
       . '<input class="auth-input" type="text" name="username" placeholder="Username" required autofocus>'
       . '<input class="auth-input" type="password" name="password" placeholder="Password" required>'
       . '<button class="auth-btn auth-btn--login" type="submit">Login</button>'
       . '<span class="auth-msg auth-msg--error">Authentication failed</span>'
       . '</form>';
} else {
    echo '<form class="auth-login-form" method="post">'
       . '<input class="auth-input" type="text" name="username" placeholder="Username" required>'
       . '<input class="auth-input" type="password" name="password" placeholder="Password" required>'
       . '<button class="auth-btn auth-btn--login" type="submit">Login</button>'
       . '</form>';
}
