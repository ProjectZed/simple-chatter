package com.projectzed.simplechatter;

import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.adapter.rxjava.RxJavaCallAdapterFactory;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.POST;
import retrofit2.http.Path;
import rx.Observable;
import rx.schedulers.Schedulers;

/**
 * Created by ProjectZed on 6/10/17.
 */

interface ChatterService {

    @GET("me")
    @Headers({
            "Content-Type: application/json"
    })
    Observable<User> getMe();

    @GET("user/{userId}/conversations")
    @Headers({
            "Content-Type: application/json"
    })
    Observable<String[]> getConversations(@Path("userId") String userId);

    @GET("conversations/{convoId}/messages")
    @Headers({
            "Content-Type: application/json"
    })
    Observable<Message[]> getMessages(@Path("convoId") String convoId);

    @POST("conversations/{convoId}/messages")
    @Headers({
            "Content-Type: application/json"
    })
    Observable<Message> writeMessage(@Body MessageBody body, @Path("convoId") String convoId);


}

public class ChatterConnector {

    public static final String API_URL = "http://192.168.0.114:3000";

    private static ChatterService chatterService;

    public static Observable<User> getMe() {
        ChatterService service = retrieveBackendService();
        return service.getMe()
                .subscribeOn(Schedulers.newThread())
                .onErrorReturn(throwable -> {
                    Log.e("ChatterConnector", "GetMe", throwable);
                    return null;
                });
    }

    public static Observable<String[]> getConversations(String userId) {
        ChatterService service = retrieveBackendService();
        return service.getConversations(userId)
                .subscribeOn(Schedulers.newThread());
    }

    public static Observable<Message[]> getMessages(String convoId) {
        ChatterService service = retrieveBackendService();
        return service.getMessages(convoId)
                .subscribeOn(Schedulers.newThread());
    }

    public static Observable<Message> writeMessage(String convoId, String authorId, String content) {
        ChatterService service = retrieveBackendService();
        return service.writeMessage(new MessageBody(authorId, content), convoId)
                .subscribeOn(Schedulers.newThread());
    }


    private static ChatterService retrieveBackendService() {
        if (chatterService == null) {
            GsonBuilder builder = new GsonBuilder();
            Gson gson = builder.create();
            OkHttpClient interceptClient = new OkHttpClient();
            interceptClient = interceptClient.newBuilder().addInterceptor(new HeaderInterceptor()).build();
            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl(API_URL)
                    .client(interceptClient)
                    .addCallAdapterFactory(RxJavaCallAdapterFactory.create())
                    .addConverterFactory(GsonConverterFactory.create(gson))
                    .build();
            chatterService = retrofit.create(ChatterService.class);
        }
        return chatterService;
    }
}

class MessageBody {
    String author;
    String content;

    public MessageBody(String author, String content) {
        this.author = author;
        this.content = content;
    }
}