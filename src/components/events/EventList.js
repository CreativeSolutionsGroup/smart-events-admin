import React, { createRef } from "react";
import { Icon, Card, Button, Divider, CardContent } from "semantic-ui-react";
import AddEventModal from "./AddEventModal"
import { getEventEngageeCounts, getEvents, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE } from "../../utils";

export default class EventList extends React.Component {
  addEventModalRef = createRef();
  
  constructor(props) {
    super(props);

    this.state = {
        events: [],
        eventEngagements: {},
        windowWidth: window.innerWidth,
        addModalOpen: false,
        editModalOpen: false,
        editEvent: null
    }

    this.loadEvents = this.loadEvents.bind(this);
    this.showAddEventModal = this.showAddEventModal.bind(this);
  }

  componentDidMount() {
    this.loadEvents();
  }

  showAddEventModal() {
    this.addEventModalRef.current.setState({ 
      name: "",
      description: "",
      open: true 
    });
  }

  loadEvents() {
    getEvents()
    .then((events) => {
        this.setState({ events: events});
        this.loadEventTotalEngagements()
    });
  }

  loadEventTotalEngagements(){
    this.state.events.forEach((event) => {
      getEventEngageeCounts(event._id)
      .then(
        (filteredEngagees) => {
          let count = 0;
          const keys = Object.keys(filteredEngagees);
          keys.forEach((value) => {
            count += filteredEngagees[value];
          });
          let eventEngagements = this.state.eventEngagements;
          eventEngagements[event._id] = count;
          this.setState({eventEngagements: eventEngagements});
        }
      )
    });
  }

  clickEvent(element){
    //this.showEditEventModal(element)
    window.open("/event/" + element._id, "_self")
  }

  render() {
    return (
        <div>
          <div style={{display: 'flex', marginTop: 5}}>
            <h2 style={{marginLeft: 'auto', marginRight: 'auto'}}>Events</h2>
          </div>
          <Divider />
          <Card.Group style={{margin: 5}} centered>
            {
                this.state.events.map((element) => {
                    return (
                      <Card onClick={() => this.clickEvent(element)} key={"event_"+element._id}>
                        <Card.Content style={{backgroundColor: COLOR_CEDARVILLE_BLUE}}>
                          <Card.Header>{element.name}</Card.Header>
                        </Card.Content>
                        <CardContent>
                          <Card.Description>{element.description}</Card.Description>
                        </CardContent>
                        <Card.Content extra >
                            <div style={{display: "flex"}}>
                              <Icon name='users' />
                              {this.state.eventEngagements[element._id]}
                            </div>
                        </Card.Content>
                      </Card>
                    );
                })
            }
          </Card.Group>
          <Divider />
          <div style={{display: 'flex', flexDirection: 'row'}}>
              <Button 
                icon labelPosition='left'
                onClick={() => {
                  this.showAddEventModal();
                }}
                style={{marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW}}
              >
                <Icon name='add' />
                Add Event
              </Button>
          </div>
          <AddEventModal ref={this.addEventModalRef} />
        </div>
    );
  }
}