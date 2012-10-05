<!DOCTYPE html>
<html>
<head>
  <title>venus ♀  for Lu</title>
  <script type="text/javascript" src="/js/jquery-1.7.2.min.js"></script>
  <script type="text/javascript" src="/js/runner_client/venus.js"></script>
  <script type="text/javascript" src="/temp/static/lu/scripts/libraries/underscore.js"></script>
  <script type="text/javascript" src="/temp/static/lu/scripts/libraries/inject/inject.js"></script>
  <script type="text/javascript" src="/temp/static/lu/scripts/config.js"></script>
  <script type="text/javascript" src="/temp/static/lu/scripts/lu.js"></script>
  <script type="text/javascript" src="/temp/static/lu/scripts/mappers.js"></script>
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
  <h1 class="header">venus ♀ for Lu</h1>
  <div class="dashboard">
    <div class="header2">first test</div>
    <div class="test">should work</div>
    <p>
      time: results.<br />
      speed: fast<br />
      failures: 0<br />
      percent: 100%
    <p>
    <!--Running test: {testId}-->
  </div>
  <div id="test-container">
    <form method="get">
      <input id="inputTest" type="text" placeholder="input placeholder" data-lu="Placeholder" name="inputTest"/>
      <textarea id="textareaTest" placeholder="textarea placeholder" data-lu="Placeholder" name="textareaTest"></textarea>
    </form>
  </div>
  <script src="{testcaseFile}"></script>
  <script type="text/javascript">
    Inject.setExpires( 0 );
    Inject.clearCache();
    Inject.setModuleRoot( 'http://localhost:2013/temp/static/lu/' );
    Lu.execute( $( 'body' ) ).then( function() {
      window.adaptor.start();
    } );
  </script>
</body>
</html>
