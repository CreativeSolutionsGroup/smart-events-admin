import React, { createRef } from "react";
import { Card, Icon, Button, Dropdown, Popup, Segment, Grid, Divider, Checkbox } from "semantic-ui-react";
import AddEngagementModal from "./AddEngagementModal";
import EditEngagementModal from "./EditEngagementModal";
import EditEventModal from "./EditEventModal"
import AddAttractionModal from "../attractions/AddAttractionModal"
import AddGiveawayModal from "./AddGiveawayModal"
import EditGiveawayModal from "./EditGiveawayModal"
import { getEventEngagements, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, isLive, formatTime, authorizedFetch, API_URL, getEngagementEngagees, getEngagementUniqueEngagees, getAttractions, getAllAttractionCapacities, getUserPermissions, getEventGiveaways, getGiveawayEntires } from "../../utils";
import { CSVLink } from "react-csv";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import AsyncImage from "../AsyncImage";

export default class EventInfo extends React.Component {
  addEngagementModalRef = createRef();
  editEngagementModalRef = createRef();
  editEventModalRef = createRef();
  addAttractionModalRef = createRef();
  addGiveawayModalRef = createRef();
  editGiveawayModalRef = createRef();

  intervalID;

  constructor(props) {
    super(props);

    this.event_id = props.event_id;

    this.state = {
      event_name: "",
      event_desc: "",
      engagements: [],
      engagementEngagees: {},
      allEngagementEngagees: {},
      downloadEngagementId: "",
      downloadAllEngagees: false,
      downloadCSV: [],
      attractions: [],
      attractionCapacities: {},
      giveways: [],
      giveawayEngagees: {},
      autoSync: false
    }

    this.getEventName = this.getEventName.bind(this);
    this.loadEngagements = this.loadEngagements.bind(this);
    this.loadAttractions = this.loadAttractions.bind(this);
    this.loadGiveaways = this.loadGiveaways.bind(this);

    this.showAddEngagementModal = this.showAddEngagementModal.bind(this);
    this.showEditEngagementModal = this.showEditEngagementModal.bind(this);
    this.showEditEventModal = this.showEditEventModal.bind(this);
    this.showAddAttractionModal = this.showAddAttractionModal.bind(this);
    this.showAddGiveawayModal = this.showAddGiveawayModal.bind(this);
    this.showEditGiveawayModal = this.showEditGiveawayModal.bind(this);
  }

  componentDidMount() {
    this.getEventName();
    this.loadEngagements();
    this.loadAttractions();
    this.loadGiveaways();

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

  handleChangeDownload = (e, { name, value }) => {
    let keyword = "";
    this.state.engagements.forEach((engagement) => {
      if(engagement._id === value){
        keyword = engagement.keyword;
      }
    })

    let downloadName = this.state.event_name + " (" + keyword + ").csv"
    this.setState({ downloadEngagementId: value, downloadName: downloadName })
    this.updateCSVData(value);
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

  showAddGiveawayModal() {
    this.addGiveawayModalRef.current.setState({
      eventId: this.event_id,
      message: "",
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

  showEditGiveawayModal(giveaway) {
    this.editGiveawayModalRef.current.setState({
      giveawayId: giveaway._id,
      message: giveaway.message,
      formMessage: giveaway.message,
      startTime: giveaway.start_time,
      formStartTime: giveaway.start_time,
      endTime: giveaway.end_time,
      formEndTime: giveaway.end_time,
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
        getEngagementUniqueEngagees(engagement._id)
        .then((response) => {
          let newEnagementDict = this.state.engagementEngagees;
          newEnagementDict[engagement._id] = response
          this.setState({ engagementEngagees:  newEnagementDict});
        })
        getEngagementEngagees(engagement._id)
        .then((response) => {
          let newEnagementDict = this.state.allEngagementEngagees;
          newEnagementDict[engagement._id] = response
          this.setState({ allEngagementEngagees:  newEnagementDict});
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

  loadGiveaways() {
    getEventGiveaways(this.event_id)
    .then((filteredGiveaways) => {
      this.setState({ giveways: filteredGiveaways });
      filteredGiveaways.forEach((giveaway) => {
        getGiveawayEntires(giveaway._id)
        .then((response) => {
          let newEnagementDict = this.state.giveawayEngagees;
          newEnagementDict[giveaway._id] = response
          this.setState({ giveawayEngagees:  newEnagementDict});
        })
      })
    });
  }

  updateCSVData(engagementId) {
    let data = [];
    data.push(["Message Received", "Phone"])
    if(this.state.downloadAllEngagees){
      this.state.allEngagementEngagees[engagementId].forEach((element) => {
        data.push([element.message_received, element.phone]);
      })
    } else {
      this.state.engagementEngagees[engagementId].forEach((element) => {
        data.push([element.message_received, element.phone]);
      })
    }
    this.setState({ downloadCSV: data })
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
      getEngagementUniqueEngagees(engagement._id)
      .then((response) => {
        let newEnagementDict = this.state.engagementEngagees;
        newEnagementDict[engagement._id] = response
        this.setState({ engagementEngagees:  newEnagementDict});
      })
      getEngagementEngagees(engagement._id)
      .then((response) => {
        let newEnagementDict = this.state.allEngagementEngagees;
        newEnagementDict[engagement._id] = response
        this.setState({ allEngagementEngagees:  newEnagementDict});
      })
    })
    this.state.giveways.forEach((giveaway) => {
      getGiveawayEntires(giveaway._id)
      .then((response) => {
        let newEnagementDict = this.state.giveawayEngagees;
        newEnagementDict[giveaway._id] = response
        this.setState({ giveawayEngagees:  newEnagementDict});
      })
    })
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
                   <Dropdown
                      placeholder='Engagement'
                      selection
                      value={this.state.downloadEngagementId}
                      options={this.engagmentDownloadSelectionList()}
                      onChange={this.handleChangeDownload}
                      style={{ margin: 10 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Checkbox 
                        label='Include Duplicate Entries'
                        onChange={(e, { checked }) => {
                          this.updateCSVData(this.state.downloadEngagementId);
                          this.setState((prevState) => ({ downloadAllEngagees: !prevState.downloadAllEngagees }))
                        }}
                        checked={this.state.downloadAllEngagees}
                        style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 5}}
                        disabled={this.state.downloadEngagementId === undefined || this.state.downloadEngagementId === ""}
                      />
                      <div style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 5, marginBottom: 5 }}>
                        <CSVLink
                          data={this.state.downloadCSV}
                          filename={this.state.downloadName}
                          target="_blank"
                          onClick={event => {
                            if (this.state.downloadEngagementId === "") {
                              return false;
                            }
                          }}
                        >
                          <Button color='green' disabled={this.state.downloadEngagementId === ""}>Download</Button>
                        </CSVLink>
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
                        {this.state.engagementEngagees[element._id] === undefined ? 0 : this.state.engagementEngagees[element._id].length}
                        {" "}
                        ({this.state.allEngagementEngagees[element._id] === undefined ? 0 : this.state.allEngagementEngagees[element._id].length})
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

        {/* Giveaway Cards */}
        {
          this.state.giveways.length !== 0 ?
            <Segment compact raised style={{marginLeft: 'auto', marginRight: 'auto'}}>
              <div style={{ display: 'flex', marginTop: 5 }}>
                <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Giveaways</h2>
              </div>
              <Divider />
              <Card.Group centered style={{ margin: 5 }}>
              {
                this.state.giveways.map((element) => {
                  return (
                    <Card 
                      onClick={() => 
                        {
                          if(this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit"))){
                            this.showEditGiveawayModal(element)
                          }
                        }
                      }
                      key={"card_" + element._id} style={{ width: 'fit-content' }}
                    >
                      <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                        <Card.Header>
                          <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 'auto', marginBottom: 'auto', marginRight: 5 }}>
                              <Icon name="clock" />
                              {formatTime(element.start_time)}
                              {" - "}
                              {formatTime(element.end_time)}
                            </div>
                            {/*Visible Indicator*/}
                            {isLive(element) ?
                              <Popup
                                content="Giveaway is Live"
                                position='top right'
                                trigger={<Icon name="eye" size='large' style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 'auto', marginBottom: 'auto', color: COLOR_CEDARVILLE_YELLOW }} />}
                              />
                              : ""}
                          </div>
                        </Card.Header>
                      </Card.Content>

                      <Card.Content>
                        <Card.Description style={{ whiteSpace: 'pre-line' }}>"{element.message}"</Card.Description>
                      </Card.Content>
                      
                      <Card.Content extra>
                        <div>
                          <Icon name="users" />
                          {this.state.giveawayEngagees[element._id] === undefined ? 0 : this.state.giveawayEngagees[element._id].length}
                        </div>
                      </Card.Content>
                    </Card>
                  );
                })
              }
            </Card.Group>
            </Segment>
          : ""
        }

        {/* Attraction Cards */}
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
                    this.showAddAttractionModal();
                  }}
                  style={{ marginTop: 10, marginBottom: 10, marginLeft: 5, marginRight: 5, backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                >
                  <Icon name='add' />
                  Add Attraction
                </Button>
                <Button
                  icon labelPosition='left'
                  onClick={() => {
                    this.showAddGiveawayModal();
                  }}
                  style={{ marginTop: 10, marginBottom: 10, marginLeft: 5, marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                >
                  <Icon name='add' />
                  Add Giveaway
                </Button>
              </div>
          : ""  
        }
        <AddEngagementModal ref={this.addEngagementModalRef} />
        <EditEngagementModal ref={this.editEngagementModalRef} />
        <EditEventModal ref={this.editEventModalRef} />
        <AddAttractionModal ref={this.addAttractionModalRef} />
        <AddGiveawayModal ref={this.addGiveawayModalRef} />
        <EditGiveawayModal ref={this.editGiveawayModalRef} />
      </div>
    );
  }
}