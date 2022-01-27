import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Grid } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedDelete, authorizedPut, formatTime, clientId } from "../../utils"
import GooglePicker from "react-google-picker";

class EditGiveawayModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            giveawayId: props.giveawayId === undefined ? "" : props.giveawayId,
            message: props.message === undefined ? "" : props.message,
            startTime: props.startTime === undefined ? "" : props.startTime,
            endTime: props.endTime === undefined ? "" : props.endTime,
            formMessage: props.message === undefined ? "" : props.message,
            formStartTime: props.startTime === undefined ? "" : props.startTime,
            formEndTime: props.endTime === undefined ? "" : props.endTime,
            open: false,
            openDelete: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.giveawayId === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/giveaway/' + this.state.giveawayId)
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
        if (this.state.giveawayId === "") {
            return false;
        }

        let changed = false;

        if (this.state.message !== this.state.formMessage) {
            changed = true;
            if (this.state.formMessage === "") {
                return false;
            }
        }

        if (this.state.startTime !== this.state.formStartTime) {
            changed = true;
            if (this.state.formStartTime === "") {
                return false;
            }
        }

        if (this.state.endTime !== this.state.formEndTime) {
            changed = true;
            if (this.state.formEndTime === "") {
                return false;
            }
            //TODO check if date is less than start
        }

        return changed;
    }

    handleSubmit() {

        if (!this.isSubmitValid()) {
            console.log("Invalid Form");
            return;
        }
        this.setState({ open: false });

        let values = {}

        if (this.state.message !== this.state.formMessage) {
            values['message'] = this.state.formMessage;
        }

        if (this.state.imageURL !== this.state.formImageURL) {
            values['image_url'] = this.state.formImageURL;
        }

        if (this.state.startTime !== this.state.formStartTime) {
            let newTime = this.state.formStartTime
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['start_time'] = utc.toISOString();
        }
        if (this.state.endTime !== this.state.formEndTime) {
            let newTime = this.state.formEndTime
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['end_time'] = utc.toISOString();
        }

        if (Object.keys(values).length > 0) {
            authorizedPut(axios, API_URL + '/api/giveaway/' + this.state.giveawayId, values)
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
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    convertDate = v => {
        if (!v) return "";

        console.log(v);
        let parsedDate = new Date(v);
        let utc = new Date(parsedDate.getTime() - (parsedDate.getTimezoneOffset() * 60000) * 2);
        console.log(utc)
        console.log(utc.toISOString())
        return utc.toISOString().slice(0, 16);
    };

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
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div>Edit Giveaway</div>
                                <div>{this.state.giveawayId}</div>
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
                                <label>Message</label>
                                <TextArea 
                                    defaultValue={this.state.message}
                                    name='formMessage'
                                    onChange={this.handleChange}
                                 />
                            </Form.Field>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <TextField
                                        label="Start Time"
                                        type="datetime-local"
                                        required
                                        defaultValue={this.convertDate(this.state.startTime.slice(0, 16))}
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
                                        defaultValue={this.convertDate(this.state.endTime.slice(0, 16))}
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
                
                {/*Delete Modal*/}
                <Modal
                    size="small"
                    onClose={() => this.setState({ openDelete: false })}
                    onOpen={() => this.setState({ openDelete: true })}
                    open={this.state.openDelete}
                >
                    <Modal.Header>Delete</Modal.Header>
                    <Modal.Content>
                        Do you want to delete this Giveaway?
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

export default EditGiveawayModal;