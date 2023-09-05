import { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [userSocket, setUserSocket] = useState({});
  const address = "http://10.10.72.77";
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === "dark");
  const [userFriends, setUserFriends] = useState([]);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    Appearance.addChangeListener((scheme) => {
      setIsDark(scheme.colorScheme === "dark");
    });
  }, []);
  const contextValue = {
    userSocket,
    setUserSocket,
    address,
    isDark,
    userFriends,
    setUserFriends,
    userData,
    setUserData,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
};
export { MyContext, MyContextProvider };
