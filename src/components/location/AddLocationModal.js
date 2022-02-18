import React from "react";
import { Button, Modal, Input, Form, TextArea } from "semantic-ui-react";
import axios from "axios";
import { authorizedPost } from "../../utils";

class AddLocationModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            name: "",
            latitude: 0.0,
            longitude: 0.0,
            radius: 50
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    //Make sure all required fields are filled out
    isSubmitValid() {
        if (this.state.name === "") {
            return false;
        }

        if (this.state.latitude === 0.0) {
            return false;
        }

        if (this.state.longitude === 0.0) {
            return false;
        }

        if(this.state.radius < 50){
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
            latitude: this.state.latitude, 
            longitude: this.state.longitude,
            radius: this.state.radius
        };

        authorizedPost(axios, "http://localhost:3001" + '/api/location/', values)
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
                                <div>Create Location</div>
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
                            <Form.Group widths='equal'>
                                <Form.Field required>
                                    <label>Latitude</label>
                                    <Input
                                        name='latitude'
                                        onChange={this.handleChange}
                                    />
                                </Form.Field>
                                <Form.Field required>
                                    <label>Longitude</label>
                                    <Input
                                        name='longitude'
                                        onChange={this.handleChange}
                                    />
                                </Form.Field>
                                <Form.Field required>
                                    <label>Radius</label>
                                    <Input
                                        name='radius'
                                        onChange={this.handleChange}
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

export default AddLocationModal;