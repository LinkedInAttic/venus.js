<!DOCTYPE html>
<html>
<head>
  <title>Application</title>
  <script type="text/javascript" src="js/socketio/socket.io.min.js"></script>
  <script type="text/javascript" src="js/slave.js"></script>
  <script type="text/javascript">
    new Slave({
      masterUrl: 'http://{hostname}:{port}'
    });
  </script>
  <link rel="stylesheet" type="text/css" href="css/app.css">
</head>
<body>
  {i18n_message}
</body>
</html>
