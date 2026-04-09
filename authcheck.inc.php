<?php

/*
 * ctifeeds include file: check if authenticated
 *
 */

$is_authenticated = false;

if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
        //header('Location: index.php?login=true');
	$is_authenticated = true;
}
