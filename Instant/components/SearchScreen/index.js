import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  BackHandler,
} from "react-native";
import { SearchBar } from "react-native-elements";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "../context";
import { View } from "react-native";
import jwtEncode from "jwt-encode";
import { useNavigation } from "@react-navigation/native";

const FriendSuggestion = (props) => {
  const { data1, sender, addingFriend } = props;
  const data = data1.item;
  const isOnline = data.socket_id !== null;
  const navigation = useNavigation();
  return (
    <TouchableHighlight
      style={{ borderBottomWidth: 0.2, borderColor: "gray", paddingBottom: 8 }}
      onPress={() => {
        addingFriend(data);
        navigation.navigate("Chat", {
          exchangeData: { sender, receiver: { item: data } },
        });
      }}>
      <Text
        style={{
          color: isOnline ? "green" : "red",
          textAlign: "center",
        }}>
        {data.name}
      </Text>
    </TouchableHighlight>
  );
};

const SearchScreen = ({ navigation }) => {
  const { userFriends, isDark, userData, address } = useContext(MyContext);
  const [name, setName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState({});
  navigation.setOptions({ title: "" });
  const nameHandler = async (name) => {
    setName(name);
    const jwtToken = jwtEncode(userData, "secret");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${jwtToken}`,
      },
      body: JSON.stringify({ name }),
    };
    try {
      const response = await fetch(`${address}:3001/findwithname`, options);
      if (!response.ok) throw new Error(`Error ${response}`);
      else {
        const data = await response.json();
        console.log(data);
        setNameSuggestions(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addingFriend = async (FriendData) => {
    const index = userFriends.findIndex(
      (each) => each.email === FriendData.email
    );
    if (index === -1) {
      const payload = {
        userEmail: userData.email,
        friendEmail: FriendData.email,
      };
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };

      try {
        const response = await fetch(`${address}:3001/addfriend`, options);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "black" : "white",
        }}>
        <SearchBar
          onChangeText={(e) => {
            nameHandler(e);
          }}
          value={name}
          style={{
            backgroundColor: isDark ? "#1f1f1f" : "white",
            color: isDark ? "white" : "black",
            padding: 10,
            borderRadius: 10,
          }}
          inputContainerStyle={{
            backgroundColor: isDark ? "black" : "white",
            borderBottomColor: "transparent",
            borderTopColor: "transparent",
          }}
          containerStyle={{
            backgroundColor: "transparent",
            borderWidth: 0, // Remove the border
            borderBottomWidth: 0, // Remove the bottom border
            borderTopWidth: 0, // Remove the top border
          }}
        />
        <FlatList
          data={nameSuggestions}
          keyExtractor={(each) => each.email}
          renderItem={(each) => (
            <FriendSuggestion
              data1={each}
              sender={userData.email}
              addingFriend={addingFriend}
            />
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SearchScreen;
