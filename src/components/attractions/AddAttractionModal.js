import React from "react";
import { Button, Modal, Input, Form, TextArea, Image, Dropdown } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import {formatTime, getEvents} from "../../utils"

class AddAttractionModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            eventId: "",
            eventList: [],
            name: "",
            description: "",
            about: "",
            imageURL: "",
            startTime: "",
            endTime: "",
            formStartTime: "",
            formEndTime: ""
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadEvents = this.loadEvents.bind(this);
    }

    componentDidMount() {
        this.loadEvents();
    }

    isSubmitValid() {
        if (this.state.eventId === "") {
            return false;
        }

        if (this.state.name === "") {
            return false;
        }

        if (this.state.description === "") {
            return false;
        }

        if (this.state.about === "") {
            return false;
        }

        if (this.state.imageURL === "") {
            return false;
        }

        if (this.state.formStartTime === "") {
            return false;
        }

        if (this.state.formEndTime === "") {
            return false;
        }

        return true;
    }

    handleSubmit() {

        if (!this.isSubmitValid()) {
            console.log("Invalid Form");
            return;
        }
        this.setState({ open: false });

        let values = { 
            event_id: this.state.eventId,
            name: this.state.name, 
            description: this.state.description, 
            about: this.state.about,
            image_url: this.state.imageURL
        };

        if (this.state.startTime !== this.state.formStartTime) {
            let newTime = this.state.formStartTime + ":00.000Z"
            let parsedDate = new Date(newTime);
            parsedDate.setHours(parsedDate.getHours() + 7); //Adjust timezone
            values['start_time'] = formatTime(parsedDate);
        }
        if (this.state.endTime !== this.state.formEndTime) {
            let newTime = this.state.formEndTime + ":00.000Z"
            let parsedDate = new Date(newTime);
            parsedDate.setHours(parsedDate.getHours() + 7); //Adjust timezone
            values['end_time'] = formatTime(parsedDate);
        }

        axios.post('https://api.cusmartevents.com/api/attractions/', values)
            .then(async response => {
                const data = await response.data;

                if (data.status !== "success") {
                    alert("Error");
                    console.log(data.message);
                } else {
                    window.location.reload();
                }
            })
            .catch(error => {
                alert("Error: " + error);
                console.log(error);
            });
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    dateString = v => {
        if (!v) return "";

        let parsedDate = new Date(v);
        parsedDate.setHours(parsedDate.getHours() - 8);//Adjust timezone

        return parsedDate.toISOString().slice(0, 16);
    };

    loadEvents() {
        getEvents()
        .then((events) => {
            this.setState({ eventList: events });
        });
    }

    handleChangeEvent = (e, { name, value }) => {
        this.setState({ eventId: value})
    }

    eventSelectionList() {
        let list = [];
        this.state.eventList.forEach((event) => {
            let selection = {
                key: event._id,
                text: event.name,
                value: event._id
            }
            list.push(selection);
        })
        return list;
    }

    render() {
        return (
            <Modal
                closeIcon
                size="large"
                onClose={() => this.setState({ open: false })}
                onOpen={() => this.setState({ open: true })}
                open={this.state.open}
            >
                <Modal.Header>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div>Create Attraction</div>
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field required>
                            <label>Event</label>
                            <Dropdown
                                placeholder='Select Event'
                                selection
                                value={this.state.eventId}
                                options={this.eventSelectionList()}
                                onChange={this.handleChangeEvent}
                                style={{marginTop: 5, marginBottom: 5}}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label>Name</label>
                            <Input
                                fluid
                                name='name'
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label>Description (Public)</label>
                            <TextArea
                                fluid
                                name='description'
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label>About (Dashboard)</label>
                            <Input
                                fluid
                                name='about'
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label>Image URL</label>
                            <Input
                                fluid
                                name='imageURL'
                                onChange={this.handleChange}
                                icon='image'
                                iconPosition='left'
                            />
                            <Image src={this.state.imageURL} size='medium' centered />
                        </Form.Field>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <TextField
                                    label="Start Time"
                                    type="datetime-local"
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name='formStartTime'
                                    onChange={(event) => {
                                        this.handleChange(event, { name: 'formStartTime', value: this.dateString(event.target.value) })
                                    }}
                                />
                            </Form.Field>
                            <Form.Field>
                                <TextField
                                    label="End Time"
                                    type="datetime-local"
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name='formEndTime'
                                    onChange={(event) => {
                                        this.handleChange(event, { name: 'formEndTime', value: this.dateString(event.target.value) })
                                    }}
                                />
                            </Form.Field>
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content="Create"
                        labelPosition='right'
                        icon='checkmark'
                        onClick={() => this.handleSubmit()}
                        disabled={!this.isSubmitValid()}
                        positive
                    />
                    <Button
                        content="Cancel"
                        labelPosition='right'
                        icon='close'
                        onClick={() => this.setState({ open: false })}
                        negative
                    />
                </Modal.Actions>
            </Modal>
        );
    }
}

export default AddAttractionModal;