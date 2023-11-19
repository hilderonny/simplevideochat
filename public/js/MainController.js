// Controller for main functions
app.controller('MainController', function($scope, $mdMedia) {

    $scope.$mdMedia = $mdMedia; // https://github.com/angular/material/issues/2341#issuecomment-93680762

    $scope.rtc = new WebRTC({ audio: true, video: true}, true);

    $scope.remoteClients = {};

    $scope.rtc.on('clientList', function(newClientList) {
        Object.keys($scope.remoteClients).forEach((key) => {
            delete $scope.remoteClients[key];
        });
        Object.keys(newClientList).forEach(function(clientId) {
            var client = newClientList[clientId];
            $scope.addClient(client);
        });
    }).on('clientConnected', function(newClient) {
        $scope.addClient(newClient);
    }).on('clientDisconnected', function(client) {
        $scope.removeClient(client.id);
    }).on('clientChanged', function(changedClient) {
        var client = $scope.remoteClients[changedClient.id];
        if (!client) return;
        client.name = changedClient.name;
        $scope.$apply();
    }).on('localStream', function(localStream) {
        $scope.localVideoStream = localStream;
        document.getElementById('localVideoTag').srcObject = $scope.localVideoStream;
    }).on('remoteStream', function(event) {
        var client = $scope.remoteClients[event.connection.remoteClientId];
        if (!client) return;
        client.remoteVideo = event.stream;
        $scope.$apply();
    }).on('clientThumbnail', function(changedClient) {
        var client = $scope.remoteClients[changedClient.id];
        if (!client) return;
        client.thumbnail = changedClient.thumbnail;
        $scope.$apply();
    }).on('incomingCallAccepted', function(connection) {
        var remoteClient = $scope.remoteClients[connection.remoteClientId];
        if (!remoteClient) return;
        remoteClient.isInCall = true;
        remoteClient.currentConnection = connection;
        $scope.$apply();
    }).on('connectionClosed', function(connection) {
        var remoteClient = $scope.remoteClients[connection.remoteClientId];
        if (!remoteClient) return;
        remoteClient.isInCall = false;
        $scope.$apply();
    });

    $scope.addClient = function(client) {
        $scope.remoteClients[client.id] = client;
    };

    $scope.removeClient = function(clientId) {
        delete $scope.remoteClients[clientId];
    };

    $scope.updateLocalName = function() {
        localStorage.setItem('LocalClientName', $scope.localClientName);
        $scope.rtc.setLocalClientName($scope.localClientName);
    };

    $scope.callRemoteClient = function(remoteClient) {
        remoteClient.isInCall = true;
        remoteClient.currentConnection = $scope.rtc.call(remoteClient.id);
    };

    $scope.endCall = function(remoteClient) {
        if (!remoteClient.currentConnection) return;
        remoteClient.currentConnection.close();
        remoteClient.isInCall = false;
    };
    

    $scope.localClientName = localStorage.getItem('LocalClientName');
    $scope.rtc.setLocalClientName($scope.localClientName);

});
