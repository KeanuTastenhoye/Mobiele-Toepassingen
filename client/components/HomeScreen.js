import React from 'react';
import {
	View,
	StyleSheet,
	Text,
	AsyncStorage,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	Image,
	TouchableHighlight,
	StatusBar, TextInput
} from 'react-native';
import { encode, decode } from './inputParser';
import publicIP from 'react-native-public-ip';
import { withNavigationFocus } from 'react-navigation';

export default class HomeScreen extends React.Component {
	static navigationOptions = {
		title: 'Home'
	};

    state = {
        location: null,
        latitude: null,
        longitude: null,
		ipR: null,
		commentAdd: ""
    };

	constructor(props) {
		super(props);
		this.state = {
			status: 'Test',
			user: '',
			friends: [],
			refreshing: true,
		};

		this.x = Date.now();
	}

	//websocket = new WebSocket("ws://10.0.2.2:8080/websocket");
	websocket = new WebSocket("ws://10.0.2.2:8080/websocket");
	static navigationOptions = {
		title: 'Welcome',
	};

	componentWillMount() {
		this.websocket.onopen = () => {
			console.log("Websocket client connected");
		};

		this.websocket.onmessage = (message) => {
			//console.log(message);
		};
		this._retrieveData();
		//this.findCoordinates();
	}

	componentDidMount() {
		const {navigation} = this.props;

		this.focusListener = navigation.addListener('didFocus', () => {
			this._retrieveData();
		})
	}

	componentWillUnmount() {
		this.focusListener.remove();
	}

    _loadPosts = async () => {
        //fetch('http://10.0.2.2:8080/GetPosts', {
        fetch('http://10.0.2.2:8080/GetPosts', {
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
            	console.log("In get posts");
                this.setState({
                    posts: responseJson.posts,
                });
            }).catch((error) => {
            console.error("error:" + error)
        });
	};

	_retrieveData = async () => {
		try {
			let username = await AsyncStorage.getItem('user', function() {});
			this.setState({refreshing: false, user: username});
			//console.log("retrieved usernamew = " + username);
			this._loadPosts();
		} catch (error) {
		}
	};

	ListViewItemSeparator = () => {
		return (
			//returning the listview item separator view
			<View
				style={{
					height: 0.2,
					width: '90%',
					backgroundColor: '#808080',
				}}
			/>
		);
	};

	_goToCommentPage = async (id) => {
		this.props.navigation.navigate('CommentPage', { id });
	};


	onRefresh() {
		//Clear old data of the list
		this.setState({ dataSource: [] });
		//Call the Service to get the latest data
		this._retrieveData();
	}

	render() {
		const {navigate} = this.props.navigation;

		if (this.state.refreshing) {
			return (
				<View style={{ flex: 1, paddingTop: 20 }}>
					<ActivityIndicator />
				</View>
			);
		}
		return (
			<View style={styles.container}>
				{/*<Text>*/}
					{/*Welcome: {this.state.user}*/}
				{/*</Text>*/}
				{/*<View style={{marginTop: 25, marginLeft: '75%'}}>*/}
					<TouchableHighlight style={[styles.buttonContainer, styles.signOutButton]} onPress={this._signOutAsync}>
						<Text style={styles.signUpText}>Log out</Text>
					</TouchableHighlight>
				{/*</View>*/}

    {/*<TextInput*/}
    {/*onChangeText = {text => {this.setState({status: text})}}*/}
    {/*onSubmitEditing={() => {this.onSubmit(this.state.status)}}*/}
    {/*style = {styles.Textinput}*/}
    {/*/>*/}
    {/*<Text>*/}
    {/*status {this.state.statusDisplay}*/}
    {/*</Text>*/}
    {/*<Button*/}
    {/*title="Update status"*/}
    {/*onPress={() => this.onSubmit(this.state.status)}*/}
    {/*/>*/}

                <FlatList style={styles.flList}
                    data={this.state.posts}
                    renderItem={({item}) =>
                        <View style={[styles.postContainer, styles.postsCSS]} id={item.id}>
							<Text>{decode(item.fullName)}</Text>
	                        {item.photo &&
		                        <View style={{width: '100%', margin: 0}}>
			                        <Image
				                        style={{width: 375, height: 375}}
				                        source={{uri: 'http://10.0.2.2:8080/static/images/posts/' + item.id + '.png?date=' + this.x}}
			                        />
		                        </View>
	                        }
	                        <Text style={styles.titlePost}>{decode(item.title)}</Text>
                            <Text>{decode(item.text)}</Text>
							{item.taggedPerson != undefined ? <Text>With: {decode(item.taggedPerson)}</Text>: null}
                            <Text>{decode(item.locatie)}</Text>

							<View style={styles.likesCSS}>
                                <Text style={styles.likesCount}>{item.likes}</Text>
							<TouchableHighlight style={styles.likesButton} onPress={() => this.onLike(item.id)}>
								<Text style={styles.likeButtonText}>Like</Text>
							</TouchableHighlight>
							</View>

							<View style={styles.commentContainer}>
								<View >
									<Text>Comments:</Text>
                                	<Text style={styles.commentText}>{decode(item.comments)}</Text>
                                </View>
                                <TextInput
                                    style={styles.commentAdd}
                                    placeholder="commentAdd"
                                    onChangeText={(commentAdd) => {
                                    	this.setState({commentAdd});
                                    	item.tempComment = commentAdd;
                                    	// console.log(item)
									}}
									value={item.tempComment}
                                />
                                <TouchableHighlight style={[styles.commentButton]} onPress={() => {
                                	this.Func(item.id, this.state.user, item.tempComment);
                                	item.tempComment = '';
								}}>
                                    <Text style={styles.signUpText}>Add Comment</Text>
                                </TouchableHighlight>
								<TouchableHighlight style={[styles.commentButton]} onPress={() => this._goToCommentPage(item.id)}>
									<Text style={styles.signUpText}>View more comments</Text>
								</TouchableHighlight>
							</View>
						</View>
					}
					refreshControl={
						<RefreshControl
							//refresh control used for the Pull to Refresh
							refreshing={this.state.refreshing}
							onRefresh={this.onRefresh.bind(this)}
						/>
					}
				/>
			</View>
		);
	}

    Func(id, user, commentadd) {
		this.setState({commentAdd: ""});
		console.log(id + ' ' + user + ' ' + commentadd);
        fetch('http://10.0.2.2:8080/AddComment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: user,
                id: id,
				commentadd: encode(commentadd)
            })
        });
			this._retrieveData();
    };

	onLike(idP) {
		//console.log(idP);
        //fetch('http://10.0.2.2:8080/LikePost', {
        fetch('http://10.0.2.2:8080/LikePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: this.state.user,
				id: idP
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    likes: responseJson.likes,
                });
                //this.arrayholder = responseJson.posts;
               // console.log(responseJson.posts)
                //console.log(this.state.likes);
                this._loadPosts();

            }).catch((error) => {
            console.error(error)
        });
		//let likeCount = document.getElementById(idP);
	}

	onSubmit(text) {
		console.log(text);
		if (text !== null && text !== '' && text !== ' ') {
			this.setState({status: text});
			this.websocket.send(JSON.stringify(text));
			this.setState({statusDisplay: text});
		} else {
			alert('Please enter a message in the text input field!');
		}

	}

	_signOutAsync = async () => {
		this.props.navigation.navigate('Auth')
	};
}
const styles = StyleSheet.create({
	postsCSS: {
	    color: '#000000',
        backgroundColor: '#ffffff',
        borderColor: '#535353',
        borderWidth: 1,
        marginBottom: 5,
        paddingBottom: 10,
        paddingTop: 10,
        paddingLeft: '2.5%',
		paddingRight: '2%'
    },
    titlePost: {
	    fontWeight: 'bold'
    },
    flList: {
        height: 555
    },
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#5CDB95',
		paddingTop: StatusBar.currentHeight,
	},
	postContainer: {
		backgroundColor: '#5CDB95',
		alignItems:'center',
		maxWidth: 400,
		justifyContent: 'center',
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
	signOutButton: {
		marginTop: 20,
		backgroundColor: "#05386B",
	},
	signUpText: {
		color: 'white',
	},
	commentAdd: {

        backgroundColor: '#cacaca',
        borderRadius:5,
        
		margin: 6,
		padding: 8,
		fontSize: 15,
        flexDirection: 'row',
        alignItems:'center'
	},
	commentContainer: {
		backgroundColor: '#dde3e6',
		width: '100%'
	},
	commentText: {
        margin: 6,
        fontSize: 16,
	},
    commentButton: {
        backgroundColor: "#05386B",
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:5,
        width: '96%',
        borderRadius:5,
		marginLeft: '2%'
	},
    likesCSS: {
		width: '25%',
        flexDirection: 'row',
		marginLeft: '0%'
	},
    likesButton: {
        backgroundColor: "#05386B",
        height: 40,
        justifyContent: 'center',
        marginBottom:5,
        width: 50,
        borderRadius:5,
        marginLeft: '10%'
	},
    likesCount: {
		fontSize: 18,
		paddingTop: 10
	},
    likeButtonText: {
		color: '#ffffff',
		fontSize: 15,
		textAlign: 'center',
		width: '100%',
	}
});
