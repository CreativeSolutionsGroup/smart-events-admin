import React from "react";
import { Button, Modal, Input, Form } from "semantic-ui-react";
import axios from "axios";
import { API_URL, authorizedPost } from "../../utils";

class AddEventModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            name: props.name === undefined ? "" : props.name,
            description: props.description === undefined ? "" : props.description
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    isSubmitValid() {

        if (this.state.name === "") {
            return false;
        }

        if (this.state.description === "") {
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

        let values = { name: this.state.name, description: this.state.description };
        authorizedPost(axios, API_URL + '/api/events/', values)
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
                    <div>Create Event</div>
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
                        <Form.Field required>
                            <label>Description</label>
                            <Input
                                fluid
                                defaultValue={this.state.description}
                                name='description'
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
        );
    }
}

export default AddEventModal;