import React from 'react';

import HomeScreen from './components/HomeScreen.js';
import ProfileScreen from './components/ProfileScreen.js';
import LoginScreen from './components/LoginScreen.js';
import PrivateChatScreen from './components/PrivateChatScreen.js';
import GroupChatScreen from './components/GroupChatScreen.js';
import ChatOverviewScreen from './components/ChatOverviewScreen.js';
import PostScreen from './components/PostScreen.js';

import {createAppContainer, createSwitchNavigator} from "react-navigation";
import {createBottomTabNavigator} from "react-navigation-tabs";

import {createStackNavigator} from "react-navigation-stack"

import Icon from "react-native-vector-icons/FontAwesome";
import CreateGroupChatScreen from "./components/CreateGroupChatScreen";
import RegistrationScreen from "./components/RegistrationScreen";
import AddFriendScreen from "./components/AddFriendScreen";
import CommentsOverviewScreen from "./components/CommentsOverviewScreen";

const HomeStack = createStackNavigator( {
	Home: {screen: HomeScreen},
	CommentPage: {screen: CommentsOverviewScreen},
});

const ChatStack = createStackNavigator({
	Chats: {screen: ChatOverviewScreen},
	PrivateChat: {screen: PrivateChatScreen},
	GroupChat: {screen: GroupChatScreen},
	CreateGroupChat: {screen: CreateGroupChatScreen},
	AddFriend: {screen: AddFriendScreen},
});

const BottomTabNavigator = createBottomTabNavigator(
	{
		Home: {
			screen: HomeStack,
			navigationOptions: ({
				tabBarIcon: ({ tintColor }) => (
					<Icon name="home" size={25} color={tintColor}/>
				)
			})
		},
		Post: {
            screen: PostScreen,
            navigationOptions: ({
                tabBarIcon: ({ tintColor }) => (
                    <Icon name="plus" size={25} color={tintColor}/>
                )
            })
		},
		Profile: {
			screen: ProfileScreen,
			navigationOptions: ({
				tabBarIcon: ({ tintColor }) => (
					<Icon name="user" size={25} color={tintColor}/>
				)
			})
		},
		Chat: {
			screen: ChatStack,
			navigationOptions: ({
				tabBarIcon: ({ tintColor }) => (
					<Icon name="comments-o" size={25} color={tintColor}/>
				)
			})
		}
	},
	{
		initialRouteName: 'Home',
		tabBarOptions: {
			activeTintColor: '#eb6e3d'
		}
	}
);

const AuthStack = createStackNavigator(
	{
		Login: LoginScreen,
		Registration: RegistrationScreen
	},
	{
		initialRouteName: 'Login'
	}
);

const Navigator = createAppContainer(
	createSwitchNavigator(
		{
			App: BottomTabNavigator,
			Auth: AuthStack,
		},
		{
			initialRouteName: 'Auth',
		}
	)
);

export default class App extends React.Component {
	render() {
		console.disableYellowBox = true;
		return <Navigator />
	}
}
