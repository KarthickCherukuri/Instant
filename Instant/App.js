import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import Login from "./components/login";
import { Appearance, StatusBar } from "react-native";
import { enableScreens } from "react-native-screens";
import Home from "./components/Home";
import Chat from "./components/chat";
import { MyContextProvider } from "./components/context";
import SearchScreen from "./components/SearchScreen";

enableScreens();

const Stack = createNativeStackNavigator();

const App = () => {
  const [isDark, setIsDark] = React.useState(
    Appearance.getColorScheme() === "dark"
  );

  React.useEffect(() => {
    Appearance.addChangeListener((scheme) => {
      setIsDark(scheme.colorScheme === "dark");
    });
  }, []);

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <MyContextProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: isDark ? "black" : "#f0f0f0",
              },
              headerTintColor: isDark ? "white" : "none",
            }}>
            <Stack.Screen component={Login} name="Login" />
            <Stack.Screen component={Home} name="Home" />
            <Stack.Screen component={Chat} name="Chat" />
            <Stack.Screen component={SearchScreen} name="SearchScreen" />
          </Stack.Navigator>
        </NavigationContainer>
      </MyContextProvider>
    </>
  );
};

export default App;
