import "./App.css";
import { Route, Switch } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/login";
import ProtectedRoute from "./components/protectedRoute";

function App() {
  return (
    <>
      <Switch>
        <Route exact path="/login" render={(props) => <Login {...props} />} />
        <ProtectedRoute exact component={Home} path="/" />
      </Switch>
    </>
  );
}

export default App;
