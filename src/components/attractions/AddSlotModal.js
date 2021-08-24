import React from "react";
import { Button, Modal, Input, Form } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { formatTime } from "../../utils"

class AddSlotModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            attractionId: props.attractionId === undefined ? "" : props.attractionId,
            label: props.label === undefined ? "" : props.label,
            capacity: props.capacity === undefined ? "" : props.capacity,
            hideTime: props.hideTime === undefined ? "" : props.hideTime,
            formHideTime: props.formHideTime === undefined ? "" : props.formHideTime,
            open: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    isSubmitValid() {
        if (this.state.attractionId === "") {
            return false;
        }

        if (this.state.label === "") {
            return false;
        }

        if (this.state.capacity === "") {
            return false;
        }

        if (this.state.formHideTime === "") {
            return false;
        }

        return true;
    }

    dateString = v => {
        if (!v) return "";

        let parsedDate = new Date(v);
        parsedDate.setHours(parsedDate.getHours() - 8);//Adjust timezone

        return parsedDate.toISOString().slice(0, 16);
    };

    handleSubmit() {

        if (!this.isSubmitValid()) {
            console.log("Invalid Form");
            return;
        }
        this.setState({ open: false });

        let values = { attraction_id: this.state.attractionId, label: this.state.label, ticket_capacity: this.state.capacity };

        if (this.state.hideTime !== this.state.formHideTime) {
            let newTime = this.state.formHideTime + ":00.000Z"
            let parsedDate = new Date(newTime);
            parsedDate.setHours(parsedDate.getHours() + 7); //Adjust timezone
            values['hide_time'] = formatTime(parsedDate);
        }

        axios.post('https://api.cusmartevents.com/api/slots/', values)
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
                    Create Slot
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field required>
                            <label>Label</label>
                            <Input
                                fluid
                                defaultValue={this.state.label}
                                name='label'
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label>Ticket Capacity</label>
                            <Input
                                fluid
                                type="number"
                                defaultValue={this.state.capacity}
                                name='capacity'
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <TextField
                                label="Hide Time"
                                type="datetime-local"
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                name='formHideTime'
                                onChange={(event) => {
                                    this.handleChange(event, { name: 'formHideTime', value: this.dateString(event.target.value) })
                                }}
                            />
                        </Form.Field>
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

export default AddSlotModal;