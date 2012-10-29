<!DOCTYPE html>
<html>
<head>
  <title> venus ♀ </title>
  <script type="text/javascript" src="/js/jquery-1.7.2.min.js"></script>
  <!--[if lte IE 7]>
  <script type="text/javascript" src="/js/json2.js"></script>
  <![endif]-->
  <script type="text/javascript" src="/js/runner_client/venus.js"></script>
  <script type="text/javascript">
    window.venus.postUrl = '{postTestResultsUrl}';
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
    <iframe src="/test/sandbox/{testId}" height="270" width="440">
    <!--Running test: {testId}-->
  </div>
</body>
</html>
