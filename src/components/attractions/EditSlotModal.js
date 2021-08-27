import React from "react";
import { Button, Modal, Input, Form } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedDelete, formatTime } from "../../utils"

class EditSlotModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            slotId: props.slotId === undefined ? "" : props.slotId,
            label: props.label === undefined ? "" : props.label,
            formLabel: props.formLabel === undefined ? "" : props.formLabel,
            capacity: props.capacity === undefined ? "" : props.capacity,
            formCapacity: props.formCapacity === undefined ? "" : props.formCapacity,
            hideTime: props.hideTime === undefined ? "" : props.hideTime,
            formHideTime: props.formHideTime === undefined ? "" : props.formHideTime,
            open: false,
            openDelete: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.slotId === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/slots/' + this.state.slotId)
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

    isSubmitValid() {
        if (this.state.slotId === "") {
            return false;
        }

        let changed = false;
        if (this.state.label !== this.state.formLabel) {
            changed = true;
            if (this.state.formLabel === "") {
                return false;
            }
        }

        if (this.state.capacity !== this.state.formCapacity) {
            changed = true;
            if (this.state.formCapacity === "") {
                return false;
            }
        }

        if (this.state.hideTime !== this.state.formHideTime) {
            changed = true;
            if (this.state.formHideTime === "") {
                return false;
            }
        }

        return changed;
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

        let values = { label: this.state.formLabel, ticket_capacity: this.state.formCapacity };

        if (this.state.hideTime !== this.state.formHideTime) {
            let newTime = this.state.formHideTime + ":00.000Z"
            let parsedDate = new Date(newTime);
            parsedDate.setHours(parsedDate.getHours() + 7); //Adjust timezone
            values['hide_time'] = formatTime(parsedDate);
        }

        axios.put(API_URL + '/api/slots/' + this.state.slotId, values)
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
            <div>
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
                                <div>Edit Slot</div>
                            </div>
                            <Button
                                icon='trash'
                                style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5 }}
                                onClick={() => {
                                    this.setState({ openDelete: true })
                                }}
                            />
                        </div>
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field required>
                                <label>Label</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.label}
                                    name='formLabel'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Ticket Capacity</label>
                                <Input
                                    fluid
                                    type="number"
                                    defaultValue={this.state.capacity}
                                    name='formCapacity'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <TextField
                                    label="Hide Time"
                                    type="datetime-local"
                                    required
                                    defaultValue={this.dateString(this.state.hideTime.slice(0, 16))}
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
                            content="Save"
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
                <Modal
                    size="small"
                    onClose={() => this.setState({ openDelete: false })}
                    onOpen={() => this.setState({ openDelete: true })}
                    open={this.state.openDelete}
                >
                    <Modal.Header>Delete</Modal.Header>
                    <Modal.Content>
                        Do you want to delete '{this.state.label}'?
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            content="Delete"
                            labelPosition='right'
                            icon='trash'
                            onClick={() => this.handleDelete()}
                            negative
                        />
                        <Button
                            content="Cancel"
                            labelPosition='right'
                            icon='close'
                            onClick={() => this.setState({ openDelete: false })}
                        />
                    </Modal.Actions>
                </Modal>
        </div>
        );
    }
}

export default EditSlotModal;