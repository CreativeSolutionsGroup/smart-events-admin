import React, { createRef } from "react";
import { Card, Image, Icon, Button, Dropdown, Popup, Divider, Grid } from "semantic-ui-react";
import Giveaway from "./Giveaway";
import AddEngagementModal from "./AddEngagementModal";
import EditEngagementModal from "./EditEngagementModal";
import EditEventModal from "./EditEventModal"
import { getEventEngagements, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, isLive, formatTime, authorizedFetch, API_URL, getEngagementEngagees } from "../../utils";
import { CSVLink } from "react-csv";

export default class EventInfo extends React.Component {
  addEngagementModalRef = createRef();
  editEngagementModalRef = createRef();
  editEventModalRef = createRef();

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
      downloadCSV: [],
      autoSync: false
    }

    this.getEventName = this.getEventName.bind(this);
    this.loadEngagements = this.loadEngagements.bind(this);
    this.showAddEngagementModal = this.showAddEngagementModal.bind(this);
    this.showEditEngagementModal = this.showEditEngagementModal.bind(this);
    this.showEditEventModal = this.showEditEventModal.bind(this);
  }

  componentDidMount() {
    this.getEventName();
    this.loadEngagements();
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
        getEngagementEngagees(engagement._id)
        .then((response) => {
          let newEnagementDict = this.state.engagementEngagees;
          newEnagementDict[engagement._id] = response
          this.setState({ engagementEngagees:  newEnagementDict});
        })
      })
    });
  }

  updateCSVData(engagementId) {
    let data = [];
    data.push(["Message Received", "Phone"])
    this.state.engagementEngagees[engagementId].forEach((element) => {
      data.push([element.message_received, element.phone]);
    })
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
      getEngagementEngagees(engagement._id)
      .then((response) => {
        let newEnagementDict = this.state.engagementEngagees;
        newEnagementDict[engagement._id] = response
        this.setState({ engagementEngagees:  newEnagementDict});
      })
    })
  }

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
            <Dropdown
              icon='download'
              floating
              button
              className='icon'
              style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5 }}
            >
              <Dropdown.Menu direction='left'>
                <Dropdown
                  placeholder='Engagement'
                  selection
                  value={this.state.downloadEngagementId}
                  options={this.engagmentDownloadSelectionList()}
                  onChange={this.handleChangeDownload}
                  style={{ margin: 10 }}
                />
                <div style={{ display: 'flex' }}>
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
              </Dropdown.Menu>
            </Dropdown>
            <Button
              icon='edit'
              onClick={() => {
                this.showEditEventModal();
              }}
              style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 5 }}>
          <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Engagements</h2>
        </div>
        <Divider />
        <Card.Group centered style={{ margin: 5 }}>
          {
            this.state.engagements.map((element) => {
              return (
                <Card onClick={() => this.showEditEngagementModal(element)} key={"card_" + element._id} style={{ width: 'fit-content' }}>
                  <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE }}>
                    <Card.Header>
                      <div style={{ display: 'flex' }}>
                        {element.keyword}
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
                  <Grid style={{overflow: 'scroll', display: 'inline'}}>
                      <Grid.Row centered verticalAlign='middle'>
                      {
                          element.image_url.split("|").map((imageURL) => {
                              return (
                                  <Grid.Column width={5}>
                                      <Image src={imageURL} size='small'/>
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
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            icon labelPosition='left'
            onClick={() => {
              this.showAddEngagementModal();
            }}
            style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
          >
            <Icon name='add' />
            Add Engagement
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Giveaway eventId={this.event_id} showPicker={false} />
        </div>
        <AddEngagementModal ref={this.addEngagementModalRef} />
        <EditEngagementModal ref={this.editEngagementModalRef} />
        <EditEventModal ref={this.editEventModalRef} />
      </div>
    );
  }
}