import React, { createRef } from "react";
import { Icon, Card, Button, Divider } from "semantic-ui-react";
import { getUserPermissions, getAllLocations, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE } from "../../utils";
import AddLocationModal from "./AddLocationModal";

export default class LocationManager extends React.Component {
    addLocationModalRef = createRef();
    editLocationModalRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            locations: [],
            selectedCoords: null
        }

        this.loadLocations = this.loadLocations.bind(this);

        this.showAddLocationModal = this.showAddLocationModal.bind(this);
        this.showEditLocationModal = this.showEditLocationModal.bind(this);       
    }

    componentDidMount() {
        this.loadLocations();
        getUserPermissions(localStorage.getItem("email")).then(response => {
            this.setState({ permissions: response });
        })
    }

    showAddLocationModal() {
        this.addLocationModalRef.current.setState({
            name: "",
            latitude: 0.0,
            longitude: 0.0,
            radius: 50,
            open: true
        });
    }

    showEditLocationModal(location) {
        this.editLocationModalRef.current.setState({
            location_id: location._id,
            name: location.name,
            coordiantes: {latitude: location.latitude, longitude: location.longitude},
            range: location.radius,
            formName: location.name,
            formCoordiantes: {latitude: location.latitude, longitude: location.longitude},
            formRadius: location.radius,
            open: true
        });
    }

    loadLocations() {
        getAllLocations()
            .then((res) => {
                this.setState({ locations: res });
            })
    }

    clickLocation(location) {
        this.showEditLocationModal(location);
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
                <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Locations</h2>
                <Divider />

                <Card.Group style={{ margin: 5 }} centered>
                    {
                        this.state.locations.map((location) => {
                            return (
                                <Card
                                    key={location._id}
                                    onClick={() => this.clickLocation(location)}
                                >
                                    <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE, color: 'black' }}>
                                        <Card.Header>{location.name}</Card.Header>
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
                                                Lat: {location.latitude}
                                            </div>
                                            <div
                                                style={{color: 'black', fontWeight: 'bold', marginTop: 5, marginBottom: 5}}
                                            >
                                                Long: {location.longitude}
                                            </div>
                                            <div
                                                style={{color: 'black', fontWeight: 'bold', marginTop: 5, marginBottom: 5}}
                                            >
                                                Radius: {location.radius}m
                                            </div>
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
                                    this.showAddLocationModal();
                                }}
                                style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                            >
                                <Icon name='add' />
                                Add Location
                            </Button>
                        </div>
                        : ""
                }
                <AddLocationModal ref={this.addLocationModalRef} />
                {/* <EditRewardModal ref={this.editLocationModalRef} /> */}
            </div>
        );
    }
}