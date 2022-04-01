import React, { createRef } from "react";
import { Icon, Card, Button, Divider } from "semantic-ui-react";
import { getUserPermissions, getAllBeacons, COLOR_CEDARVILLE_YELLOW, COLOR_CEDARVILLE_BLUE } from "../../utils";
import AddBeaconModal from "./AddBeaconModal";
import EditBeaconModal from "./EditBeaconModal";

export default class BeaconManager extends React.Component {
    addBeaconModalRef = createRef();
    editBeaconModalRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            beacons: []
        }

        this.loadBeacons = this.loadBeacons.bind(this);

        this.showAddBeaconModal = this.showAddBeaconModal.bind(this);
        this.showEditBeaconModal = this.showEditBeaconModal.bind(this);       
    }

    componentDidMount() {
        this.loadBeacons();
        getUserPermissions(localStorage.getItem("email")).then(response => {
            this.setState({ permissions: response });
        })
    }

    showAddBeaconModal() {
        this.addBeaconModalRef.current.setState({
            name: "",
            uuid: "",
            open: true
        });
    }

    showEditBeaconModal(beacon) {
        this.editBeaconModalRef.current.setState({
            beacon_id: beacon._id,
            name: beacon.name,
            formName: beacon.name,
            uuid: beacon.uuid,
            formUUID: beacon.uuid,
            open: true
        });
    }

    loadBeacons() {
        getAllBeacons()
            .then((res) => {
                this.setState({ beacons: res });
            })
    }

    clickBeacon(beacon) {
        this.showEditBeaconModal(beacon);
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
                <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Beacons</h2>
                <Divider />

                <Card.Group style={{ margin: 5 }} centered>
                    {
                        this.state.beacons.map((beacon) => {
                            return (
                                <Card
                                    key={beacon._id}
                                    onClick={() => this.clickBeacon(beacon)}
                                >
                                    <Card.Content style={{ backgroundColor: COLOR_CEDARVILLE_BLUE, color: 'black' }}>
                                        <Card.Header>{beacon.name}</Card.Header>
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
                                                UUID:
                                            </div>
                                            <div
                                                style={{color: 'black', marginBottom: 5}}
                                            >
                                                {beacon.uuid}
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
                                    this.showAddBeaconModal();
                                }}
                                style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                            >
                                <Icon name='add' />
                                Add Beacon
                            </Button>
                        </div>
                        : ""
                }
                <AddBeaconModal ref={this.addBeaconModalRef} />
                <EditBeaconModal ref={this.editBeaconModalRef} />
            </div>
        );
    }
}