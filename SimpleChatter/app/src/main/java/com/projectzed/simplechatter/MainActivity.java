package com.projectzed.simplechatter;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.widget.EditText;
import android.widget.TextView;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnEditorAction;

public class MainActivity extends AppCompatActivity {

    @BindView(R.id.inputField)
    EditText inputField;
    @BindView(R.id.messageList)
    RecyclerView messageList;
    private MessageAdapter messageListAdapter;
    private User user;
    private String conversationId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        messageListAdapter = new MessageAdapter(this);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);
        messageList.setAdapter(messageListAdapter);
        ChatterConnector.getMe().subscribe(userData -> {
            user = userData;
            ChatterConnector.getConversations(user.getId()).subscribe(strings -> {
                conversationId = strings[0];
                ChatterConnector.getMessages(conversationId).subscribe(messages -> {
                    messageListAdapter.setMessages(messages);
                });
            });
        }, throwable -> Log.e("MainActivity", "GetMe", throwable));
    }

    @OnEditorAction(R.id.inputField)
    public boolean sendMessage(TextView text) {
        String content = text.getText().toString().trim();
        if (content.length() > 0 && user != null) {
            ChatterConnector.writeMessage(conversationId, user.getId(), content).subscribe(message -> {
                ChatterConnector.getMessages(conversationId).subscribe(messages -> {
                    messageListAdapter.setMessages(messages);
                });
            });
        }
        return true;
    }
}
