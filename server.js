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

// ip�擾
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

// request�C�x���g�F���N�G�X�g���󂯕t�����Ƃ��ɔ���
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
    �N���C�A���g����io�I�u�W�F�N�g�ŃT�[�o�[�ɐڑ�
    �N���C�A���g�����ӂ���socket�I�u�W�F�N�g�쐬
    ��������socket�I�u�W�F�N�g��n���Aconnection�C�x���g�n���h���[���s
    socket�I�u�W�F�N�g�ɑ΂���chat�C�x���g�n���h���[��ݒ肷��
    �N���C�A���g��emit���\�b�h�ɂ���ēn���ꂽ�f�[�^���������ɃC�x���g�n���h���[���s
*/
io.on('connection', function (socket) {
    socket.on('chat', function (msg) {
        io.emit('chat', '[' + ipAdress + '] ' + msg);
    });
});

// ���s��
var host = process.env.NODE_ENV === 'production' ? '10.192.212.101' : 'localhost';

server.listen(3000, host, function () {
    console.log('listening on ' + host);
});
