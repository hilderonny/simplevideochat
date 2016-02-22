var localVideoTag;
var remoteVideoTag;
var localVideoStream;
var peerConnection;

function init() {
	localVideoTag = document.getElementById('localVideo');
	remoteVideoTag = document.getElementById('remoteVideo');
	connect(); // For waiting for offers
}

/* WEBRTC */

function connect(ip) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	navigator.getUserMedia({ video: true, audio: true }, function(stream) {
		localVideoTag.src = URL.createObjectURL(stream);
		localVideoStream = stream;
        initPeerConnection(ip);
		if (ip) {
            sendOffer(ip);
		}
	}, console.log);
}

function disconnect() {
    peerConnection.close();
}

function initPeerConnection(ip) {
	peerConnection = new webkitRTCPeerConnection(null);
	peerConnection.onaddstream = function(event) {
		remoteVideoTag.src = URL.createObjectURL(event.stream);
	};
	peerConnection.onicecandidate = function(event) {
		if (event.candidate) {
			var message = { type: 'candidate', candidate: event.candidate };
			Android.sendIceCandidate(ip, JSON.stringify(message));
		}
	}
	peerConnection.addStream(localVideoStream);
}

function sendOffer(ip) {
	peerConnection.createOffer(function(offerDescription) {
		peerConnection.setLocalDescription(offerDescription);
		Android.sendOffer(ip, JSON.stringify(offerDescription));
	});
}

function sendAnswer(ip) {
	peerConnection.createAnswer(function(answerDescription) {
		peerConnection.setLocalDescription(answerDescription);
		Android.sendAnswer(ip, JSON.stringify(answerDescription));
	}, function(error) { console.log(error) });
}

function onIceCandidate(str) {
    replacedstr = str.replace(/(?:\r\n|\r|\n)/g, '\\r\\n');
    var message = JSON.parse(replacedstr);
    peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate), function() { }, function(error) { console.log(error) });
}

function onOffer(ip, str) {
    replacedstr = str.replace(/(?:\r\n|\r|\n)/g, '\\r\\n');
    var message = JSON.parse(replacedstr);
    console.log(message);
    peerConnection.close(); // Recreate the connection because connections which sent offers for itself cannot handle remote offers
    initPeerConnection(ip);
    peerConnection.setRemoteDescription(new RTCSessionDescription(message), function() {
        sendAnswer(ip);
    }, function(error) { console.log(error) });
}

function onAnswer(str) {
    replacedstr = str.replace(/(?:\r\n|\r|\n)/g, '\\r\\n');
    var message = JSON.parse(replacedstr);
    console.log(message);
    peerConnection.setRemoteDescription(new RTCSessionDescription(message), function() { }, function(error) { console.log(error) });
}

