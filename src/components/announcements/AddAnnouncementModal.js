import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Dropdown, Divider} from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedPost, formatTime, clientId } from "../../utils"
import GooglePicker from 'react-google-picker';

class AddAnnouncementModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            name: "",
            title: "",
            message: "",
            image_url: "",
            send_time: "",
            gps_start_time: "",
            gps_end_time: "",
            gps_locations: [],
            location_list: [],
            open: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //List of locations 
    locationKeywordSelectionList() {
        let list = [];
        this.state.location_list.forEach((location) => {
            let selection = {
                key: location._id,
                text: location.name,
                value: location._id
            }
            list.push(selection);
        })
        return list;
    }

    //Make sure all required fields are filled out
    isSubmitValid() {

        if (this.state.name === "") {
            return false;
        }

        if (this.state.title === "") {
            return false;
        }

        if (this.state.message === "") {
            return false;
        }

        //If the user supplies locations they need to supply start and end times
        if(this.state.gps_locations !== undefined && this.state.gps_locations.length > 0 && this.state.gps_start_time === "" && this.state.gps_end_time === ""){
            return false;
        }

        //Can't be both types
        if(this.state.gps_locations !== undefined && this.state.gps_locations.length > 0 && this.state.send_time !== ""){
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
            name: this.state.name,
            title: this.state.title,
            message: this.state.message,
            image_url: this.state.image_url,
            gps_locations: this.state.gps_locations,
        };

        if(this.state.gps_start_time !== ""){
            let newTime = this.state.gps_start_time
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['gps_start_time'] = formatTime(utc);
        }
        if(this.state.gps_end_time !== ""){
            let newTime = this.state.gps_end_time
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['gps_end_time'] = formatTime(utc);
        }
        if(this.state.send_time !== ""){
            let newTime = this.state.send_time
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['send_time'] = formatTime(utc);
        }

        authorizedPost(axios, API_URL + '/api/announcement/', values)
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
                this.setState({image_url: finalString})
            }
        }
    }

    render() {
        let isGPSMode = this.state.gps_locations !== undefined && this.state.gps_locations.length > 0;
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
                                <div>Create Announcement</div>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Content
                        style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Form>
                            <Form.Field required>
                                <label>Name (Private)</label>
                                <Input
                                    fluid
                                    name='name'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Title (Public)</label>
                                <Input
                                    fluid
                                    name='title'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Message</label>
                                <TextArea
                                    name='message'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div style={{display: 'flex', marginRight: 0, width: '100%'}}>
                                    
                                    <div style={{width: '100%'}}>
                                        <label>Image URL</label>
                                        <Input
                                            name='imageURL'
                                            value={this.state.image_url}
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
                                {this.state.image_url !== "" ? <Image src={this.state.image_url} size='medium' style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}/> : ""}
                            </Form.Field>
                            <Divider />
                            <h3>GPS Announcement</h3>
                            <Form.Field>
                                <label>Location(s)</label>
                                <Dropdown
                                    placeholder='Select Location(s)'
                                    clearable
                                    selection
                                    multiple
                                    search
                                    value={this.state.gps_locations}
                                    options={this.locationKeywordSelectionList()}
                                    onChange={this.handleChange}
                                    name="gps_locations"
                                    style={{marginTop: 5, marginBottom: 5}}
                                />
                            </Form.Field>
                            <Form.Group widths='equal'>
                                <Form.Field required={isGPSMode}>
                                    <TextField
                                        label="GPS Start Time"
                                        type="datetime-local"
                                        required={isGPSMode}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        name='gps_start_time'
                                        error={isGPSMode && this.state.gps_start_time === ""}
                                        onChange={(event) => {
                                            this.handleChange(event, {name: 'gps_start_time', value: this.dateString(event.target.value)})
                                        }}
                                    />
                                </Form.Field>
                                <Form.Field required={isGPSMode}>
                                    <TextField
                                        label="GPS End Time"
                                        type="datetime-local"
                                        required={isGPSMode}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        error={isGPSMode && this.state.gps_end_time === ""}
                                        name='gps_end_time'
                                        onChange={(event) => {
                                            this.handleChange(event, {name: 'gps_end_time', value: this.dateString(event.target.value)})
                                        }}
                                    />
                                </Form.Field>
                            </Form.Group>
                            <Divider />
                            <h3>Schedule Announcement</h3>
                            <Form.Field>
                                <TextField
                                    label="Send Time"
                                    type="datetime-local"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name='send_time'
                                    onChange={(event) => {
                                        this.handleChange(event, {name: 'send_time', value: this.dateString(event.target.value)})
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
            </div>
        );
    }
}

export default AddAnnouncementModal;