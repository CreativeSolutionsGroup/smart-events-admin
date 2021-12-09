import React, { createRef } from "react";
import { Icon, Card, Button, Divider, CardContent, Input } from "semantic-ui-react";
import AddEventModal from "./AddEventModal"
import { getEvents, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, getAllUniqueEngageesCount, getAllEngagements } from "../../utils";

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
      editEvent: null,
      searchValue: ""
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
        this.setState({ events: events });
        this.loadEventTotalEngagements()
      });
  }

  loadEventTotalEngagements() {
    getAllEngagements()
    .then((engagements) => {
      getAllUniqueEngageesCount()
      .then((engagementCounts) => {
          let eventEngageeCount = {}
          engagements.forEach((engagement) => {
            let count = engagementCounts[engagement._id] === undefined ? 0 : engagementCounts[engagement._id].length;
            let oldCount = eventEngageeCount[engagement.event_id] === undefined ? 0 : eventEngageeCount[engagement.event_id];
            eventEngageeCount[engagement.event_id] = oldCount + count;
          })
          this.setState({ eventEngagements: eventEngageeCount });
        }
      );
    })
  }

  clickEvent(element) {
    window.open("/event/" + element._id, "_self")
  }

  getFilteredEvents(searchValue){
    if(searchValue === ""){
      return this.state.events;
    }
    return this.state.events.filter(event => (event.name.toLowerCase().includes(searchValue.toLowerCase()) || event.description.toLowerCase().includes(searchValue.toLowerCase())));
  }

  render() {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 5 }}>
          <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Events</h2>
          <Input 
            icon='search' 
            placeholder='Search...' 
            style={{width: '45%', marginLeft: 'auto', marginRight: 'auto'}}
            value={this.state.searchValue}
            onChange={(e, { name, value }) => {
              this.setState({ searchValue: value })
            }}
          />
        </div>
        <Divider />
        <Card.Group style={{ margin: 5 }} centered>
          {
            this.getFilteredEvents(this.state.searchValue).map((element) => {
              return (
                <Card onClick={() => this.clickEvent(element)} key={"event_" + element._id}>
                  <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                    <Card.Header>{element.name}</Card.Header>
                  </Card.Content>
                  <CardContent>
                    <Card.Description>{element.description}</Card.Description>
                  </CardContent>
                  <Card.Content extra >
                    <div style={{ display: "flex" }}>
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
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            icon labelPosition='left'
            onClick={() => {
              this.showAddEventModal();
            }}
            style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
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