package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class GetComment extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        String id = params.get("id").toString();
        try {
            JSONArray comments = getService().getCommentsJSON(id);
            System.out.println("comments na service call " + comments);
            Controller.writeResponse(request, response, new JSONObject().put("comments", comments).toString());
        } catch (Exception e ) {
            Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
