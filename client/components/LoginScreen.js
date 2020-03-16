import React from 'react';
import { Button, View, Text, TextInput, StyleSheet, AsyncStorage, TouchableHighlight } from 'react-native';
import KeyboardSpacer from "react-native-keyboard-spacer";
import { encode, decode } from './inputParser';

export default class LoginScreen extends React.Component {
	static navigationOptions = {
		title: 'Login',
	};

	state = {response: "", username: "", password: ""};

	render() {
		const {navigate} = this.props.navigation;
		return (
			<View style={styles.container}>
				{this.state.response !== "" &&
				<Text style={{
					color: 'red',
					padding: 10
				}}>{decode(this.state.response)}</Text>}
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.inputs}
						placeholder="Username"
						onChangeText={(username) => this.setState({username})}
						value={this.state.username}
						underlineColorAndroid='transparent'
						returnKeyType="next"
						onSubmitEditing={this.nextFieldFocus}
					/>
				</View>
				<View style={styles.inputContainer}>
					<TextInput
						ref={input => {this.field2 = input}}
						style={styles.inputs}
						placeholder="Password"
						underlineColorAndroid='transparent'
						onChangeText={(password) => this.setState({password})}
						value={this.state.password}
						secureTextEntry={true}
					/>
				</View>
				<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this._signInAsync}>
					<Text style={styles.signUpText}>Login</Text>
				</TouchableHighlight>
				<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this._registerPage}>
					<Text style={styles.signUpText}>Sign up</Text>
				</TouchableHighlight>
				<KeyboardSpacer />
			</View>
		);
	}

	_registerPage = async () => {
		this.props.navigation.navigate('Registration')
	};

	nextFieldFocus = () => {
		this.field2.focus();
	};

	_signInAsync = async () => {
		//fetch('http://10.0.2.2:8080/Login', {
		fetch('http://10.0.2.2:8080/Login', {
			method: 'POST',
				headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: encode(this.state.username),
				password: encode(this.state.password)
			})
		})
			.then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.message === "Logged in!") {
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
				this.props.navigation.navigate('App', { user: userId.toString() });
			});
		} catch (error) {
			// Error retrieving data
			console.log(error.message);
		}
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


