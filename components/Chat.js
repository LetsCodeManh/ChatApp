import React from "react";
import { Platform, View, KeyboardAvoidingView } from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import CustomActions from "./CustomActions";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import MapView from "react-native-maps";

const firebase = require("firebase");
require("firebase/firestore");

/**
 * @class Chat
 * @extends React.Component
 * @desc This component is a chat component that allows users to communicate
 * with each other. It uses the `react-native-gifted-chat` library to display the
 * chat messages and input form.
 */
export default class Chat extends React.Component {
  /**
   * @constructor
   * @desc Initializes the component and sets up the connection to Firebase,
   * sets up the reference to the firestore collection "messages", and sets
   * the initial state of the component.
   */
  constructor() {
    super();

    // Initialize Firebase if it has not been initialized
    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        apiKey: "AIzaSyD2u_-pj-2Nz-pfhutJVSN6bpwhrGAlaDU",
        authDomain: "chatapp-5302a.firebaseapp.com",
        projectId: "chatapp-5302a",
        storageBucket: "chatapp-5302a.appspot.com",
        messagingSenderId: "111859126736",
        appId: "1:111859126736:web:8c60a9bb4a18aeeafe29d5",
      });
    }

    // Set up the reference to the firestore collection "messages"
    this.referenceChatMessages = firebase.firestore().collection("messages");

    // Initial state of the component
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        avatar: "",
        name: "",
      },
      image: null,
      location: null,
      isConnected: false,
    };
  }

  /**
   * @function getMessages
   * @desc Fetches all messages from AsyncStorage.
   */
  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * @function saveMessages
   * @desc Saves messages to AsyncStorage.
   */
  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * @function deleteMessages
   * @desc Deletes messages from AsyncStorage.
   */
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
      this.setState({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Lifecycle method that is called when the component is mounted.
   * Sets the navigation title based on the passed `name` prop. Calls `getMessages` to retrieve messages.
   * Checks for the internet connection using `NetInfo` and sets the state accordingly.
   * Subscribes to the `messages` collection in Firestore and sets the state with the latest messages on update.
   * If the user is not logged in, it signs them in anonymously using Firebase authentication.
   */
  componentDidMount() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: `${name}` });

    this.getMessages();

    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({
          isConnected: true,
        });
        console.log("online");
      } else {
        this.setState({
          isConnected: false,
        });
        console.log("offline");
      }
    });

    this.referenceChatMessages = firebase.firestore().collection("messages");

    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user.uid,
        messages: [],
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
  }

  /**
   * componentWillUnmount is a lifecycle method that is called just before a component is unmounted and destroyed.
   * This method is used to perform any necessary cleanup before the component is removed from the UI.
   * In this implementation, it unsubscribes from two events:
   * The unsubscribe event, which listens to updates to the Firebase firestore collection "messages".
   * The authUnsubscribe event, which listens to changes in the authentication state of the Firebase user.
   */
  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();
  }

  /**
   * @function onCollectionUpdate
   * @description Callback function to handle updates to the chat messages in Firestore
   * @param {object} querySnapshot - A QuerySnapshot object representing the chat messages.
   */
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || "",
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar || "",
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({ messages });
  };

  /**
   * @function addMessage
   * @description Adds a message to the Firestore database collection "messages".
   */
  addMessage = () => {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  };

  /**
   * @function onSend
   * @description Adds a new message to the `messages` state and saves it to the database.
   * @param  {Array} messages An array of messages to add.
   */
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }

  /**
   * @function renderInputToolbar
   * @description Renders the Input Toolbar for the chat messages.
   * @param {Object} props - The props passed to the component.
   * @returns {Component} - The component for the Input Toolbar, or nothing if the device is offline.
   */
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  /**
   * @function renderCustomActions
   * @description Renders the custom actions for the chat messages.
   * @param {Object} props - The props passed to the component.
   * @returns {Component} - The component for the custom actions.
   */
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  /**
   * @function renderCustomView 
   * @description Renders the custom view for the chat messages.
   * @param {Object} props - The props passed to the component.
   * @returns {Component} - The component for the custom view, or null if the message does not contain a location.
   */
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  /**
   * @function renderBubble
   * @description Renders the bubble component for the chat messages
   * @param {Object} props - The properties passed to the component
   * @returns {Component} - A customized bubble component for the chat messages
   */
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: "#000" },
          left: { backgroundColor: "#fff" },
        }}
      />
    );
  }

  render() {
    return (
      <ActionSheetProvider>
        <View
          style={{ flex: 1, backgroundColor: this.props.route.params.color }}
        >
          <GiftedChat
            messages={this.state.messages}
            renderInputToolbar={this.renderInputToolbar.bind(this)}
            renderActions={this.renderCustomActions.bind(this)}
            renderCustomView={this.renderCustomView.bind(this)}
            renderBubble={this.renderBubble.bind(this)}
            onSend={(messages) => this.onSend(messages)}
            user={{
              _id: this.state.uid,
              avatar: "https://placeimg.com/140/140/any",
            }}
          />
          {Platform.OS === "android" ? (
            <KeyboardAvoidingView behaviour="height" />
          ) : null}
        </View>
      </ActionSheetProvider>
    );
  }
}
