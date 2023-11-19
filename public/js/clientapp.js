var clients = {};
var rtc = null;

var updateLocalName = function(input) {
    var newLocalClientName = input.value;
    localStorage.setItem('LocalClientName', newLocalClientName);
    rtc.setLocalClientName(newLocalClientName);
};

var addClient = function(newClient) {
    var button = document.createElement('button');
    button.client = newClient;
    button.innerHTML = newClient.name;
    button.onclick = function() {
        rtc.call(button.client.id);
    };
    document.getElementById('clientList').appendChild(button);
    clients[newClient.id] = {
        button: button,
        streams: {}
    };
};

var addStream = function(clientId, stream) {
    var client = clients[clientId];
    client.streams[stream.id] = stream;
    var videoTag = document.createElement('video');
    stream.videoTag = videoTag;
    videoTag.setAttribute('autoplay', 'autoplay');
    document.getElementById('remoteVideos').appendChild(videoTag);
    videoTag.srcObject = stream;
};

var removeClient = function(clientId) {
    var client = clients[clientId];
    client.button.parentNode.removeChild(client.button);
    Object.keys(client.streams).forEach(function(streamId) {
        removeStream(clientId, streamId);
    });
    delete clients[clientId];
};

var removeStream = function(clientId, streamId) {
    var client = clients[clientId];
    var stream = client.streams[streamId];
    var videoTag = stream.videoTag;
    videoTag.pause();
    videoTag.src = '';
    videoTag.parentNode.removeChild(videoTag);
    delete client.streams[streamId];
};

window.onload = function() {

    rtc = new WebRTC({ audio: true, video: true}, true);

    rtc.on('clientList', function(newClientList) {
        var clientListDiv = document.getElementById('clientList');
        while (clientListDiv.lastChild) clientListDiv.removeChild(clientListDiv.lastChild);
        Object.keys(newClientList).forEach(function(clientId) {
            var client = newClientList[clientId];
            addClient(client);
        });
    });

    rtc.on('clientConnected', function(newClient) {
        addClient(newClient);
    });

    rtc.on('clientDisconnected', function(client) {
        removeClient(client.id);
    });

    rtc.on('clientChanged', function(changedClient) {
        clients[changedClient.id].button.innerHTML = changedClient.name;
    });

    rtc.on('localStream', function(localStream) {
        document.getElementById('localVideo').srcObject = localStream;
    });

    rtc.on('remoteStream', function(event) {
        addStream(event.connection.remoteClientId, event.stream);
    });

    var localClientName = localStorage.getItem('LocalClientName');
    document.getElementById('localName').value = localClientName;
    rtc.setLocalClientName(localClientName);

};
