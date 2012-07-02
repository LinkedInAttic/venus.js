<!DOCTYPE html>
<html>
<head>
  <title> venus ♀ </title>
  <script type="text/javascript" src="js/socketio/socket.io.min.js"></script>
  <script type="text/javascript" src="js/slave.js"></script>
  <script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
  <script type="text/javascript" src="js/highcharts.js"></script>
  <script type="text/javascript" src="js/grid.js"></script>
  <script type="text/javascript" src="css/bootstrap_btn.min.css"></script>
  <script type="text/javascript">
    new Slave({
      masterUrl: 'http://{hostname}:{port}'
    });
  </script>
  <link rel="stylesheet" type="text/css" href="css/app.css">
  <link rel="stylesheet" type="text/css" href="css/bootstrap_btn.min.css">
</head>
<body>
  <div class="header">venus ♀</div>
  <div class="dashboard">
    <div id="time">0:0:0</div>
    <div class="status_section">
      <div id="status"><span style="color: #D3D4D4;">status: </span>connected</div>
      <div id="reconnect_btn" class="viewToggle"><button class="btn btn-large btn-primary viewToggle">reconnect</button></div>
    </div>
    <div id="chart"></div>
    <div id="coverLink"></div>
  </div>
  <!--
  <div class="dashboard-container">
    <div class="box-left-container">
      <div id="box-left" class="box-left">
        <div class="test-box">
          <h2>some text</h2>
          <p><em>blah blah blah</em></p>
        </div>
        <div class="test-box"></div>
        <div class="test-box"></div>
        <div class="test-box"></div>
        <div class="test-box"></div>
      </div>
    </div>
    <div class="box-right">
      main dashboard
    </div>
  </div> -->
</body>
</html>
