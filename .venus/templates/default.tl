<!DOCTYPE html>
<html>
<head>
  <title>Venus Test Runner</title>
  {#scriptIncludes}
  <script type="text/javascript" src="{.}"></script>
  {/scriptIncludes}
  <script type="text/javascript">
    window.adaptor = new Adaptor();
  </script>
</head>
<body>
  <script src="{testcaseFile}"></script>
  <script type="text/javascript">
    window.adaptor.start();
  </script>
</body>
</html>