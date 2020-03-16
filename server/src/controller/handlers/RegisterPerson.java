package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import domain.model.DomainException;
import domain.model.User;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class RegisterPerson extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        JSONObject params = Controller.getJsonParameters(request);
        try {
            String username = params.get("username").toString();
            System.out.println("username in register: " + username);
            String firstName = params.get("firstname").toString();
            String lastName = params.get("lastname").toString();
            System.out.println("full name: " + firstName + " " + lastName);

            String password = params.get("password").toString();


            if (username.trim().length() >= 255) throw new IllegalArgumentException("This username is too long.");
            if (firstName.trim().split("\\s").length != 1) throw new IllegalArgumentException("Not a valid first name.");
            if (lastName.trim().split("\\s").length != 1) throw new IllegalArgumentException("Not a valid last name.");

            User user = new User(username, firstName, lastName, password);
            username = user.getUsername();
            getService().addUser(user);
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("message", "Registered!");
            jsonObject.put("user", user.getUsername());
            jsonObject.put("userId", user.getId());

            String realPath = request.getSession().getServletContext().getRealPath("/static/images/profiles");
            String fullPath = realPath + "\\" + username + ".png";
            System.out.println(fullPath);
            File targetFile = new File(new File(Controller.class.getProtectionDomain().getCodeSource().getLocation().getPath()).getParent());
            String decoderPath = java.net.URLDecoder.decode(targetFile.getPath(), "UTF-8");
            System.out.println(decoderPath);
            String secondPath = decoderPath.replace("out\\artifacts\\server_Web_exploded\\WEB-INF", "web\\static\\images\\profiles\\") + "standard_profile.png";
            String thirdPath = decoderPath.replace("out\\artifacts\\server_Web_exploded\\WEB-INF", "web\\static\\images\\profiles\\") + username + ".png";
            System.out.println(secondPath);
            Files.copy(new File(secondPath).toPath(), new File(fullPath).toPath());
            Files.copy(new File(secondPath).toPath(), new File(thirdPath).toPath());

            Controller.writeResponse(request, response, jsonObject.toString());
        }  catch (Exception e) {
            e.printStackTrace();
            Controller.writeResponse(request, response, new JSONObject().put("message", e.getMessage()).toString());
        }
    }
}
