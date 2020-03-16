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

public class GetUserInfo extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
       // System.out.println("in get user info");
        JSONObject params = Controller.getJsonParameters(request);
        String username = params.get("user").toString();
        System.out.println("Username: " + username);
        try {
            User loggedInUser = getService().getUser(username);
            List<User> friendList = loggedInUser.getFriends();
            List<User> friendRequests = loggedInUser.getFriendRequests();
            JSONObject jsonObject = new JSONObject();
            JSONArray friendRequestsJson = new JSONArray(friendRequests);
            jsonObject.put("friendRequests", friendRequestsJson);
            JSONArray friendListJson = new JSONArray(friendList);
            jsonObject.put("friends", friendListJson);
           // System.out.println("Friend json object: " + jsonObject);
            Controller.writeResponse(request, response, jsonObject.toString());
        } catch(Exception e) {
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }
    }
}
