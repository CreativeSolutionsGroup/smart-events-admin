import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Grid, Dropdown } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedDelete, authorizedPut, formatTime, clientId } from "../../utils"
import GooglePicker from "react-google-picker";

class EditCheckinModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            checkin_id: props.checkin_id === undefined ? "" : props.checkin_id,
            beacons: props.beacons === undefined ? [] : props.beacons,
            beacon_ids: props.beacon_ids === undefined ? [] : props.beacon_ids,
            name: props.name === undefined ? "" : props.name,
            description: props.description === undefined ? "" : props.description,
            message: props.message === undefined ? "" : props.message,
            imageURL: props.imageURL === undefined ? "" : props.imageURL,
            startTime: props.startTime === undefined ? "" : props.startTime,
            endTime: props.endTime === undefined ? "" : props.endTime,
            formBeaconIDs: props.beacon_ids === undefined ? [] : props.beacon_ids,
            formName: props.name === undefined ? "" : props.name,
            formDescription: props.description === undefined ? "" : props.description,
            formMessage: props.message === undefined ? "" : props.message,
            formImageURL: props.imageURL === undefined ? "" : props.imageURL,
            formStartTime: props.startTime === undefined ? "" : props.startTime,
            formEndTime: props.endTime === undefined ? "" : props.endTime,
            open: false,
            openDelete: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.checkin_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/checkin/' + this.state.checkin_id)
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

    //List of beacons 
    beaconKeywordSelectionList() {
        let list = [];
        this.state.beacons.forEach((beacon) => {
            let selection = {
                key: beacon._id,
                text: beacon.name,
                value: beacon._id
            }
            list.push(selection);
        })
        return list;
    }

    isSubmitValid() {
        if (this.state.checkin_id === "") {
            return false;
        }

        let changed = false;
        if (this.state.beacon_ids !== this.state.formBeaconIDs) {
            changed = true;
            if (this.state.formBeaconIDs.length === 0) {
                return false;
            }
        }

        if (this.state.name !== this.state.formName) {
            changed = true;
            if (this.state.formName === "") {
                return false;
            }
        }

        if (this.state.message !== this.state.formMessage) {
            changed = true;
            if (this.state.formMessage === "") {
                return false;
            }
        }

        if (this.state.description !== this.state.formDescription) {
            changed = true;
        }

        if (this.state.imageURL !== this.state.formImageURL) {
            changed = true;
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

        if (this.state.beacon_ids !== this.state.formBeaconIDs) {
            values['beacons'] = this.state.formBeaconIDs;
        }

        if (this.state.name !== this.state.formName) {
            values['name'] = this.state.formName;
        }

        if (this.state.message !== this.state.formMessage) {
            values['message'] = this.state.formMessage;
        }

        if (this.state.description !== this.state.formDescription) {
            values['description'] = this.state.formDescription;
        }

        if (this.state.imageURL !== this.state.formImageURL) {
            values['image_url'] = this.state.formImageURL;
        }

        if(this.state.startTime !== this.state.formStartTime){
            let newTime = this.state.formStartTime
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['start_time'] = formatTime(utc);
        }
        if(this.state.endTime !== this.state.formEndTime){
            let newTime = this.state.formEndTime
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['end_time'] = formatTime(utc);
        }

        if (Object.keys(values).length > 0) {
            authorizedPut(axios, API_URL + '/api/checkin/' + this.state.checkin_id, values)
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

        let parsedDate = new Date(v);
        let utc = new Date(parsedDate.getTime() - (parsedDate.getTimezoneOffset() * 60000) * 2);
        return utc.toISOString().slice(0, 16);
    };

    dateString = v => {
        if (!v) return "";

        let parsedDate = new Date(v);
        return parsedDate.toISOString().slice(0, 16);
    };

    googleDriveImageURL(data){
        const driveImageURL = 'http://drive.google.com/uc?export=view&id=';
        if(data.docs !== undefined){
            let finalString = '';
            for(let i = 0; i < data.docs.length; i++){
                let doc = data.docs[i];
                let docId = doc.id;
                if(docId !== undefined){
                    finalString += i > 0 ? ("|"+ driveImageURL + docId) : (driveImageURL + docId);
                }
            }
            if(finalString !== undefined){
                this.setState({formImageURL: finalString})
            }
        }
    }

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
                                <div>Edit Check In</div>
                                <div>{this.state.checkin_id}</div>
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
                            <Form.Field>
                                <label>Description (Private)</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.description}
                                    name='formDescription'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Message (Public)</label>
                                <TextArea 
                                    defaultValue={this.state.message}
                                    name='formMessage'
                                    onChange={this.handleChange}
                                 />
                            </Form.Field>
                            <Form.Field required>
                                <label>Beacon(s)</label>
                                <Dropdown
                                    placeholder='Select Beacon(s)'
                                    clearable
                                    selection
                                    multiple
                                    search
                                    value={this.state.formBeaconIDs}
                                    options={this.beaconKeywordSelectionList()}
                                    onChange={this.handleChange}
                                    name="formBeaconIDs"
                                    style={{marginTop: 5, marginBottom: 5}}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div style={{display: 'flex', marginRight: 0, width: '100%'}}>
                                    <div style={{width: '100%'}}>
                                        <label>Image URL</label>
                                        <Input
                                            name='formImageURL'
                                            value={this.state.formImageURL}
                                            onChange={this.handleChange}
                                            icon='image'
                                            iconPosition='left'
                                        />
                                    </div>
                                    <GooglePicker 
                                        clientId={clientId}
                                        developerKey={'AIzaSyBwjEWiq9VGOgHdMcjDTJGNyQWHGaLg3gg'}
                                        scope={['https://www.googleapis.com/auth/drive.readonly']}
                                        onChange={data => this.googleDriveImageURL(data)}
                                        onAuthFailed={data => console.log('on auth failed:', data)}
                                        navHidden={true}
                                        authImmediate={false}
                                        multiselect={true}
                                        mimeTypes={['image/png', 'image/jpeg', 'image/jpg']}
                                        viewId={'FOLDERS'}>
                                            <Button 
                                                icon
                                                style={{marginTop: 20, marginLeft: 2}}
                                            >
                                                <Icon name='google drive' />
                                            </Button>
                                    </GooglePicker>
                                </div>
                                {this.state.formImageURL !== "" ? <Image src={this.state.formImageURL} size='medium' style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}/> : ""}
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
                        Do you want to delete the '{this.state.keyword}' Checkin?
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

export default EditCheckinModal;