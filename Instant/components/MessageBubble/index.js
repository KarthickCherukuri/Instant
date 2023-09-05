import { View, Text, StyleSheet, Dimensions } from "react-native";
const width = Dimensions.get("screen").width;

const MessageBubble = (props) => {
  const { data, sender } = props;
  const { message_content, time } = data;
  const { item } = data;

  const now = new Date(item.time);
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const bubbleStyle =
    item.sender === sender ? styles.myBubble : styles.otherBubble;

  return (
    <View style={[styles.messageContainer, bubbleStyle]}>
      <Text style={styles.myText}>{item.message_content}</Text>
      <Text style={styles.timestamp}>
        {hours}:{minutes}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "70%",
    minWidth: "40%",
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  myBubble: {
    backgroundColor: "rgb(2,79,70)",
    alignSelf: "flex-end",
  },
  otherBubble: {
    backgroundColor: "rgb(54,54,56)",
    alignSelf: "flex-start",
  },
  myText: {
    color: "white",
    margin: 4,
  },

  timestamp: {
    fontSize: 12,
    color: "gray",
    alignSelf: "flex-end",
    marginTop: 4,
    position: "absolute",
    right: 0,
    bottom: 0,
    margin: 5,
  },
});

export default MessageBubble;
