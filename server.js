var http = require('http');
var server = http.createServer();
var fs = require('fs');
var url = require('url');
var path = require('path');

var message = {
    200: 'OK',
    404: 'Not Found',
    500: 'Internal Server Error',
    501: 'Not Implemented'
};

var mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.txt': 'text/plain'
};

server.on('request', function (req, res) {
    var pathName = url.parse(req.url).pathname;
    var filePath = __dirname + pathName;

    if (req.method != 'GET') return;

    fs.stat(filePath, function (err, stats) {
        if (err) return;

        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        var stream = fs.createReadStream(filePath);
        stream.on('readable', function () {
            res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'text-plain' });
        });
        stream.on('data', function (chunk) { res.write(chunk); });
        stream.on('close', function () { res.end(); });
        stream.on('error', function (err) { return; });
    });
});


var msgpack = require('msgpack');
//var obj = {
//    aaa: {
//        count: 123,
//        name: 'test1',
//        result: false
//    },
//    bbb: {
//        count: 456,
//        name: 'test2',
//        result: true
//    },
//    ccc: {
//        count: 789,
//        name: 'test3',
//        param: {
//            ary: ['a', 'b', 'c'],
//            name: 'test4'
//        },
//        result: true
//    }
//};
//var p = msgpack.pack(obj);
//var up = msgpack.unpack(p);
//console.log(p.length);
//console.log(up.length);


// socket.io
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    socket.on('chat', function (data) {
        console.log(data);
        var buf = new Buffer(data);
        console.log(buf);
        //var unpack = msgpack.unpack(data);
        //console.log(unpack);
        io.emit('chat', { buffer: buf });
    });
});

var host = process.env.NODE_ENV === 'production' ? '10.192.212.101' : 'localhost';
var port = 3000;

server.listen(port, host, function () {
    console.log('listening on ' + host + ':' + port);
});
