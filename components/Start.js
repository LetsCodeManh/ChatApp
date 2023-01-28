import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";

import image from "../assets/StartBackground.jpg";

export default class Start extends React.Component {
  // Create state for "name" and "color"
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      color: "",
    };
  }

  render() {
    const { name, color } = this.state;
    return (
      <ImageBackground source={image} style={{ flex: 1 }}>
        <View style={styles.imageBackground}>
          <Text style={styles.nameApp}>ChatApp</Text>
          <View style={styles.userInputArea}>
            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={(name) => this.setState({ name })}
              placeholder="What is your name?"
            />
            {/* White Box */}
            <View style={styles.chooseContainer}>
              <Text style={styles.chooseText}>Choose a Background Color</Text>
              <View style={styles.colorContainer}>
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    color === "#090C08" && styles.selected,
                    { backgroundColor: "#090C08" },
                  ]}
                  onPress={() => this.setState({ color: "#090C08" })}
                  colorValue="#090C08"
                />
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    color === "#474056" && styles.selected,
                    { backgroundColor: "#474056" },
                  ]}
                  onPress={() => this.setState({ color: "#474056" })}
                  backgroundColor="#474056"
                />
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    color === "#8A95A5" && styles.selected,
                    { backgroundColor: "#8A95A5" },
                  ]}
                  onPress={() => this.setState({ color: "#8A95A5" })}
                  backgroundColor="#8A95A5"
                />
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    color === "#B9C6AE" && styles.selected,
                    { backgroundColor: "#B9C6AE" },
                  ]}
                  onPress={() => this.setState({ color: "#B9C6AE" })}
                  backgroundColor="#B9C6AE"
                />
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this.props.navigation.navigate("Chat", {
                  name: name,
                  color: color,
                })
              }
              accessible={true}
              accessibilityLabel="Start Chatting"
              accessibilityHint="Accept my Name and Color and Start Chatting!"
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: "6%",
  },
  nameApp: {
    fontSize: 45,
    fontWeight: "600",
    color: "#fff",
    marginTop: "40%",
  },
  userInputArea: {
    alignItems: "center",
    justifyContent: "space-between",
    width: "88%",
    height: "44%",
    backgroundColor: "white",
    borderRadius: 30,
    padding: "6%",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "black",
    padding: 20,
    width: "100%",
    borderRadius: 10,
    color: "#757083",
    fontWeight: "300",
    fontSize: 16,
  },
  chooseContainer: {
    width: "100%",
  },
  chooseText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    marginBottom: 15,
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorButton: {
    backgroundColor: "red",
    width: 60,
    height: 60,
    borderRadius: "50%",
    borderWidth: 5,
    borderColor: "white",
    overflow: "hidden",
  },
  selected: {
    borderColor: "white",
    borderWidth: 2,
  },
  button: {
    backgroundColor: "#757083",
    padding: 20,
    alignItems: "center",
    borderRadius: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
