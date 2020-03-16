package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import domain.model.Post;
import org.json.JSONArray;
import org.json.JSONObject;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class LikePost extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {

        JSONObject params = Controller.getJsonParameters(request);
        String id = params.get("id").toString();
        System.out.println("Id for liked post: " + id);
        String username = params.get("name").toString();
        System.out.println("Username for liked posts: " + username);

        double idD = Double.parseDouble(id);

        Post postLiked = getService().getPostById(idD, username);
        postLiked.addLike(username);




        try {
            int likes = getService().getPostById(idD, username).getLikes();
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("likes", likes);
            // System.out.println("Friend json object: " + jsonObject);
            Controller.writeResponse(request, response, jsonObject.toString());
        } catch(Exception e) {
            Controller.writeResponse(request, response, new JSONObject().put("Message", e.getMessage()).toString());
        }
        /*
        try {
            //System.out.println("In try for posts request");
            JSONArray posts = getService().getPostsAllFriendsJSON(username);
            //JSONArray posts = getService().getPostsJSON(username);
            System.out.println(posts);

            Controller.writeResponse(request, response, new JSONObject().put("posts", posts).toString());
        } catch (Exception e ) {
            Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
        }
        */
    }

}
