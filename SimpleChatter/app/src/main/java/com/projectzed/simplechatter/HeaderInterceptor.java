package com.projectzed.simplechatter;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import okio.Buffer;

/**
 * Created by ProjectZed on 6/10/17.
 */

class HeaderInterceptor implements Interceptor {

    private static final String AUTH_TOKEN = "eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNCJ9";

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request request = chain.request();
        request = addAuthToken(request);
        if (request.body() != null) {
            try {
                final Request copy = request.newBuilder().build();
                final Buffer buffer = new Buffer();
                copy.body().writeTo(buffer);
            } catch (final IOException e) {
                e.printStackTrace();
            }
        }
        return chain.proceed(request);
    }

    private Request addAuthToken(Request request) {
        return request.newBuilder().header("Authorization", "Bearer " + AUTH_TOKEN).build();
    }
}
