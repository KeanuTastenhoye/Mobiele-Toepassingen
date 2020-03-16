import React from "react";
import { encode, decode } from './inputParser';
import {AsyncStorage, FlatList, Image, StyleSheet, Text, TextInput, TouchableHighlight, View} from "react-native";
import {material} from "react-native-typography";

export default class CreateGroupChatScreen extends React.Component {
    static navigationOptions = {
        title: 'Comment page',
    };

    constructor(props) {
        super(props);

        this.state = {
            user: '',
            postId: this.props.navigation.state.params.id,
            response: '',
        };
    }

    componentWillMount() {
        this._retrieveData();
    }

    _retrieveData = async () => {
        try {
            let username = await AsyncStorage.getItem('user', function () {
            });
            this.setState({user: username});
            this._loadComments();
        } catch (error) {
        }
    };

    _loadComments = async () => {
        console.log("heheheheh " + this.props.navigation.state.params.id);
        fetch("http://10.0.2.2:8080/GetComment", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.props.navigation.state.params.id
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({comments: responseJson.comments,});
            }).catch((error) => {
            console.error(error)
        })
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.blueDisplay}>All comments</Text>

                <FlatList
                    style={styles.flList}
                    data={this.state.comments}
                    renderItem={({item}) => (
                        <View>
                            <Text style={styles.titleChat}>{decode(item.comments)}</Text>
                        </View>
                    )}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    selectBox: {
        padding: 10
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CDB95',
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        flex:1,
    },
    flList: {
        height: 555
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:30,
        borderBottomWidth: 1,
        width:250,
        height:45,
        marginBottom:20,
        flexDirection: 'row',
        alignItems:'center'
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
    signupButton: {
        backgroundColor: "#05386B",
    },
    signUpText: {
        color: 'white',
    },
    titleChat: {
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 5,
        marginRight: 5,
        fontSize:15,
    },
    blueDisplay: {
        ...material.display1,
        color: '#05386B',
    },
});
