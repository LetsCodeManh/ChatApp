import PropTypes from "prop-types";
import React from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { connectActionSheet } from "@expo/react-native-action-sheet";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const firebase = require("firebase");
require("firebase/firestore");

export default class CustomActions extends React.Component {
  /**
   * @function pickImage is used to pick an image from the user's device's image library.
   * @description It requests media library permissions, launches the image library and saves the selected image.
   * @async
   */
  pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    try {
      if (status === "granted") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.canceled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * @function takePhoto is used to capture an image from the camera
   * @description It requests camera permissions, launches the camera and saves the captured image.
   * @async
   */
  takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    try {
      if (status === "granted") {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.canceled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * @function getLocation is used to get the current location of the user's device.
   * @description It requests background location permissions and then gets the current location of the device.
   * @async
   */
  getLocation = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    try {
      if (status === "granted") {
        let result = await Location.getCurrentPositionAsync({}).catch((error) =>
          console.log(error)
        );

        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * @function uploadImageFetch uploads an image to Firebase storage.
   * @async
   * @param {string} uri - The uri of the image to be uploaded.
   * @returns {string} The download URL of the uploaded image.
   */
  uploadImageFetch = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const imageNameBefore = uri.split("/");
    const imageName = imageNameBefore[imageNameBefore.length - 1];
    const ref = firebase.storage().ref().child(`images/${imageName}`);
    const snapshot = await ref.put(blob);
    blob.close();
    return await snapshot.ref.getDownloadURL();
  };

  /**
   * @function onActionPress is used to prompt the user to select a desired action.
   * @description It shows a list of options for the user to choose from and executes the selected action.
   */
  onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log("User wants to pick an image");
            return this.pickImage();
          case 1:
            console.log("User wants to take a photo");
            return this.takePhoto();
          case 2:
            console.log("User wants to get their location");
            return this.getLocation();
        }
      }
    );
  };

  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="More options"
        accessibilityHint="Send an image or your geolocation."
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});
CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomActions = connectActionSheet(CustomActions);
