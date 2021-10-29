import React from "react";
import { Button, Modal, TextArea, Form, Divider, Popup } from "semantic-ui-react";
import axios from "axios";
import { authorizedPost, ENGAGEMENT_WEBHOOK_ANNOUNCEMENT } from "../../utils";

class TextGroupModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            text: props.text === undefined ? "" : props.text,
            numbers: props.numbers === undefined ? [] : props.numbers,
            engagements: props.engagements === undefined ? [] : props.engagements,
            engagementNames : props.engagementNames === undefined ? [] : props.engagementNames
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    isSubmitValid() {

        if (this.state.text === "" || this.state.text.length > 160) {
            return false;
        }

        if(this.state.engagements.length === 0){
            return false;
        }

        if(this.state.numbers.length === 0){
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

        //Send Texts with Twilio
        authorizedPost(axios, ENGAGEMENT_WEBHOOK_ANNOUNCEMENT, { numbers: this.state.numbers, message: this.state.text })
        .then(
            (res) => {
                let data = res.data;
                if (data.status !== 'success') {
                    console.log("Failed to send announcement");
                    console.log(data.message);
                    alert("Error (Announcement): " + data.message);
                }
                else {
                    this.props.messageSent();
                }
            },
            (err) => {
                console.error("Failed to send announcement");
                console.error(err);
                alert("Error (Announcement): " + err);
            }
        );
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    render() {
        return (
            <Modal
                closeIcon
                size="large"
                onClose={() => this.setState({ open: false })}
                onOpen={() => this.setState({ open: true })}
                open={this.state.open}
            >
                <Modal.Header>
                    <div>Send Text Blast to Subscribers</div>
                </Modal.Header>
                <Modal.Content>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <body><b>Engagement(s): {this.state.engagementNames.join(", ")}</b></body>
                        <body><b>Numbers: {this.state.numbers.length}</b></body>
                        <Divider />
                        <Form>
                            <Form.Field required>
                                <label>Text Message</label>
                                <TextArea
                                    value={this.state.text}
                                    name='text'
                                    onChange={this.handleChange}
                                />
                                <div style={{display: 'flex'}}>
                                    <div style={{marginLeft: 'auto', marginRight: 5, color: (this.state.text.length > 160 ? 'red' : 'black')}}><Popup position='top right' content='SMS character limit' trigger={<div>{this.state.text.length} / 160</div>} /></div>
                                </div>
                            </Form.Field>
                        </Form>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content="Send"
                        labelPosition='right'
                        icon='bullhorn'
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
        );
    }
}

export default TextGroupModal;