package controller;

import domain.model.Service;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public abstract class RequestHandler {

    private Service service;

    public abstract void handleRequest (HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException;

    public void setService(Service service) {
        this.service = service;
    }

    public Service getService() {
        return service;
    }
}
