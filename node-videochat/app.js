var fs = require('fs'); // For reading certificate files
var express = require('express'); // Webserver
var https = require('https'); // WebRTC needs SSL connections
var socketio = require('socket.io'); // Broadcast handshake messages
var jsonbodyparser = require('body-parser').json(); // Parse JSON request bodies to req.body

var httpsPort = 443; // Change to your needs

var app = express();
app.use(jsonbodyparser);
app.use(express.static(__dirname + '/public')); // Serve HTML files from ./public directory

// Prepare SSL certificates for server. Will result in browser warning about untrusted certificates, but it is okay for local tests
var credentials = { 
    key: fs.readFileSync('./priv.key', 'utf8'), 
    cert: fs.readFileSync('./pub.cert', 'utf8')
};

// Prepare HTTPS server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(httpsPort, () => { // Start HTTPS server
    console.log(`HTTPS server is running at port ${httpsPort}.`);
});

// Prepare websockets and bind them to the HTTPS server
var io = socketio.listen(httpsServer,credentials);
// Handle incoming connections
io.on('connection', (socket) => {
    // Handle incoming messages with tag "message"
    socket.on('message', (msg) => {
        // Forward the message to all connected clients except the sender independent on content
        socket.broadcast.emit('message', msg);
    });
});
