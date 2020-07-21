package com.uportMobile;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.*;

import duo.labs.webauthn.Authenticator;
import duo.labs.webauthn.models.*;
import duo.labs.webauthn.exceptions.VirgilException;
import duo.labs.webauthn.exceptions.WebAuthnException;

class FidoManager extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    private static final String TAG = FidoManager.class.getName();

    private Context context;
    private ReactApplicationContext reactContext;
    private Authenticator authenticator;


    public FidoManager(ReactApplicationContext reactContext) throws VirgilException {
        super(reactContext);
        context = reactContext;
        this.reactContext = reactContext;
        this.authenticator = new Authenticator(context, false, false);
        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);
        Log.d(TAG, "FidoManager created");
    }

    @Override
    public String getName() {
        return "FidoManager";
    }

    @Override
    public void onHostResume() {
        Log.d(TAG, "onHostResume");
    }

    @Override
    public void onHostPause() {
        Log.d(TAG, "onHostPause");
    }

    @Override
    public void onHostDestroy() {
        Log.d(TAG, "onHostDestroy");
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "onActivityResult");
    }

    @Override
    public void onNewIntent(Intent intent) {
        Log.d(TAG, "onNewIntent " + intent);
    }

    @ReactMethod
    public void makeCredential(String options, Promise promise) {
        try {
            Log.d(TAG, "makeCredential : " + options);
            AuthenticatorMakeCredentialOptions makeCredentialOptions = AuthenticatorMakeCredentialOptions.fromJSON(options);
            AttestationObject attObj = this.authenticator.makeCredential(makeCredentialOptions);
            byte[] credentialId = attObj.getCredentialId();
            byte[] cborEncoded = attObj.asCBOR();

            WritableMap writableMap = Arguments.createMap();
            writableMap.putArray("credentialId", bytesToRnArray(credentialId));
            writableMap.putArray("cborEncoded", bytesToRnArray(cborEncoded));
            Toast.makeText(getReactApplicationContext(), "makeCredential....", Toast.LENGTH_LONG).show();
            promise.resolve(writableMap);
        } catch (WebAuthnException e) {
            e.printStackTrace();
            promise.reject("WebAuthnException", e);
        } catch (VirgilException e) {
            e.printStackTrace();
            promise.reject("VirgilException", e);
        }
    }

    private static WritableArray bytesToRnArray(byte[] bytes) {
        return appendBytesToRnArray(Arguments.createArray(), bytes);
    }

    private static WritableArray appendBytesToRnArray(WritableArray value, byte[] bytes) {
        for (int i = 0; i < bytes.length; i++) {
            value.pushInt((bytes[i] & 0xFF));
        }
        return value;
    }
}