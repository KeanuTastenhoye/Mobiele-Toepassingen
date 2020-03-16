package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class GetTopPosts extends RequestHandler {

    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String username = params.get("name").toString();

        try {
            JSONArray posts = getService().getTopPostsJSON(username);
            Controller.writeResponse(request, response, new JSONObject().put("posts", posts).toString());
        } catch (Exception e ) {
            Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
