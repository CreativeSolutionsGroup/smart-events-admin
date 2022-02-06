import React from "react";
import { Button, Modal, Input, Icon, Form, TextArea, Image, Radio } from "semantic-ui-react";
import TextField from '@material-ui/core/TextField';
import axios from "axios";
import {API_URL, authorizedDelete, authorizedPut, formatTime, clientId} from "../../utils"
import GooglePicker from 'react-google-picker';
import RewardCard from "./RewardCard";

class EditRewardModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            reward_id: props.reward_id === undefined ? "" : props.reward_id,
            name: props.name === undefined ? "" : props.name,
            description: props.description === undefined ? "" : props.description,
            instructions: props.instructions === undefined ? "" : props.instructions,
            image_url: props.image_url === undefined ? "" : props.image_url,
            formName: props.name === undefined ? "" : props.name,
            formDescription: props.description === undefined ? "" : props.description,
            formInstructions: props.instructions === undefined ? "" : props.instructions,
            formImage_url: props.image_url === undefined ? "" : props.image_url
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.reward_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/reward/' + this.state.reward_id)
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
        if (this.state.reward_id === "") {
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

        if (this.state.instructions !== this.state.formInstructions) {
            changed = true;
            if (this.state.formInstructions === "") {
                return false;
            }
        }

        if (this.state.image_url !== this.state.formImage_url) {
            changed = true;
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
            instructions: this.state.formInstructions,
            image_url: this.state.formImage_url
        };

        authorizedPut(axios, API_URL + '/api/reward/' + this.state.reward_id, values)
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

    googleDriveimage_url(data){
        const driveimage_url = 'http://drive.google.com/uc?export=view&id=';
        if(data.docs !== undefined){
            let doc = data.docs[0]; //Only Get one
            let docId = doc.id;
            console.log(docId);
            if(docId !== undefined){
                this.setState({formImage_url: driveimage_url + docId})
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
                                <div>Edit Reward</div>
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
                                    defaultValue={this.state.name}
                                    name='formName'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Description (Public)</label>
                                <TextArea
                                    defaultValue={this.state.description}
                                    name='formDescription'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field required>
                                <label>Instructions (For CE Member)</label>
                                <Input
                                    fluid
                                    defaultValue={this.state.instructions}
                                    name='formInstructions'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <div style={{display: 'flex', marginRight: 0, width: '100%'}}>
                                    <div style={{width: '100%'}}>
                                        <label>Image URL</label>
                                        <Input
                                            name='formImage_url'
                                            value={this.state.formImage_url}
                                            onChange={this.handleChange}
                                            icon='image'
                                            iconPosition='left'
                                        />
                                    </div>
                                    <GooglePicker 
                                        clientId={clientId}
                                        developerKey={'AIzaSyBwjEWiq9VGOgHdMcjDTJGNyQWHGaLg3gg'}
                                        scope={['https://www.googleapis.com/auth/drive.readonly']}
                                        onChange={data => this.googleDriveimage_url(data)}
                                        onAuthFailed={data => console.log('on auth failed:', data)}
                                        multiple={true}
                                        navHidden={true}
                                        authImmediate={false}
                                        mimeTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
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
                                reward_id={this.state.reward_id}
                                name={this.state.formName}
                                description={this.state.formDescription}
                                image_url={this.state.formImage_url}
                            />
                        </div>
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

export default EditRewardModal;