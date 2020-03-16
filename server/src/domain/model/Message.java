package domain.model;

import org.json.JSONObject;
import org.json.JSONPropertyIgnore;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public abstract class Message {

    private User sender;
    private String message;
    private Date dateOfMessage;
    private int id;

    public Message(User sender, String message) {
        setSender(sender);
        setMessage(message);
        Date date = new Date();
        setDateOfMessage(date);
        setId(Service.incrementAndGetId());
    }

    public int getId() {
        return id;
    }

    private void setId(int id) {
        this.id = id;
    }

    public User getSender() {
        return sender;
    }

    private void setSender(User sender) {
        if (sender == null) throw new IllegalArgumentException("Sender is empty.");
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    private void setMessage(String message) {
        if (message == null || message.trim().isEmpty()) throw new IllegalArgumentException("PrivateMessage is empty.");
        this.message = message;
    }

    public Date getDateOfMessage() {
        return dateOfMessage;
    }

    public String getDateFormatted() {
        return new SimpleDateFormat("dd MMM yyyy 'at' kk:mm", Locale.ENGLISH).format(getDateOfMessage());
    }

    private void setDateOfMessage(Date dateOfMessage) {
        this.dateOfMessage = dateOfMessage;
    }

    public String getDateIso() {
        TimeZone tz = TimeZone.getTimeZone("CEST");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);
        return df.format(this.getDateOfMessage());
    }

    @Override
    public String toString() {
        return "Message from " + getSender().getUsername() + ": " + getMessage();
    }


    @JSONPropertyIgnore
    public JSONObject getJson() {
        return new JSONObject()
                .put("sender", getSender().getUsername())
                .put("senderId", getSender().getId())
                .put("message", getMessage())
                .put("date", getDateIso())
                .put("dateFormatted", getDateFormatted())
                .put("id", getId());
    }
}
