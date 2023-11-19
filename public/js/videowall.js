
var videowall = {
    rtc: null,
    clients: {},
    videolisttag: null,
    localvideotag: document.createElement("video"),
    onclientlist: function(clientlist) {
        videowall.clients = clientlist;
    },
    onclientconnected: function(client) {
        videowall.clients[client.id] = client;
    },
    onclientdisconnected: function(client) {
        if (!client || !client.videotag) return;
        client.videotag.pause();
        client.videotag.src = "";
        client.videotag.parentNode.removeChild(client.videotag);
        delete videowall.clients[client.id];
    },
    onlocalstream: function(stream) {
        videowall.localvideotag.srcObject = stream;
        Object.keys(videowall.clients).forEach(function(key) {
            videowall.rtc.call(key);
        });
    },
    onremotestream: function(event) {
        var client = videowall.clients[event.connection.remoteClientId];
        client.videotag = document.createElement("video");
        client.videotag.autoplay = "autoplay";
        client.videotag.srcObject = event.stream;
        videowall.videolisttag.appendChild(client.videotag);
    },
    init: function(selector) {

        // Init local video
        videowall.videolisttag = document.querySelector(selector);
        videowall.localvideotag.autoplay = "autoplay";
        videowall.videolisttag.appendChild(videowall.localvideotag);

        // Init WebRTC
        videowall.rtc = new WebRTC({ audio: true, video: true}, true);
        videowall.rtc.on("clientList", videowall.onclientlist);
        videowall.rtc.on("clientConnected", videowall.onclientconnected);
        videowall.rtc.on("clientDisconnected", videowall.onclientdisconnected);
        videowall.rtc.on("localStream", videowall.onlocalstream);
        videowall.rtc.on("remoteStream", videowall.onremotestream);

    },
};
