var fs      = require('fs'),
    through = require('through'),
    pass    = require('stream').PassThrough,
    path    = require('path'),
    http    = require('http');

var file = path.resolve(process.argv[2]);
console.log(file);
var data = {};

var upper = function (buf) {
  console.log('>>>', buf.toString());
  this.queue(buf.toString().toUpperCase());
};

var reverse = function (buf) {
  this.queue(buf.toString().split('').reverse().join(''));
};


data[file] = {
  transform: [upper, reverse]
};

var server = http.createServer(function (req, res) {
  debugger;
  var path = req.url.replace('/fs', ''),
      filename = data[path];

  if (filename) {
    console.log('Loading', path);
    var f = fs.createReadStream(path, {bufferSize: 4});
    console.log('-------------------');

    // filename.transform.unshift(f);
    // var result = filename.transform.reduce(function (p, c) {
      // // if (p && c) {
        // return p.pipe(c);
      // // } else {
        // // return p;
      // // }
    // });

    // var p = f;
    // // filename.transform.forEach(function (stream) {
      // // p = p.pipe(stream);
    // // });
    // //
    // var p = p.pipe(upper).pipe(reverse);
    
    // res.end('Done');
    f.pipe(through(upper)).pipe(res);

    // f.on('data', function (data) {
      // res.write(data);
    // });

    // f.on('end', function () {
      // res.end();
    // });
    // f.close();
  } else {
    res.end('Not found');
  }
});

server.listen(8080);

// var = fs.createReadStream(file);

// var a = new pass;
// var b = new pass;

// file.pipe(a).pipe(cap).pipe(process.stdout);
// file.pipe(b).pipe(low).pipe(process.stdout);

// var c = new pass;

// file.pipe(c).pipe(process.stdout);
