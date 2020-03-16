import React from 'react';
import {AsyncStorage, StyleSheet, View} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { encode, decode, websocket } from './inputParser';

export default class PrivateChatScreen extends React.Component {
	static navigationOptions = ({navigation}) => ({
		title: decode(navigation.state.params.receiver.username),
	});
	constructor(props) {
		super(props);
		this.state = {
			user: '',
			messages: [],
			message: 'test',
			userId: '',
		};
		//this.chatsocket = new WebSocket("ws://10.0.2.2:8080/chat/" + websocket(this.props.navigation.state.params.user));
		this.chatsocket = new WebSocket("ws://10.0.2.2:8080/chat/" + websocket(this.props.navigation.state.params.user) + "/" + websocket(this.props.navigation.state.params.receiver.username));
	}

	componentWillMount() {
		this.chatsocket.onopen = () => {
			console.log("chatsocket client connected");
		};

		this.chatsocket.onmessage = (message) => {
			message = JSON.parse(message.data);
			console.log("Showing message data now: " + message.id);
			let giftedMessage = {
				_id: message.id,
				text: decode(message.message),
				createdAt: message.date,
				user: {
					_id: message.senderId,
					name: message.sender,
					avatar: 'http://10.0.2.2:8080/static/images/profiles/' + message.sender + '.png?' + Date.now(),
				}
			};
			this._storeMessages(giftedMessage)
		};
		this._retrieveData();
	}

	_loadMessageHistory = async () => {
		//fetch('http://10.0.2.2:8080/GetMessages', {
		fetch('http://10.0.2.2:8080/GetMessages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: this.state.user,
				receiver: this.props.navigation.state.params.receiver.username
			})
		})
			.then((response) => response.json())
			.then((responseJson) => {
				console.log(responseJson);
				this.setState({
					messages: responseJson.messages.map((chatMessage)=>{
						//console.log(chatMessage);
						let giftedMessage = {
							_id: chatMessage.id,
							text: decode(chatMessage.message),
							createdAt: chatMessage.date,
							user: {
								_id: chatMessage.senderId,
								name: chatMessage.sender,
								avatar: 'http://10.0.2.2:8080/static/images/profiles/' + chatMessage.sender + '.png?' + Date.now(),
							}
						};
						console.log(giftedMessage);
						return giftedMessage;
					}),
				});
				//console.log(this.state.messages);
			}).catch((error) => {
			console.error(error)
		});
	};

	_retrieveData = async () => {
		try {
			let username = await AsyncStorage.getItem('user', function() {});
			this.setState({user: username});
			let userId = await AsyncStorage.getItem('userid', function() {});
			this.setState({userId: parseInt(userId)});
			//console.log("retrieved username = " + username);
			this._loadMessageHistory();
		} catch (error) {
		}
	};

	renderSeparator = () => {
		return (
			<View
				style={{
					width: '80%',
					backgroundColor: '#88D0CE',
					marginLeft: '20%',
				}}
			/>
		)
	};

	render() {
		return (
			<View style = {{flex: 1}}>
			<GiftedChat
				messages = {this.state.messages}
				onSend = {messages => this.sendMessage(messages)}
				user={{
					_id: this.state.userId,
					avatar: 'http://10.0.2.2:8080/static/images/profiles/' + this.props.navigation.state.params.receiver.username + '.png?' + Date.now(),
				}}
			/>
			<KeyboardSpacer />
			</View>
		);
	}

	// sendMessage = (messages=[]) => {
	// 	messages.forEach(message => {
	// 		console.log(message);
	// 		this.chatsocket.send(JSON.stringify({
	// 			sender: this.state.user,
	// 			receiver: this.props.navigation.state.params.receiver.username,
	// 			message: message
	// 		}));
	// 	});
	// };
	_storeMessages(messages) {
		this.setState((previousState) => {
			return {
				messages: GiftedChat.append(previousState.messages, messages),
			};
		})
	}

	sendMessage(messages) {
		messages.forEach(message => {
			console.log(message);
			console.log("###############################");
			message.receiver = this.props.navigation.state.params.receiver.username;
			message.text = encode(message.text);
			this.chatsocket.send(JSON.stringify(message));
		});
		// this._storeMessages(messages);
		//console.log(messages);
		//console.log(this.state.messages);
	}

	_return = () => {
		this.props.navigation.navigate('Profile');
	};
}
