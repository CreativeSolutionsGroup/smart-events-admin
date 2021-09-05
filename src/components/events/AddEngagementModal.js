import React from "react";
import { Button, Modal, Input, Form, Image, TextArea, Icon} from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import { API_URL, authorizedPost, formatTime, clientId } from "../../utils"
import GooglePicker from 'react-google-picker';

class AddEngagementModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            eventId: props.eventId === undefined ? "" : props.eventId,
            keyword: props.keyword === undefined ? "" : props.keyword,
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

    isSubmitValid() {
        if (this.state.eventId === "") {
            return false;
        }

        if (this.state.keyword === "") {
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

        let values = {
            event_id: this.state.eventId,
            keyword: this.state.keyword,
            message: this.state.message,
            image_url: this.state.imageURL
        }

        if(this.state.startTime !== this.state.formStartTime){
            let newTime = this.state.formStartTime + ":00.000Z"
            let parsedDate = new Date(newTime);
            parsedDate.setHours(parsedDate.getHours() + 7); //Adjust timezone
            values['start_time'] = formatTime(parsedDate);
        }
        if(this.state.endTime !== this.state.formEndTime){
            let newTime = this.state.formEndTime + ":00.000Z"
            let parsedDate = new Date(newTime);
            parsedDate.setHours(parsedDate.getHours() + 7); //Adjust timezone
            values['end_time'] = formatTime(parsedDate);
        }

        authorizedPost(axios, API_URL + '/api/engagements/', values)
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

    googleDriveImageURL(data){
        const driveImageURL = 'http://drive.google.com/uc?export=view&id=';
        if(data.docs !== undefined){
            let doc = data.docs[0]; //Only Get one
            let docId = doc.id;
            console.log(docId);
            if(docId !== undefined){
                this.setState({imageURL: driveImageURL + docId})
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
                        Create Engagement
                    </Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field required>
                                <label>Keyword</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.keyword}
                                    name='keyword'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Message</label>
                                <TextArea 
                                    fluid
                                    defaultValue={this.state.message}
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
                                <Image src={this.state.imageURL} size='medium' centered style={{margin: 20, marginLeft: 'auto', marginRight: 'auto'}} />
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

export default AddEngagementModal;