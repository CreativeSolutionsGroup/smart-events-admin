import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Dropdown} from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedPost, formatTime, clientId } from "../../utils"
import GooglePicker from 'react-google-picker';

class AddCheckinModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            eventId: props.eventId === undefined ? "" : props.eventId,
            locations: props.locations === undefined ? [] : props.locations,
            location_ids: props.location_ids === undefined ? [] : props.location_ids,
            name: props.name === undefined ? "" : props.name,
            description: props.description === undefined ? "" : props.description,
            message: props.message === undefined ? "" : props.message,
            imageURL: props.imageURL === undefined ? "" : props.imageURL,
            startTime: props.startTime === undefined ? "" : props.startTime,
            endTime: props.endTime === undefined ? "" : props.endTime,
            formStartTime: props.startTime === undefined ? "" : props.startTime,
            formEndTime: props.endTime === undefined ? "" : props.endTime,
            open: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //List of locations 
    locationKeywordSelectionList() {
        let list = [];
        this.state.locations.forEach((location) => {
            let selection = {
                key: location._id,
                text: location.name,
                value: location._id
            }
            list.push(selection);
        })
        return list;
    }

    isSubmitValid() {
        if (this.state.eventId === "") {
            return false;
        }

        if (this.state.location_ids.length === 0) {
            return false;
        }

        if (this.state.name === "") {
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

        console.log(this.state.location_ids)

        let values = {
            event_id: this.state.eventId,
            locations: this.state.location_ids,
            name: this.state.name,
            message: this.state.message,
            description: this.state.description,
            image_url: this.state.imageURL
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

        authorizedPost(axios, API_URL + '/api/checkin/', values)
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

    //Fix the list of images to use the public image URL for each image
    googleDriveImageURL(data){
        const driveImageURL = 'http://drive.google.com/uc?export=view&id=';
        if(data.docs !== undefined){
            let finalString = '';
            for(let i = 0; i < data.docs.length; i++){
                let doc = data.docs[i];
                let docId = doc.id;
                console.log(docId);
                if(docId !== undefined){
                    finalString += i > 0 ? ("|"+ driveImageURL + docId) : (driveImageURL + docId);
                }
            }
            if(finalString !== undefined){
                this.setState({imageURL: finalString})
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
                        Create Check In
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field required>
                                <label>Name</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.name}
                                    name='name'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Description (Private)</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.description}
                                    name='description'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Message (Public)</label>
                                <TextArea 
                                    defaultValue={this.state.message}
                                    name='message'
                                    onChange={this.handleChange}
                                 />
                            </Form.Field>
                            <Form.Field required>
                                <label>Location(s)</label>
                                <Dropdown
                                    placeholder='Select Location(s)'
                                    clearable
                                    selection
                                    multiple
                                    search
                                    value={this.state.location_ids}
                                    options={this.locationKeywordSelectionList()}
                                    onChange={this.handleChange}
                                    name="location_ids"
                                    style={{marginTop: 5, marginBottom: 5}}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div style={{display: 'flex', marginRight: 0, width: '100%'}}>
                                    
                                    <div style={{width: '100%'}}>
                                        <label>Image URL</label>
                                        <Input
                                            name='imageURL'
                                            value={this.state.imageURL}
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
                                        multiselect={true} //Allow multiple images
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
                                {this.state.imageURL !== "" ? <Image src={this.state.imageURL} size='medium' style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}/> : ""}
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

export default AddCheckinModal;