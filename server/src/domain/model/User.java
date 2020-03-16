package domain.model;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONPropertyIgnore;

import java.util.ArrayList;
import java.util.List;

public class User implements Cloneable {
    private String username;
    private String password;

    private String firstName;
    private String lastName;
    private String status;

    private List<User> friendRequests = new ArrayList<>();
    private int id = -1;

    private List<User> friends = new ArrayList<>();

    // List of posts that user has posted //
    private List<Post> posts = new ArrayList<>();

    public User(String username, String firstName, String lastName, String password) {
        //System.out.println("Username in user: " + username);
        setUsername(username);
        //System.out.println("First name in user: " + firstName);
        setFirstName(firstName);
        //System.out.println("Last name in user: " + lastName);
        setLastName(lastName);
        //System.out.println("Password in user: " + password);
        setPassword(password);
        setStatus("Online");
        //addPost(new Post("Hey", "lol"));
        //addPost(new Post("pfff", "haha"));
    }

    // all getters and setters for posts //
    public void addPost(Post p) {
        if (p == null || p.getText().isEmpty() || p.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Post can't be empty or null");
        } else {
            posts.add(p);
        }
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }
    // end getters and setters for posts //

    public void setUsername(String username) {
        //System.out.println("username:" + username);
        if (username == null || username.trim().isEmpty()) throw new IllegalArgumentException("Username cant be empty");
        if (username.replaceAll("(\\$[^\\$]+\\$)", "5").length() > 40) throw new IllegalArgumentException("Username too long (max 40 characters)");
        this.username = org.apache.commons.lang3.StringUtils.stripAccents(username.trim());
    }

    public void setPassword(String password) {
        if (password == null || password.trim().isEmpty()) throw new IllegalArgumentException("Password cant be empty");
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    @JSONPropertyIgnore
    public String getPassword() {
        return password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        if (firstName == null || firstName.trim().isEmpty()) throw new IllegalArgumentException("First name cant be empty");
        if (firstName.replaceAll("(\\$[^\\$]+\\$)", "5").length() > 40) throw new IllegalArgumentException("First name too long (max 40 characters)");
        this.firstName = firstName.trim();
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        if (lastName == null || lastName.trim().isEmpty()) throw new IllegalArgumentException("Last name cant be empty");
        if (lastName.replaceAll("(\\$[^\\$]+\\$)", "5").length() > 40) throw new IllegalArgumentException("Last name too long (max 40 characters)");
        this.lastName = lastName.trim();
    }

    @JSONPropertyIgnore
    public List<User> getFriends() {
        return friends;
    }

    public void setFriends(List<User> friends) {
        if (friends == null) throw new IllegalArgumentException("Friends cant be null");
        this.friends = friends;
    }

    public void addFriend(User friend) {
        if (friend != null) {
            for (User user : this.friends) {
                if (friend.getUsername().equals(user.getUsername())) {
                    throw new IllegalArgumentException("You already have this person added as a friend");
                }
            }
            this.friends.add(friend);
        }
    }

    public String getStatus() {
        return this.status;
    }

    public void setStatus(String status) {
        if (status == null || status.trim().isEmpty()) throw new IllegalArgumentException("Status cant be empty");
        this.status = status.trim();
    }

    @JSONPropertyIgnore
    public JSONObject getJson() {
        return new JSONObject()
                .put("firstname", getFirstName())
                .put("lastname", getLastName())
                .put("username", getUsername())
                .put("friends", new JSONArray(getFriends()))
                .put("status", getStatus());
    }

    @Override
    public boolean equals(Object o) {
        boolean b = false;

        if (o instanceof User) {
            b = true;
            if (!this.getUsername().equals(((User) o).getUsername())) b = false;
            if (!this.getFirstName().equals(((User) o).getFirstName())) b = false;
            if (!this.getLastName().equals(((User) o).getLastName())) b = false;
        }

        return b;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void sendFriendRequest(User friend) {
        if (this.getUsername().equals(friend.getUsername())) throw new DomainException("You cannot send a friend request to yourself.");
        if (this.getFriends().contains(friend)) throw new DomainException("This person is already your friend.");
        if (this.getFriendRequests().contains(friend)) throw new DomainException("You have already sent a friend request to this person.");
        this.friendRequests.add(friend);
    }

    @JSONPropertyIgnore
    public List<User> getFriendRequests() {
        return this.friendRequests;
    }

    public void deleteFriendRequest(User user) {
        try {
            this.getFriendRequests().remove(user);
        } catch (Exception e) {
            throw new DomainException("This user has not sent you a friend request.");
        }
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        User clone = null;
        try
        {
            clone = (User) super.clone();
        }
        catch (CloneNotSupportedException e)
        {
            throw new RuntimeException(e);
        }
        return clone;
    }

    public void deleteFriend(User friend) {
        if (!getFriends().contains(friend)) {
            throw new DomainException("This user is not your friend, cannot delete");
        } else {
            this.getFriends().remove(friend);
        }
    }
}
