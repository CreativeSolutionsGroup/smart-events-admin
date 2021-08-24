import React from "react";
import ReactDOM from "react-dom";

import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  useParams
} from "react-router-dom";

import { Image } from "semantic-ui-react";

import "./index.css";
import "semantic-ui-css/semantic.min.css";
import EventList from "./components/events/EventList";
import EventInfo from "./components/events/EventInfo";
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from "./components/Login";
import Header from "./components/Header";
import { isLogin } from "./utils";
import smart_events_logo from "./images/smart-events-logo.png";
import Giveaway from "./components/events/Giveaway";
import Scanner from "./components/Scanner";

import AttractionList from "./components/attractions/AttractionList";
import AttractionInfo from "./components/attractions/AttractionInfo";

class App extends React.Component {
  state = {
    error: null,
    darkMode: true
  };

  render() {
    const { error } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    return (

      <BrowserRouter className="App">
        <Switch>
          <Route path="/" exact render={props => (
            isLogin() ? (
              <Redirect to="/dashboard" />)
              : <Redirect to="/signin" />
          )} />
          <PublicRoute restricted={true} component={SignIn} path="/signin" exact />
          <Route path="/scanner" exact component={ScannerPage} />
          <PrivateRoute component={Dashboard} path="/dashboard" exact />
          <PrivateRoute component={Event} path="/event/:event_id" exact />
          <PrivateRoute component={GiveawayPage} path="/giveaway" exact />
          <PrivateRoute component={Attractions} path="/attractions" exact />
          <PrivateRoute component={AttractionPage} path="/attraction/:attraction_id" exact />
        </Switch>
      </BrowserRouter>

    );
  }
}

function Dashboard() {
  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: "100%" }}>
          <EventList />
        </div>
      </div>
    </div>
  );
}

function Event() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  let { event_id } = useParams();

  return (
    <div>
      <Header />
      <EventInfo event_id={event_id} />
    </div>
  );
}

function GiveawayPage() {
  return (
    <div>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Giveaway showPicker={true} />
      </div>
    </div>
  );
}

function Attractions() {
  return (
    <div>
      <Header />
      <div style={{ margin: 10, marginBottom: 0 }}><h1>Attractions</h1></div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: "100%" }}>
          <AttractionList />
        </div>
      </div>
    </div>
  );
}

function AttractionPage() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  let { attraction_id } = useParams();

  return (
    <div>
      <Header />
      <AttractionInfo attraction_id={attraction_id} />
    </div>
  );
}

function SignIn() {

  return (

    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route render={() => (
      isLogin() ?
        <Redirect to="/dashboard" />
        : (
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: "90%" }}>
                <Image src={smart_events_logo} centered />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 10 }}>
                  <Login />
                </div>
              </div>
            </div>
          </div>
        )
    )} />
  );
}

function ScannerPage() {
  return (
    <div>
      <Scanner />
    </div>
  );
}

// ========================================

ReactDOM.render(<App />, document.getElementById("root"));