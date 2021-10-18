import React, { createRef } from "react";
import { Icon, Card, Button, Image, Popup } from "semantic-ui-react";
import { getAttractions, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, getEvent, formatTime, isLive, getAllAttractionCapacities } from "../../utils";
import AddAttractionModal from "./AddAttractionModal";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default class AttractionList extends React.Component {
  addAttractionModalRef = createRef();

  constructor(props) {
    super(props);

    this.state = {
      eventNames: {},
      attractions: {},
      attractionCapacities: {},
      windowWidth: window.innerWidth,
      addModalOpen: false,
      editModalOpen: false,
      editAttraction: null
    }

    this.loadAttractions = this.loadAttractions.bind(this);
    this.showAddAttractionModal = this.showAddAttractionModal.bind(this);
  }

  componentDidMount() {
    this.loadAttractions();
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

  loadAttractions() {
    getAttractions()
      .then((attractions) => {

        let attractionDict = {}
        let newEventNames = this.state.eventNames;
        attractions.forEach((attraction) => {
          let event_id = attraction.event_id;
          
          if(newEventNames[event_id] === undefined){
            getEvent(event_id)
            .then((res) => {
              newEventNames[event_id] = res.name;
              this.setState({ eventNames: newEventNames })
            })
          }
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
          let attractionList = attractionDict[event_id] === undefined ? [] : attractionDict[event_id];
          attractionList.push(attractionValue);
          attractionDict[event_id] = attractionList;
        });

        this.setState({ attractions: attractionDict, eventNames: newEventNames });
        this.loadAttractionCapacities(attractionDict)
      });
  }

  loadAttractionCapacities(attractionDict) {
    let keys = Object.keys(attractionDict);
    let allAttractions = [];
    keys.forEach((event) => {
      let attractions = attractionDict[event];
      attractions.forEach(attraction => {
        allAttractions.push(attraction);
      })
    })

    getAllAttractionCapacities(allAttractions)
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

  clickAttraction(element) {
    window.open("/attraction/" + element._id, "_self")
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
      <div style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
        {
          Object.entries(this.state.attractions)
            .map(([event_id, attraction]) => {
              return (
                <Card key={"event_" + event_id} fluid style={{minHeight: 250}}>
                  <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                    <Card.Header style={{minHeight: 20}}>{this.state.eventNames[event_id]}</Card.Header>
                  </Card.Content>
                  <Card.Content>
                    <Carousel
                      responsive={this.responsiveCarousel}
                    >
                      {
                        attraction.map((element) => {
                          return (
                            <Card
                              style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 5, minHeight: 250}}
                              onClick={() => window.open("/attraction/" + element._id, "_self")}
                              key={"attraction_" + element.id}
                            >
                              <Image src={element.image_url} wrapped />
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
                                {this.state.attractionCapacities[element._id] !== "-" ?
                                  <div style={{ display: "flex" }}>
                                    <Icon name='ticket' />
                                    {this.state.attractionCapacities[element._id]}
                                  </div>
                                : ""}
                                <div style={{ display: "flex" }}>
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
                    </Carousel >
                  </Card.Content>
                </Card>
              );
            })
        }
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            icon labelPosition='left'
            onClick={() => {
              this.showAddAttractionModal();
            }}
            style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
          >
            <Icon name='add' />
            Add Attraction
          </Button>
        </div>
        <AddAttractionModal ref={this.addAttractionModalRef} />
      </div>
    );
  }
}