import { useContext, useEffect, useState } from "react";
import { Text, View, Image, FlatList } from "react-native";
import { Button } from "react-native-elements";
import jwtEncode from "jwt-encode";
import FriendsListItem from "../FriendsList";
import { io } from "socket.io-client";
import { MyContext } from "../context";
import Icon from "react-native-vector-icons/FontAwesome";
const MainHead = ({ name, image, isDark }) => (
  <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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

const Home = ({ navigation, route }) => {
  const userContext = useContext(MyContext);
  const {
    userSocket,
    setUserSocket,
    address,
    isDark,
    userFriends,
    setUserFriends,
    userData,
    setUserData,
  } = userContext;

  const fetchUserDetails = async () => {
    try {
      const email = route.params["email"];

      const response = await fetch(`${address}:3001/getuserdata/${email}`);

      const data = await response.json();

      setUserData(data);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    navigation.setOptions({
      title: "",
      headerTitle: () => {
        if (userData !== null)
          return (
            <MainHead
              image={userData.picture}
              name={userData.name}
              isDark={isDark}
            />
          );
      },
      headerRight: () => (
        <Button
          onPress={() => {
            navigation.navigate("SearchScreen");
          }}
          icon={<Icon name="search-plus" size={19} color="white" />}
          buttonStyle={{ backgroundColor: "transparent" }}
        />
      ),
    });
  }, [isDark, userData]);
  const getUserFriends = async () => {
    const jwtToken = jwtEncode(userData, "secret");

    const options = {
      headers: {
        Authorization: `${jwtToken}`,
      },
      method: "GET",
    };

    try {
      const response = await fetch(`${address}:3001/userFriends`, options);

      if (response.ok) {
        const data = await response.json();
        setUserFriends(data);
      }
    } catch (error) {
      console.error("error at getting friends: ", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [route.params["email"]]);

  useEffect(() => {
    if (userData === null) return;

    const jwtToken = jwtEncode(userData, "secret");
    const socket = io(`${address}:3002/`, {
      auth: { token: jwtToken },
    });
    try {
      socket.on("connect", () => {
        setUserSocket(socket);
      });
      socket.on("get-friends", (data) => {
        if (Object.keys(userFriends).length === 0) {
          getUserFriends();
        } else {
          if (data.type === 1) {
            setUserFriends((prev) => {
              const newData = prev.map((each) => {
                if (each.email === data.email) {
                  return { ...each, socket_id: data.socket_id };
                }
                return each;
              });
              return newData;
            });
          } else {
            setUserFriends((prev) => {
              const newData = prev.map((each) => {
                if (each.email === data.email) {
                  return { ...each, socket_id: null };
                }
                return each;
              });
              return newData;
            });
          }
        }
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong please reload");
    }
    getUserFriends();
  }, [userData]);
  return (
    <View style={{ backgroundColor: isDark ? "black" : "white", flex: 1 }}>
      {userFriends.length > 0 && (
        <FlatList
          data={userFriends}
          key={(each) => each.email}
          renderItem={(each) => (
            <FriendsListItem
              data={each}
              sender={userData.email}
              userSocket={userSocket}
              isDark={isDark}
            />
          )}
        />
      )}
    </View>
  );
};

export default Home;
