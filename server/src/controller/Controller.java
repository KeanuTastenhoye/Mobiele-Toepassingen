package controller;

import domain.model.Service;
import org.json.JSONObject;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Enumeration;
import java.util.Properties;

/**
 * Servlet implementation class Controller
 */
@WebServlet("/Controller")
@MultipartConfig
//@WebServlet(urlPatterns = "/", loadOnStartup = 1)
public class Controller extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Service service;
    private HandlerFactory factory = new HandlerFactory();

    @Override
    public void init() throws ServletException {
        super.init();

        ServletContext context = this.getServletContext();
        Properties properties = new Properties();
        Enumeration<String> parameterNames = context.getInitParameterNames();
        while (parameterNames.hasMoreElements()) {
            String propertyName = parameterNames.nextElement();
            properties.setProperty(propertyName, context.getInitParameter(propertyName));
        }

        service = Service.getInstance();
    }

    /**
     * @see HttpServlet#HttpServlet()
     */
    public Controller() {
        super();
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        processRequest(request, response);
    }

    private void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	String[] requestURIparts = request.getRequestURI().split("/");
    	String action = requestURIparts.length>0?requestURIparts[(requestURIparts.length-1)]:"";

		if (action != null && !action.trim().isEmpty()) {
            try {
                RequestHandler handler = null;
                handler = factory.getController(action, service);
                handler.handleRequest(request, response);
            } catch (NotAuthorizedException e) {
                writeResponse(request, response, new JSONObject().put("error", "You have insufficient right to perform this action!").toString());
            } catch (RuntimeException e) {
                writeResponse(request, response, new JSONObject().put("error", e.getMessage()).toString());
            }
        }
    }

    public static void writeResponse(HttpServletRequest request, HttpServletResponse response, String json) {
        try {
            response.setContentType("application/json");
            response.getWriter().write(json);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    public static JSONObject getJsonParameters(HttpServletRequest request) throws IOException{
        BufferedReader br = new BufferedReader(new InputStreamReader(request.getInputStream(), "utf-8"));
        String s = "";
        try {
            String line = "";
            while ((line = br.readLine()) != null) {
                s += line;
                //System.out.println(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new JSONObject(s);
    }

    private boolean loggedIn(HttpServletRequest request) {


    	return false;
    }
}
