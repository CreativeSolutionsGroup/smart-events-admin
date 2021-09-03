import React, { Component } from 'react'
import QrReader from 'react-qr-reader'
import { Modal, Icon, Button, Image, Grid, Accordion, AccordionContent, AccordionTitle, Divider } from 'semantic-ui-react'
import axios from "axios";
import smart_events_logo from "../images/smart-events-logo.png";
import VQ_QR_CODE from "../images/vq-cusmartevents-com.png"

export default class Scanner extends Component {

    state = {
        scannerOn: true,
        result: 'No result',
        isScanning: false,
        popupOpen: false,
        popupIcon: "",
        popupText: "",
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        showTapHint: true,
        linkModalVisible: false,
        tickInfoModalOpen: false,
        attractionNames: {},
        slotInfo: {},
        selectedTicketAttractions: []
    }

    serverAddress = 'https://api.cusmartevents.com'

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        this.getSlotInfo();
    }

    handleResize = (e) => {
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
    };

    componentWillUnmount() {
        window.addEventListener("resize", this.handleResize);
    }

    handleScan = data => {
        if (data) {
            if (this.state.isScanning) {
                this.ticketPopup(data);
                this.setState({
                    result: data,
                    isScanning: false
                })
            }
        }
    }
    handleError = err => {
        console.error(err)
    }

    ticketPopup(qrData) {
        if (this.state.showTapHint) {
            this.setState({ showTapHint: false })
        }
        //Make sure it is a valid ticket string
        if (/^[0-9a-fA-F]{24}$/.test("" + qrData)) {
            console.log("Valid QR")
            fetch(this.serverAddress + "/api/tickets/" + qrData)
                .then((res) => res.json())
                .then((res) => {
                    if (res.status === "success") {

                        if (res.data === null) {
                            this.startPopup("invalid");
                        }
                        else {
                            if (res.data.scanned) {
                                this.startPopup("rescan");
                            } else {
                                this.scanTicket(qrData);
                            }
                        }
                    }
                });
        } else {
            this.startPopup("invalid");
        }
    }

    scanTicket(ticketId) {
        let values = { scanned: true }
        axios.put(this.serverAddress + '/api/tickets/' + ticketId, values)
            .then(async response => {
                const data = await response.data;

                if (data.status !== "success") {
                    alert("Error: " + data.message);
                    console.log(data.message);
                } else {
                    this.startPopup("scanned");
                }
            })
            .catch(error => {
                alert("Error: " + error);
                console.log(error);
            });
    }

    startPopup(type) {
        let text = "";
        let icon = "";
        if (type === "invalid") {
            text = "Invalid Ticket";
            icon = "ban"
        }
        else if (type === "scanned") {
            text = "Scanned Ticket";
            icon = "check"
        }
        else if (type === "rescan") {
            text = "Already scanned";
            icon = "redo"
        }
        this.setState({ popupOpen: true, popupText: text, popupIcon: icon })
        setTimeout(() => this.setState({ popupOpen: false, popupText: "", popupIcon: "" }), 1500)
    }


    showLinks() {
        this.setState({ linkModalVisible: true })
    }

    showTicketInfo() {
        this.setState({ tickInfoModalOpen: true })
    }

    getSlotInfo() {

        //Get Attraction Names
        fetch('https://api.cusmartevents.com/api/attractions/')
            .then((res) => res.json())
            .then(
                (res) => {
                    if (res.status !== "success") {
                        console.log("Failed to retrieve Attractions");
                        console.log(res.message);
                        alert("Error (Attractions): " + res.message);
                        this.setState({ attractionNames: {} });
                    }
                    else {
                        let attractions = {}
                        res.data.forEach((attraction) => {
                            attractions[attraction._id] = attraction.name;
                        })
                        this.setState({ attractionNames: attractions })
                    }
                },
                (err) => {
                    console.error("Failed to retrieve Attractions");
                    console.error(err);
                    this.setState({ attractionNames: {} });
                }
            );

        //Get Slot Info
        fetch('https://api.cusmartevents.com/api/slots/')
            .then((res) => res.json())
            .then(
                (res) => {
                    if (res.status !== "success") {
                        console.log("Failed to retrieve Slots");
                        console.log(res.message);
                        alert("Error (Slots): " + res.message);
                        this.setState({ slotInfo: {} });
                    }
                    else {
                        let slots = {}
                        //Sort by time 
                        let sortedSlots = res.data.sort((a, b) => {
                            return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
                        });
                        sortedSlots.forEach(async (slot) => {
                            //Get tickets for slot
                            let tickets = await fetch('https://api.cusmartevents.com/api/slots/' + slot._id + "/tickets").then(res => res.json()).then(res => res.data);
                            let ticketCount = tickets.length;
                            //Get scanned ticket amount
                            let scannedTickets = tickets.filter((ticket) => ticket.scanned === true).length;
                            let slotList = slots[slot.attraction_id] === undefined ? [] : slots[slot.attraction_id];
                            slotList.push({ name: slot.label, time: slot.hide_time, ticketCount: ticketCount, scannedTickets: scannedTickets, capacity: slot.ticket_capacity });
                            slots[slot.attraction_id] = slotList;
                            this.setState({ slotInfo: slots });
                        })
                    }
                },
                (err) => {
                    console.error("Failed to retrieve Slots");
                    console.error(err);
                    this.setState({ slotInfo: {} });
                }
            );
    }

    displayTime(time) {
        let date = new Date(Date.parse(time));
        let hour = date.getHours();
        let min = date.getMinutes();
        return (hour % 12) + ":" + (min < 10 ? "0" + min : min) + " " + (hour > 11 ? "PM" : "AM");
    }

    buildTicketAccordionPanels() {
        let sortedKeys = Object.keys(this.state.slotInfo).sort();
        return sortedKeys.map((key) => {
            let slot = this.state.slotInfo[key];
            return (
                <div>
                    <AccordionTitle
                        active={this.state.selectedTicketAttractions.includes(key)}
                        onClick={() => {
                            let newSelectionList = this.state.selectedTicketAttractions;
                            let index = this.state.selectedTicketAttractions.indexOf(key);
                            if (index !== -1) {
                                newSelectionList.splice(index, 1);
                            } else {
                                newSelectionList.push(key);
                            }
                            this.setState({ selectedTicketAttractions: newSelectionList });
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Icon name='dropdown' style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                            <h2 style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                {this.state.attractionNames[key] == undefined ? "UNKNOWN ATTRACTION" : this.state.attractionNames[key]}
                            </h2>
                        </div>
                    </AccordionTitle>
                    <AccordionContent
                        active={this.state.selectedTicketAttractions.includes(key)}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Divider />
                            {
                                slot.map(element => {
                                    return (
                                        <div>
                                            <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5, marginBottom: 5 }}>

                                                <div style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto', marginRight: 'auto' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <h3 style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 0 }}>{element.name}</h3>
                                                        <h3 style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 0 }}>{
                                                            this.displayTime(element.time)
                                                        }</h3>
                                                    </div>
                                                </div>
                                                <div style={{ marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto', marginRight: 'auto' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Icon name='ticket' size='large' style={{ marginLeft: 'auto', marginRight: 'auto' }} />
                                                        <h3 style={{ marginTop: 5 }}>{element.ticketCount}/{element.capacity}</h3>
                                                    </div>
                                                </div>
                                                <div style={{ marginLeft: 'auto', marginTop: 'auto', marginBottom: 'auto', marginRight: 20 }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Icon name='qrcode' size='large' style={{ marginLeft: 'auto', marginRight: 'auto' }} />
                                                        <h3 style={{ marginTop: 5, marginBottom: 0 }}>{(element.scannedTickets) + "/" + element.ticketCount}</h3>
                                                        <h3 style={{ marginTop: 0, marginLeft: 'auto', marginRight: 'auto' }}>{"(" + (element.ticketCount - element.scannedTickets) + ")"}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <Divider />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </AccordionContent>
                </div>
            )
        })
    }

    buildTicketAccordion() {
        return (
            <Accordion
                styled
                fluid
            >
                {
                    this.buildTicketAccordionPanels()
                }
            </Accordion>

        );
    }

    render() {

        const { windowWidth, windowHeight } = this.state;

        //Resize to fit square in middle of screen
        let scannerSize = windowHeight < windowWidth ? windowHeight : windowWidth;

        return (
            <div>

                {/*Top Header*/}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                        <div style={{ width: "90%" }}>
                            <Image src={smart_events_logo} size='medium' centered />
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Icon name='ticket' size='big' style={{ marginLeft: 'auto' }}></Icon>
                                <h3 style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 'auto' }}>Ticket Scanner</h3>
                            </div>
                        </div>
                    </div>
                </div>
               
                {/*QR Scanner*/}
                <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: (scannerSize), height: (scannerSize),
                    display: 'flex', flexDirection: 'column'
                }}>
                    {this.state.scannerOn ? <div style={{ margin: 20 }}
                        onClick={() => this.setState({ isScanning: true })}
                    >
                        <QrReader
                            delay={300}
                            onError={this.handleError}
                            onScan={this.handleScan}
                        />
                    </div> : ""}
                    {this.state.scannerOn && this.state.showTapHint ? <div style={{ marginLeft: 'auto', marginRight: 'auto' }}><h2>Tap to Scan Ticket</h2></div> : ""}
                    {!this.state.scannerOn ?
                        <div style={{ margin: 'auto' }}>
                            <Icon name='qrcode' size='massive'></Icon>
                            <h2>Scanner is off</h2>
                        </div> :
                        ""}
                </div>

                {/*Bottom button array*/}
                <div style={{ display: 'flex', width: '100%', position: 'absolute', bottom: 50 }}>
                    <Grid style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                        <Grid.Row columns={3}>
                            <Grid.Column style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                                <Button
                                    circular
                                    onClick={() => {
                                        this.showTicketInfo();
                                    }}
                                    size="massive"
                                    icon
                                >
                                    <Icon name="ticket" />
                                </Button>
                            </Grid.Column>
                            <Grid.Column style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                                <Button
                                    toggle
                                    circular
                                    active={this.state.scannerOn}
                                    onClick={() => {
                                        //Toggle scanner
                                        let newValue = !this.state.scannerOn;
                                        this.setState({ scannerOn: newValue })
                                    }}
                                    size="massive"
                                    icon
                                >
                                    <Icon name="power" />
                                </Button>
                            </Grid.Column>
                            <Grid.Column style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                                <Button
                                    circular
                                    onClick={() => {
                                        this.showLinks();
                                    }}
                                    size="massive"
                                    icon
                                >
                                    <Icon name="linkify" />
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>

                {/*Scan event popup for info on QR Code*/}
                <Modal
                    open={this.state.popupOpen}
                >
                    <Modal.Content>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Icon
                                name={this.state.popupIcon}
                                size='massive'
                                style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
                            />
                            <h1 style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                                {this.state.popupText}
                            </h1>
                        </div>
                    </Modal.Content>
                </Modal>
                {/*Popup for sharing VQ Link*/}
                <Modal
                    open={this.state.linkModalVisible}
                    onClose={() => this.setState({ linkModalVisible: false })}
                    closeIcon
                >
                    <Modal.Content>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginLeft: 'auto', marginRight: 'auto' }}><h1>Virtual Queues Link</h1></div>
                            <Image src={VQ_QR_CODE} />
                        </div>
                    </Modal.Content>
                </Modal>
                {/*Popup for slot ticket info*/}
                <Modal
                    open={this.state.tickInfoModalOpen}
                    onClose={() => this.setState({ tickInfoModalOpen: false })}
                    closeIcon
                >
                    <Modal.Content>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {this.buildTicketAccordion()}
                            <Button
                                icon labelPosition='right'
                                onClick={() => {
                                    this.getSlotInfo();
                                }}
                                style={{ marginTop: 10, marginLeft: 'auto', marginRight: 'auto' }}
                            >
                                <Icon name='refresh' />
                                Refresh
                            </Button>
                        </div>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}