import React from 'react';
import {AsyncStorage, Text, View, ActivityIndicator, RefreshControl,} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { encode, decode, websocket } from './inputParser';

export default class GroupChatScreen extends React.Component {
	static navigationOptions = ({navigation}) => ({
		title: decode(navigation.state.params.gc.name),
	});
	constructor(props) {
		super(props);
		this.state = {
			user: '',
			messages: [],
			message: 'test',
			userId: '',
			refreshing: true,
		};
		this.chatsocket = new WebSocket("ws://10.0.2.2:8080/groupchat/" + websocket(this.props.navigation.state.params.gc.id) + "/" + websocket(this.props.navigation.state.params.user));
	}

	componentWillMount() {
		this.chatsocket.onopen = () => {
			console.log("chatsocket client connected");
		};

		this.chatsocket.onmessage = (message) => {
			message = JSON.parse(message.data);
			let giftedMessage = {
				_id: message.id,
				text: decode(message.message),
				createdAt: message.date,
				key: message.id+"",
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
		//console.log("user = " + this.state.user);
		//console.log("receiver = " + this.props.navigation.state.params.receiver.username);
		console.log("### LOADING GROUPCHAT MESSAGE HISTORY ###");
		fetch('http://10.0.2.2:8080/GetGroupMessages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: this.state.user,
				group: this.props.navigation.state.params.gc.id
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
							key: chatMessage.id+"",
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
			this.setState({refreshing: false, user: username});
			let userId = await AsyncStorage.getItem('userid', function() {});
			this.setState({userId: parseInt(userId)});
			//console.log("retrieved username = " + username);
			//comment
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

	onRefresh() {
		//Clear old data of the list
		this.setState({ dataSource: [] });
		//Call the Service to get the latest data
		this._retrieveData();
	}

	render() {
		if (this.state.refreshing) {
			return (
				<View style={{ flex: 1, paddingTop: 20 }}>
					<ActivityIndicator />
				</View>
			);
		}
		return (
			<View style = {{flex: 1}}>
				<GiftedChat
					messages = {this.state.messages}
					onSend = {messages => this.sendMessage(messages)}
					key="giftedchatkey"
					user={{
						_id: this.state.userId,
						avatar: 'http://10.0.2.2:8080/static/images/profiles/' + this.state.user + '.png?' + Date.now(),
					}}
					refreshControl={
						<RefreshControl
							//refresh control used for the Pull to Refresh
							refreshing={this.state.refreshing}
							onRefresh={this.onRefresh.bind(this)}
						/>
					}
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
			message.groupchat = this.props.navigation.state.params.gc.id;
			message.text = encode(message.text);
			this.chatsocket.send(JSON.stringify(message));
		});
		//this._storeMessages(messages);
		//console.log(messages);
		//console.log(this.state.messages);
	}
}
