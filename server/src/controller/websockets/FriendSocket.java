package controller.websockets;

import domain.model.Service;
import domain.model.User;
import org.json.JSONArray;
import org.json.JSONObject;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ServerEndpoint(value = "/friends/{userid}")
public class FriendSocket {
    private static final Map<Session, String> sessions = Collections.synchronizedMap(new HashMap<Session, String>());
    private Service service = Service.getInstance();
    private String userId;

    @OnOpen
    public void onOpen(@PathParam("userid") String userId, Session session) {
        sessions.put(session, userId);
        this.userId = userId;
    }

    @OnMessage
    public void onMessage(String newFriend) {
        //System.out.println("RECEIVED MESSAGE: " + message);
        try {
            User sender = service.getUser(userId);
            User friend = service.getUser(newFriend);
            if (sender.getFriendRequests().contains(friend)) {
                sender.addFriend(friend);
                friend.addFriend(sender);
                sender.deleteFriendRequest(friend);
                List<User> friendRequests = sender.getFriendRequests();
                sendMessage(friendRequests);
            } else {
                friend.sendFriendRequest(sender);
                List<User> updatedFriendRequests = friend.getFriendRequests();
                sendMessage(friend.getUsername(), updatedFriendRequests);
            }
        } catch (Exception e) {
            sendMessage(e.getMessage());
        }
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
    }

    private void sendMessage(String friendUsername, List<User> friendRequests) {
        JSONArray friendRequestsJson = new JSONArray(friendRequests);
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (friendUsername.equals(entry.getValue())) {
                    entry.getKey().getBasicRemote().sendText(friendRequestsJson.toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("confirmation", "Friend request sent.");
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (userId.equals(entry.getValue())) {
                    entry.getKey().getBasicRemote().sendText(jsonObject.toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void sendMessage(List<User> friendRequests) {
        JSONArray friendRequestsJson = new JSONArray(friendRequests);
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (userId.equals(entry.getValue())) {
                    entry.getKey().getBasicRemote().sendText(friendRequestsJson.toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("confirmation", "This user had already sent you a friend request, you are now friends!");
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (userId.equals(entry.getValue())) {
                    entry.getKey().getBasicRemote().sendText(jsonObject.toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void sendMessage(String errorMessage) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("error", errorMessage);
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (userId.equals(entry.getValue())) {
                    entry.getKey().getBasicRemote().sendText(jsonObject.toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
