var http = require('http');
var server = http.createServer();
var fs = require('fs');

var html;
fs.readFile('./index.html', function (err, data) {
    if (err) {
        throw err;
    }
    html = data;
});

// ip取得
function getIpAdress(request) {
    if (request.headers['x-forwarded-for']) {
        return request.headers['x-forwarded-for'];
    }
    if (request.connection && request.connection.remoteAddress) {
        return request.connection.remoteAddress;
    }
    if (request.connection.socket && request.connection.socket.remoteAddress) {
        return request.connection.socket.remoteAddress;
    }
    if (request.socket && request.socket.remoteAddress) {
        return request.socket.remoteAddress;
    }
    return '0.0.0.0';
};

var ipAdress;

// requestイベント：リクエストを受け付けたときに発生
server.on('request', function (req, res) {
    ipAdress = getIpAdress(req);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
})

var io = require('socket.io')(server);
var redis = require('socket.io-redis');
io.adapter(redis({ host: 'dev-cache01.clayapp.jp', port: 6383 }));

/*
    クライアント側のioオブジェクトでサーバーに接続
    クライアント情報をふくむsocketオブジェクト作成
    引き数にsocketオブジェクトを渡し、connectionイベントハンドラー実行
    socketオブジェクトに対してchatイベントハンドラーを設定する
    クライアントのemitメソッドによって渡されたデータを引き数にイベントハンドラー実行
*/
io.on('connection', function (socket) {
    socket.on('chat', function (msg) {
        io.emit('chat', '[' + ipAdress + '] ' + msg);
    });
});

// 実行環境
var host = process.env.NODE_ENV === 'production' ? '10.192.212.101' : 'localhost';

server.listen(3000, host, function () {
    console.log('listening on ' + host);
});
