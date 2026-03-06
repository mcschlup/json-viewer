<?php
session_start();

/* ── API: return JSON by session ID ──────────────────────────────────────── */
if (isset($_GET['jsonid'])) {
    $id = preg_replace('/[^a-f0-9]/', '', $_GET['jsonid']);
    if (!empty($id) && isset($_SESSION['json_store'][$id])) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache');
        echo $_SESSION['json_store'][$id];
    } else {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Session data not found or expired.']);
    }
    exit;
}

/* ── Handle POST: validate, save, redirect ───────────────────────────────── */
$form_error  = null;
$form_replay = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['data'])) {
    $raw = trim($_POST['data']);
    json_decode($raw);
    if (json_last_error() === JSON_ERROR_NONE) {
        $id = bin2hex(random_bytes(16));
        if (!isset($_SESSION['json_store'])) {
            $_SESSION['json_store'] = [];
        }
        $_SESSION['json_store'][$id] = $raw;
        header('Location: index.php?view=' . $id);
        exit;
    } else {
        $form_error  = json_last_error_msg();
        $form_replay = $raw;
    }
}

/* ── Resolve viewer mode: ?view=<id> ─────────────────────────────────────── */
$view_id = null;
if (isset($_GET['view'])) {
    $vid = preg_replace('/[^a-f0-9]/', '', $_GET['view']);
    if (!empty($vid) && isset($_SESSION['json_store'][$vid])) {
        $view_id = $vid;
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Viewer</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app">

    <header class="app-header">
      <div class="header-inner">
        <h1 class="app-title">
          <a href="index.php" class="app-title-link">
            <img src="img/icon.png" class="title-icon" alt="">
            CRSI JSON Viewer
          </a>
        </h1>
        <div class="header-right">
          <button class="info-btn" id="info-btn" title="Version Info" aria-label="Show Version Info">i</button>
          <img src="img/logo.png" class="header-logo" alt="Logo">
        </div>
      </div>
    </header>

    <!-- Version popup -->
    <div id="version-popup" class="version-popup hidden" role="dialog" aria-modal="true" aria-labelledby="version-popup-title">
      <div class="version-popup-box">
        <div class="version-popup-header">
          <span id="version-popup-title">Version Info</span>
          <button class="version-popup-close" id="version-popup-close" aria-label="Close">&times;</button>
        </div>
        <div class="version-popup-body" id="version-popup-body"></div>
      </div>
    </div>

    <main class="app-main">

<?php if ($view_id): ?>
      <script>window.__DATA_URL = 'index.php?jsonid=<?= htmlspecialchars($view_id, ENT_QUOTES) ?>';</script>

      <!-- Error state -->
      <div id="error-state" class="state-container hidden" role="alert">
        <div class="state-icon is-error" aria-hidden="true">!</div>
        <h2>Failed to Load Data</h2>
        <p id="error-message" class="state-message"></p>
      </div>

      <!-- Empty / no-data state -->
      <div id="empty-state" class="state-container hidden">
        <div class="state-icon" aria-hidden="true">{ }</div>
        <h2>No Data</h2>
        <p class="state-message">No JSON data was found for this session.</p>
      </div>

      <!-- Viewer -->
      <div id="viewer" class="hidden">
        <nav class="tab-bar" id="tab-bar" role="tablist" aria-label="Data sections"></nav>
        <div id="tab-panels"></div>
      </div>

<?php else: ?>
      <!-- Paste form -->
      <div class="paste-wrap">
        <div class="paste-card">
          <h2 class="paste-title">Paste JSON Data</h2>
<?php if ($form_error): ?>
          <div class="paste-error">
            <strong>Invalid JSON:</strong> <?= htmlspecialchars($form_error) ?>
          </div>
<?php endif; ?>
          <form method="post" action="index.php">
            <textarea
              name="data"
              class="paste-textarea"
              placeholder="Paste JSON here…"
              rows="20"
              autofocus
              spellcheck="false"><?= htmlspecialchars($form_replay) ?></textarea>
            <div class="paste-actions">
              <button type="submit" class="paste-submit">View JSON</button>
            </div>
          </form>
        </div>
      </div>

<?php endif; ?>
    </main>
  </div>

  <script src="js/config.js"></script>
  <script src="js/config-local.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
