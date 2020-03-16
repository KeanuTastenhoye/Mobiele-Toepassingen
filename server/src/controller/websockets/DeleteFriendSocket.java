package controller.websockets;

import domain.model.Service;
import domain.model.User;
import org.json.JSONArray;
import org.json.JSONObject;
import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.*;

@ServerEndpoint(value = "/delete/{userid}")
public class DeleteFriendSocket {
    private static final Map<Session, String> sessions = Collections.synchronizedMap(new HashMap<Session, String>());
    private Service service = Service.getInstance();
    private String userId;

    @OnOpen
    public void onOpen(@PathParam("userid") String userId, Session session) {
        sessions.put(session, userId);
        System.out.println(session.getId());
        System.out.println(userId);
        System.out.println("number of sessions in map = " + sessions.size());
        this.userId = userId;
    }

    @OnMessage
    public void onMessage(String deletedFriend) {
        //System.out.println("RECEIVED MESSAGE: " + message);
        try {
            User sender = service.getUser(userId);
            User friend = service.getUser(deletedFriend);
            sender.deleteFriend(friend);
            friend.deleteFriend(sender);
//            List<User> usersNotclone = service.getAllUsers();
//            ArrayList<User> users = (ArrayList<User>) ((ArrayList<User>) usersNotclone).clone();
//
//            List<User> friendsOfLoggedInUser = sender.getFriends();
//            users.removeAll(friendsOfLoggedInUser);
//            users.remove(sender);
            List<User> users = service.getAllNonFriendUsersOfUser(sender);
            sendMessage(friend.getUsername(), users);
        } catch (Exception e) {
            sendMessage(e.getMessage());
        }
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
    }

    private void sendMessage(String friendUsername, List<User> newListofNonUserFriends) {
        User friend = service.getUser(friendUsername);
        List<User> listOfNonFriendsUserOfFriend = service.getAllNonFriendUsersOfUser(friend);
        JSONArray listOfNonFriendsUserOfFriendJSON = new JSONArray(listOfNonFriendsUserOfFriend);
        JSONObject friendJSONObject = new JSONObject();
        friendJSONObject.put("users", listOfNonFriendsUserOfFriendJSON);
        List<User> updatedFriendList = service.getUser(friendUsername).getFriends();
        JSONArray updatedFriendListJSON = new JSONArray(updatedFriendList);
        friendJSONObject.put("friends", updatedFriendListJSON);
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (friendUsername.equals(entry.getValue())) {
                    // System.out.println(friendUsername);
                    entry.getKey().getBasicRemote().sendText(friendJSONObject.toString());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("confirmation", "Friend deleted.");
        jsonObject.put("users", newListofNonUserFriends);
        List<User> updatedLoggedInUserFriendlist = service.getUser(userId).getFriends();
        JSONArray updatedLoggedInUserFriendlistJSON = new JSONArray(updatedLoggedInUserFriendlist);
        jsonObject.put("friends", updatedLoggedInUserFriendlistJSON);
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            try {
                if (userId.equals(entry.getValue())) {
                    // System.out.println(userId);
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
