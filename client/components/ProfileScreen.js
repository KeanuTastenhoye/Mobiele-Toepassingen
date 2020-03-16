import React from 'react';
import {
	AsyncStorage,
	Text,
	View,
	Image,
	StyleSheet,
	TouchableHighlight,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {ListItem} from "react-native-elements";
import { encode, decode } from './inputParser';
import { material } from 'react-native-typography';

export default class ProfileScreen extends React.Component {
	static navigationOptions = {
		title: 'Profile',
	};

	//navigate = this.props.navigation;

	constructor(props) {
		super(props);
		this.state = {
			user: '',
			photo: null,
			date: Date.now(),
			posts: [],
			refreshing: true,
		};
		this._retrieveData();
	}

	componentWillMount() {
		this._retrieveData();
	}

	_getTopPosts = async () => {
		fetch('http://10.0.2.2:8080/GetTopPosts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: this.state.user,
			})
		})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({
					posts: responseJson.posts,
				});
				this.arrayholder = responseJson.posts;
			}).catch((error) => {
			console.error(error)
		});
	};

	_retrieveData = async () => {
		try {
			let username = await AsyncStorage.getItem('user', function() {});
			this.setState({refreshing: false, user: username});
			this._getTopPosts();
		} catch (error) {
			console.error(error);
		}
		this._getTopPosts();
	};

	_sendImage = async () => {
		if (this.state.photo == null) console.log("No photo selected");
		else {

			let name = this.state.photo.uri.split("/")[this.state.photo.uri.split("/").length-1];

			let file = {
				uri: this.state.photo.uri,                                                                    // e.g. 'file:///path/to/file/image123.jpg'
				name: name,                                                                                   // e.g. 'image123.jpg',
				type: this.state.photo.type+"/"+name.split(".")[name.split(".").length-1]   // e.g. 'image/jpg'
			};

			let body = new FormData();
			body.append('photo', file);
			body.append('user', this.state.user);
			body.append('name', name);

			fetch("http://10.0.2.2:8080/SaveImage", {
				method: "POST",
				body: body
			})
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({ photo: null });
				this.setState({ date: Date.now() });
			}).catch((error) => {
				console.error(error)
			})
		}
	};

	onRefresh() {
		//Clear old data of the list
		this.setState({ dataSource: [] });
		//Call the Service to get the latest data
		this._retrieveData();
	}

	renderSeparator = () => {
		return (
			<View
				style={{
					width: '90%',
					backgroundColor: '#CED0CE',
					marginLeft: '10%',
				}}
			/>
		)
	};

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
				<Text style={styles.blueDisplay}>
					Welcome {decode(this.state.user)}
				</Text>

				<Image
					style={{width: 75, height: 75}}
					source={{uri: 'http://10.0.2.2:8080/static/images/profiles/' + this.state.user + '.png?' + this.state.date}}
				/>

				<View>
					{this.state.photo && (
						<View style={{alignItems: 'center', justifyContent: 'center'}}>
							<Text style={styles.blueDisplay}>
								Selected photo:
							</Text>
							<Image
								source={{ uri: this.state.photo.uri }}
								style={{ width: 150, height: 150, marginBottom: 10 }}
							/>
						</View>
					)}
					<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this.handleChoosePhoto}>
						<Text style={styles.signUpText}>Choose Photo</Text>
					</TouchableHighlight>
				</View>

				<TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this._sendImage}>
					<Text style={styles.signUpText}>Send Image</Text>
				</TouchableHighlight>

				<Text style={styles.blueDisplay}>
					Top 3 most liked posts:
				</Text>

				<FlatList
					style={styles.flatList}
					keyExtractor={(item, index) => String(index)}
					data={this.state.posts}
					renderItem={({item}) => (
						<ListItem style={{width: '100%', borderWidth: 2, borderColor: '#000000'}}
								  key={item.id}
								  title={decode(item.title)}
								  subtitle={decode(item.text)}
						/>
					)}
					refreshControl={
						<RefreshControl
							//refresh control used for the Pull to Refresh
							refreshing={this.state.refreshing}
							onRefresh={this.onRefresh.bind(this)}
						/>
					}
					ItemSeparatorComponent={this.renderSeparator}
				/>
			</View>
		);
	}

	handleChoosePhoto = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [3, 3],
		});
		if (result.uri) {
			console.log("Selected image: \n");
			this.setState({ photo: result })
		}
	};
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#5CDB95',
		paddingTop: StatusBar.currentHeight,
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
	titleProfile: {
		fontWeight: 'bold',
		marginTop: 20,
	},
	flatList: {

		width: 250,
		marginTop: 10,
	},
	blueDisplay: {
		...material.display1,
		color: '#05386B',
	}
});
