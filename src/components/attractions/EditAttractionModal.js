import React from "react";
import { Button, Modal, Input, Form, TextArea, Image } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import {API_URL, authorizedDelete, authorizedPut, formatTime} from "../../utils"

class EditAttractionModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            attractionId: props.attractionId === undefined ? "" : props.attractionId,
            name: props.name === undefined ? "" : props.name,
            description: props.description === undefined ? "" : props.description,
            about: props.about === undefined ? "" : props.about,
            imageURL: props.imageURL === undefined ? "" : props.imageURL,
            startTime: props.startTime === undefined ? "" : props.startTime,
            endTime: props.endTime === undefined ? "" : props.endTime,
            formName: props.name === undefined ? "" : props.name,
            formDescription: props.description === undefined ? "" : props.description,
            formAbout: props.about === undefined ? "" : props.about,
            formImageURL: props.imageURL === undefined ? "" : props.imageURL,
            formStartTime: props.startTime === undefined ? "" : props.startTime,
            formEndTime: props.endTime === undefined ? "" : props.endTime
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.eventId === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/attractions/' + this.state.attractionId)
            .then(async response => {
                const data = await response.data;

                if (data.status !== "success") {
                    alert("Error");
                    console.log(data.message);
                } else {
                    window.open("/dashboard/", "_self")
                }
            })
            .catch(error => {
                alert("Error: " + error);
                console.log(error);
            });
    }

    isSubmitValid() {
        if (this.state.attractionId === "") {
            return false;
        }

        let changed = false;
        if (this.state.name !== this.state.formName) {
            changed = true;
            if (this.state.formName === "") {
                return false;
            }
        }

        if (this.state.description !== this.state.formDescription) {
            changed = true;
            if (this.state.formDescription === "") {
                return false;
            }
        }

        if (this.state.about !== this.state.formAbout) {
            changed = true;
            if (this.state.formAbout === "") {
                return false;
            }
        }

        if (this.state.imageURL !== this.state.formImageURL) {
            changed = true;
            if (this.state.formImageURL === "") {
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

        let values = { 
            name: this.state.formName, 
            description: this.state.formDescription, 
            about: this.state.formAbout,
            image_url: this.state.formImageURL
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

        authorizedPut(axios, API_URL + '/api/attractions/' + this.state.attractionId, values)
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
                                <div>Edit Attraction</div>
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
                                <label>Name</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.name}
                                    name='formName'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Description (Public)</label>
                                <TextArea
                                    fluid
                                    defaultValue={this.state.description}
                                    name='formDescription'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>About (Dashboard)</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.about}
                                    name='formAbout'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Image URL</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.imageURL}
                                    name='formImageURL'
                                    onChange={this.handleChange}
                                    icon='image'
                                    iconPosition='left'
                                />
                                <Image src={this.state.formImageURL} size='medium' centered />
                            </Form.Field>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <TextField
                                        label="Start Time"
                                        type="datetime-local"
                                        required
                                        defaultValue={this.dateString(this.state.startTime.slice(0, 16))}
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
                                        defaultValue={this.dateString(this.state.endTime.slice(0, 16))}
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
                <Modal
                    size="small"
                    onClose={() => this.setState({ openDelete: false })}
                    onOpen={() => this.setState({ openDelete: true })}
                    open={this.state.openDelete}
                >
                    <Modal.Header>Delete</Modal.Header>
                    <Modal.Content>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <div>Do you want to delete '{this.state.name}'?</div>
                        </div>
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

export default EditAttractionModal;