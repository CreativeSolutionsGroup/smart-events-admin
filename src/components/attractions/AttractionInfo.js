import React, { createRef } from "react";
import { Card, Icon, Button, Image, Modal, Divider, Popup, Segment } from "semantic-ui-react";
import { getAttractionSlots, getSlotTickets, formatTime, isTimeLive, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, API_URL, getUserPermissions } from "../../utils";
import AddSlotModal from "./AddSlotModal";
import EditSlotModal from "./EditSlotModal";
import EditAttractionModal from "./EditAttractionModal";

export default class AttractionInfo extends React.Component {
  addSlotModalRef = createRef();
  editSlotModalRef = createRef();
  editAttractionModalRef = createRef();

  constructor(props) {
    super(props);

    this.attraction_id = props.attraction_id;

    this.state = {
      attraction_name: "",
      attraction_desc: "",
      attraction_about: "",
      attraction_imageURL: "",
      attraction_startTime: "",
      attraction_endTime: "",
      attraction_location: "",
      attraction_hidden: "",
      slots: [],
      tickets: {},
      imageModalOpen: false
    }

    this.getAttractionInfo = this.getAttractionInfo.bind(this);
    this.loadSlots = this.loadSlots.bind(this);
    this.showAddSlotModal = this.showAddSlotModal.bind(this);
    this.showEditSlotModal = this.showEditSlotModal.bind(this);
    this.showEditAttractionModal = this.showEditAttractionModal.bind(this);
  }

  componentDidMount() {
    this.getAttractionInfo();
    this.loadSlots();    

    //Check user permissions
    getUserPermissions(localStorage.getItem("email")).then(response => {
      this.setState({permissions: response});
    });
  }

  showAddSlotModal() {
    this.addSlotModalRef.current.setState({
      attractionId: this.attraction_id,
      label: "",
      capacity: "",
      hideTime: "",
      formHideTime: "",
      open: true
    });
  }

  showEditSlotModal(slot) {
    this.editSlotModalRef.current.setState({
      slotId: slot._id,
      label: slot.label,
      formLabel: slot.label,
      capacity: slot.ticket_capacity,
      formCapacity: slot.ticket_capacity,
      hideTime: slot.hide_time,
      formHideTime: slot.hide_time,
      open: true
    });
  }

  showEditAttractionModal() {
    this.editAttractionModalRef.current.setState({
      attractionId: this.attraction_id,
      name: this.state.attraction_name,
      formName: this.state.attraction_name,
      description: this.state.attraction_desc,
      formDescription: this.state.attraction_desc,
      about: this.state.attraction_about,
      formAbout: this.state.attraction_about,
      imageURL: this.state.attraction_imageURL,
      formImageURL: this.state.attraction_imageURL,
      startTime: this.state.attraction_startTime,
      formStartTime: this.state.attraction_startTime,
      endTime: this.state.attraction_endTime,
      formEndTime: this.state.attraction_endTime,
      location: this.state.attraction_location,
      formLocation: this.state.attraction_location,
      hidden: this.state.attraction_hidden,
      formHidden: this.state.attraction_hidden,
      open: true
    });
  }

  getAttractionInfo() {
    fetch(API_URL + '/api/attractions/' + this.attraction_id)
      .then((res) => res.json())
      .then(
        (res) => {
          if (res.status !== "success") {
            console.log("Failed to retrieve Attraction info");
            console.log(res.message);
            alert("Error (Attractions): " + res.message);
          }
          if (res.data != null) {
            let attractionName = res.data.name;
            let attractionDesc = res.data.description;
            let attractionAbout = res.data.about;
            let attractionImageURL = res.data.image_url;
            let attractionStartTime = res.data.start_time;
            let attractionEndTime = res.data.end_time;
            let attractionLocation = res.data.location;
            let attractionHidden = res.data.hidden;
            this.setState({
              attraction_name: attractionName,
              attraction_desc: attractionDesc,
              attraction_about: attractionAbout,
              attraction_imageURL: attractionImageURL,
              attraction_startTime: attractionStartTime,
              attraction_endTime: attractionEndTime,
              attraction_location: attractionLocation,
              attraction_hidden: attractionHidden
            });
          }
        },
        (err) => {
          console.error("Failed to retrieve Attraction info");
          console.error(err);
        }
      );
  }

  loadSlots() {
    getAttractionSlots(this.attraction_id)
      .then((filteredSlots) => {
        this.setState({ slots: filteredSlots });
        this.loadTickets(filteredSlots);
      });
  }

  loadTickets(slots) {
    slots.forEach((slot) => {
      getSlotTickets(slot._id)
        .then((res) => {
          let tickets = this.state.tickets === undefined ? {} : this.state.tickets;
          tickets[slot._id] = res;
          this.setState({ tickets: tickets });
        })
    })

  }

  getTicketCount(slotId) {
    let slotTickets = this.state.tickets[slotId];
    if (slotTickets !== undefined) {
      return slotTickets.length === undefined ? 0 : slotTickets.length;
    }
    return 0;
  }

  getScannedTicketCount(slotId){
    let slotTickets = this.state.tickets[slotId];
    if (slotTickets !== undefined) {
      let scannedTickets = slotTickets.filter((ticket) => (ticket.scanned === true));
      return scannedTickets.length === undefined ? 0 : scannedTickets.length;
    }
    return 0;
  }

  render() {
    const now = Date.now();
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: "column" }}>

          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h1 style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 10 }}>{this.state.attraction_name}</h1>
            {/*Visible Indicator*/}
            {isTimeLive(this.state.attraction_startTime, this.state.attraction_endTime) ? <Icon name="eye" size='large' style={{ marginLeft: 5, marginRight: 5, marginTop: 10, color: COLOR_CEDARVILLE_YELLOW }} /> : ""}

            {/*Hidden Indicator*/}
            {this.state.attraction_hidden ? <Icon name="eye slash" size='large' style={{ marginLeft: 5, marginRight: 5, marginTop: 'auto', marginBottom: 'auto' }} /> : ""}
            <Button
              icon
              style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5 }}
              onClick={() => this.setState({ imageModalOpen: true })}
            >
              <Icon name='image' />
            </Button>
            {
              this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
                <Button
                  icon
                  onClick={() => {
                    this.showEditAttractionModal();
                  }}
                  style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: 5 }}
                >
                  <Icon name='edit' />
                </Button>
              : ""
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, marginRight: 10 }}>
            <Segment compact style={{marginTop: 10}}>
              <div style={{ display: "flex" }}> <h3>Public Info</h3></div>
              <div style={{ display: "flex", whiteSpace: 'pre-line', marginLeft: 10, width: 'wrap-content' }}>"{this.state.attraction_desc}"</div>
              <div style={{ display: "flex", flexDirection: "row", marginTop: 5 }}>
                <Icon name="clock" />
                {formatTime(this.state.attraction_startTime)}
                {" - "}
                {formatTime(this.state.attraction_endTime)}
              </div>
              <div style={{ display: "flex", flexDirection: "row", marginTop: 5 }}>
                <Icon name="map marker alternate" />
                {this.state.attraction_location}
              </div>
              <Divider />
              <h3>Private Info</h3>
              <div style={{ marginLeft: 10 }}>{this.state.attraction_about}</div>
            </Segment>
          </div>
        </div>        

        <Segment compact raised style={{marginLeft: 'auto', marginRight: 'auto'}}>
          <div style={{ display: 'flex', marginTop: 5 }}>
            <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Slots</h2>
          </div>          
          <Divider />
          <Card.Group style={{ margin: 5 }} centered>
            {this.state.slots.length === 0 ? <div><b>No Slots Created</b></div>: ""}
            {
              this.state.slots.map((slot) => {
                return (
                  <Card 
                    onClick={() => 
                      {
                        if(this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit"))){
                          this.showEditSlotModal(slot)
                        }
                      }
                    } 
                    key={"card_" + slot._id}
                  >
                    <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                      <Card.Header>{slot.label}</Card.Header>
                    </Card.Content>
                    <Card.Content>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                      <div>
                        <Icon name="ticket" />
                        {"Tickets: " + this.getTicketCount(slot._id)}/{slot.ticket_capacity}
                      </div>
                      <div>
                        <Icon name='qrcode' />
                        {"Scanned: " + this.getScannedTicketCount(slot._id)}/{this.getTicketCount(slot._id)}
                      </div>
                      </div>
                    </Card.Content>
                    <Card.Content extra>
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <Icon name="clock" />
                        {formatTime(slot.hide_time)}
                        
                        {/*Visible Indicator*/}
                        {(now <= new Date(slot.hide_time)) ?
                            <Popup
                              content="Slot is Visible"
                              position='top right'
                              trigger={<Icon name="eye" size='large' style={{ marginLeft: 'auto', marginRight: 5, marginTop: 'auto', marginBottom: 'auto', color: COLOR_CEDARVILLE_YELLOW }} />}
                            />
                            : ""}
                      </div>
                    </Card.Content>
                  </Card>
                );
              })
            }
          </Card.Group>
        </Segment>
        {
          this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                icon labelPosition='left'
                onClick={() => {
                  this.showAddSlotModal();
                }}
                style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
              >
                <Icon name='add' />
                Add Slot
              </Button>
            </div>
          : ""
        }
        <AddSlotModal ref={this.addSlotModalRef} />
        <EditSlotModal ref={this.editSlotModalRef} />
        <EditAttractionModal ref={this.editAttractionModalRef} />
        <Modal
          closeIcon
          size="small"
          onClose={() => this.setState({ imageModalOpen: false })}
          onOpen={() => this.setState({ imageModalOpen: true })}
          open={this.state.imageModalOpen}
        >
          <Modal.Header>Attraction Image</Modal.Header>
          <Modal.Content>
            <Image size='medium' src={this.state.attraction_imageURL} style={{ marginLeft: 'auto', marginRight: 'auto' }} />
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}