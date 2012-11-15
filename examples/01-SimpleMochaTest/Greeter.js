function Greeter() {

}

Greeter.prototype.talk = function() {
  var args = Array.prototype.slice.call(arguments, 0),
      ph   = '%s',
      str  = args[0];

  args.slice(1).forEach( function(arg) {
    str = str.replace(arg, ph);
  });

  return str;
}
