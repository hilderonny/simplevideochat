var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var socketio = require('socket.io');

// Anwendung initialisieren und Handler-Reihenfolge festlegen
var app = express();
app.use(express.static(__dirname + '/public')); // Statische Ressourcen im public-Verzeichnis, lädt bei root-Aufruf automatisch index.html
app.use('/node_modules', express.static(__dirname + '/node_modules')); // Node Module als statische Verweise bereit stellen, damit angular geladen werden kann

// Webserver Express Instanz
var server = https.createServer({ 
    key: fs.readFileSync('./priv.key', 'utf8'), 
    cert: fs.readFileSync('./pub.cert', 'utf8')
}, app);
// Socket.io Instanz
var io = socketio(server);

// Liste verbundener Sockets
var sockets = {};

io.on('connection', (socket) => {
    sockets[socket.id] = socket;
    socket.on('disconnect', () => {
        delete sockets[socket.id];
        console.log(`Socket ${socket.id} disconnected.`);
        socket.broadcast.emit('Message', {
            type: 'WebRTCclientDisconnected',
            content: socket.id
        });
    });
    socket.on('Message', (message) => {
        message.from = socket.id;
        if (message.type === 'WebRTCclientName') {
            socket.name = message.content;
        }
        if (message.to) {
            sockets[message.to].emit('Message', message);
            console.log(`Sent message type "${message.type}" from ${message.from} to ${message.to}`);
        } else {
            socket.broadcast.emit('Message', message);
            console.log(`Sent message type "${message.type}" from ${message.from} to all other`);
        }
    });
    console.log(`Socket ${socket.id} connected.`);
    socket.broadcast.emit('Message', {
        type: 'WebRTCclientConnected',
        content: socket.id
    });
    socket.emit('Message', {
        type: 'WebRTCclientList',
        content: Object.keys(sockets).filter((id) => id !== socket.id).map((id) => {
            return { id: id, name: sockets[id].name }
        })
    });
});

// Server starten
server.listen(443, () => {
    console.log(`HTTP laeuft an Port 443.`);
});
http.createServer((req, res) => {
    // When redirecting, the correct port must be used. But the original request can also have a port which must be stripped.
    var indexOfColon = req.headers.host.lastIndexOf(':');
    var hostWithoutPort = indexOfColon > 0 ? req.headers.host.substring(0, indexOfColon) : req.headers.host;
    var newUrl = `https://${hostWithoutPort}:443${req.url}`;
    res.writeHead(302, { 'Location': newUrl }); // http://stackoverflow.com/a/4062281
    res.end();
}).listen(80, function() {
    console.log(`HTTP laeuft an Port 80.`);
});
