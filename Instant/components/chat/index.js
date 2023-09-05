import {
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Appearance,
  ScrollView,
  BackHandler,
} from "react-native";
import { useContext, useEffect, useState, useRef } from "react";
import { MyContext } from "../context";
import MessageBubble from "../MessageBubble";
import { Button } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import App from "../../App";
const { width, height } = Dimensions.get("screen");

const MainHead = ({ name, image, isDark }) => (
  <View
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      width: 250,
    }}>
    <Image
      source={{ url: image, cache: "only-if-cached" }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        marginRight: 10,
      }}
    />
    <Text style={{ color: isDark ? "white" : "black" }}>{name}</Text>
  </View>
);

const Chat = ({ navigation, route }) => {
  const { exchangeData } = route.params;

  const userContext = useContext(MyContext);
  const { userSocket, setUserSocket, address, isDark } = userContext;
  const [messagesList, setMessagesList] = useState([]);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [formMessage, setFormMessage] = useState("");
  const listRef = useRef(null);
  const scrollToBottom = (ani) => {
    if (listRef.current) {
      listRef.current.scrollToEnd({ animated: ani });
    }
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setIsKeyboardOpen(true);
        setKeyboardHeight(e.endCoordinates.height);
        scrollToBottom(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsKeyboardOpen(false)
    );

    // Clean up listeners when the component unmounts
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  navigation.setOptions({
    title: exchangeData.receiver.name,
    headerTitle: () => (
      <MainHead
        image={exchangeData.receiver.item.picture}
        name={exchangeData.receiver.item.name}
        isDark={isDark}
      />
    ),
  });
  const sendMessageForm = async () => {
    console.log(exchangeData.receiver.item.email);
    try {
      if (formMessage !== "") {
        userSocket.emit(
          "send-message-to-friend",
          {
            message: formMessage,
            reciever: exchangeData.receiver.item.email,
          },
          (Id) => {
            const now = new Date();
            const nxtMsg = {
              id: Id,
              sender: exchangeData.sender,
              receiver: exchangeData.receiver,
              message_content: formMessage,
              time: now.toString(),
            };
            setMessagesList((prev) => [...prev, nxtMsg]);
            setFormMessage("");
          }
        );
      }
    } catch (e) {
      console.error(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const fetchChat = async (email) => {
    const sender = exchangeData.sender;
    const receiver = email;

    try {
      const response = await fetch(
        `${address}:3001/chat/${sender}/${receiver}`
      );
      const data = await response.json();
      setMessagesList(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchChat(exchangeData.receiver.item.email);
  }, [exchangeData.sender]);
  useEffect(() => {
    if (messagesList.length > 0) {
      scrollToBottom(false);
    }
  }, [messagesList]);
  useEffect(() => {
    try {
      userSocket.on("send-message-to-friend", (data) => {
        setMessagesList((prev) => [...prev, data]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        scrollToBottom(true);
      });
    } catch (error) {
      console.error(error);
    }
  }, [userSocket]);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "black" : "#f0f0f0" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={{
          flex: 1,

          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          height: height,
          width: width,
          display: "flex",
          flexDirection: "row",
          flex: 1,
        }}>
        <View
          style={{
            paddingBottom: 10,
            flex: 1,
            padding: 2,
          }}>
          {messagesList.length > 0 && (
            <FlatList
              data={messagesList}
              ref={listRef}
              style={{
                marginBottom: 10,
                width: width,
                flex: 1,
              }}
              renderItem={(each) => (
                <MessageBubble data={each} sender={exchangeData.sender} />
              )}
              keyExtractor={(each) => each.id}
            />
          )}

          <View
            style={{
              marginLeft: 5,
              alignItems: "center",
              marginBottom: 12,
              display: "flex",
              flexDirection: "row",
            }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: isDark ? "gray" : "#dedede",
                color: isDark ? "white" : "black",
                height: 32,
                paddingLeft: 15,
                borderRadius: 10,
              }}
              placeholder="Enter to Text"
              value={formMessage}
              onChangeText={(e) => {
                setFormMessage(e);
              }}
            />
            <Button
              onPress={() => {
                sendMessageForm();
              }}
              icon={<Icon name="send-sharp" size={15} color="white" />}
              buttonStyle={{
                borderRadius: 17,
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Chat;
