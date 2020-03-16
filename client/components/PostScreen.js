import React from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Text,
	AsyncStorage,
	TouchableHighlight,
	Image, ActivityIndicator, StatusBar
} from 'react-native';
import * as ImagePicker from "expo-image-picker";
import {encode, decode} from "./inputParser";
import SearchableDropdown from "react-native-searchable-dropdown";
import { material } from 'react-native-typography';
import publicIP from "react-native-public-ip";

export default class PostScreen extends React.Component {
    static navigationOptions = {
        title: 'Add post',
    };

    findCoordinates = () => {
        // navigator.geolocation.getCurrentPosition(
        //     (position) => {
        //         this.setState({
        //             latitude: position.coords.latitude,
        //             longitude: position.coords.longitude,
        //             error: null,
        //         });
        //     },
        //     (error) => this.setState({ error: error.message }),
        //     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        // );
        publicIP()
            .then(ip => {
                this.setState({ipR: ip});
                console.log(this.state.ipR)
                fetch('http://api.ipstack.com/'+ this.state.ipR + '?access_key=f1cc8cc351683458d686347cd35557b3')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        console.log('ADDRESS GEOCODE is BACK!! => ' + JSON.stringify(responseJson));
                        this.setState({location: responseJson.city + " " + responseJson.location.country_flag_emoji});
                        console.log(this.state.location)
                    })
                console.log('http://api.ipstack.com/'+ this.state.ipR + '?access_key=f1cc8cc351683458d686347cd35557b3')
            })
            .catch(error => {
                console.log(error);
                // 'Unable to get IP address.'
            });


    };

    constructor(props) {
    	super(props);
    	this.state = {
		    title: "",
		    text: "",
			locatie: "Albaquerke",
			location: "",
		    user: "",
		    response: "",
		    errorStyle: {
			    borderRadius: 0,
			    borderWidth: 0,
			    borderColor: '#ffffff',
			    padding: 0,
			    marginTop: 50
		    },
		    photo: null,
			refreshing: true,
			taggedPerson: "",
			users: [],
	    };
    }

    componentWillMount() {
        this._retrieveData();
        this.findCoordinates();
    }

    _retrieveData = async () => {
        try {
            let username = await AsyncStorage.getItem('user', function() {});
            this.setState({user: username});
        } catch (error) {
        }
        this._getAllUsers();
    };

	_getAllUsers = async () => {
		fetch('http://10.0.2.2:8080/GetEveryoneForPostTag', {
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
				console.log(responseJson);
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

    render() {
        //const {navigate} = this.props.navigation;
            return (
                <View style={styles.container}>
                    <Text style={styles.blueDisplay}>Add Post</Text>
	                {this.state.response !== '' &&
		                <Text style={this.state.errorStyle}>
			                {decode(this.state.response)}
		                </Text>
	                }

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputs}
                            placeholder="Title"
                            onChangeText={(title) => this.setState({title})}
                            value={this.state.title}
                            underlineColorAndroid='transparent'
                            returnKeyType="next"
                            onSubmitEditing={this.nextFieldFocus}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={input => {this.field2 = input}}
                            style={styles.inputs}
                            placeholder="Text"
                            underlineColorAndroid='transparent'
                            onChangeText={(text) => this.setState({text})}
                            value={this.state.text}
                        />
                    </View>

					<View style={{flex: 3}}>
						<Text style={styles.titleChat}>Tag someone: </Text>
						{ (this.state.response !== "") ? <Text style={{
							color: 'red',
						}}>{ this.state.response }</Text> : null }
						<SearchableDropdown
							onTextChange={ item => this.setState({
								taggedPerson: item
							})}
							onItemSelect={item => this.setState({
								taggedPerson: item
							})}
							textInputProps = {
								{
									value: ((this.state.taggedPerson == null || this.state.taggedPerson === "") ? "" : this.state.taggedPerson.name)
								}
							}
							containerStyle={{padding: 5}}
							textInputStyle={{
								padding: 12,
								borderWidth: 1,
								borderColor: '#ccc',
								backgroundColor: '#FAF7F6',
								zIndex: 2
							}}

							itemStyle={{
								padding: 10,
								marginTop: 2,
								backgroundColor: '#FAF9F8',
								borderColor: '#bbb',
								borderWidth: 1,
								zIndex: 2
							}}

							itemTextStyle={{
								color: '#222'
							}}

							itemsContainerStyle={{
								maxHeight: '60%',
								zIndex: 2
							}}

							items={ this.state.users }
							defaultIndex={2}
							placeholder="Search for person..."
							resetValue={false}
							underlineColorAndroid="transparent"
						/>
					</View>

	                <View>
		                {this.state.photo && (
			                <View style={{alignItems: 'center', justifyContent: 'center', zIndex: 1}}>
				                <Text style={[styles.blueDisplay, styles.smallText]}>
					                Selected photo:
				                </Text>
				                <Image
					                source={{ uri: this.state.photo.uri }}
					                style={{ width: 100, height: 100, marginBottom: 10 }}
				                />
			                </View>
		                )}

		                <TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this.handleChoosePhoto}>
			                <Text style={styles.signUpText}>Choose Photo</Text>
		                </TouchableHighlight>
	                </View>

	                <TouchableHighlight style={[styles.buttonContainer, styles.signupButton]} onPress={this._addPost}>
                        <Text style={styles.signUpText}>Submit</Text>
                    </TouchableHighlight>
                </View>
            );
        }

    nextFieldFocus = () => {this.field2.focus();};

	handleChoosePhoto = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [3, 3],
		});
		if (result.uri) {
			//console.log("Selected image: \n");
			this.setState({ photo: result })
		}
	};

	_addPost = async () => {

		if (this.state.title.trim() === "" || this.state.text.trim() === "") {
			this.setState({
				response: "Fill in both fields"
			});

			return;
		}

		let body = null;

		if (this.state.photo != null) {
			let name = this.state.photo.uri.split("/")[this.state.photo.uri.split("/").length-1];
			let file = {
				uri: this.state.photo.uri,                                                                    // e.g. 'file:///path/to/file/image123.jpg'
				name: name,                                                                                   // e.g. 'image123.jpg',
				type: this.state.photo.type+"/"+name.split(".")[name.split(".").length-1]   // e.g. 'image/jpg'
			};
			body = new FormData();
			body.append('photo', file);
			body.append('user', this.state.user);
			body.append('name', name);
			body.append('title', encode(this.state.title));
			body.append('text', encode(this.state.text));
			body.append('locatie', encode(this.state.location));
			body.append('taggedPerson', encode(this.state.taggedPerson.name));
		} else {
			body = new FormData();
			body.append('user', this.state.user);
			body.append('title', encode(this.state.title));
			body.append('text', encode(this.state.text));
            body.append('locatie', encode(this.state.location));
			body.append('taggedPerson', encode(this.state.taggedPerson.name));
		}


		//fetch('http://10.0.2.2:8080/AddPost', {
		fetch('http://10.0.2.2:8080/AddPost', {
			method: 'POST',
			body: body
		})
			.then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.success) {
					this.setState({title: ""});
					this.setState({text: ""});
					this.setState({taggedPerson: ""});
					this.setState({photo: null});
					this.props.navigation.navigate("Home");
				} else {
					this.setState({
						response: responseJson.error
					})
				}
			})
			.catch((error) => {
				console.error(error)
			});
	};
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CDB95',
		paddingTop: StatusBar.currentHeight,
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
    inputs: {
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
	smallText: {
        fontSize: 18,
		zIndex: 1
	},
    signUpText: {
        color: 'white',
    },
    titlePost: {
        fontWeight: 'bold'
    },
	blueDisplay: {
		...material.display1,
		color: '#05386B',
	},
	titleChat: {
		fontWeight: 'bold',
		marginBottom: 15,
		marginTop: 20,
	}
});
