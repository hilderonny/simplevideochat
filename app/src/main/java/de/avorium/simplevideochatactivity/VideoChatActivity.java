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

import android.annotation.SuppressLint;
import android.net.http.SslError;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;

public class VideoChatActivity extends AppCompatActivity implements View.OnClickListener {

    private VideoChatSocketListener mVideoChatSocketListener;
    private boolean mConnected;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_video_chat);
        findViewById(R.id.activity_video_chat_button_connect).setOnClickListener(this);
        WebView webView = (WebView) findViewById(R.id.activity_video_chat_webview);
        AndroidJavascriptInterface androidJavascriptInterface =
                new AndroidJavascriptInterface(this);
        mVideoChatSocketListener = new VideoChatSocketListener(androidJavascriptInterface);
        WebView.setWebContentsDebuggingEnabled(true);
        // Settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webView.addJavascriptInterface(androidJavascriptInterface, "Android");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            // Need to accept permissions to use the camera and audio
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                VideoChatActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Load the local HTML file into the webview
        WebView webView = (WebView)findViewById(R.id.activity_video_chat_webview);
        webView.loadUrl("file:///android_asset/videochat.html");
        mVideoChatSocketListener.start();
        // When previously connected (Screen rotation) connect again
        if (mConnected) {
            connect();
        }
    }

    @Override
    protected void onPause() {
        mVideoChatSocketListener.stop();
        // Disconnect webview
        WebView webView = (WebView)findViewById(R.id.activity_video_chat_webview);
        webView.loadUrl("");
        super.onPause();
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.activity_video_chat_button_connect:
                connect();
                break;
            default:
                break;
        }
    }

    private void connect() {
        String ip = ((EditText)findViewById(R.id.activity_video_chat_edittext_ip))
                .getText()
                .toString();
        WebView webView = (WebView)findViewById(R.id.activity_video_chat_webview);
        webView.loadUrl("javascript:connect('" + ip + "');");
        mConnected = true;
    }
}
