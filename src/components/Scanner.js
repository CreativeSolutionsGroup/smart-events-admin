import React, { Component } from 'react'
import QrReader from 'react-qr-reader'
import { Modal, Icon, Button, Image } from 'semantic-ui-react'
import axios from "axios";
import smart_events_logo from "../images/smart-events-logo.png";
import { COLOR_CEDARVILLE_YELLOW } from "../utils"

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
        showTapHint: true
    }

    serverAddress = 'https://api.cusmartevents.com'

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
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


    render() {

        const { windowWidth, windowHeight } = this.state;

        let scannerSize = windowHeight < windowWidth ? windowHeight : windowWidth;

        return (
            <div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                        <div style={{ width: "90%" }}>
                            <Image src={smart_events_logo} centered />
                            <div style={{ display: 'flex', flexDirection: 'row', color: { COLOR_CEDARVILLE_YELLOW } }}>
                                <Icon name='ticket' size='big' style={{ marginLeft: 'auto' }}></Icon>
                                <h3 style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 'auto' }}>Ticket Scanner</h3>
                            </div>
                        </div>
                    </div>
                </div>
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

                <div style={{ display: 'flex', width: '100%', position: 'absolute', bottom: 50 }}>
                    <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                        <Button
                            toggle
                            circular
                            active={this.state.scannerOn}
                            onClick={() => {
                                let newValue = !this.state.scannerOn;
                                this.setState({ scannerOn: newValue })
                            }}
                            size="massive"
                            icon
                        >
                            <Icon name="power" />
                        </Button>
                    </div>
                </div>

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
            </div>
        )
    }
}