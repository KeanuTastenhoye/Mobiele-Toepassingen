package domain.model;

import org.json.JSONObject;
import org.json.JSONPropertyIgnore;

public class GroupMessage extends Message {

    private Groupchat groupchat;

    public GroupMessage(User sender, Groupchat chat, String message) {
        super(sender, message);
        setGroupchat(chat);
    }

    private void setGroupchat(Groupchat groupchat) {
        if (groupchat == null) throw new IllegalArgumentException("Null is not a groupchat");
        if (!groupchat.userInGroup(super.getSender())) throw new DomainException("User is not in this groupchat!");
        this.groupchat = groupchat;
    }

    public Groupchat getGroupchat() {
        return this.groupchat;
    }

    @Override
    public String toString() {
        return "Message from " + getSender().getUsername() + " to group '" + getGroupchat().getName() + "': " + getMessage();
    }

    @JSONPropertyIgnore
    public JSONObject getJson() {
        return super.getJson().put("groupchat", getGroupchat().getJson());
    }
}
