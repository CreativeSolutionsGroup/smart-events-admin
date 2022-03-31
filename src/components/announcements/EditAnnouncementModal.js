import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon, Dropdown, Divider, Card, Transition, Message } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedDelete, authorizedPut, authorizedPost, formatTime, clientId } from "../../utils"
import GooglePicker from "react-google-picker";

class EditAnnouncementModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            announcement_id: props.announcement_id === undefined ? "" : props.announcement_id,
            name: props.name === undefined ? "" : props.name,
            form_name: props.name === undefined ? "" : props.name,
            title: props.title === undefined ? "" : props.title,
            form_title: props.title === undefined ? "" : props.title,
            message: props.message === undefined ? "" : props.message,
            form_message: props.message === undefined ? "" : props.message,
            image_url: props.image_url === undefined ? "" : props.image_url,
            form_image_url: props.image_url === undefined ? "" : props.image_url,
            send_time: props.send_time === undefined ? "" : props.send_time,
            form_send_time: props.send_time === undefined ? "" : props.send_time,
            gps_start_time: props.gps_start_time === undefined ? "" : props.gps_start_time,
            form_gps_start_time: props.gps_start_time === undefined ? "" : props.gps_start_time,
            gps_end_time: props.gps_end_time === undefined ? "" : props.gps_end_time,
            form_gps_end_time: props.gps_end_time === undefined ? "" : props.gps_end_time,
            gps_locations: props.gps_locations === undefined ? [] : props.gps_locations,
            form_gps_locations: props.gps_locations === undefined ? [] : props.gps_locations,
            location_list: props.location_list === undefined ? [] : props.location_list,            
            open: false,
            openDelete: false,
            openSend: false,
            showSendToast: false,
            sentAnnouncementCount: 0
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSendAnnouncement = this.handleSendAnnouncement.bind(this);
    }

    handleDelete() {
        if (this.state.announcement_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/announcement/' + this.state.announcement_id)
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

    isSubmitValid() {
        if (this.state.announcement_id === "") {
            return false;
        }

        let changed = false;

        if (this.state.name !== this.state.form_name) {
            changed = true;
            if (this.state.form_name === "") {
                return false;
            }
        }

        if (this.state.title !== this.state.form_title) {
            changed = true;
            if (this.state.form_title === "") {
                return false;
            }
        }

        if (this.state.message !== this.state.form_message) {
            changed = true;
            if (this.state.form_message === "") {
                return false;
            }
        }

        if (this.state.image_url !== this.state.form_image_url) {
            changed = true;
        }

        if (this.state.send_time !== this.state.form_send_time) {
            changed = true;
        }

        if (this.state.gps_locations !== this.state.form_gps_locations) {
            changed = true;
            if (this.state.form_gps_locations.length === 0) {
                return false;
            }
        }

        if (this.state.gps_start_time !== this.state.form_gps_start_time) {
            changed = true;
        }

        if (this.state.gps_end_time !== this.state.form_gps_end_time) {
            changed = true;
        }

         //If the user supplies locations they need to supply start and end times
         if(this.state.form_gps_locations !== undefined && this.state.form_gps_locations.length > 0 && this.state.form_gps_start_time === "" && this.state.form_gps_end_time === ""){
            return false;
        }

        //Can't be both types
        if(this.state.form_gps_locations !== undefined && this.state.form_gps_locations.length > 0 && this.state.form_send_time !== ""){
            return false;
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

        if (this.state.name !== this.state.form_name) {
            values['name'] = this.state.form_name;
        }

        if (this.state.title !== this.state.form_title) {
            values['title'] = this.state.form_title;
        }

        if (this.state.message !== this.state.form_message) {
            values['message'] = this.state.form_message;
        }

        if (this.state.image_url !== this.state.form_image_url) {
            values['image_url'] = this.state.form_image_url;
        }

        if(this.state.send_time !== this.state.form_send_time){
            let newTime = this.state.form_send_time
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['send_time'] = formatTime(utc);
        }

        if(this.state.gps_start_time !== this.state.form_gps_start_time){
            let newTime = this.state.form_gps_start_time
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['gps_start_time'] = formatTime(utc);
        }

        if(this.state.gps_end_time !== this.state.form_gps_end_time){
            let newTime = this.state.form_gps_end_time
            let parsedDate = new Date(newTime);
            let utc = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
            values['gps_end_time'] = formatTime(utc);
        }

        if (this.state.gps_locations !== this.state.form_gps_locations) {
            values['gps_locations'] = this.state.form_gps_locations;
        }

        if (Object.keys(values).length > 0) {
            authorizedPut(axios, API_URL + '/api/announcement/' + this.state.announcement_id, values)
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

    handleSendAnnouncement() {
        if (this.state.announcement_id === "") {
            return;
        }
        authorizedPost(axios, API_URL + '/api/announcement/' + this.state.announcement_id + "/send")
            .then(async response => {
                const data = await response.data;

                if (data.status !== "success") {
                    alert("Error");
                    console.log(data.message);
                }  else {
                    console.log(data)
                    let count = parseInt(data.data.sentAnnouncements);
                    this.setState({showSendToast: true, sentAnnouncementCount: count});
                }
            })
            .catch(error => {
                alert("Error: " + error);
                console.log(error);
            });
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
                this.setState({form_image_url: finalString})
            }
        }
    }

    render() {
        let isGPSMode = this.state.form_gps_locations !== undefined && this.state.form_gps_locations.length > 0;
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
                                <div>Edit Announcement</div>
                                <div>{this.state.announcement_id}</div>
                            </div>
                            <Button
                                icon='send'
                                style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5 }}
                                onClick={() => {
                                    this.setState({ openSend: true })
                                }}
                            />
                            <Button
                                icon='trash'
                                style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5 }}
                                onClick={() => {
                                    this.setState({ openDelete: true })
                                }}
                            />
                        </div>
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field required>
                                <label>Name (Private)</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.name}
                                    name='form_name'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Title (Public)</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.title}
                                    name='form_title'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Message</label>
                                <TextArea 
                                    defaultValue={this.state.message}
                                    name='form_message'
                                    onChange={this.handleChange}
                                 />
                            </Form.Field>
                            <Form.Field>
                                <div style={{display: 'flex', marginRight: 0, width: '100%'}}>
                                    <div style={{width: '100%'}}>
                                        <label>Image URL</label>
                                        <Input
                                            name='form_image_url'
                                            value={this.state.form_image_url}
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
                                {this.state.form_image_url !== "" ? <Image src={this.state.form_image_url} size='medium' style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 10}}/> : ""}
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
                                    value={this.state.form_gps_locations}
                                    options={this.locationKeywordSelectionList()}
                                    onChange={this.handleChange}
                                    name="form_gps_locations"
                                    style={{marginTop: 5, marginBottom: 5}}
                                />
                            </Form.Field>
                            <Form.Group widths='equal'>
                                <Form.Field required={isGPSMode}>
                                    <TextField
                                        label="GPS Start Time"
                                        type="datetime-local"
                                        required={isGPSMode}
                                        defaultValue={this.state.gps_start_time === undefined ? "" : this.convertDate(this.state.gps_start_time.slice(0, 16))}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        name='form_gps_start_time'
                                        error={isGPSMode && this.state.form_gps_start_time === ""}
                                        onChange={(event) => {
                                            this.handleChange(event, { name: 'form_gps_start_time', value: this.dateString(event.target.value) })
                                        }}
                                    />
                                </Form.Field>
                                <Form.Field required={isGPSMode}>
                                    <TextField
                                        label="GPS End Time"
                                        type="datetime-local"
                                        required={isGPSMode}
                                        defaultValue={this.state.gps_end_time === undefined ? "" : this.convertDate(this.state.gps_end_time.slice(0, 16))}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        name='form_gps_end_time'
                                        error={isGPSMode && this.state.form_gps_end_time === ""}
                                        onChange={(event) => {
                                            this.handleChange(event, { name: 'form_gps_end_time', value: this.dateString(event.target.value) })
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
                                    defaultValue={this.state.send_time === undefined ? "" : this.convertDate(this.state.send_time.slice(0, 16))}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    name='form_send_time'
                                    onChange={(event) => {
                                        this.handleChange(event, {name: 'form_send_time', value: this.dateString(event.target.value)})
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
                
                {/*Delete Modal*/}
                <Modal
                    size="small"
                    onClose={() => this.setState({ openDelete: false })}
                    onOpen={() => this.setState({ openDelete: true })}
                    open={this.state.openDelete}
                >
                    <Modal.Header>Delete</Modal.Header>
                    <Modal.Content>
                        Do you want to delete the '{this.state.name}' Announcement?
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
                <Modal
                    closeIcon
                    size="small"
                    onClose={() => this.setState({ openSend: false, showSendToast: false, sentAnnouncementCount: 0 })}
                    onOpen={() => this.setState({ openSend: true })}
                    open={this.state.openSend}
                >
                    <Modal.Header>Send Announcement</Modal.Header>
                    <Modal.Content>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div>Do you want to send '{this.state.name}' to all users?</div>

                            <Card
                                style={{
                                    marginTop: 20,
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                }}
                            >
                                <Card.Content>
                                    <h3>{this.state.title}</h3>
                                    <div
                                        style={{
                                            display: 'flex',
                                            marginTop: 10
                                        }}
                                    >
                                        {this.state.message}
                                    </div>
                                </Card.Content>
                            </Card>
                            
                            <Transition visible={this.state.showSendToast} animation='scale' duration={500}>
                                <Message floating icon positive style={{display: 'flex'}}>
                                    <Icon name='check' style={{marginLeft: 'auto', marginRight: 'auto'}}/>
                                    <Message.Header style={{display: 'flex'}}>
                                        <div style={{marginLeft: 'auto', marginRight: 'auto'}}>{this.state.sentAnnouncementCount} Announcement(s) successfully sent</div>
                                    </Message.Header>
                                </Message>
                            </Transition>
                        </div>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            content="Send"
                            labelPosition='right'
                            icon='send'
                            onClick={() => {
                                this.handleSendAnnouncement();
                            }}
                            positive
                        />
                        <Button
                            content="Cancel"
                            labelPosition='right'
                            icon='close'
                            onClick={() => this.setState({ openSend: false, showSendToast: false, sentAnnouncementCount: 0 })}
                            negative
                        />
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
}

export default EditAnnouncementModal;