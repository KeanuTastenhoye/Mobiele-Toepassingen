package controller;

import domain.model.Service;

import java.lang.reflect.InvocationTargetException;

public class HandlerFactory {
    public RequestHandler getController(String key, Service service) {
        return this.getHandler(key, service);
    }


    private RequestHandler getHandler(String handlerName, Service service) {
        RequestHandler handler = null;
        try {
            Class<?> handlerClass = Class.forName("controller.handlers."+ handlerName);
            Object handlerObject = handlerClass.getConstructor().newInstance();
            handler = (RequestHandler) handlerObject;
            handler.setService(service);
        } catch(ClassNotFoundException | NoSuchMethodException | InstantiationException | IllegalAccessException | InvocationTargetException e) {
            throw new RuntimeException("Page '" + handlerName + "' does not exist");
        }
        return handler;
    }
}
