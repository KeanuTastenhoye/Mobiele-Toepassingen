package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import domain.model.User;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class Login extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String username = params.get("username").toString();
        String password = params.get("password").toString();
        try {
            User u = getService().authenticate(username, password);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("message", "Logged in!");
           // System.out.println(u.getUsername());
            jsonObject.put("user", u.getUsername());
            jsonObject.put("userId", u.getId());
            Controller.writeResponse(request, response, jsonObject.toString());

            request.getSession().setAttribute("user", u);
        } catch(Exception e) {
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }
    }
}
