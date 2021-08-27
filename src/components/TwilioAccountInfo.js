import React from "react";
import { Card, Icon } from "semantic-ui-react";
import { API_URL } from "../utils";

export default class TwilioAccountInfo extends React.Component {
  constructor(props) {
    super(props);

    let balance = 0;
    let smsLeft = 0;
    let mmsLeft = 0;
    this.state = {
      balance: balance,
      smsLeft: smsLeft,
      mmsLeft: mmsLeft
    };

    this.getTwilioInfo = this.getTwilioInfo.bind(this);
  }

  componentDidMount() {
    this.getTwilioInfo();
  }

  getTwilioInfo() {
    fetch(API_URL + '/api/twilio/')
      .then((res) => res.json())
      .then(
        (res) => {
          if (res.status !== "success") {
            console.log("Failed to retrieve Twilio Account information");
            console.log(res.message);
          }

          let balance = parseFloat(res.data.balance).toFixed(2);
          let costSMS = 0.0075;
          let costMMS = 0.02;
          let costSMSTotal = costSMS * 2;
          let costMMSTotal = costSMS + costMMS;
          let smsLeft = parseFloat(res.data.balance / costSMSTotal).toFixed(0);
          let mmsLeft = parseFloat(res.data.balance / costMMSTotal).toFixed(0);

          this.setState({ balance: balance, smsLeft: smsLeft, mmsLeft: mmsLeft });
        },
        (err) => {
          console.error("Failed to retrieve Twilio Account information");
          console.error(err);
        }
      );
  }

  openTwilioConsole(){
    const newWindow = window.open("https://www.twilio.com/console", '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  render() {
    return (
      <Card style={{
        display: "flex",
        borderRadius: 10,
        alignItems: "center",
        border: "1px solid",
        backgroundColor: "rgba(187, 64, 64, 0.8)"
      }}>
        <Card.Content>
          <Card.Header style={{display: "flex", justifyContent:'center'}}>
            Twilio Account Info
          </Card.Header>
        </Card.Content>
        <Icon name="external alternate" onClick={this.openTwilioConsole} style={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 1,
              margin: 5
            }}/>
        <Card.Content style={{color: "white"}}>
          <div>
            <Icon name="dollar sign" />
            {this.state.balance}
          </div>
          <div>
            <Icon name="comment" />
            SMS Left: {this.state.smsLeft}
          </div>
          <div>
            <Icon name="image" />
            MMS Left: {this.state.mmsLeft}
          </div>
        </Card.Content>
      </Card>
    );
  }
}