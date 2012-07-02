/**
 * Browser Slave
 * @author LinkedIn
 */
function Slave(config) {
  init();
  var chart;
  var t;
  var timeDiv;
  var timerInterval;
  var failedPercentage = 40;
  var passedPercentage = 60;

  function init() {
    var socket = io.connect(config.masterUrl);
    socket.on('open', function(e) {
      var url = e.url,
          iframe = document.createElement('iframe');

      iframe.src = url;
      document.body.appendChild(iframe);
    });

    socket.on('disconnect', function(e) {
      
      $('#status').addClass('viewToggle');
      $('#reconnect_btn').removeClass('viewToggle');
      clearInterval(timerInterval);
      t = 0;
      timeDiv.html('0:0:0');
    });

    socket.on('reconnect', function(e) {
      $('#status').removeClass('viewToggle');
      $('#reconnect_btn').addClass('viewToggle');
      timeInterval();
    });
  }

  $(document).ready(function () {

    var t = 0;
    timeDiv = $('#time');

    function timer () {
      t += 1;

      var hours = Math.floor(t / 3600); 
      var minutes = Math.floor(t / 60) - (hours * 60); 
      var seconds = t - (hours * 3600) - (minutes * 60); 

      timeDiv.html(hours + ':' + minutes + ':' + seconds);
    }

    timerInterval = setInterval(timer, 1000);
    setTimeout(makeChart, 1000);
    function makeChart () {
      chart = new Highcharts.Chart({
        chart: {
          renderTo: 'chart',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          backgroundColor: null,
          borderColor: null,
          plotShadow: false
        },
        title: {
          text: ''
        },
        tooltip: {
          formatter: function() {
            return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: false,
              color: '#D3D4D4',
              connectorColor: '#D3D4D4',
              formatter: function() {
                return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'test statistics',
          data: [
            ['failed', failedPercentage],
            {
              name: 'passed',
              y: passedPercentage,
              sliced: true,
              selected: true
            }
          ]
        }]
      });
    }

  });
}