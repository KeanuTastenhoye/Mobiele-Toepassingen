package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import domain.model.User;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

public class AcceptFriendRequest extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String usernameFriend = params.get("usernameFriend").toString();
        String usernameLoggedInUser = params.get("user").toString();
        try {
            User friend = getService().getUser(usernameFriend);
            User user = getService().getUser(usernameLoggedInUser);
            friend.addFriend(user);
            user.addFriend(friend);
            user.deleteFriendRequest(friend);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("message", "Friend added!");
            List<User> friendList = user.getFriends();
            JSONArray friendListJson = new JSONArray(friendList);
            jsonObject.put("friends", friendListJson);
            List<User> friendRequestList = user.getFriendRequests();
            JSONArray friendRequestListJson = new JSONArray(friendRequestList);
            jsonObject.put("friendRequests", friendRequestListJson);
            Controller.writeResponse(request, response, jsonObject.toString());
        } catch (Exception e) {
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }
    }
}
