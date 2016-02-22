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

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import java.io.IOException;
import java.nio.charset.Charset;

public class AndroidJavascriptInterface {

    private Activity mActivity;

    public AndroidJavascriptInterface(Activity activity) {
        mActivity = activity;
    }

    public void executeJavascript(final String javascript) {
        mActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                ((WebView) mActivity.findViewById(R.id.activity_video_chat_webview))
                        .loadUrl("javascript:" + javascript);
            }
        });
    }

    @JavascriptInterface
    public void sendIceCandidate(String ip, String json) throws IOException {
        Message.sendMessageToIp(ip, new Message(
                Message.MessageType.WEBRTC_ICE_CANDIDATE,
                json.getBytes(Charset.forName("UTF-8"))
        ));
    }

    @JavascriptInterface
    public void sendOffer(String ip, String json) throws IOException, ClassNotFoundException {
        Message.sendMessageToIp(ip, new Message(
                Message.MessageType.WEBRTC_OFFER,
                json.getBytes(Charset.forName("UTF-8"))
        ));
    }

    @JavascriptInterface
    public void sendAnswer(String ip, String json) throws IOException, ClassNotFoundException {
        Message.sendMessageToIp(ip, new Message(
                Message.MessageType.WEBRTC_ANSWER,
                json.getBytes(Charset.forName("UTF-8"))
        ));
    }
}
