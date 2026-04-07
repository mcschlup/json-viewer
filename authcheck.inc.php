<?php

/*
 * ctifeeds include file: check if authenticated
 *
 */

$auth_required = false;

// redirect to base url if not authenticated
if (!isset($_SESSION['authenticated'])) {
        //header('Location: index.php?login=true');
	$auth_required = true;
}

if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === false) {
        //header('Location: index.php?login=true');
	$auth_required = true;
}
