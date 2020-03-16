package domain.model;

import org.json.JSONObject;
import org.json.JSONPropertyIgnore;

public class PrivateMessage extends Message {
    private User receiver;

    public PrivateMessage(User sender, User receiver, String message) {
        super(sender, message);
        setReceiver(receiver);
    }

    public User getReceiver() {
        return receiver;
    }

    private void setReceiver(User receiver) {
        if (receiver == null) throw new IllegalArgumentException("Receiver is empty.");
        this.receiver = receiver;
    }

    @Override
    public String toString() {
        return "Message from " + getSender().getUsername() + " to " + getReceiver().getUsername() + ": " + getMessage();
    }

    @JSONPropertyIgnore
    public JSONObject getJson() {
        return super.getJson().put("receiver", getReceiver().getUsername());
    }
}
