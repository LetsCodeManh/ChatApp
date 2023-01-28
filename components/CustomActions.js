import React from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

const firebase = require("firebase");
require("firebase/firestore");

export default class CustomActions extends React.Component {
  pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    try {
      if (status === "grated") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    try {
      if (status === "grated") {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: "Images",
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  getLocation = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    try {
      if (status === "grated") {
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

  uploadImageFetch = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (error) {
        console.log(error);
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

  onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    this.props.showActionSheetWithOption(
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
      <TouchableOpacity accessible={true}>
        <View>
          <Text>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
