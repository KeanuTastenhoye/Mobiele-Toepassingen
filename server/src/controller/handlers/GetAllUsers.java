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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class GetAllUsers extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String usernameID = params.get("user").toString();
//        List<User> usersNotclone = getService().getAllUsers();
//        ArrayList<User> users = (ArrayList<User>) ((ArrayList<User>) usersNotclone).clone();
        try {
            User loggedInUser = getService().getUser(usernameID);
//            List<User> friendsOfLoggedInUser = loggedInUser.getFriends();
//            users.removeAll(friendsOfLoggedInUser);
//            users.remove(loggedInUser);
            List<User> users = getService().getAllNonFriendUsersOfUser(loggedInUser);
            JSONArray usersJson = new JSONArray(users);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("users", usersJson);
            System.out.println(jsonObject);
            Controller.writeResponse(request, response, jsonObject.toString());
        } catch (Exception e) {
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }

    }
}
