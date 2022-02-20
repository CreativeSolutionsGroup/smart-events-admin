import React from "react";
import { Button, Modal, Input, Form, TextArea, Dropdown, Card} from "semantic-ui-react";
import axios from "axios";
import {API_URL, authorizedDelete, authorizedPut} from "../../utils"
import RewardCard from "./RewardCard";

class EditRewardTierModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            reward_tier_id: props.reward_tier_id === undefined ? "" : props.reward_tier_id,
            name: props.name === undefined ? "" : props.name,
            description: props.description === undefined ? "" : props.description,
            color: props.color === undefined ? "" : props.color,
            min_points: props.min_points === undefined ? 0 : props.min_points,
            rewards: props.rewards === undefined ? [] : props.rewards,
            reward_list: props.reward_list === undefined ? [] : props.reward_list,
            formName: props.name === undefined ? "" : props.name,
            formColor: props.color === undefined ? "" : props.color,
            formMin_points: props.min_points === undefined ? 0 : props.min_points,
            formRewards: props.rewards === undefined ? [] : props.rewards
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        if (this.state.reward_tier_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/reward_tier/' + this.state.reward_tier_id)
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
        if (this.state.reward_tier_id === "") {
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

        if (this.state.color !== this.state.formColor) {
            changed = true;
            if (this.state.formColor === "") {
                return false;
            }
        }

        if (this.state.min_points !== this.state.formMin_points) {
            changed = true;
            if(this.state.min_points < 0){
                return false;
            }
        }

        if (this.state.rewards !== this.state.formRewards) {
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
            color: this.state.formColor,
            min_points: this.state.formMin_points,
            rewards: this.state.formRewards
        };

        authorizedPut(axios, API_URL + '/api/reward_tier/' + this.state.reward_tier_id, values)
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
        this.setState({ formRewards: value });
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
                                <div>Edit Reward Tier</div>
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
                                            name='formColor'
                                            value={this.state.formColor}
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
                                                backgroundColor: this.state.formColor
                                            }}
                                        >

                                        </div>
                                    </div>
                                </Form.Field>
                                <Form.Field>
                                    <label>Points needed to unlock</label>
                                    <Input
                                        name='formMin_points'
                                        value={this.state.formMin_points}
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
                                    value={this.state.formRewards}
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
                                    this.state.formRewards.map((reward_id) => {
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
                            <div>Do you want to delete the '{this.state.name}' Tier?</div>
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

export default EditRewardTierModal;