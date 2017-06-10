package com.projectzed.simplechatter;

import android.support.v7.widget.RecyclerView;
import android.view.View;
import android.widget.TextView;

import butterknife.BindView;
import butterknife.ButterKnife;

/**
 * Created by ProjectZed on 6/10/17.
 */

class MessageViewHolder extends RecyclerView.ViewHolder {

    protected Message message;

    @BindView(R.id.messageAuthor)
    TextView messageAuthor;
    @BindView(R.id.messageContent)
    TextView messageContent;
    @BindView(R.id.messageTime)
    TextView messageTime;

    public MessageViewHolder(View itemView) {
        super(itemView);
        ButterKnife.bind(itemView);
    }

    public void setMessage(Message message) {
        this.message = message;
    }

    public void clearMessage() {
        this.message = null;
    }

    public void bindMessage(Message message) {
        messageAuthor.setText(message.getAuthor().getFullName());
        messageContent.setText(message.getContent());
        messageTime.setText(message.getTime());
    }
}
