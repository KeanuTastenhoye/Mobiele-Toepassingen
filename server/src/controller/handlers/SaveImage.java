package controller.handlers;

import controller.Controller;
import controller.RequestHandler;
import org.json.JSONObject;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

public class SaveImage extends RequestHandler {
    @Override
    public void handleRequest(HttpServletRequest request, HttpServletResponse response) {
        String realPath = request.getSession().getServletContext().getRealPath("/static/images/profiles");
        try {
            Part filePart = request.getPart("photo");
            InputStream fileContent = filePart.getInputStream();
            String fileName = request.getParameter("user");

            String fullPath = realPath + "\\" + fileName + ".png";

            File targetFile = new File(new File(Controller.class.getProtectionDomain().getCodeSource().getLocation().getPath()).getParent());
            String decoderPath = java.net.URLDecoder.decode(targetFile.getPath(), "UTF-8");
            String secondPath = decoderPath.replace("out\\artifacts\\server_Web_exploded\\WEB-INF", "web\\static\\images\\profiles\\") + fileName + ".png";

            //OutputStream out = new FileOutputStream(fullPath);
            ImageIO.write(ImageIO.read(fileContent), "png", new FileOutputStream(fullPath));
            //ImageIO.write(ImageIO.read(fileContent), "png", new FileOutputStream(secondPath));
            Files.copy(new File(fullPath).toPath(), new File(secondPath).toPath(), StandardCopyOption.REPLACE_EXISTING);
            //copy(fileContent, out);
            //out.flush();
            //out.close();

            Controller.writeResponse(request, response, new JSONObject().put("success", "Profile picture uploaded successfuly!").toString());
        } catch (Exception e) {
            e.printStackTrace();
            Controller.writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
        }
    }

    private long copy(InputStream input, OutputStream output) throws IOException {
        byte[] buffer = new byte[4096];

        long count = 0L;
        int n = 0;

        while (-1 != (n = input.read(buffer))) {
            output.write(buffer, 0, n);
            count += n;
        }
        return count;
    }
}
