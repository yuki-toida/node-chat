var http = require('http');
var server = http.createServer();
var fs = require('fs');
var url = require('url');
var path = require('path');
var io = require('socket.io')(server);
var msgpack = require('msgpack');

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

// socket.io
io.on('connection', function (socket) {
    socket.on('chat', function (data) {
        //console.log(data);
        io.emit('chat', data);
    });

    socket.on('binary', function(data) {
        //console.log(msgpack.unpack(data));
        //console.log(data);
        io.emit('binary', { buffer: data });
    })
});

var host = process.env.NODE_ENV === 'production' ? '10.192.212.101' : 'localhost';
var port = 3000;

server.listen(port, host, function () {
    console.log('listening on ' + host + ':' + port);
});
