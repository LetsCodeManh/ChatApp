import { useNavigation } from "@react-navigation/native";
import { Button, Text, View } from "react-native";

const Chat = ({name, color}) => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Hello Chat!</Text>
      <Button
        title="Go to Screen 1"
        onPress={() => navigation.navigate("Screen1")}
      />
    </View>
  );
};

export default Chat;
