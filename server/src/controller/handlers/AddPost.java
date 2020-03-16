package controller.handlers;
import controller.Controller;
import controller.RequestHandler;
import domain.model.Post;
import domain.model.User;
import org.json.JSONObject;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class AddPost extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        /*JSONObject params = Controller.getJsonParameters(request);
        String user = params.get("user").toString();
        String title = params.get("title").toString();
        String text = params.get("text").toString();

        try {
            getService().addPost(user, title, text);
        } catch (Exception e) {
            e.printStackTrace();
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }*/

        String realPath = request.getSession().getServletContext().getRealPath("/static/images/posts");

        try {
            Part filePart = request.getPart("photo");
            String user = request.getParameter("user");
            String title = request.getParameter("title");
            String text = request.getParameter("text");
            String taggedPerson = request.getParameter("taggedPerson");
            String locatie = request.getParameter("locatie");

            System.out.println("=====================");
            System.out.println(filePart);
            System.out.println(user);
            System.out.println(title);
            System.out.println(text);
            System.out.println(taggedPerson);
            System.out.println(locatie);
            System.out.println("=====================");

            Post post = null;

            if (!taggedPerson.equals("undefined")) {
                System.out.println("addMet");
                post = getService().addPostWithTag(user, title, text, taggedPerson, locatie, (filePart != null));
            } else {
                System.out.println("addZonder");
                post = getService().addPost(user, title, text, locatie, (filePart != null));
            }

            if (filePart != null) {
                InputStream fileContent = filePart.getInputStream();
                String fullPath = realPath + "\\" + post.getId() + ".png";

                File targetFile = new File(new File(Controller.class.getProtectionDomain().getCodeSource().getLocation().getPath()).getParent());
                String decoderPath = java.net.URLDecoder.decode(targetFile.getPath(), "UTF-8");
                String secondPath = decoderPath.replace("out\\artifacts\\server_Web_exploded\\WEB-INF", "web\\static\\images\\posts\\") + post.getId() + ".png";

                ImageIO.write(ImageIO.read(fileContent), "png", new FileOutputStream(fullPath));
                Files.copy(new File(fullPath).toPath(), new File(secondPath).toPath(), StandardCopyOption.REPLACE_EXISTING);
            }

            Controller.writeResponse(request, response, new JSONObject().put("success", "Post added!").toString());
        } catch (Exception e) {
            //e.printStackTrace();
            Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
        }
    }
}
