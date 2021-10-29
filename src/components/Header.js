import React from "react";
import smart_events_logo from "../images/smart-events-logo.png";
import Logout from "../components/Logout";
import { Image, Button, Icon, Divider, Popup } from "semantic-ui-react";
import TwilioAccountInfo from "./TwilioAccountInfo";

export default class Header extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sideBarVisible: false
    }
  }


  render() {
    return (
      <div style={{ width: "100%", display: 'flex', flexDirection: 'row' }}>
        {/*Logo*/}
        <Image
          src={smart_events_logo}
          size="small"
          style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: "auto" }}
          onClick={() => window.open("/dashboard", "_self")}
        />

        {/*Menu Button*/}
        <Popup 
          trigger={
            <Button icon='bars' style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5 }}/>
          } 
          on={['click']}
        >
          {/*Menu Buttons*/}
          <div style={{display: 'flex', flexDirection: 'column', margin: 5}}>
                <Button
                  icon
                  labelPosition='left'
                  onClick={() => window.open("/attractions", "_self")}
                  style={{ margin: 5, backgroundColor: 'olive', color: 'white' }}
                >
                  <Icon name='ticket' />
                  Attractions
                </Button>
                <Button
                  icon
                  labelPosition='left'
                  onClick={() => window.open("/announcement", "_self")}
                  style={{ margin: 5, backgroundColor: 'orange', color: 'white' }}
                >
                  <Icon name='bullhorn' />
                  Text Blast
                </Button>
                <Button
                  icon
                  labelPosition='left'
                  onClick={() => window.open("/giveaway", "_self")}
                  style={{ margin: 5, backgroundColor: 'green', color: 'white' }}
                >
                  <Icon name='winner' />
                  Giveaway
                </Button>
                <Popup
                  content={
                    <TwilioAccountInfo />
                  }
                  position='bottom right'
                  on='click'
                  trigger={
                    <Button
                      icon
                      labelPosition='left'
                      style={{ margin: 5, backgroundColor: 'red', color: 'white' }}
                    >
                      <Icon name='comments' />
                      Twillio Info
                    </Button>
                  }
                />
                <Divider />
                <div style={{marginLeft: 'auto', marginRight: 'auto', marginBottom: 5}}>
                  <Logout />
                </div>
              </div>
        </Popup>
      </div>
    );
  }

}