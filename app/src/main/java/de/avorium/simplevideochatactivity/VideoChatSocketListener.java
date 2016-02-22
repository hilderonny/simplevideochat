/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Ronny Hildebrandt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
package de.avorium.simplevideochatactivity;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.Charset;

public class VideoChatSocketListener implements Runnable {

    private ServerSocket mServerSocket;
    private AndroidJavascriptInterface mAndroidJavascriptInterface;

    public VideoChatSocketListener(AndroidJavascriptInterface androidJavascriptInterface) {
        mAndroidJavascriptInterface = androidJavascriptInterface;
    }

    public void start() {
        if (mServerSocket == null) {
            new Thread(this).start();
        }
    }

    public void stop() {
        if (mServerSocket != null) {
            try {
                mServerSocket.close();
            } catch (IOException e) {
                // Do not mind
            }
            mServerSocket = null;
        }
    }

    @Override
    public void run() {
        try {
            mServerSocket = new ServerSocket(Core.VIDDEOCHAT_SERVERSOCKET_PORT);
        } catch (IOException e) {
            return;
        }
        Socket socket;
        while (true) {
            try {
                socket = mServerSocket.accept();
            } catch (IOException e) {
                // Hier kommen wir hin, wenn von der onDestroy-Methode der ServerSocket geschlossen wird
                break;
            }
            try {
                handleIncomingMessage(socket);
                socket.close();
            } catch (IOException e) {
                // Baeh!
            }
        }
    }

    private void handleIncomingMessage(Socket socket) throws IOException {
        try {
            String ip = socket.getInetAddress().getHostAddress();
            ObjectInputStream objectInputStream = new ObjectInputStream(socket.getInputStream());
            Message message = (Message)objectInputStream.readObject();
            Message.MessageType messageType = message.getMessageType();
            switch(messageType) {
                case WEBRTC_ICE_CANDIDATE:
                    String iceCandidateJson = new String(message.getData(), Charset.forName("UTF-8"));
                    mAndroidJavascriptInterface.executeJavascript("onIceCandidate('" + iceCandidateJson + "');");
                    break;
                case WEBRTC_OFFER:
                    String offerJson = new String(message.getData(), Charset.forName("UTF-8"));
                    mAndroidJavascriptInterface.executeJavascript("onOffer('" + ip + "', '" + offerJson + "');");
                    break;
                case WEBRTC_ANSWER:
                    String answerJson = new String(message.getData(), Charset.forName("UTF-8"));
                    mAndroidJavascriptInterface.executeJavascript("onAnswer('" + answerJson + "');");
                    break;
                default:
                    break;
            }
        } catch (ClassNotFoundException ignored) {
        }
    }

}
