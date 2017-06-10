package com.projectzed.simplechatter;

import com.google.gson.annotations.Expose;

import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * Created by ProjectZed on 6/10/17.
 */

public class Message {

    private User author;
    private String content;
    private long timestamp;

    public Message(User author, String content, long timestamp) {
        this.author = author;
        this.content = content;
        this.timestamp = timestamp;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getTime() {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(timestamp);
        SimpleDateFormat format = new SimpleDateFormat("hh:mm aa");
        return format.format(calendar.getTime());
    }
}
