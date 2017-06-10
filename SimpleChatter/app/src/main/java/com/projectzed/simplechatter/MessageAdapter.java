package com.projectzed.simplechatter;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by ProjectZed on 6/10/17.
 */

public class MessageAdapter extends RecyclerView.Adapter<MessageViewHolder> {

    private Message[] messages;

    public MessageAdapter(Context context) {
        messages = new Message[0];
    }

    @Override
    public MessageViewHolder onCreateViewHolder(ViewGroup viewGroup, int i) {
        View inflatedView = LayoutInflater.from(viewGroup.getContext())
                .inflate(R.layout.item_message, viewGroup, false);
        return new MessageViewHolder(inflatedView);
    }

    public void setMessages(Message[] messages) {
        this.messages = messages;
        notifyDataSetChanged();
    }

    @Override
    public void onBindViewHolder(MessageViewHolder messageViewHolder, int i) {
        messageViewHolder.bindMessage(messages[i]);
    }

    @Override
    public int getItemCount() {
        return messages.length;
    }
}
