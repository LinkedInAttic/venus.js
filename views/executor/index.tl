<!DOCTYPE html>
<html>
<head>
  <title>Venus Test Server</title>
  <link rel="stylesheet" type="text/css" href="/css/app.css">
</head>
<body>
  <h1>Venus</h1>
  <ul class="test-list">
  {#tests}
    <li>{path}<br/><a href="{url.run}">{url.run}</a></li>
  {/tests}
  </ul>
</body>
</html>
