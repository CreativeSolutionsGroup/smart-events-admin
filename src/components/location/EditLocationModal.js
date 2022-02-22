import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Grid, Dropdown } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedDelete, authorizedPut, formatTime, clientId } from "../../utils"
import GooglePicker from "react-google-picker";
import { FormGroup } from "@material-ui/core";

class EditLocationModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            location_id: props.location_id === undefined ? "" : props.location_id,
            name: props.name === undefined ? "" : props.name,
            latitude: props.latitude === undefined ? 0.0 : props.latitude,
            longitude: props.longitude === undefined ? 0.0 : props.longitude,
            radius: props.radius === undefined ? 0 : props.radius,
            formName: props.name === undefined ? "" : props.name,
            formLatitude: props.latitude === undefined ? 0.0 : props.latitude,
            formLongitude: props.longitude === undefined ? 0.0 : props.longitude,
            formRadius: props.radius === undefined ? 0.0 : props.radius,
            open: false,
            openDelete: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.location_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/location/' + this.state.location_id)
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
        if (this.state.location_id === "") {
            return false;
        }

        let changed = false;

        if (this.state.name !== this.state.formName) {
            changed = true;
            if (this.state.formName === "") {
                return false;
            }
        }

        if (this.state.latitude !== this.state.formLatitude) {
            changed = true;
            if (this.state.formLatitude === 0.0) {
                return false;
            }
        }

        if (this.state.longitude !== this.state.formLongitude) {
            changed = true;
            if (this.state.formLongitude === 0.0) {
                return false;
            }
        }

        if (this.state.radius !== this.state.formRadius) {
            changed = true;
            if (this.state.formRadius === undefined || this.state.formRadius === "" || parseInt(this.state.formRadius) < 50) {
                return false;
            }
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

        if (this.state.name !== this.state.formName) {
            values['name'] = this.state.formName;
        }

        if (this.state.latitude !== this.state.formLatitude) {
            values['latitude'] = this.state.formLatitude;
        }

        if (this.state.longitude !== this.state.formLongitude) {
            values['longitude'] = this.state.formLongitude;
        }

        if (this.state.radius !== this.state.formRadius) {
            values['radius'] = this.state.formRadius;
        }

        if (Object.keys(values).length > 0) {
            authorizedPut(axios, API_URL + '/api/location/' + this.state.location_id, values)
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
                                <div>Edit Location</div>
                                <div>{this.state.location_id}</div>
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
                            <Form.Group widths='equal'>
                                <Form.Field required>
                                    <label>Latitude</label>
                                    <Input
                                        defaultValue={this.state.latitude}
                                        name='formLatitude'
                                        onChange={this.handleChange}
                                    />
                                </Form.Field>
                                <Form.Field required>
                                    <label>Longitude</label>
                                    <Input
                                        defaultValue={this.state.longitude}
                                        name='formLongitude'
                                        onChange={this.handleChange}
                                    />
                                </Form.Field>
                                <Form.Field required>
                                    <label>Radius</label>
                                    <Input
                                        defaultValue={this.state.radius}
                                        name='formRadius'
                                        onChange={this.handleChange}
                                        type="number"
                                    />
                                    <div style={{color: 'red'}}>{this.state.formRadius === undefined || this.state.formRadius === "" || parseInt(this.state.formRadius) < 50 ? "Radius must be 50m or more" : ""}</div>
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
                        Do you want to delete '{this.state.name}'?
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

export default EditLocationModal;