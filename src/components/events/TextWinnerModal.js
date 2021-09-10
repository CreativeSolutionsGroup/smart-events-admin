import React from "react";
import { Button, Modal, TextArea, Form } from "semantic-ui-react";
import axios from "axios";
import { authorizedPost, ENGAGEMENT_WEBHOOK_GIVEAWAY } from "../../utils";

class TextWinnerModal extends React.Component {

    
    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            studentId: props.studentId === undefined ? "" : props.studentId,
            phone: props.phone === undefined ? "" : props.phone,
            text: props.text === undefined ? "" : props.text
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    isSubmitValid() {

        if (this.state.phone === "") {
            return false;
        }

        if (this.state.text === "") {
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

        //Send Text with Twilio
        let phoneNumber = this.state.phone
        authorizedPost(axios, ENGAGEMENT_WEBHOOK_GIVEAWAY, { to: phoneNumber, body: this.state.text })
        .then(
            (res) => {
                let data = res.data;
                if (data.status !== 'success') {
                    console.log("Failed to send text");
                    console.log(data.message);
                    alert("Error (Text): " + data.message);
                }
                else {
                    this.props.messageSent();
                }
            },
            (err) => {
                console.error("Failed to send text");
                console.error(err);
                alert("Error (Text): " + err);
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
                    <div>Send Text to Winner</div>
                </Modal.Header>
                <Modal.Content>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <div>To: {this.state.studentId}</div>
                        <div>Phone: {this.state.phone}</div>
                        <Form>
                            <Form.Field required>
                                <label>Text Message</label>
                                <TextArea
                                    value={this.state.text}
                                    name='text'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content="Send"
                        labelPosition='right'
                        icon='send'
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

export default TextWinnerModal;