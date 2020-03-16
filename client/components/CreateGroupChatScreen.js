import React from "react";
import { encode, decode } from './inputParser';
import {AsyncStorage, FlatList, StyleSheet, Text, TextInput, TouchableHighlight, View} from "react-native";

export default class CreateGroupChatScreen extends React.Component {
	static navigationOptions = {
		title: 'Create Chat',
	};

	constructor(props) {
		super(props);

		let list = [];

		for(let i = 0; i < this.props.navigation.state.params.friends.length; i++) {
			list.push(false)
		}

		this.state = {
			user: '',
			gcname: '',
			friends: this.props.navigation.state.params.friends,
			selectedFriends: list,
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
			//console.log("retrieved username = " + username);
		} catch (error) {
		}
	};

	_createGroupChat = async () => {
		let list = [];
		list.push(this.state.user);

		for (let i = 0; i < this.state.selectedFriends.length; i++) {
			if (this.state.selectedFriends[i]) list.push(this.state.friends[i].username);
		}

		fetch("http://10.0.2.2:8080/CreateGroupchat", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				users: list,
				name: encode(this.state.gcname)
			})
		})
		.then((response) => response.json())
		.then((responseJson) => {
			console.log(responseJson);
			if (responseJson.success) {
				this.props.navigation.navigate('Chats', {});
			} else {
				this.setState({response: responseJson.error});
			}
		}).catch((error) => {
			console.error(error)
		})
	};

	selectFriend = async (friend, index) => {
		let {selectedFriends} = this.state;
		selectedFriends[index] = !selectedFriends[index];
		this.setState({selectedFriends});

		this.setState({user: this.state.user});
	};

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.titleChat}>Create Groupchat</Text>

				<View style={styles.inputContainer}>
					<TextInput
						style={styles.inputs}
						placeholder="Name"
						onChangeText={(gcname) => this.setState({gcname})}
						value={this.state.gcname}
						returnKeyType="next"
						onSubmitEditing={this.nextFieldFocus}
					/>
				</View>

				<Text style={styles.titleChat}>Select Friends</Text>

				<FlatList
					key={this.state.selectedFriends}
					data={this.state.friends}
					renderItem={({item, index}) => (
						/*<ListItem
							key={item.id}
							button onPress={() => this.selectFriend(item, index)}
							title={item.firstName}
							subtitle={item.lastName}
							style = {{backgroundColor: (this.state.selectedFriends[index]) ? 'green' : 'white'}}
						/>*/
						<Text
							key={item.id}
							button onPress={() => this.selectFriend(item, index)}
							style = {[styles.selectBox, {backgroundColor: (this.state.selectedFriends[index]) ? 'green' : 'white'}]}
						>
							{decode(item.username)}
						</Text>
					)}
					keyExtractor={item => item.id+""}
					ItemSeparatorComponent={this.renderSeparator}
				/>

				<Text style={{
					color: 'red',
					padding: 10
				}}>{decode(this.state.response)}</Text>

				<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this._createGroupChat}>
					<Text style={styles.signUpText}>Create</Text>
				</TouchableHighlight>
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
		marginTop: 20,
	}
});
