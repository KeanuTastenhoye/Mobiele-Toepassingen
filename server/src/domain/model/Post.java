package domain.model;

import org.json.JSONObject;
import org.json.JSONPropertyIgnore;

import java.util.ArrayList;

public class Post {

    private String title, text, user, taggedPerson, fullName, locatie;
    private int id;

    private boolean photo;

    private ArrayList<String> likes;
    private ArrayList<String> comments;


    public Post(int id, String title, String text, String user,String fullName, String locatie, boolean photo) {
        setId(id);
        setTitle(title);
        setText(text);
        setUser(user);
        setFullName(fullName);
        setPhoto(photo);
        setLocatie(locatie);
        //setLikes(0);
        likes = new ArrayList<>();
        comments = new ArrayList<>();
    }


    public Post(int id, String title, String text, String user, String taggedPerson, String fullName, String locatie, boolean photo) {
        setId(id);
        setTitle(title);
        setText(text);
        setUser(user);
        setTaggedPerson(taggedPerson);
        setPhoto(photo);
        setLocatie(locatie);
        //setLikes(0);
        setFullName(fullName);
        likes = new ArrayList<>();
        comments = new ArrayList<>();
    }

    public String getFirstComment()
    {
        int size = comments.size();

        if (size == 0)
        {
            return "No comments yet";
        } else
        {
            return comments.get(size - 1);
        }
    }

    public String getLocatie() {
        return locatie;
    }

    public void setLocatie(String locatie) {
        this.locatie = locatie;
    }

    private void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        if (user == null || user.trim().isEmpty()) {
            throw new IllegalArgumentException("User cant be empty");
        }
        this.user = user;
    }

    public String getTaggedPerson() {
        return taggedPerson;
    }

    public void setTaggedPerson(String taggedPerson) {
        this.taggedPerson = taggedPerson;
    }

    public int getLikes() {
        return likes.size();
    }

    public void addLike(String username) {
        if (likes.contains(username)) {
            likes.remove(username);
        } else {
            likes.add(username);
        }
    }

    public boolean hasPhoto() {
        return photo;
    }

    private void setPhoto(boolean photo) {
        this.photo = photo;
    }

    public String getTitle() {
        return title;
    }

    private void setTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cant be empty");
        }
        if (title.replaceAll("(\\$[^\\$]+\\$)", "5").length() > 40) throw new IllegalArgumentException("Title too long (max 40 characters)");
        this.title = title;
    }

    public String getText() {
        return text;
    }

    private void setText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cant be empty");
        }
        if (text.replaceAll("(\\$[^\\$]+\\$)", "5").length() > 255) throw new IllegalArgumentException("Text too long (max 255 characters)");
        this.text = text;
    }

    public ArrayList<String> getComments() {
        return comments;
    }

    public void setComments(ArrayList<String> comments) {
        this.comments = comments;
    }

    public void addComment(String comment, String user) {
        if (comment.isEmpty() || comment.equals("")) {
            throw new IllegalArgumentException("Empty comments are not accepted");
        } else {
            comments.add(user + ": " + comment);
        }
    }

    @JSONPropertyIgnore
    public JSONObject getJson() {
        return new JSONObject()
                .put("id", getId())
                .put("title", getTitle())
                .put("text", getText())
                .put("user", getUser())
                .put("fullName", getFullName())
                .put("locatie", getLocatie())
                .put("taggedPerson", getTaggedPerson())
                .put("likes", getLikes())
                .put("comments", getFirstComment())
                .put("photo", hasPhoto());
    }

    public int compareUsingLikes(Post p) {
        return Integer.compare(getLikes(), p.getLikes());
    }

    public int compareUsingId(Post p) {
        return getId() > p.getId() ? +1 : getId() < p.getId() ? -1 : 0;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        if (fullName.equals("") || fullName.isEmpty()) {
            throw new IllegalArgumentException("Full name should not be empty");
        }
        this.fullName = fullName;
    }
}
