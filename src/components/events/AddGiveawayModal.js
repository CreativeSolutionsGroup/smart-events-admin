import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Grid} from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedPost, formatTime, clientId } from "../../utils"

class AddGiveawayModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            eventId: props.eventId === undefined ? "" : props.eventId,
            message: props.message === undefined ? "" : props.message,
            startTime: props.startTime === undefined ? "" : props.startTime,
            endTime: props.endTime === undefined ? "" : props.endTime,
            password: props.password === undefined ? "" : props.password,
            open: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    isSubmitValid() {
        if (this.state.eventId === "") {
            return false;
        }

        if (this.state.message === "") {
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
            message: this.state.message
        }

        if(this.state.startTime !== this.state.formStartTime){
            let newTime = this.state.formStartTime
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['start_time'] = utc.toISOString();
        }
        if(this.state.endTime !== this.state.formEndTime){
            let newTime = this.state.formEndTime
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['end_time'] = utc.toISOString();
        }

        authorizedPost(axios, API_URL + '/api/giveaway/', values)
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
        return parsedDate.toISOString().slice(0, 16);
    };

    render() {
        return (
            <div>
                <Modal
                    closeIcon
                    size="large"
                    onClose={() => this.setState({ open: false })}
                    onOpen={() => this.setState({ open: true })}
                    open={this.state.open}
                >
                    <Modal.Header>
                        Create Giveaway
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field required>
                                <label>Message</label>
                                <TextArea 
                                    defaultValue={this.state.message}
                                    name='message'
                                    onChange={this.handleChange}
                                 />
                                 {this.state.message === undefined ? 0 : this.state.message.length} / 160
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
                                            this.handleChange(event, {name: 'formStartTime', value: this.dateString(event.target.value)})
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
                                            this.handleChange(event, {name: 'formEndTime', value: this.dateString(event.target.value)})
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
            </div>
        );
    }
}

export default AddGiveawayModal;