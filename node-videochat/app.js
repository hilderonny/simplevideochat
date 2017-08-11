
var init = () => {
    var fs = require('fs');
    var express = require('express');
    var app = express();
    app.use(require('compression')()); // Ausgabekompression
    app.use(require('body-parser').json()); // JSON Request-Body-Parser -> req.body
    app.use(express.static(__dirname + '/public')); // Statische Ressourcen im public-Verzeichnis, lädt bei root-Aufruf automatisch index.html

    // SSL für HTTPS-Server vorbereiten, siehe https://franciskim.co/2015/07/30/how-to-use-ssl-https-for-express-4-x-node-js/
    var credentials = { 
        key: fs.existsSync('./priv.key') ? fs.readFileSync('./priv.key', 'utf8') : null, 
        cert: fs.existsSync('./pub.cert') ? fs.readFileSync('./pub.cert', 'utf8') : null
    };

    var httpsPort = process.env.HTTPS_PORT || 443;
    var httpPort = process.env.PORT || 80;

    var https = require('https');
    var http = require('http');
    var socketio = require('socket.io'); // Chat
    var io, server;

    // HTTPS
    var httpsServer = https.createServer(credentials, app);
    server = httpsServer.listen(httpsPort, function() {
        console.log(`HTTPS laeuft an Port ${httpsPort}.`);
    });
    // HTTP
    var handler = function(req, res) {
        // When redirecting, the correct port must be used. But the original request can also have a port which must be stripped.
        if (!req || !req.headers || !req.headers.host) return; // Attackers do not send correct header information
        var indexOfColon = req.headers.host.lastIndexOf(':');
        var hostWithoutPort = indexOfColon > 0 ? req.headers.host.substring(0, indexOfColon) : req.headers.host;
        var newUrl = `https://${hostWithoutPort}:${httpsPort}${req.url}`;
        res.writeHead(302, { 'Location': newUrl }); // http://stackoverflow.com/a/4062281
        res.end();
    };
    var httpServer = http.createServer(handler);
    httpServer.listen(httpPort, function() {
        console.log(`HTTP laeuft an Port ${httpPort}.`);
    });

    // Websockets
    io = socketio.listen(httpsServer,credentials); // Chat
    io.on('connection', function(socket){
        socket.on('message', function(msg){
            socket.broadcast.emit('message', msg);
        });
    });

};

init();