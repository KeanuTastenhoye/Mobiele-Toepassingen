package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import domain.model.Groupchat;
import domain.model.User;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class GetGroupMessages extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String username = params.get("user").toString();

        try {
            User user = getService().getUser(username);
            Groupchat chat = getService().getGroupchat(params.getInt("group"));

            if (!chat.userInGroup(user)) throw new IllegalArgumentException("Cant access group messages, no permission!");

            JSONArray messages = getService().getMessagesJSON(chat);

            System.out.println("Request for groupchat " + chat.getId() + " for " + messages.length() + " messages");

            Controller.writeResponse(request, response, new JSONObject().put("messages", messages).toString());
        } catch (Exception e ) {
            Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
