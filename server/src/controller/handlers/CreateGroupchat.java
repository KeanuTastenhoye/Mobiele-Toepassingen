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
import java.util.ArrayList;
import java.util.List;

public class CreateGroupchat extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        List<User> users = new ArrayList<>();
        String name = params.get("name").toString();

        try {

            for (Object obj : params.getJSONArray("users")) {
                String user = obj.toString();
                try {
                    users.add(getService().getUser(user));
                } catch (Exception e) {
                    e.printStackTrace();
                    //Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
                }
            }

            if (users.size() < 2) {
               throw new IllegalArgumentException("Add at least 1 friend to the group");
            }

            Groupchat gc = new Groupchat(name, users.get(0));
            gc.addUsers(users);

            getService().addGroupchat(gc);

            Controller.writeResponse(request, response, new JSONObject().put("success", "Group chat '" + name + "' created!").toString());
        } catch (Exception e2) {
            //e2.printStackTrace();
            Controller.writeResponse(request, response, new JSONObject().put("error", e2.getMessage()).toString());
        }
    }
}
