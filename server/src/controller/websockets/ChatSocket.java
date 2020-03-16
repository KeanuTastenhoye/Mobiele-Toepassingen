package controller.websockets;

import domain.model.PrivateMessage;
import domain.model.Service;
import domain.model.User;
import org.json.JSONObject;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@ServerEndpoint(value = "/chat/{userid}/{userid2}")
public class ChatSocket {
    private static final Map<Session, Conversation> sessions = Collections.synchronizedMap(new HashMap<>());
    private Service service = Service.getInstance();
    private String userId, userId2;

    private class Conversation {
        private String user1, user2;

        public Conversation(String user1, String user2) {
            this.user1 = user1;
            this.user2 = user2;
        }

        public String getUser1() { return user1; }
        public String getUser2() { return user2; }
    }

    @OnOpen
    public void onOpen(@PathParam("userid") String userId, @PathParam("userid2") String userId2, Session session) {
        Conversation conversation = new Conversation(userId, userId2);
        sessions.put(session, conversation);
        this.userId = userId;
        this.userId2 = userId2;
    }

    @OnMessage
    public void onMessage(String message) {
        //System.out.println("RECEIVED MESSAGE: " + message);
        try {
            /*
                json
                    'receiver' -> userId of receiver
                    'text' -> content of message
             */
            JSONObject json = new JSONObject(message);

            User sender = service.getUser(userId);
            //User receivingUser = service.getUserById(id);
            User receivingUser = service.getUser(json.getString("receiver"));
            PrivateMessage msg = new PrivateMessage(sender, receivingUser, json.getString("text"));

            service.addMessage(msg);
            sendMessage(msg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
    }

    private void sendMessage(PrivateMessage msg) {
        for (Map.Entry<Session, Conversation> entry : sessions.entrySet()) {
            try {
                Conversation conversation = entry.getValue();
                if ((conversation.getUser1().equals(userId) && conversation.getUser2().equals(userId2)) ||
                    conversation.getUser2().equals(userId) && conversation.getUser1().equals(userId2)) {
                    entry.getKey().getBasicRemote().sendText(msg.getJson().toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
