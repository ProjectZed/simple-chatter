package com.projectzed.simplechatter;

/**
 * Created by ProjectZed on 6/10/17.
 */

public class User {

    private String id;
    private String fullName;
    private String[] joindConversations;


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String[] getJoindConversations() {
        return joindConversations;
    }

    public void setJoindConversations(String[] joindConversations) {
        this.joindConversations = joindConversations;
    }

    public User(String id, String fullName, String[] joindConversations) {
        this.id = id;
        this.fullName = fullName;
        this.joindConversations = joindConversations;
    }


}
