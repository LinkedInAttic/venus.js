<!DOCTYPE html>
<html>
<head>
  <title>Venus Test Server</title>
  <link rel="stylesheet" type="text/css" href="/css/app.css">
  <script type="text/javascript" src="/js/jquery/jquery-1.10.0.min.js"></script>
  <script src="/js/runner_client/VenusTestList.js"></script>
  <link rel="icon" type="image/png" href="/img/favicon.ico">
</head>
<body class="test-list-page">
  <h1>
    Venus
    &nbsp;<img id="loading" src="/img/spinner.gif">
  </h1>
  <ul class="test-list">
  {#tests}
    <li id="test-{id}" class="test pending">
      <a href="{url.path}">{path}</a>
      <iframe src="{url.path}"></iframe>
    </li>
  {/tests}
  </ul>
</body>
</html>
