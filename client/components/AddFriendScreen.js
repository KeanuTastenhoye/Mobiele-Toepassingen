import React from "react";
import {AsyncStorage, FlatList, Image, StyleSheet, Text, TouchableHighlight, View} from "react-native";
import SearchableDropdown from 'react-native-searchable-dropdown';
import {material} from 'react-native-typography';
import { decode, websocket } from './inputParser';
import KeyboardSpacer from "react-native-keyboard-spacer";

export default class AddFriendScreen extends React.Component {
    static navigationOptions = {
        title: 'Chats',
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            user: '',
            users: [],
            friends: [],
            friendRequests: [],
            newfriend: '',
            confirmation: '',
            deletefriend: '',
            friendsForDropdown: [],
        };
        this.chatsocket = new WebSocket("ws://10.0.2.2:8080/friends/" + websocket(this.props.navigation.state.params.user));
        this.deletefriendsocket = new WebSocket("ws://10.0.2.2:8080/delete/" + websocket(this.props.navigation.state.params.user));
    }

    componentWillMount() {
        this.chatsocket.onopen = () => {
            console.log("Friend socket client connected");
        };

        this.chatsocket.onmessage = (message) => {
            let data = JSON.parse(message.data);
            if (data.error != null) {
                alert(data.error)
            } else if (data.confirmation != null) {
                alert(data.confirmation);
            } else {
                this.setState({
                    friendRequests: data,
                })
            }
        };

        this.deletefriendsocket.onopen = () => {
            console.log("Delete friend socket client connected");
        };

        this.deletefriendsocket.onmessage = (message) => {
            let data = JSON.parse(message.data);
            if (data.error != null) {
                alert(data.error)
            } else if (data.confirmation != null) {
                alert(data.confirmation);
                this.setState({
                    users: data.users.map((user)=> {
                        return {
                            id: user.username,
                            name: decode(user.firstName + " " + user.lastName),
                        };
                    }),
                    friendsForDropdown: data.friends.map((user)=> {
                        return {
                            id: user.username,
                            name: decode(user.firstName + " " + user.lastName),
                        };
                    }),
                })
            }
        };
        this._retrieveData();
    }

    componentWillUnmount() {
        this.chatsocket.close();
        this.deletefriendsocket.close();
    }

    _retrieveData = async () => {
        console.log("in retrieve data");
        try {
            let username = await AsyncStorage.getItem('user', function () {
            });
            this.setState({user: username});
            //console.log("retrieved username = " + username);
        } catch (error) {
        }
        this._getFriendList();
        this._getAllUsers();
    };

    _getAllUsers = async () => {
        fetch('http://10.0.2.2:8080/GetAllUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: this.state.user,
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                // console.log(responseJson);
                this.setState({
                    users: responseJson.users.map((user)=>{
                        //console.log(chatMessage);
                        return {
                            id: user.username,
                            name: decode(user.firstName + " " + user.lastName),
                        };
                    }),
                });
            }).catch((error) => {
                console.error(error)
            });
    };

    _getFriendList = async () => {
        fetch('http://10.0.2.2:8080/GetUserInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: this.state.user,
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                // console.log(responseJson.friends);
                this.setState({
                    friends: responseJson.friends,
                    friendsForDropdown: responseJson.friends.map((user)=> {
                        return {
                            id: user.username,
                            name: decode(user.firstName + " " + user.lastName),
                        };
                    }),
                    friendRequests: responseJson.friendRequests,
                });
            }).catch((error) => {
            console.error(error)
        });
    };

    deleteFriend = (friend) => {
        let deleteFriend = friend;
        if (deleteFriend.id == null) {
            this.deletefriendsocket.send(deleteFriend);
        } else {
            this.deletefriendsocket.send(deleteFriend.id);
        }
        this.setState({
            deletefriend: ''
        })
    };

    addFriend = (friend) => {
        console.log("Friend: " + friend);
        let newFriend = friend;
        if (newFriend.id == null) {
            this.chatsocket.send(friend)
        } else {
            this.chatsocket.send(newFriend.id);
        }
        this.setState({
            newfriend: ''
        })
    };

    acceptFriendRequest = (usernameFriend) => {
        fetch('http://10.0.2.2:8080/AcceptFriendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: this.state.user,
                usernameFriend: usernameFriend,
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.message === "Friend added!") {
                    this.setState({
                        friends: responseJson.friends,
                        friendRequests: responseJson.friendRequests,
                    })
                }
                else {
                    alert(responseJson.message)
                }
            }).catch((error) => {
            console.error(error)
        });
    };

    denyFriendRequest = (usernameFriend) => {
        fetch('http://10.0.2.2:8080/DenyFriendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: this.state.user,
                usernameFriend: usernameFriend,
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.message === "Friend request denied!") {
                    this.setState({
                        friends: responseJson.friends,
                        friendRequests: responseJson.friendRequests,
                    })
                }
                else {
                    alert(responseJson.message)
                }
            }).catch((error) => {
            console.error(error)
        });
    };

    renderSeparator = () => {
        return (
            <View
                style={{
                    width: '80%',
                    backgroundColor: '#CED0CE',
                    marginLeft: '20%',
                }}
            />
        )
    };

    render() {
        return (
            <View style={{
                padding: 10,
                backgroundColor: '#5CDB95',
                flex: 1,
            }}>
                <View>
                    <Text style={styles.blueDisplay}>Friend requests</Text>
                    { (this.state.friendRequests == null || this.state.friendRequests.length === 0) ? <Text>You currently have no friend requests. </Text> :
                        <FlatList key='FriendRequests'
                                  data={this.state.friendRequests}
                                  renderItem={({item}) => (
                                      <View style={{
                                          flexDirection:'row',
                                          justifyContent: 'space-between',
	                                      width: '100%'
                                      }}>
                                          <Text style={{fontSize:16, flex:0.8}}>{decode(item.firstName)} {decode(item.lastName)}</Text>
                                          <View style={{
                                              flexDirection: 'row'
                                          }}>
                                              <TouchableHighlight style={{
                                                  padding: 5,
                                              }} onPress={() => this.acceptFriendRequest(item.username)}>
                                                  <Image style={{
	                                                  width: 22,
	                                                  height: 22,
                                                  }} source={require('../assets/accept_transparent.jpg')}/>
                                              </TouchableHighlight>
                                              <TouchableHighlight style={{
                                                  padding: 5,
                                              }} onPress={() => this.denyFriendRequest(item.username)}>
                                                  <Image style={{
                                                      width: 22,
                                                      height: 22,
                                                  }} source={require('../assets/deny_transparent.png')}/>
                                              </TouchableHighlight>
                                          </View>
                                      </View>
                                  )}
                                  keyExtractor={item => item.firstName}
                                  ItemSeparatorComponent={this.renderSeparator}
                        /> }
                </View>
                <View style={{flexDirection:'row',
                    justifyContent: 'space-between',}}>
                    <SearchableDropdown
                        onTextChange={ item => this.setState({
                            newfriend: item
                        })}
                        onItemSelect={item => this.setState({
                            newfriend: item
                        })}
                        textInputProps = {
	                        {
	                        	value: this.state.newfriend.name
	                        }
                        }
                        containerStyle={{padding: 5}}
                        textInputStyle={{
                            padding: 12,
                            borderWidth: 1,
                            width: 300,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6'
                        }}

                        itemStyle={{
                            padding: 10,
                            marginTop: 2,
                            backgroundColor: '#FAF9F8',
                            borderColor: '#bbb',
                            borderWidth: 1,
                        }}

                        itemTextStyle={{
                            color: '#222'
                        }}

                        itemsContainerStyle={{
                            maxHeight: '60%',
                        }}

                        items={ this.state.users }
                        defaultIndex={2}
                        placeholder="Search for user..."
                        resetValue={false}
                        underlineColorAndroid="transparent"
                    />
                    <TouchableHighlight style={[styles.sendButtonContainer, styles.signupButton]} onPress={() => this.addFriend(this.state.newfriend)}>
                        <Text style={styles.signUpText}>Send</Text>
                    </TouchableHighlight>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <SearchableDropdown
                        onTextChange={ item => this.setState({
                            deletefriend: item
                        })}
                        onItemSelect={item => this.setState({
                            deletefriend: item
                        })}
                        textInputProps = {
                            {
                                value: this.state.deletefriend.name
                            }
                        }
                        containerStyle={{padding: 5}}
                        textInputStyle={{
                            padding: 12,
                            borderWidth: 1,
                            width: 300,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6'
                        }}

                        itemStyle={{
                            padding: 10,
                            marginTop: 2,
                            backgroundColor: '#FAF9F8',
                            borderColor: '#bbb',
                            borderWidth: 1,
                        }}

                        itemTextStyle={{
                            color: '#222'
                        }}

                        itemsContainerStyle={{
                            maxHeight: '60%',
                        }}

                        items={ this.state.friendsForDropdown }
                        defaultIndex={2}
                        placeholder="Search for friend..."
                        resetValue={false}
                        underlineColorAndroid="transparent"
                    />
                    <TouchableHighlight style={[styles.sendButtonContainer, styles.signupButton]} onPress={() => this.deleteFriend(this.state.deletefriend)}>
                        <Text style={styles.signUpText}>Delete</Text>
                    </TouchableHighlight>
                </View>
                <KeyboardSpacer />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#5CDB95',
        padding: 10,
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        width:300,
        height:45,
        marginBottom:20,
        flexDirection: 'row',
        alignItems:'center',
        alignContent: 'center'
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        flex:1,
    },
    inputIcon:{
        width:30,
        height:30,
        marginLeft:15,
        justifyContent: 'center'
    },
    buttonContainer: {
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:20,
        width:250,
        borderRadius:30,
    },
    sendButtonContainer: {
        height:45,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:20,
        width: 75,
        borderRadius:30,
    },
    signupButton: {
        backgroundColor: "#05386B",
    },
    signUpText: {
        color: 'white',
    },
    blueDisplay: {
        ...material.display1,
        color: '#05386B',
    }
});
