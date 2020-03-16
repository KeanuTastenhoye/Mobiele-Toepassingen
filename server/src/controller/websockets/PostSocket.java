//package controller.websockets;
//
//import domain.model.Message;
//import domain.model.Post;
//import domain.model.Service;
//import domain.model.User;
//import org.json.JSONObject;
//import javax.websocket.*;
//import javax.websocket.server.PathParam;
//import javax.websocket.server.ServerEndpoint;
//import java.util.Collections;
//import java.util.HashMap;
//import java.util.Map;
//
//@ServerEndpoint(value = "/posts/{name}")
//public class PostSocket {
//    private static final Map<Session, String> sessions = Collections.synchronizedMap(new HashMap<Session, String>());
//    private Service service = Service.getInstance();
//    private String name;
//
//    @OnOpen
//    public void onOpen(@PathParam("name") String name, Session session) {
//        sessions.put(session, name);
//        this.name = name;
//    }
//
//
//
//    @OnClose
//    public void onClose(Session session) {
//        sessions.remove(session);
//    }
//
//}
