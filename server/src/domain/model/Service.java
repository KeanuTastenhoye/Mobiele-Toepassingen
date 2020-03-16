package domain.model;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class Service {

    private List<User> users;
    private List<Message> messages;
    private List<Groupchat> groupchats;


    private static AtomicInteger id = new AtomicInteger(1);

    //Singleton
    private static Service service = null;

    private Service() {
        users = new ArrayList<>();
        messages = new ArrayList<>();
        groupchats = new ArrayList<>();

        addUser(new User("steven", "Steven", "Zegers", "t"));
        addUser(new User("shiva", "Shiva", "Janssens", "t"));
        addUser(new User("lucas", "Lucas", "Thole", "t"));
        addUser(new User("keanu", "Keanu", "Tastenhoye", "t"));

        this.getUser("steven").addFriend(this.getUser("shiva"));
        this.getUser("steven").addFriend(this.getUser("lucas"));
        this.getUser("steven").addFriend(this.getUser("keanu"));
        this.getUser("keanu").addFriend(this.getUser("shiva"));
        this.getUser("keanu").addFriend(this.getUser("steven"));
        this.getUser("shiva").addFriend(this.getUser("steven"));
        this.getUser("shiva").addFriend(this.getUser("keanu"));
        this.getUser("lucas").addFriend(this.getUser("steven"));

        addPost("steven", "Mijn uitzicht!", "Net weekendje naar zee met de hond en de kinderen, dit was ons uitzicht!", "Wenduine", true);
        addPost("shiva", "Hey ik ben Shiva", "Ik vind deze app heel mooi, ik zou er persoonlijk een 20/20 voor geven!", "Brussel", true);
        addPost("shiva", "Chilly's Waterfles", "Koop een herbruikbare waterfles en red het mileu!", "Oostende", true);
        addPost("keanu", "Camion chauffeurs zijn stom", "Wie weet verliezen ze lading dat op je auto valt en plegen ze vluchtmisdrijf!", "Brussel", false);
        addPost("lucas", "Nieuwe PC", "Na een lange tijd heb ik eindelijk een nieuwe PC aangeschaft.", "Antwerpen", false);
        addPost("lucas", "Prakijk rij-examen", "Die examinator heeft mij absoluut onterecht gebuisd!", "Leuven", false);
    }

    public static Service getInstance() {
        if (service == null) {
            service = new Service();
        }
        return service;
    }

    public void addComment(String username, String comment, String id) {
        int idR = Integer.parseInt(id);
        Post post = getPostById(idR, username);
        post.addComment(comment, username);
    }

    private List<String> getComments(String id) {
        int idR = Integer.parseInt(id);
        List<Post> allPosts = new ArrayList<>();
        List<String> commentsByPost = new ArrayList<>();

        for (User u: getAllUsers()) {
            for (Post p: getPosts(u.getUsername())) {
                allPosts.add(p);
            }
        }

        for (Post p: allPosts) {
            if (p.getId() == idR) {
                commentsByPost.addAll(p.getComments());
            }
        }

        return commentsByPost;
    }

    public JSONArray getCommentsJSON(String id) {
        JSONArray commentPosts = new JSONArray();
        List<String> foundComments = getComments(id);

        Collections.reverse(foundComments);

        for (String c : foundComments) {
            commentPosts.put(new JSONObject().put("comments", c));
        }
        return commentPosts;
    }

    public List<User> getAllUsers() {
        return this.users;
    }

    public List<Groupchat> getGroupchats() {
        return groupchats;
    }

    public List<Groupchat> getGroupchats(User user) {
        List<Groupchat> chats = new ArrayList<>();
        for (Groupchat gc : groupchats) {
            if (gc.userInGroup(user)) chats.add(gc);
        }
        return chats;
    }

    public List<Groupchat> getOwnerGroupchats(User owner) {
        List<Groupchat> chats = new ArrayList<>();
        for (Groupchat gc : groupchats) {
            if (gc.getOwner().equals(owner)) chats.add(gc);
        }
        return chats;
    }

    public void addGroupchat(Groupchat gc) {
        if (gc == null) throw new IllegalArgumentException("Can't add null to groupchats");
        if (!groupchats.contains(gc)) {
            groupchats.add(gc);
        }
    }

    public Post addPost(String user, String title, String text, String locatie, boolean photo) {
        User userAddPost = getUser(user);
        String fullName = userAddPost.getFirstName() + " " + userAddPost.getLastName();
        Post post = new Post(id.incrementAndGet(), title, text, user, fullName, locatie, photo);
        userAddPost.addPost(post);
        return post;
    }

    public Post addPostWithTag(String user, String title, String text, String taggedPerson, String locatie, boolean photo) {
        User userAddPost = getUser(user);
        String fullName = userAddPost.getFirstName() + " " + userAddPost.getLastName();
        Post post = new Post(id.incrementAndGet(), title, text, user, taggedPerson, fullName, locatie, photo);
        userAddPost.addPost(post);
        return post;
    }

    public Post getPostById(double id, String username) {
        List<Post> posts = getPostsFromAllFriends(username);
        Post answer = null;
        for (Post p: posts) {
           // System.out.println(p.getId() + " " + id);
            if (p.getId() == id) {
                answer = p;
            }
        }
        return answer;
    }

    public User authenticate(String username, String password) {
        if (username == null || password == null) throw new IllegalArgumentException();

        username = org.apache.commons.lang3.StringUtils.stripAccents(username);

        for(User u : users) {
            if (u.getUsername().equals(username.trim())) {
                if (u.getPassword().equals(password.trim())) {
                    return u;
                }
            }
        }
        throw new DomainException("Invalid credentials");
    }

    public void addUser(User user) {
        for(User u : users) {
            if (u.getUsername().equals(user.getUsername())) {
                throw new DomainException("This username is already in use");
            }
        }
        user.setId(id.incrementAndGet());
        this.users.add(user);
    }

    public User getUser(String userID) {
        for (User user : users) {
            if (user.getUsername().equals(userID)) {
                return user;
            }
        }
        throw new IllegalArgumentException("There is no user with this userid: '" + userID + "'");
    }

    public Groupchat getGroupchat(int chatId) {
        for (Groupchat gc : groupchats) {
            if (gc.getId() == chatId) return gc;
        }
        throw new IllegalArgumentException("There is no Groupchat with this chatId");
    }

    public User getUserById(int userID) {
        for (User user : users) {
            if (user.getId() == (userID)) {
                return user;
            }
        }
        throw new IllegalArgumentException("There is no user with this id");
    }

    public void addMessage(Message msg) {
        if (msg != null) {
            messages.add(msg);
        }
    }

    public static int incrementAndGetId() {
        return id.incrementAndGet();
    }

    public List<Message> getMessages() {
        return messages;
    }

    public List<PrivateMessage> getMessages(User user1, User user2) {
        List<PrivateMessage> messages = new ArrayList<>();
        //System.out.println(user1.getFirstName());
        //System.out.println(user2.getFirstName());
        for(Message m : this.messages) {
            if (m instanceof PrivateMessage) {
                PrivateMessage pm = (PrivateMessage) m;
                if ((m.getSender().equals(user1) && pm.getReceiver().equals(user2))
                        || (m.getSender().equals(user2) && pm.getReceiver().equals(user1))) {
                    System.out.println("PrivateMessage should be added");
                    System.out.println(pm.getSender().getFirstName());
                    System.out.println(pm.getReceiver().getFirstName());
                    messages.add(pm);
                }
            }
        }
        return messages;
    }

    public List<GroupMessage> getMessages(Groupchat groupchat) {
        List<GroupMessage> messages = new ArrayList<>();

        for(Message m : this.messages) {
            if (m instanceof GroupMessage) {
                GroupMessage gm = (GroupMessage) m;
                if (gm.getGroupchat().equals(groupchat)) {
                    messages.add(gm);
                }
            }
        }
        return messages;
    }

    public List<User> getAllNonFriendUsersOfUser(User user) {
        List<User> usersNotclone = getAllUsers();
        ArrayList<User> users = (ArrayList<User>) ((ArrayList<User>) usersNotclone).clone();

        List<User> friendsOfLoggedInUser = user.getFriends();
        users.removeAll(friendsOfLoggedInUser);
        users.remove(user);
        return users;
    }

    public List<Post> getPostsFromAllFriends(String username) {
        User user = getUser(username);
        List<Post> postsAllFriends = new ArrayList<>();

        for (User u: user.getFriends()) {
            postsAllFriends.addAll(u.getPosts());
        }

        postsAllFriends.addAll(user.getPosts());

        postsAllFriends.sort(Post::compareUsingId);

        return postsAllFriends;
    }

    public JSONArray getPostsAllFriendsJSON(String username) {
        JSONArray postsAllFriends = new JSONArray();

        List<Post> foundPosts = getPostsFromAllFriends(username);
        Collections.reverse(foundPosts);
        for (Post p : foundPosts) {
            postsAllFriends.put(p.getJson());
        }
        return postsAllFriends;
    }

    public List<Post> getPosts(String user) {
        User userReal = getUser(user);
        List<Post> postsUserReal = userReal.getPosts();
        return postsUserReal;
    }

    public JSONArray getPostsJSON(String user) {
        JSONArray posts = new JSONArray();

        List<Post> foundPosts = getPosts(user);
        Collections.reverse(foundPosts);
        for (Post p : foundPosts) {
            posts.put(p.getJson());
        }
        return posts;
    }

    public List<Post> getTopPosts(String user) {
        List<Post> posts = getUser(user).getPosts();
        posts.sort(Post::compareUsingLikes);

        //werkt wel :p
        return posts.subList((Math.max(0, posts.size() - 3)), posts.size());

        //Anders werkt het niet
        /*User userReal = getUser(user);
        List<Post> postsUserReal = userReal.getPosts();
        List<Integer> likes = new ArrayList<>();
        List<Integer> likes2 = new ArrayList<>();
        List<Post> topPosts = new ArrayList<>();
        if (postsUserReal.size() > 3) {
            for (Post p: postsUserReal) {
                likes.add(p.getLikes());
            }
            Collections.sort(likes);
            for (int i = 0; i <= likes.size(); i ++) {
                if (i >= likes.size() - 3) {
                    likes2.add(i);
                }
            }
            for (Integer i: likes2) {
                for (Post p: postsUserReal) {
                    if (i == p.getLikes()) {
                        topPosts.add(p);
                    }
                }
            }
        } else {
            topPosts = postsUserReal;
        }
        return topPosts;*/
    }

    public JSONArray getTopPostsJSON(String user) {
        JSONArray posts = new JSONArray();
        List<Post> top = getTopPosts(user);
        Collections.reverse(top);

        for (Post p: top) {
            posts.put(p.getJson());
        }
        return posts;
    }

    public JSONArray getMessagesJSON(User user1, User user2) {
        JSONArray messages = new JSONArray();

        List<PrivateMessage> found = getMessages(user1, user2);
        Collections.reverse(found);
        for (PrivateMessage m : found) {
            messages.put(m.getJson());
        }
        return messages;
    }

    public JSONArray getMessagesJSON(Groupchat chat) {
        JSONArray messages = new JSONArray();

        List<GroupMessage> found = getMessages(chat);
        Collections.reverse(found);
        for (GroupMessage m : found) {
            messages.put(m.getJson());
        }

        return messages;
    }

    public List<Groupchat> getChats(User user) {
        List<Groupchat> chats = new ArrayList<>();
        for(Groupchat gc : this.groupchats) {
           if (gc.userInGroup(user)) chats.add(gc);
        }
        return chats;
    }

    public JSONArray getChatsJSON(User user) {
        JSONArray chats = new JSONArray();

        List<Groupchat> found = getChats(user);
        Collections.reverse(found);
        for (Groupchat gc : found) {
            chats.put(gc.getJson());
        }

        return chats;
    }
}
