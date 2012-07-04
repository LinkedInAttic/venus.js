/**
 * Initialize a new Mocha adapter
 * @param {Runner} runner
 */
function Adapter(runner) {

  var results = {
    "test": []
  };

  runner.on('pass', function(test){
    results.test.push(test);
  });

  runner.on('fail', function(test){
    results.test.push(test);
  });

  runner.on('end', function(test){
    //console.log(results)
  });
}