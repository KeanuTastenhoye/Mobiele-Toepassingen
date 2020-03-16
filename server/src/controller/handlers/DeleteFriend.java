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

public class DeleteFriend extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String usernameID = params.get("user").toString();
        String friendID = params.get("friend").toString();
        try {
            User user = getService().getUser(usernameID);
            User friend = getService().getUser(friendID);
            user.deleteFriend(friend);
            friend.deleteFriend(user);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("message", "Friend deleted!");
            List<User> friendList = user.getFriends();
            JSONArray friendListJson = new JSONArray(friendList);
            jsonObject.put("friends", friendListJson);
            Controller.writeResponse(request, response, jsonObject.toString());
        } catch (Exception e) {
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }
    }
}
