import React, { Component } from 'react';
import { encode, decode } from './inputParser';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableHighlight,
    Image,
    AsyncStorage
} from 'react-native';
import KeyboardSpacer from "react-native-keyboard-spacer";

export default class SignUpView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            response: '',
	        firstname: '',
		    lastname: ''
        }
    }

    onClickListener = (viewId) => {
        fetch('http://10.0.2.2:8080/RegisterPerson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstname: encode(this.state.firstname),
                lastname: encode(this.state.lastname),
                username: encode(this.state.username),
                password: encode(this.state.password)
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.message === "Registered!") {
                    this._storeUser(responseJson.user, responseJson.userId);
                }
                else {
                    this.setState({
                        response: responseJson.message
                    })
                }
            }).catch((error) => {
            console.error(error)
        });
    };

    async _storeUser(user, userId) {
        try {
            console.log(user);
            console.log(userId);
            await AsyncStorage.multiSet([["user", user], ["userid", userId.toString()]], () => {
                this.props.navigation.navigate('App');
            });
        } catch (error) {
            // Error retrieving data
            console.log(error.message);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.response !== '' &&
                    <Text style={{
                        color: 'red',
                        padding: 10
                    }}>{decode(this.state.response)}</Text>
                }
                <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://logodix.com/logo/1727553.png'}}/>
                    <TextInput style={styles.inputs}
                               placeholder="Username"
                               keyboardType="email-address"
                               underlineColorAndroid='transparent'
                               onChangeText={(username) => this.setState({username})}/>
                </View>

                <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/pastel-glyph/2x/person-male.png'}}/>
                    <TextInput style={styles.inputs}
                               placeholder="First name"
                               keyboardType="email-address"
                               underlineColorAndroid='transparent'
                               onChangeText={(firstname) => this.setState({firstname})}/>
                </View>

	            <View style={styles.inputContainer}>
		            <Image style={styles.inputIcon} source={{uri: 'https://img.icons8.com/pastel-glyph/2x/person-male.png'}}/>
		            <TextInput style={styles.inputs}
		                       placeholder="Last name"
		                       keyboardType="email-address"
		                       underlineColorAndroid='transparent'
		                       onChangeText={(lastname) => this.setState({lastname})}/>
	            </View>

                <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://www.pnglot.com/pngfile/detail/365-3657030_password-comments-white-password-icon-transparent-background.png'}}/>
                    <TextInput style={styles.inputs}
                               placeholder="Password"
                               secureTextEntry={true}
                               underlineColorAndroid='transparent'
                               onChangeText={(password) => this.setState({password})}/>
                </View>

                <TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={() => this.onClickListener('sign_up')}>
                    <Text style={styles.signUpText}>Sign up</Text>
                </TouchableHighlight>
                <KeyboardSpacer />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CDB95',
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
    signupButton: {
        backgroundColor: "#05386B",
    },
    signUpText: {
        color: 'white',
    }
});
