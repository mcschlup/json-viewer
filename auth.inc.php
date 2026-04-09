<?php

/*
 * ctifeeds include file: authentication login form
 *
 */

// if session is already authenticated, then just display user's mail address
if ($_SESSION['authenticated'] == true) {
    echo '<span class="auth-user">' . htmlspecialchars($_SESSION['mail'], ENT_QUOTES) . '</span>'
       . '<form class="auth-logout-form" method="post">'
       . '<input type="hidden" name="logout" value="1">'
       . '<button class="auth-btn auth-btn--logout" type="submit">Logout</button>'
       . '</form>';
}
// check post request form and try to authenticate
elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    try {
        if (authenticate($username, $password)) {
            $_SESSION['authenticated'] = true;
            echo '<span class="auth-user">' . htmlspecialchars($_SESSION['mail'], ENT_QUOTES) . '</span>'
               . '<form class="auth-logout-form" method="post">'
               . '<input type="hidden" name="logout" value="1">'
               . '<button class="auth-btn auth-btn--logout" type="submit">Logout</button>'
               . '</form>';
        } else {
            $_SESSION['authenticated'] = false;
            echo '<form class="auth-login-form" method="post">'
               . '<input class="auth-input" type="text" name="username" placeholder="Username" required autofocus>'
               . '<input class="auth-input" type="password" name="password" placeholder="Password" required>'
               . '<button class="auth-btn auth-btn--login" type="submit">Login</button>'
               . '<span class="auth-msg auth-msg--error">Authentication failed</span>'
               . '</form>';
        }
    } catch (Exception $e) {
        echo '<span class="auth-msg auth-msg--error">Error: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES) . '</span>';
    }
}
// check if logout button pressed
elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    echo '<form class="auth-login-form" method="post">'
       . '<input class="auth-input" type="text" name="username" placeholder="Username" required>'
       . '<input class="auth-input" type="password" name="password" placeholder="Password" required>'
       . '<button class="auth-btn auth-btn--login" type="submit">Login</button>'
       . '</form>';
}
// display login form
else {
    echo '<form class="auth-login-form" method="post">'
       . '<input class="auth-input" type="text" name="username" placeholder="Username" required>'
       . '<input class="auth-input" type="password" name="password" placeholder="Password" required>'
       . '<button class="auth-btn auth-btn--login" type="submit">Login</button>'
       . '</form>';
}
