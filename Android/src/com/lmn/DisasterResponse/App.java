package com.lmn.DisasterResponse;

import org.apache.cordova.DroidGap;

import android.os.Bundle;

public class App extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000); 
        super.loadUrl("file:///android_asset/www/common/index.html");
    }
}
