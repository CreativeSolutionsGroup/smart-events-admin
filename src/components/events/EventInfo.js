import React, { createRef } from "react";
import { Card, Icon, Button, Dropdown, Popup, Segment, Grid, Divider, Checkbox } from "semantic-ui-react";
import AddEngagementModal from "./AddEngagementModal";
import EditEngagementModal from "./EditEngagementModal";
import EditEventModal from "./EditEventModal"
import AddAttractionModal from "../attractions/AddAttractionModal"
import { getEventEngagements, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, isLive, formatTime, authorizedFetch, API_URL, getAttractions, getAllAttractionCapacities, getUserPermissions, getAllBeacons, getEventCheckins, getCheckinCount, getEngagementEngageeCount } from "../../utils";
import { CSVLink } from "react-csv";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import AsyncImage from "../AsyncImage";
import AddCheckinModal from "./AddCheckinModal";
import EditCheckinModal from "./EditCheckinModal";
import axios from "axios";

export default class EventInfo extends React.Component {
  addEngagementModalRef = createRef();
  editEngagementModalRef = createRef();
  editEventModalRef = createRef();
  addAttractionModalRef = createRef();
  addCheckinModalRef = createRef();
  editCheckinModalRef = createRef();

  intervalID;

  constructor(props) {
    super(props);

    this.event_id = props.event_id;

    this.state = {
      event_name: "",
      event_desc: "",
      engagements: [],
      engagementEngagees: {},
      downloadEngagementId: "",
      downloadCheckInId: "",
      attractions: [],
      attractionCapacities: {},      
      checkins: [],
      checkinCounts: {}, //Map of id -> count
      beaconNames: {},
      autoSync: false
    }

    this.getEventName = this.getEventName.bind(this);
    this.loadEngagements = this.loadEngagements.bind(this);
    this.loadAttractions = this.loadAttractions.bind(this);
    this.loadCheckins = this.loadCheckins.bind(this);
    this.loadBeaconNames = this.loadBeaconNames.bind(this);

    this.showAddEngagementModal = this.showAddEngagementModal.bind(this);
    this.showEditEngagementModal = this.showEditEngagementModal.bind(this);
    this.showEditEventModal = this.showEditEventModal.bind(this);
    this.showAddAttractionModal = this.showAddAttractionModal.bind(this);
    this.showAddCheckinModal = this.showAddCheckinModal.bind(this);
    this.showEditCheckinModal = this.showEditCheckinModal.bind(this);
  }

  componentDidMount() {
    this.getEventName();
    this.loadEngagements();
    this.loadAttractions();
    this.loadCheckins();
    this.loadBeaconNames();

    //Check user permissions
    getUserPermissions(localStorage.getItem("email")).then(response => {
      this.setState({permissions: response});
    })
  }

  componentWillUnmount() {
    if (this.intervalID !== null) {
      clearInterval(this.intervalID);
    }
  }

  engagmentDownloadSelectionList() {
    let list = [];
    this.state.engagements.forEach((engagement) => {
      let selection = {
        key: engagement._id,
        text: engagement.keyword,
        value: engagement._id
      }
      list.push(selection);
    })
    return list;
  }

  checkInDownloadSelectionList() {
    let list = [];
    this.state.checkins.forEach((checkIn) => {
      let selection = {
        key: checkIn._id,
        text: checkIn.name,
        value: checkIn._id
      }
      list.push(selection);
    })
    return list;
  }

  showAddEngagementModal() {
    this.addEngagementModalRef.current.setState({
      eventId: this.event_id,
      keyword: "",
      message: "",
      imageURL: "",
      startTime: "",
      formStartTime: "",
      endTime: "",
      formEndTime: "",
      open: true
    });
  }

  showAddAttractionModal() {
    this.addAttractionModalRef.current.setState({
      eventId: "",
      name: "",
      description: "",
      about: "",
      imageURL: "",
      startTime: "",
      endTime: "",
      formStartTime: "",
      formEndTime: "",
      location: "",
      open: true
    });
  }

  async showAddCheckinModal() {
    let beacons = await getAllBeacons();
    this.addCheckinModalRef.current.setState({
      eventId: this.event_id,
      beacon_ids: [],
      beacons: beacons,
      name: "",
      description: "",
      message: "",
      imageURL: "",
      startTime: "",
      formStartTime: "",
      endTime: "",
      formEndTime: "",
      open: true
    });
  }

  showEditEngagementModal(engagement) {
    this.editEngagementModalRef.current.setState({
      engagementId: engagement._id,
      keyword: engagement.keyword,
      formKeyword: engagement.keyword,
      message: engagement.message,
      formMessage: engagement.message,
      imageURL: engagement.image_url,
      formImageURL: engagement.image_url,
      startTime: engagement.start_time,
      formStartTime: engagement.start_time,
      endTime: engagement.end_time,
      formEndTime: engagement.end_time,
      open: true
    });
  }

  showEditEventModal() {
    this.editEventModalRef.current.setState({
      eventId: this.event_id,
      name: this.state.event_name,
      description: this.state.event_desc,
      formName: this.state.event_name,
      formDescription: this.state.event_desc,
      open: true
    });
  }

  async showEditCheckinModal(checkin) {
    let beacons = await getAllBeacons();
    console.log(checkin.beacons)
    this.editCheckinModalRef.current.setState({
      checkin_id: checkin._id,
      beacons: beacons,
      beacon_ids: checkin.beacons,
      formBeaconIDs: checkin.beacons,
      name: checkin.name,
      formName: checkin.name,
      message: checkin.message,
      formMessage: checkin.message,
      description: checkin.description,
      formDescription: checkin.description,
      imageURL: checkin.image_url,
      formImageURL: checkin.image_url,
      startTime: checkin.start_time,
      formStartTime: checkin.start_time,
      endTime: checkin.end_time,
      formEndTime: checkin.end_time,
      open: true
    });
  }

  getEventName() {
    authorizedFetch(API_URL + '/api/events/' + this.event_id)
      .then((res) => res.json())
      .then(
        (res) => {
          if (res.status !== "success") {
            console.log("Failed to retrieve Event Name");
            console.log(res.message);
            alert("Error (Event): " + res.message);
          }
          if (res.data != null) {
            let eventName = res.data.name;
            let eventDesc = res.data.description;
            this.setState({ event_name: eventName, event_desc: eventDesc });
          }
        },
        (err) => {
          console.error("Failed to retrieve Event Name");
          console.error(err);
        }
      );
  }

  loadEngagements() {
    getEventEngagements(this.event_id)
    .then((filteredEngagements) => {
      this.setState({ engagements: filteredEngagements });
      filteredEngagements.forEach((engagement) => {
        getEngagementEngageeCount(engagement._id)
        .then((response) => {
          let newEnagementDict = this.state.engagementEngagees;
          newEnagementDict[engagement._id] = response
          this.setState({ engagementEngagees:  newEnagementDict});
        })
      })
    });
  }

  loadAttractions() {
    getAttractions()
      .then((attractions) => {

        let attractionList = []
        attractions.forEach((attraction) => {
          let attraction_event_id = attraction.event_id;
          if(attraction_event_id !== this.event_id)return;

          let attractionValue = {
            _id: attraction._id,
            name: attraction.name,
            description: attraction.description,
            about: attraction.about,
            image_url: attraction.image_url,
            start_time: attraction.start_time,
            end_time: attraction.end_time,
            location: attraction.location,
            hidden: attraction.hidden
          }
          attractionList.push(attractionValue);
        });

        this.setState({ attractions: attractionList });
        this.loadAttractionCapacities(attractionList)
      });
  }

  loadAttractionCapacities(attractionList) {
    
    getAllAttractionCapacities(attractionList)
    .then(capacities => {
      capacities.forEach((capacity) => {
        capacity.then((value) => {
          let attractionId = value[0];
          let values = this.state.attractionCapacities === undefined ? {} : this.state.attractionCapacities;
          values[attractionId] = value[1];
          this.setState({ attractionCapacities: values });
        })
      })
    });
  }

  loadCheckins() {
    getEventCheckins(this.event_id)
    .then((filteredCheckins) => {
      this.setState({ checkins: filteredCheckins });
      filteredCheckins.forEach((checkin) => {
        getCheckinCount(checkin._id)
        .then((response) => {
          let newCheckinDict = this.state.checkinCounts;
          newCheckinDict[checkin._id] = response;
          this.setState({ checkinCounts:  newCheckinDict});
        })
      })
    });
  }

  loadBeaconNames(){
    getAllBeacons()
    .then(data => {
      data.forEach((beacon) => {
        let newNames = this.state.beaconNames;
        newNames[beacon._id] = beacon.name
        this.setState({ beaconNames:  newNames});
      })
    })
  }

  toggleAutoSync() {
    let newSync = !this.state.autoSync;
    this.setState({ autoSync: newSync });

    if (newSync) {
      this.intervalID = setInterval(this.autoSync.bind(this), 5000);
    } else {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
  }

  autoSync() {
    this.state.engagements.forEach((engagement) => {
      getEngagementEngageeCount(engagement._id)
      .then((response) => {
        let newEnagementDict = this.state.engagementEngagees;
        newEnagementDict[engagement._id] = response
        this.setState({ engagementEngagees:  newEnagementDict});
      })
    })
    //TODO Make this also sync checkins
  }

  fetchEngagementFile(){
    let token = localStorage.getItem('authToken');
    let authHeader = {Authorization: "Bearer " + token}
    let engagement = this.state.engagements.find((e) => e._id === this.state.downloadEngagementId);
    let fileName = this.state.event_name + " (" + (engagement === undefined ? "ERROR" : engagement.keyword) + ") Engagement Report.csv"
    axios({
          url: API_URL + "/api/engagements/" + this.state.downloadEngagementId + "/download",
          method: "GET",
          headers: authHeader,
          responseType: "blob" // important
      }).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
              "download",
              fileName
          );
          document.body.appendChild(link);
          link.click();
  
          // Clean up and remove the link
          link.parentNode.removeChild(link);
      });
  }

  fetchCheckInFile(){
    let token = localStorage.getItem('authToken');
    let authHeader = {Authorization: "Bearer " + token}
    let checkIn = this.state.checkins.find((c) => c._id === this.state.downloadCheckInId);
    let fileName = this.state.event_name + " (" + (checkIn === undefined ? "ERROR" : checkIn.name) + ") Check In Report.csv"
    axios({
          url: API_URL + "/api/checkin/" + this.state.downloadCheckInId + "/download",
          method: "GET",
          headers: authHeader,
          responseType: "blob" // important
      }).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
              "download",
              fileName
          );
          document.body.appendChild(link);
          link.click();
  
          // Clean up and remove the link
          link.parentNode.removeChild(link);
      });
  }

  responsiveCarousel = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3 // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1000, min: 464 },
      items: 2,
      slidesToSlide: 2 // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 1000, min: 0 },
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    }
  };

  render() {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 5 }}>
            <h1>{this.state.event_name}</h1>
            <div style={{ marginLeft: 5 }}>{this.state.event_desc}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', marginLeft: 'auto' }}>
            <Button
              toggle
              icon
              style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5 }}
              active={this.state.autoSync}
              onClick={() => this.toggleAutoSync()}
            >
              <Icon name='sync' />
            </Button>
            <Popup
              trigger={<Button icon='download' style={{height: 38, width: 38, marginTop: 'auto', marginBottom: 'auto'}}/>}
              on='click'
              content={
                <div>
                  <div>
                    <label>Engagement Download</label>  
                    <Dropdown
                        placeholder='Engagement'
                        selection
                        value={this.state.downloadEngagementId}
                        options={this.engagmentDownloadSelectionList()}
                        onChange={(e, { name, value }) => 
                          {
                            this.setState({downloadEngagementId: value});
                          }
                        }
                        style={{ margin: 10 }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 5, marginBottom: 5 }}>
                          <Button 
                              color='green' 
                              disabled={this.state.downloadEngagementId === ""}
                              onClick={() => this.fetchEngagementFile()}
                            >
                                Download
                            </Button>
                        </div>
                      </div>
                  </div>
                  <div>
                  <Divider/>
                  <label>Check In Download</label>  
                  <Dropdown
                    placeholder='Checkin'
                    selection
                    value={this.state.downloadCheckInId}
                    options={this.checkInDownloadSelectionList()}
                    onChange={(e, { name, value }) => 
                      {
                        this.setState({downloadCheckInId: value});
                      }
                    }
                    style={{ margin: 10 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 5, marginBottom: 5 }}>
                       <Button 
                          color='green' 
                          disabled={this.state.downloadCheckInId === ""}
                          onClick={() => this.fetchCheckInFile()}
                        >
                            Download
                        </Button>
                    </div>
                  </div>
                </div>    
               </div>            
              }
              basic
            />
            {
               this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
                <Button
                  icon='edit'
                  onClick={() => {
                    this.showEditEventModal();
                  }}
                  style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 1, marginRight: 5 }}
                />
              : ""
            }
          </div>
        </div>

        
        <Segment compact raised style={{marginLeft: 'auto', marginRight: 'auto'}}>
          <div style={{ display: 'flex', marginTop: 5 }}>
            <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Engagements</h2>
          </div>
          <Divider />
          {this.state.engagements.length === 0 ? <div><b>No Engagements have been created</b></div>: ""}
          <Card.Group centered style={{ margin: 5 }}>
            {
              this.state.engagements.map((element) => {
                return (
                  <Card 
                    onClick={() => 
                      {
                        if(this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit"))){
                          this.showEditEngagementModal(element)
                        }
                      }
                    }
                    key={"card_" + element._id} style={{ width: 'fit-content' }}
                  >
                    <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                      <Card.Header>
                        <div style={{ display: 'flex' }}>
                          {element.keyword}

                          {/*Visible Indicator*/}
                          {isLive(element) ?
                            <Popup
                              content="Engagement is Live"
                              position='top right'
                              trigger={<Icon name="eye" size='large' style={{ marginLeft: 'auto', marginRight: 5, marginTop: 'auto', marginBottom: 'auto', color: COLOR_CEDARVILLE_YELLOW }} />}
                            />
                            : ""}
                        </div>
                      </Card.Header>
                    </Card.Content>
                    <Card.Content>
                      <Card.Description style={{ whiteSpace: 'pre-line' }}>"{element.message}"</Card.Description>
                    </Card.Content>
                    {element.image_url !== "" ? <Card.Content style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                    {/*Display Image list in a scroll area*/}
                    <Grid style={{overflow: 'scroll', display: 'inline'}}>
                        <Grid.Row centered verticalAlign='middle'>
                        {
                            element.image_url.split("|").map((imageURL) => {
                                return (
                                    <Grid.Column width={5} key={"column_" + imageURL}>
                                        <AsyncImage src={imageURL} size='large'/>
                                    </Grid.Column>
                                )
                            })
                        }
                        </Grid.Row>
                    </Grid>
                    </Card.Content> : ""}
                    <Card.Content extra>
                      <div>
                        <Icon name="users" />
                        {this.state.engagementEngagees[element._id] === undefined ? 0 : this.state.engagementEngagees[element._id]}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Icon name="clock" />
                        {formatTime(element.start_time)}
                        {" - "}
                        {formatTime(element.end_time)}
                      </div>
                    </Card.Content>
                  </Card>
                );
              })
            }
          </Card.Group>
        </Segment>
        {/* Check In Cards */}
        <Segment compact raised style={{marginLeft: 'auto', marginRight: 'auto'}}>
          <div style={{ display: 'flex', marginTop: 5 }}>
            <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Checkins</h2>
          </div>
          <Divider />
          {this.state.checkins.length === 0 ? <div><b>No Checkins have been created</b></div>: ""}
          <Card.Group centered style={{ margin: 5 }}>
            {
              this.state.checkins.map((element) => {
                let cardBeaconNames = element.beacons.map((beacon, i) => {
                  return this.state.beaconNames[beacon] + (i < element.beacons.length - 1 ? ", ": "")
                })
                return (
                  <Card 
                    onClick={() => 
                      {
                        if(this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit"))){
                          this.showEditCheckinModal(element)
                        }
                      }
                    }
                    key={"card_" + element._id} style={{ width: 'fit-content' }}
                  >
                    <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                      <Card.Header>
                        <div style={{ display: 'flex' }}>
                          {element.name}

                          {/*Visible Indicator*/}
                          {isLive(element) ?
                            <Popup
                              content="Checkin is Live"
                              position='top right'
                              trigger={<Icon name="eye" size='large' style={{ marginLeft: 'auto', marginRight: 5, marginTop: 'auto', marginBottom: 'auto', color: COLOR_CEDARVILLE_YELLOW }} />}
                            />
                            : ""}
                        </div>
                      </Card.Header>
                    </Card.Content>
                    <Card.Content>
                      {
                        element.description !== "" ?
                            <div>
                              <Card.Description style={{color: 'black', marginBottom: 10}}>{element.description}</Card.Description>
                            </div>
                        : ""
                      }                   
                    
                      <Card.Description style={{fontWeight: 'bold', color: 'black'}}>Message (Public): </Card.Description>
                      <Card.Description style={{ whiteSpace: 'pre-line', marginLeft: 10 }}>"{element.message}"</Card.Description>
                    </Card.Content>
                    {element.image_url !== "" ? 
                      <Card.Content>
                        <AsyncImage src={element.image_url} size='medium'/>
                      </Card.Content>
                    : ""}
                    <Card.Content extra>
                      <div>
                        <Icon name="users" />
                        {this.state.checkinCounts[element._id] === undefined ? 0 : this.state.checkinCounts[element._id]}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Icon name="clock" />
                        {formatTime(element.start_time)}
                        {" - "}
                        {formatTime(element.end_time)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Icon name="bluetooth" />
                        {cardBeaconNames}
                      </div>
                    </Card.Content>
                  </Card>
                );
              })
            }
          </Card.Group>
        </Segment>
        {
          this.state.attractions.length !== 0 ?
            <Segment raised style={{marginLeft: 'auto', marginRight: 'auto', maxWidth: '80%'}}>
              <div style={{ display: 'flex', marginTop: 5 }}>
                <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Attractions</h2>
              </div>
              <Divider />
              <Carousel
                responsive={this.responsiveCarousel}
              >
              {
                this.state.attractions.map((element) => {
                  return (
                    <Card
                      style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 5, minHeight: 250}}
                      onClick={() => window.open("/attraction/" + element._id, "_self")}
                      key={"attraction_" + element.id}
                    >
                      <AsyncImage src={element.image_url} wrapped />
                      <Card.Content>
                        <Card.Header>
                          <div style={{ display: 'flex' }}>
                            {element.name}
                            {/*Visible Indicator*/}
                            {isLive(element) ?
                              <Popup
                                content="Attraction is Live"
                                trigger={<Icon name="eye" size='large' style={{ marginLeft: 'auto', marginRight: 5, marginTop: 'auto', marginBottom: 'auto', color: COLOR_CEDARVILLE_YELLOW }} />}
                              />
                              : ""}
                            {/*Hidden Indicator*/}
                            {element.hidden ?
                              <Popup
                                content="Attraction is Hidden"
                                trigger={<Icon name="eye slash" size='large' style={{ marginLeft: 'auto', marginRight: 5, marginTop: 'auto', marginBottom: 'auto' }} />}
                              />
                              : ""}
                          </div>
                        </Card.Header>
                        <Card.Description style={{ whiteSpace: 'pre-line' }}>{element.description}</Card.Description>
                      </Card.Content>
                      <Card.Content extra style={{color: 'black'}}>
                          {this.state.attractionCapacities[element._id] !== "-" ?
                            <div style={{ display: "flex" }}>
                              <Icon name='ticket' />
                              {this.state.attractionCapacities[element._id]}
                            </div>
                          : ""}
                          <div style={{ display: "flex", fontSize: 13}}>
                            <Icon name='clock' />
                            {formatTime(element.start_time)}
                            {" - "}
                            {formatTime(element.end_time)}
                          </div>
                          {/*Location Information*/}
                          {(element.location !== "" && element.location !== undefined && element.location !== "N/A") ?
                            <div style={{ display: "flex" }}>
                              <Icon name='map marker alternate' />
                              {element.location}
                            </div> 
                          : ""}
                          </Card.Content>
                    </Card>
                  );
                })
              }
              </Carousel>
            </Segment>
          : ""
        }
        {
          this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  icon labelPosition='left'
                  onClick={() => {
                    this.showAddEngagementModal();
                  }}
                  style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 5, backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                >
                  <Icon name='add' />
                  Add Engagement
                </Button>
                <Button
                  icon labelPosition='left'
                  onClick={() => {
                    this.showAddCheckinModal();
                  }}
                  style={{ marginTop: 10, marginBottom: 10, marginLeft: 5, marginRight: 5, backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                >
                  <Icon name='add' />
                  Add Checkin
                </Button>
                <Button
                  icon labelPosition='left'
                  onClick={() => {
                    this.showAddAttractionModal();
                  }}
                  style={{ marginTop: 10, marginBottom: 10, marginLeft: 5, marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                >
                  <Icon name='add' />
                  Add Attraction
                </Button>
              </div>
          : ""  
        }
        <AddEngagementModal ref={this.addEngagementModalRef} />
        <EditEngagementModal ref={this.editEngagementModalRef} />
        <EditEventModal ref={this.editEventModalRef} />
        <AddAttractionModal ref={this.addAttractionModalRef} />
        <AddCheckinModal ref={this.addCheckinModalRef} />
        <EditCheckinModal ref={this.editCheckinModalRef} />
      </div>
    );
  }
}