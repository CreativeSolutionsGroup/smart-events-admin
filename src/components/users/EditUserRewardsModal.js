import React from "react";
import { Button, Modal, Input, Form, TextArea, Dropdown, Card} from "semantic-ui-react";
import axios from "axios";
import {API_URL, authorizedDelete, authorizedPut} from "../../utils"
import RewardCard from "../rewards/RewardCard";

class EditUserRewardsModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            user_id: props.user_id === undefined ? "" : props.user_id,
            rewards: props.rewards === undefined ? [] : props.rewards,
            formRewards: props.rewards === undefined ? [] : props.rewards,
            reward_list: props.reward_list === undefined ? [] : props.reward_list            
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        //this.handleDelete = this.handleDelete.bind(this);
    }

    /*handleDeleteReward() {
        if (this.state.user_reward_id === "") {
            return;
        }
        this.setState({ open: false, openDelete: false });
        authorizedDelete(axios, API_URL + '/api/user_rewards/' + this.state.user_reward_id)
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
    }*/

    isSubmitValid() {
        if (this.state.user_id === "") {
            return false;
        }

        let changed = false;

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

        /*let values = { 
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
            });*/
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    //List of Rewards for selection 
    rewardKeywordSelectionList() {
        let list = [];
        this.state.reward_list.forEach((reward) => {
            if(this.state.formRewards.find((user_reward) => user_reward.reward_id === reward._id) !== undefined){
                return;
            }
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
        console.log(value);

        let newReward = {
            user_id: this.state.user_id,
            reward_id: value,
            remaining_uses: 1,
        }
        let newRewards = this.state.formRewards;
        newRewards.push(newReward)
        this.setState({ formRewards: newRewards });
    }

    handleRemoveReward(user_reward){
        let array = [...this.state.formRewards]; // make a separate copy of the array
        let index = array.indexOf(user_reward)
        if (index !== -1) {
            array.splice(index, 1);
            this.setState({formRewards: array});
        }
        this.setState({ openDelete: false, rewardToDelete: undefined, rewardToDeleteName: undefined})
    }

    render() {
        return (
            <div>
                <Modal
                    closeIcon
                    size="small"
                    onClose={() => this.setState({ open: false })}
                    onOpen={() => this.setState({ open: true })}
                    open={this.state.open}
                >
                    <Modal.Header>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div>Edit User Rewards</div>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Content
                        style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <label>Reward List</label>
                        <Dropdown
                            search
                            fluid
                            value={''}
                            placeholder='Reward(s)'
                            options={this.rewardKeywordSelectionList()}
                            onChange={this.handleChangeRewards}
                            style={{marginTop: 5, marginBottom: 5, width: '100%'}}
                        />
                        {/* Show fake reward cards */}
                        {this.state.rewards.length > 0 ?                        
                            <Card.Group
                                style={{
                                    marginTop: 20,
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                }}
                                centered
                            >
                                {
                                    this.state.formRewards.map((user_reward) => {
                                        let database_reward = this.state.reward_list.find((reward) => reward._id === user_reward.reward_id)
                                        if(database_reward === null || database_reward === undefined)return "";
                                        return (
                                            <div
                                                style={{
                                                    marginTop: 'auto',
                                                    marginBottom: 'auto',
                                                    marginLeft: 10,
                                                    marginRight: 10,
                                                    marginTop: 'auto',
                                                    marginBottom: 'auto',
                                                    padding: 10
                                                }}
                                                key={"reward_card_"+database_reward._id}
                                            >
                                                <RewardCard
                                                    reward_id={database_reward._id}
                                                    name={database_reward.name}
                                                    description={database_reward.description}
                                                    image_url={database_reward.image_url}
                                                    count={user_reward.remaining_uses}
                                                    closeable={true}
                                                    closeCard={() => this.setState({ openDelete: true, rewardToDelete: user_reward, rewardToDeleteName: database_reward.name})}
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
                            <div>Do you want to delete this user's '{this.state.rewardToDeleteName}' Reward?</div>
                        </div>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            content="Delete"
                            labelPosition='right'
                            icon='trash'
                            onClick={() => this.handleRemoveReward(this.state.rewardToDelete)}
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

export default EditUserRewardsModal;