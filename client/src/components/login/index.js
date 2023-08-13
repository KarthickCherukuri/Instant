import { useEffect } from "react";

import Cookies from "js-cookie";

import "./index.css";
import { Redirect } from "react-router-dom/";

const Login = (props) => {
  const handleLogin = async (response) => {
    Cookies.set("jwt_token", response.credential, { expires: 7 });
    const body = JSON.stringify({ jwt_token: response.credential });
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    };
    console.log(body);
    const responsed = await fetch("http://localhost:3001/testdata", options);
    const data = await responsed.json();
    console.log(data);
    const { history } = props;
    history.replace("/");
  };

  useEffect(() => {
    /*global google */
    google.accounts.id.initialize({
      client_id:
        "781932930127-u9hnig5sq3k8cju79thrc7rnv5iav38o.apps.googleusercontent.com",
      callback: handleLogin,
    });

    google.accounts.id.renderButton(document.getElementById("signIn"), {
      theme: "outline",
      size: "large",
      shape: "pill",
    });
    google.accounts.id.prompt();
  }, []);

  const jwt_token = Cookies.get("jwt_token");
  if (jwt_token !== undefined) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <div
        id="signIn"
        className="login-div"
        data-prompt_parent_id="g_id_onload"></div>
      <h1>Login</h1>
    </>
  );
};

export default Login;
