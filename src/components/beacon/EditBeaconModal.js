import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Grid, Dropdown } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedDelete, authorizedPut, formatTime, clientId } from "../../utils"
import GooglePicker from "react-google-picker";
import { FormGroup } from "@material-ui/core";

class EditBeaconModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            beacon_id: props.beacon_id === undefined ? "" : props.beacon_id,
            name: props.name === undefined ? "" : props.name,
            identifier: props.identifier === undefined ? "" : props.identifier,
            uuid: props.uuid === undefined ? "" : props.uuid,
            formName: props.name === undefined ? "" : props.name,
            formUUID: props.uuid === undefined ? "" : props.uuid,
            formIdentifier: props.identifier === undefined ? "" : props.identifier,
            open: false,
            openDelete: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.beacon_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/beacon/' + this.state.beacon_id)
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
        if (this.state.beacon_id === "") {
            return false;
        }

        let changed = false;

        if (this.state.name !== this.state.formName) {
            changed = true;
            if (this.state.formName === "") {
                return false;
            }
        }

        if (this.state.uuid !== this.state.formUUID) {
            changed = true;
            if (this.state.formUUID === "") {
                return false;
            }
        }

        if (this.state.identifier !== this.state.formIdentifier) {
            changed = true;
            if (this.state.formIdentifier === "") {
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

        if (this.state.identifier !== this.state.formIdentifier) {
            values['identifier'] = this.state.formIdentifier;
        }

        if (this.state.uuid !== this.state.formUUID) {
            values['uuid'] = this.state.formUUID;
        }

        if (Object.keys(values).length > 0) {
            authorizedPut(axios, API_URL + '/api/beacon/' + this.state.beacon_id, values)
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
                                <div>Edit Beacon</div>
                                <div>{this.state.beacon_id}</div>
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
                                <label>Identifier</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.identifier}
                                    name='formIdentifier'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>UUID</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.uuid}
                                    name='formUUID'
                                    onChange={this.handleChange}
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

export default EditBeaconModal;