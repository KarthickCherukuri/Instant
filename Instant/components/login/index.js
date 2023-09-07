
import {
  Button,
  Text,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Platform,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import styles from "./styles";
import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
const width = Dimensions.get("screen").width;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const onFaceId = async () => {
    try {
      // Checking if device is compatible
      const isCompatible = await LocalAuthentication.hasHardwareAsync();

      if (!isCompatible) {
        throw new Error("Your device isn't compatible.");
      }

      // Checking if device has biometrics records
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        throw new Error("No Faces / Fingers found.");
      }

      // Authenticate user
      await LocalAuthentication.authenticateAsync();

      Alert.alert("Authenticated", "Welcome back !");
    } catch (error) {
      Alert.alert("An error as occured", error?.message);
    }
  };

  const redirect = async () => {
    try {
      const email = await AsyncStorage.getItem("email");
      if (email === null || email === "") return;
      navigation.replace("Home", { email: email });
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    // onFaceId();

    redirect();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        style={{ width: 393 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}>
          <View>
            <TextInput
              value={email}
              style={{
                width: 250,
                borderRadius: 30,
                borderWidth: 0.2,
                borderColor: "blue",
                marginBottom: 10,
                padding: 20,
              }}
              placeholder="Enter ur email"
              onChangeText={(txt) => {
                setEmail(txt);
              }}
            />
            <Button
              title="Sign in"
              style={{ borderRadius: Platform.Os === "android" ? 10 : 0 }}
              onPress={async () => {
                navigation.navigate("Home", { email: email });
                await AsyncStorage.setItem("email", email);
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default Login;
