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
  <div class="header">venus ♀</div>
  <div class="dashboard">
    <div class="header2">first test</div>
    <div class="test">should work</div>
    <p>
      time: results.<br />
      speed: fast<br />
      passes: 1<br />
      failures: 0<br />
      percent: 100%
    <p>
    <!--Running test: {testId}-->
  </div>

  <script src="{testcaseFile}"></script>
  <script type="text/javascript">
    window.adaptor.start();
  </script>
</body>
</html>
