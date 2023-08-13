import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import "./index.css";
import { useState, useEffect } from "react";
import UsersFriends from "../usersFriends";
import Suggestions from "../suggestions";
const Home = (props) => {
  const [userData, setUserData] = useState({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState({});

  const nameHandler = async (event) => {
    const name = event.target.value;
    setName(name);

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    };

    const response = await fetch("http://localhost:3001/findwithname", options);
    if (!response.ok) throw new Error(`Error ${response}`);
    else {
      const data = await response.json();
      setNameSuggestions(data);
    }
  };

  const emailHandler = async (event) => {
    const email = event.target.value;
    setEmail(email);

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    };
    const response = await fetch(
      "http://localhost:3001/findwithemail",
      options
    );

    const data = await response.json();
    setEmailSuggestions(data);
  };

  const signout = () => {
    Cookies.remove("jwt_token");
    const { history } = props;
    history.replace("/login");
  };

  useEffect(() => {
    const userData = jwt_decode(Cookies.get("jwt_token"));

    setUserData({ ...userData });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <nav>
        <img src={userData.picture} alt="profile pic" className="profile-pic" />
        <div className="search-with-name">
          <input
            type="search"
            className="name-input"
            placeholder="full name"
            value={name}
            onChange={nameHandler}
            autoComplete
          />
          {nameSuggestions.length > 0 && name.length > 0 && (
            <ul className="name-suggestions">
              {nameSuggestions.map((each) => (
                <Suggestions data={each} key={each.email} />
              ))}
            </ul>
          )}
        </div>

        <div className="search-with-name">
          <input
            type="search"
            className="email-input"
            placeholder="email"
            value={email}
            onChange={emailHandler}
            autoComplete
          />
          {emailSuggestions.length > 0 && email.length > 0 && (
            <ul className="email-suggestions">
              {emailSuggestions.map((each) => (
                <Suggestions data={each} key={each.email} />
              ))}
            </ul>
          )}
        </div>

        <button onClick={signout} className="sign-out-btn">
          Sign out
        </button>
      </nav>
      <div className="ui">
        <div id="sidebar">
          <UsersFriends data={userData} />
        </div>
        <div id="chat">
          <h1>Chat</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
