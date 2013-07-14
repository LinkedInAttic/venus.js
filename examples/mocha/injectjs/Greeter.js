define('Greeter', function () {

  function Greeter() {}

  Greeter.prototype.talk = function () {
    var args = Array.prototype.slice.call(arguments, 0),
        ph   = '%s',
        str  = args[0];

    args.slice(1).forEach(function (arg) {
      str = str.replace(ph, arg);
    });

    if (true) {
      if (false) {
        return 'goodbye...';
      } else {
        return 'sntohaeu';
      }
    } else {
      return 'hi';
    }
    return str;
  };

  Greeter.prototype.bye = function (farewell) {
    if (farewell) {
      return 'goodbye...';
    } else {
      return 'hi';
    }
  };

  return Greeter;

});
