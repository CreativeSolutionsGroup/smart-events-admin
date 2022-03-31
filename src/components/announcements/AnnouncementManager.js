import React, { createRef } from "react";
import { Icon, Card, Button, Divider, Popup} from "semantic-ui-react";
import { getUserPermissions, getAllAnnouncements, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE, getAllLocations, getAnnouncementSentCount, getAnnouncementReadCount, formatTime, isTimeLive } from "../../utils";
import AsyncImage from "../AsyncImage";
import AddAnnouncementModal from "./AddAnnouncementModal";
import EditAnnouncementModal from "./EditAnnouncementModal";
//import EditAnnouncementModal from "./EditAnnouncementModal";

export default class AnnouncementManager extends React.Component {
    addAnnouncementModalRef = createRef();
    editAnnouncementModalRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            announcements: [],
            announcementCounts: {},
            announcementReadCounts: {},
            locationNames: {},
            selectedCoords: null
        }

        this.loadAnnouncements = this.loadAnnouncements.bind(this);

        this.showAddAnnouncementModal = this.showAddAnnouncementModal.bind(this);
        this.showEditAnnouncementModal = this.showEditAnnouncementModal.bind(this);       
    }

    componentDidMount() {
        this.loadAnnouncements();
        this.loadLocationNames();
        getUserPermissions(localStorage.getItem("email")).then(response => {
            this.setState({ permissions: response });
        })
    }

    loadLocationNames() {
        getAllLocations()
            .then(data => {
                data.forEach((location) => {
                    let newNames = this.state.locationNames;
                    newNames[location._id] = location.name
                    this.setState({ locationNames: newNames });
                })
            })
    }

    async showAddAnnouncementModal() {
        let locationList = await getAllLocations();
        this.addAnnouncementModalRef.current.setState({
            name: "",
            title: "",
            message: "",
            image_url: "",
            send_time: "",
            gps_start_time: "",
            gps_end_time: "",
            gps_locations: [],
            location_list: locationList,
            open: true
        });
    }

    async showEditAnnouncementModal(announcement) {
        let locationList = await getAllLocations();
        this.editAnnouncementModalRef.current.setState({
            announcement_id: announcement._id,
            name: announcement.name,
            form_name: announcement.name,
            title: announcement.title,
            form_title: announcement.title,
            message: announcement.message,
            form_message: announcement.message,
            image_url: announcement.image_url,
            form_image_url: announcement.image_url,
            send_time: announcement.send_time,
            form_send_time: announcement.send_time,
            gps_start_time: announcement.gps_start_time,
            form_gps_start_time: announcement.gps_start_time,
            gps_end_time: announcement.gps_end_time,
            form_gps_end_time: announcement.gps_end_time,
            gps_locations: announcement.gps_locations,
            form_gps_locations: announcement.gps_locations,
            location_list: locationList,
            open: true
        });
    }

    async loadAnnouncements() {
        getAllAnnouncements()
            .then(async (res) => {
                this.setState({ announcements: res });

                let announcementCounts = {}
                let announcementReadCounts = {}
                await Promise.all(res.map(async (announcement) => {
                    let count = await getAnnouncementSentCount(announcement._id);
                    let read_count = await getAnnouncementReadCount(announcement._id);
                    announcementCounts[announcement._id] = count;
                    announcementReadCounts[announcement._id] = read_count;
                }))
                this.setState({announcementCounts: announcementCounts, announcementReadCounts: announcementReadCounts});
            })
        
        
    }

    clickAnnouncement(announcement) {
        this.showEditAnnouncementModal(announcement);
    }

    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: 50
                }}
            >
                <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Announcements</h2>
                <Divider />

                <Card.Group style={{ margin: 5 }} centered>
                    {
                        this.state.announcements.map((announcement) => {
                            let locationNames = announcement.gps_locations.map((location, i) => {
                                return this.state.locationNames[location] + (i < announcement.gps_locations.length - 1 ? ", ": "")
                            })
                            let isLive = false;
                            if(announcement.gps_start_time !== "" && announcement.gps_end_time !== ""){
                                isLive = isTimeLive(announcement.gps_start_time, announcement.gps_end_time);
                            }
                            return (
                                <Card
                                    key={announcement._id}
                                    onClick={() => this.clickAnnouncement(announcement)}
                                    style={{
                                        marginTop: 'auto',
                                        marginBottom: 'auto'
                                    }}
                                >
                                    <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE, color: 'black' }}>
                                        <Card.Header>
                                            <div style={{display: 'flex'}}>
                                                {announcement.name}
                                                {
                                                    announcement.gps_locations !== undefined && announcement.gps_locations.length > 0 ?
                                                        <Popup
                                                            content="GPS Announcement"
                                                            position='top right'
                                                            trigger={
                                                                <Icon name="map marker alternate" size='large' style={{ marginLeft: 'auto', marginRight: 0, marginTop: 'auto', marginBottom: 'auto', color: isLive ? COLOR_CEDARVILLE_YELLOW : 'black' }} />
                                                            }
                                                        />
                                                    : ""
                                                }
                                                {
                                                    announcement.send_time !== undefined && announcement.send_time !== "" ?
                                                        <Popup
                                                            content="Scheduled Announcement"
                                                            position='top right'
                                                            trigger={
                                                                <Icon name="clock" size='large' style={{ marginLeft: 'auto', marginRight: 0, marginTop: 'auto', marginBottom: 'auto', color: isLive ? COLOR_CEDARVILLE_YELLOW : 'black' }} />
                                                            }
                                                        />
                                                    : ""
                                                }
                                            </div>
                                        </Card.Header>
                                    </Card.Content>
                                    <Card.Content>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <div
                                                style={{color: 'black', fontWeight: 'bold', marginTop: 5, marginBottom: 5}}
                                            >
                                                {announcement.title}
                                            </div>
                                            <div
                                                style={{color: 'black', marginTop: 5, marginBottom: 5, whiteSpace: 'pre-line'}}
                                            >
                                                {announcement.message}
                                            </div>     
                                            {
                                                announcement.image_url !== undefined && announcement.image_url !== "" ?
                                                    <div
                                                        style={{
                                                            marginLeft: 'auto',
                                                            marginRight: 'auto',
                                                            marginTop: 5
                                                        }}
                                                    >
                                                        <AsyncImage src={announcement.image_url} size='medium'/>
                                                    </div>
                                                : ""
                                            }                                       
                                        </div>
                                    </Card.Content>
                                    <Card.Content>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {
                                                announcement.send_time !== undefined && announcement.send_time !== "" ?
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            color: 'black'
                                                        }}
                                                    >
                                                        <div style={{fontWeight: 'bold'}}><Icon name='clock'/>Scheduled For:</div>
                                                        <div>
                                                            {formatTime(announcement.send_time)}
                                                        </div>
                                                    </div>
                                                : ""
                                            }
                                            {
                                               announcement.gps_locations !== undefined && announcement.gps_locations.length > 0 ?
                                                   <div
                                                       style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            marginTop: 10,
                                                            color: 'black'
                                                       }}
                                                   >
                                                       <div style={{fontWeight: 'bold'}}><Icon name='map marker alternate'/>Location(s):</div>
                                                       <div>                                                            
                                                            {locationNames}
                                                       </div>
                                                   </div>
                                               : ""
                                            }
                                            {
                                                announcement.gps_start_time !== undefined && announcement.gps_start_time !== "" ?
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            marginTop: 5,
                                                            color: 'black'
                                                        }}
                                                    >
                                                        <div style={{fontWeight: 'bold'}}><Icon name='clock'/>Start Time:</div> 
                                                        <div>
                                                            {formatTime(announcement.gps_start_time)}
                                                        </div>
                                                    </div>
                                                : ""
                                            }
                                            {
                                                announcement.gps_end_time !== undefined && announcement.gps_end_time !== "" ?
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            marginTop: 5,
                                                            color: 'black'
                                                        }}
                                                    >
                                                        <div style={{fontWeight: 'bold'}}><Icon name='clock'/>End Time:</div>  
                                                        <div>
                                                            {formatTime(announcement.gps_end_time)}
                                                        </div>
                                                    </div>
                                                : ""
                                            }
                                        </div>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div
                                            style={{
                                                display: 'flex'
                                            }}
                                        >
                                            <Popup
                                                content="Read/Sent Announcements"
                                                position='bottom left'
                                                trigger={
                                                    <div style={{
                                                        display: 'flex',
                                                        marginRight: 'auto'
                                                    }}>
                                                        <Icon name="envelope open" />
                                                        {this.state.announcementReadCounts[announcement._id]}
                                                        <Icon name="inbox" style={{ marginLeft: 10 }} />
                                                        {this.state.announcementCounts[announcement._id]}
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </Card.Content>
                                </Card>
                            );
                        })
                    }
                </Card.Group>
                <Divider />
                {
                    this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Button
                                icon labelPosition='left'
                                onClick={() => {
                                    this.showAddAnnouncementModal();
                                }}
                                style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                            >
                                <Icon name='add' />
                                Add Announcement
                            </Button>
                        </div>
                        : ""
                }
                <AddAnnouncementModal ref={this.addAnnouncementModalRef} />
                <EditAnnouncementModal ref={this.editAnnouncementModalRef} />
            </div>
        );
    }
}