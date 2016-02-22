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

import android.support.annotation.NonNull;

import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.net.InetSocketAddress;
import java.net.Socket;

public class Message implements Serializable {

    private MessageType mMessageType;
    private byte[] mData;

    public Message(@NonNull MessageType messageType, byte[] data) {
        mMessageType = messageType;
        mData = data;
    }

    public MessageType getMessageType() {
        return mMessageType;
    }

    public byte[] getData() {
        return mData;
    }

    public static void sendMessageToIp(String ip, Message message) throws IOException {
        Socket socket = new Socket();
        socket.connect(new InetSocketAddress(ip, Core.VIDDEOCHAT_SERVERSOCKET_PORT), Core.CONNECT_TIMEOUT);
        ObjectOutputStream objectOutputStream = new ObjectOutputStream(socket.getOutputStream());
        objectOutputStream.writeObject(message);
        objectOutputStream.flush();
        socket.close();
    }

    public enum MessageType {
        WEBRTC_ICE_CANDIDATE,
        WEBRTC_OFFER,
        WEBRTC_ANSWER,
    }
}
