package domain.model;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONPropertyIgnore;

import java.util.ArrayList;
import java.util.List;

public class Groupchat {

    private String name;

    private int id;

    private User owner;
    private List<User> members;
    private List<GroupMessage> messages;

    public Groupchat(String name, User owner) {
        setName(name);
        setOwner(owner);
        members = new ArrayList<User>();
        members.add(owner);
        messages = new ArrayList<GroupMessage>();
        id = Service.incrementAndGetId();
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) throw new IllegalArgumentException("Name can't be empty");
        this.name = name.trim();
    }

    private void setOwner(User owner) {
        if (owner == null) throw new IllegalArgumentException("Groupchat must have owner");
        this.owner = owner;
    }

    public void addUser(User user) {
        if (user == null) throw new IllegalArgumentException("Can't add null to group");
        if (!members.contains(user)) members.add(user);
    }

    public void addUsers(List<User> users) {
        if (users == null || users.size() < 1) throw new IllegalArgumentException("Cannot add null/empty list");
        for (User user : users) {
            addUser(user);
        }
    }

    public boolean userInGroup(User user) {
        return (members.contains(user) || owner.equals(user));
    }

    public void addMessage(GroupMessage message) {
        if (message == null) throw new IllegalArgumentException("Can't add null to messages");
        this.messages.add(message);
    }

    public void removeUser(User user) {
        if (user == null) throw new IllegalArgumentException("Cant remove null");
        if (!members.contains(user)) throw new IllegalArgumentException("User not in group");
        members.remove(user);
    }

    public String getName() {return name;}
    public User getOwner() {return owner;}
    public List<GroupMessage> getMessages() {return messages;}
    public List<User> getMembers(){return members;}
    public int getId() {return id;}

    @Override
    public String toString() {
        return "Groupchat '" + getName() + "', " + getMembers().size() + " members, owner = " + getOwner().getUsername();
    }

    @JSONPropertyIgnore
    public JSONObject getJson() {
        JSONArray members = new JSONArray();
        for (User m : this.members) {
            members.put(m.getUsername());
        }

        return new JSONObject()
                .put("name", getName())
                .put("owner", getOwner().getUsername())
                .put("members", members)
                .put("membersCount", getMembers().size())
                .put("id", getId());
    }
}
