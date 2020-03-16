import React from "react";
import {
	ActivityIndicator,
	AsyncStorage,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableHighlight,
	View
} from "react-native";
import {decode, websocket} from './inputParser';
import {ListItem} from "react-native-elements";
import {material} from 'react-native-typography';
import {withNavigationFocus} from 'react-navigation';

class ChatOverviewScreen extends React.Component {
	static navigationOptions = {
		title: 'Chats',
	};

	constructor(props) {
		super(props);
		this.state = {
			user: '',
			friends: [],
			chats: [],
			newfriend: '',
			response: '',
			friendRequests: [],
			refreshing: true,
		};
		this.deleteFriendSocket = null;
	}

	componentDidUpdate(prevProps) {
		if (prevProps.isFocused !== this.props.isFocused) {
			//wanneer we terug naar overview gaan
			if (this.props.isFocused) {
				this._retrieveData()
			}
		}
	}

	componentWillMount() {
		this._retrieveData();
		this._initializeWebsocket();
		// this.deleteFriendSocket = new WebSocket("ws://10.0.2.2:8080/delete/" + websocket(username));
		// 	this.deleteFriendSocket.onopen = () => {
		// 		console.log("Chat overview friend socket client connected");
		// 	},
		// 	this.deleteFriendSocket.onmessage = (message) => {
		// 		console.log(message);
		// 		let data = JSON.parse(message.data);
		// 		console.log("friends in chat overview screen: " + data.friends);
		// 		this.setState({
		// 			friends: data.friends,
		// 		})
		// 	})
	}

	// componentDidMount() {
	// 	const {navigation} = this.props;
	// 	 this.focusListener = navigation.addListener('didFocus', () => {
	// 	 	this._retrieveData();
	// 	 })
	// }

	componentWillUnmount() {
		// this.focusListener.remove();
		this.deleteFriendSocket.close();
	}

	async _initializeWebsocket() {
		let username = await AsyncStorage.getItem('user');
		console.log("username: " + username);
		this.deleteFriendSocket = new WebSocket("ws://10.0.2.2:8080/delete/" + websocket(username));
		this.deleteFriendSocket.onopen = () => {
			console.log("Chat overview friend socket client connected");
		};

		this.deleteFriendSocket.onmessage = (message) => {
			let data = JSON.parse(message.data);
			console.log("friends in chat overview screen: " + data.friends);
			this.setState({
				friends: data.friends,
			})
		};
	}

	_retrieveData = async () => {
		console.log("test");
		try {
			let username = await AsyncStorage.getItem('user', function () {
				console.log("state set")
			});
			this.setState({refreshing: false, user: username});
			this._getChats();
			this._getFriendList();

			// this.deleteFriendSocket = new WebSocket("ws://10.0.2.2:8080/delete/" + websocket(username));
			//console.log("retrieved username = " + username);
		} catch (error) {
		}
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
				this.setState({
					friends: responseJson.friends,
					friendRequests: responseJson.friendRequests,
				});
			}).catch((error) => {
			console.error(error)
		});
	};

	_getChats = async () => {
		fetch('http://10.0.2.2:8080/GetChats', {
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
			this.setState({
				chats: responseJson.chats,
			});
		}).catch((error) => {
		console.error(error)
		});
	};

	_createGroupChat = async (friends) => {
		this.props.navigation.navigate('CreateGroupChat', { friends });
	};

	goToChat = (user, receiver) => {
		this.props.navigation.navigate('PrivateChat', { user, receiver });
	};

	goToGroupChat = (user, gc) => {
		this.props.navigation.navigate('GroupChat', { user, gc });
	};

	goToAddFriendScreen = (user) => {
		this.props.navigation.navigate('AddFriend', { user });
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
			<View style={styles.container}>
				<Text style={styles.blueDisplay}>Friends</Text>
				{ (this.state.friends == null || this.state.friends.length === 0) ? <Text style={{paddingLeft: 10}}>You currently have no friends... Click on the Manage Friends button to start adding friends!</Text> :
					<FlatList
						style={styles.flatList}
						key='PrivateChats'
						data={this.state.friends}
						renderItem={({item}) => (
							<ListItem style={{width: '100%', borderWidth: 2, borderColor: '#000000'}}
								key={item.id}
								button onPress={() => this.goToChat(this.state.user, item)}
								title={decode(item.username)}
								subtitle={decode(item.firstName) + " " + decode(item.lastName)}
							/>
						)}
						refreshControl={
							<RefreshControl
								//refresh control used for the Pull to Refresh
								refreshing={this.state.refreshing}
								onRefresh={this.onRefresh.bind(this)}
							/>
						}
						keyExtractor={item => item.firstName}
						ItemSeparatorComponent={this.renderSeparator}
					/>
				}
				<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={() => this.goToAddFriendScreen(this.state.user)}>
					<Text style={styles.signUpText}>Manage friends</Text>
				</TouchableHighlight>
				<Text style={styles.blueDisplay}>GroupChats</Text>
				<FlatList
					style={styles.flatList}
					key='GroupChats'
					data={this.state.chats}
					renderItem={({item}) => (
						<ListItem style={{width: '100%', borderWidth: 2, borderColor: '#000000'}}
							key={item.id}
							button onPress={() => this.goToGroupChat(this.state.user, item)}
							title={decode(item.name).length>30 ? (decode(item.name).slice(0, 30) + "...") : decode(item.name)}
							subtitle={item.membersCount + " members"}
						/>
					)}
					refreshControl={
						<RefreshControl
							//refresh control used for the Pull to Refresh
							refreshing={this.state.refreshing}
							onRefresh={this.onRefresh.bind(this)}
						/>
					}
					keyExtractor={item => item.firstName}
					ItemSeparatorComponent={this.renderSeparator}
				/>
				<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={() => this._createGroupChat(this.state.friends)}>
					<Text style={styles.signUpText}>Create Groupchat</Text>
				</TouchableHighlight>
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
		alignItems:'center',
		alignContent: 'center'
	},
	inputs:{
		height:45,
		marginLeft:16,
		borderBottomColor: '#FFFFFF',
		flex:1,
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
	titlePost: {
		fontWeight: 'bold'
	},
	flatList: {
		width: 300,
		marginTop: 10,
		marginBottom: 25,
	},
	blueDisplay: {
		...material.display1,
		color: '#05386B',
	}
});

export default withNavigationFocus(ChatOverviewScreen);
