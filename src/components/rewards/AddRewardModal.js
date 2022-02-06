import React from "react";
import { Button, Modal, Input, Icon, Form, TextArea, Image, Dropdown } from "semantic-ui-react";
import axios from "axios";
import {API_URL, authorizedPost, clientId} from "../../utils"
import GooglePicker from 'react-google-picker'
import RewardCard from "./RewardCard";

class AddRewardModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            name: "",
            description: "",
            instructions: "",
            image_url: "",
            openDrive: false
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Make sure all required fields are filled out
    isSubmitValid() {
        if (this.state.name === "") {
            return false;
        }

        if (this.state.description === "") {
            return false;
        }

        if (this.state.instructions === "") {
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
            description: this.state.description, 
            instructions: this.state.instructions,
            image_url: this.state.image_url
        };

        authorizedPost(axios, API_URL + '/api/reward/', values)
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

    //Convert Google Drive Image to public url
    googleDriveImageURL(data){
        const driveImageURL = 'http://drive.google.com/uc?export=view&id=';
        if(data.docs !== undefined){
            let doc = data.docs[0]; //Only Get one
            let docId = doc.id;
            if(docId !== undefined){
                this.setState({image_url: driveImageURL + docId})
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
                                <div>Create Reward</div>
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
                                <label>Name</label>
                                <Input
                                    fluid
                                    name='name'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Description (Public)</label>
                                <TextArea
                                    name='description'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Instructions (For CE Member)</label>
                                <Input
                                    fluid
                                    name='instructions'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div style={{display: 'flex', marginRight: 0, width: '100%'}}>
                                    
                                    <div style={{width: '100%'}}>
                                        <label>Image URL</label>
                                        <Input
                                            name='image_url'
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
                            </Form.Field>
                        </Form>
                        {/* Show fake reward card */}
                        <div
                            style={{
                                marginTop: 20,
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}
                        >
                            <RewardCard
                                reward_id={"fake"}
                                name={this.state.name}
                                description={this.state.description}
                                image_url={this.state.image_url}
                            />
                        </div>
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

export default AddRewardModal;