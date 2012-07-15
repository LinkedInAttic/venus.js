/**
 * Initialize a new Mocha adaptor
 */
function Adaptor() {

  mocha.setup('bdd');
}

/**
 * Start the tests!
 */
Adaptor.prototype.start = function() {
  var results = this.results = {
    "test": []
  };

  function processResult(test) {

         var name, status;

         name = test.title;

         if(test.state === 'passed') {
           status = 'success';
         } else {
           status = 'failed';
         }

         results.test.push({
            name: name,
            status: status });
  }

  mocha.run()
       .on('pass', function(test){
         processResult(test);
       })
       .on('fail', function(test){
         processResult(test);
       })
       .on('end', function(test){
          console.log(results)
          window.venus.done(results);
       });
}
