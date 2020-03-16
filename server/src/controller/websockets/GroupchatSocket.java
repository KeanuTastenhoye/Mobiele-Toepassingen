package controller.websockets;

import domain.model.*;
import org.json.JSONObject;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@ServerEndpoint(value = "/groupchat/{groupid}/{userid}")
public class GroupchatSocket {
    private static final Map<Session, String> sessions = Collections.synchronizedMap(new HashMap<Session, String>());
    private Service service = Service.getInstance();
    private String userId;
    private String groupId;

    @OnOpen
    public void onOpen(@PathParam("userid") String userId, @PathParam("groupid") String groupId, Session session) {
        sessions.put(session, groupId);
        this.userId = userId;
        this.groupId = groupId;
    }

    @OnMessage
    public void onMessage(String message) {
        //System.out.println("RECEIVED MESSAGE: " + message);
        try {
            /*
                json
                    'groupchat' -> id of groupchat
                    'text' -> content of message
             */
            JSONObject json = new JSONObject(message);

            User sender = service.getUser(userId);
            //User receivingUser = service.getUserById(id);
            Groupchat chat = service.getGroupchat(json.getInt("groupchat"));
            GroupMessage msg = new GroupMessage(sender, chat, json.getString("text"));

            System.out.println("Added message: " + msg.toString() + " to gc: " + chat.toString());

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

    private void sendMessage(GroupMessage msg) {
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            if (entry.getValue().equals(groupId)) {
                try {
                    entry.getKey().getBasicRemote().sendText(msg.getJson().toString());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
