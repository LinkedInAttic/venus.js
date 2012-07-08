<!DOCTYPE html>
<html>
<head>
  <title> venus ♀ </title>
  <script type="text/javascript" src="/js/jquery-1.7.2.min.js"></script>
  <script type="text/javascript" src="/js/runner_client/venus.js"></script>
  <script type="text/javascript">
    window.venus.postUrl = '{postTestResultsUrl}';
  </script>

  {#scriptIncludes}
  <script type="text/javascript" src="{.}"></script>
  {/scriptIncludes}

  <script type="text/javascript">
    window.adaptor = new Adaptor();
  </script>

  <link rel="stylesheet" type="text/css" href="/css/app.css">
  <link rel="stylesheet" type="text/css" href="/css/bootstrap_btn.min.css">
</head>
<body>
  <div id="mocha"></div>
  <div class="header">venus ♀</div>
  Running gogogo test {testId}...

  <script src="{testcaseFile}"></script>
  <script type="text/javascript">
    window.adaptor.start();
  </script>
</body>
</html>
