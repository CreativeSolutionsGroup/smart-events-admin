import React from "react";
import { Button, Modal, Input, Icon, Form, TextArea, Image, Dropdown, Card } from "semantic-ui-react";
import axios from "axios";
import {API_URL, authorizedPost, clientId} from "../../utils"
import GooglePicker from 'react-google-picker'
import RewardCard from "./RewardCard";

class AddRewardTierModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            name: "",
            description: "",
            color: "",
            min_points: 0,
            rewards: [],
            reward_list: [] //Database Rewards
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

        if (this.state.color === "") {
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
            color: this.state.color,
            min_points: this.state.min_points,
            rewards: this.state.rewards
        };

        authorizedPost(axios, API_URL + '/api/reward_tier/', values)
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

    //List of Rewards for selection 
    rewardKeywordSelectionList() {
        let list = [];
        this.state.reward_list.forEach((reward) => {
            let selection = {
                key: reward._id,
                text: reward.name,
                value: reward._id
            }
            list.push(selection);
        })
        return list;
    }

    handleChangeRewards = (e, { name, value }) => {
        this.setState({ rewards: value });
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
                                <div>Create Reward Tier</div>
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
                            <Form.Group widths='equal'>
                                <Form.Field required>
                                    <label>Color</label>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <Input
                                            name='color'
                                            onChange={this.handleChange}
                                        />
                                        <div
                                            style={{
                                                width: 20,
                                                height: 20,
                                                marginLeft: 5,
                                                marginTop: 'auto',
                                                marginBottom: 'auto',
                                                border: '1px solid black',
                                                backgroundColor: this.state.color
                                            }}
                                        >

                                        </div>
                                    </div>
                                </Form.Field>
                                <Form.Field>
                                    <label>Points needed to unlock</label>
                                    <Input
                                        name='min_points'
                                        onChange={this.handleChange}
                                        type="number"
                                    />
                                </Form.Field>
                            </Form.Group>
                            <Form.Field>
                                <label>Rewards</label>
                                <Dropdown
                                    clearable
                                    selection
                                    multiple
                                    placeholder='Reward(s)'
                                    options={this.rewardKeywordSelectionList()}
                                    value={this.state.rewards}
                                    onChange={this.handleChangeRewards}
                                    style={{marginTop: 5, marginBottom: 5}}
                                />
                            </Form.Field>    
                        </Form>
                        {/* Show fake reward cards */}
                        {this.state.rewards.length > 0 ?                        
                            <Card.Group
                                style={{
                                    marginTop: 20,
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                }}
                            >
                                {
                                    this.state.rewards.map((reward_id) => {
                                        let database_reward = this.state.reward_list.find((reward) => reward._id === reward_id)
                                        return (
                                            <div
                                                style={{
                                                    marginTop: 'auto',
                                                    marginBottom: 'auto',
                                                    marginLeft: 10,
                                                    marginRight: 10
                                                }}
                                                key={"reward_card_"+database_reward._id}
                                            >
                                                <RewardCard
                                                    reward_id={database_reward._id}
                                                    name={database_reward.name}
                                                    description={database_reward.description}
                                                    image_url={database_reward.image_url}
                                                />
                                            </div>
                                        );
                                    })
                                }
                            </Card.Group>
                        : ""
                        }
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

export default AddRewardTierModal;