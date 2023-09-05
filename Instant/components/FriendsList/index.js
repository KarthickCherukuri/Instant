import { Text, View, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MyContext } from "../context";
import { useContext } from "react";
const FriendsListItem = (props) => {
  const { data, sender } = props;

  const { picture, name, socket_id, email } = data.item;

  const navigation = useNavigation();
  const userContext = useContext(MyContext);
  const { isDark } = userContext;

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("Chat", {
          exchangeData: { sender, receiver: data },
        });
      }}>
      <View
        style={{
          display: "flex",
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 0.5,
          borderColor: "grey",
        }}>
        <Image
          source={{
            url: picture,
            cache: "force-cache",
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 30,
            borderWidth: 3,
            borderColor: socket_id == null ? "red" : "green",

            marginRight: 10,
          }}
        />
        <Text style={{ fontSize: 17, color: isDark ? "white" : "black" }}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FriendsListItem;
