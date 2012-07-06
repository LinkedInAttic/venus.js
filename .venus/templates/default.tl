<!DOCTYPE html>
<html>
<head>
  <title> venus ♀ </title>
  <script type="text/javascript" src="/js/jquery-1.7.2.min.js"></script>
  <script type="text/javascript" src="/js/runner_client/venus.js"></script>
  <script type="text/javascript">
    window.venus.postUrl = '{postTestResultsUrl}';
  </script>

  {#frameworkUrls}
  <script type="text/javascript" src="{.}"></script>
  {/frameworkUrls}

  <script type="text/javascript" src="http://chaijs.com/chai.js"></script>

  <script type="text/javascript">
    window.adaptor = new Adaptor();
  </script>

  {#includeUrls}
  <script type="text/javascript" src="{.}"></script>
  {/includeUrls}

  <script type="text/javascript" src="{testcaseUrl}"></script>

  <link rel="stylesheet" type="text/css" href="/css/app.css">
  <link rel="stylesheet" type="text/css" href="/css/bootstrap_btn.min.css">
</head>
<body>
  <div id="mocha"></div>
  <div class="header">venus ♀</div>
  Running gogogo test {testId}...

  <script type="text/javascript">
    window.adaptor.start();
  </script>

</body>
</html>
