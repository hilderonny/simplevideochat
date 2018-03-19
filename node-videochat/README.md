# Simple video chat

This is an example for a node express server with video chat via WebRTC.

The videochat happens only between clients. The express server is used only for delivering handshake messages between the clients and for providing the HTML files.

## Usage

Start the server with ```node app.js``` and open a browser to https://localhost. You can also debug the server from Visual Studio Code.

You can change the ports the HTTP and HTTPS server listens on directly in app.js by setting

```javascript
var httpPort = 80;
var httpsPort = 443;
```

