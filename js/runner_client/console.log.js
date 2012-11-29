(function() {
  var nativeLog;

  if(console && console.log) {
    nativeLog = console.log;
    console.log = function() {
      nativeLog.apply( console, arguments );
      window.parent.venus.log( [].slice.call( arguments, 0 ).join( ',' ) );
    };
  }

}());
