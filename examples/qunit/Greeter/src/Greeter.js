function Greeter() {

}

Greeter.prototype.talk = function() {
  var args = Array.prototype.slice.call(arguments, 0),
      ph   = '%s',
      str  = args[0],
      phs  = args.slice(1);

  for (var i = 0, len = phs.length; i < len; i++) {
    str = str.replace(ph, phs[i]);
  }

  return str;
};
