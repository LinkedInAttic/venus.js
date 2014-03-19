<!DOCTYPE html>
<html>
<head>
  <title>Venus Test Harness (Sandbox)</title>
  <script type="text/javascript" src="/js/runner_client/console.log.js"></script>
</head>
<body>
  {#scriptIncludes}
  <script type="text/javascript" src="{.}"></script>
  {/scriptIncludes}
  <script type="text/javascript">
    window.adaptor = new Adaptor();
  </script>
  <script src="{testcaseFile}"></script>
  <script type="text/javascript">
    window.parent.venus.beforeHook().then(function () {
      window.adaptor.start();
    });
  </script>
</body>
</html>
