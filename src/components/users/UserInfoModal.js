import React from "react";
import {  Modal, Card, Input, Button, Icon, Tab, Accordion } from "semantic-ui-react";
import { getEngagement, getEvent } from "../../utils";
import RewardCard from "../rewards/RewardCard";

class UserInfoModal extends React.Component {

    constructor(props) {
        super(props);

        // Props and state
        this.state = {
            user_id: props.user_id !== undefined ? props.user_id : "",
            name: props.name !== undefined ? props.name : "",
            email: props.email !== undefined ? props.email : "",
            student_id: props.student_id !== undefined ? props.student_id : "",
            phone_number: props.phone_number !== undefined ? props.phone_number : "",
            reward_points: props.reward_points !== undefined ? props.reward_points : 0,
            tier: props.tier !== undefined ? props.tier : null,
            rewards: props.rewards !== undefined ? props.rewards : [],
            user_engagements: props.user_engagements !== undefined ? props.user_engagements : [],
            sortedUserEngagements: props.sortedUserEngagements !== undefined ? props.sortedUserEngagements : {},
            eventNames: props.eventNames !== undefined ? props.eventNames : {},
            reward_list: props.reward_list !== undefined ? props.reward_list : [], //Reward Database
            eventSearchValue: ""
        };
    }

    async sortUserEngagements(){
        this.setState({loadingEvents: true});
        let sortedUserEngagements = {};
        let eventNames = {}
        //Create a promise to wait for all the event info to be organized
        await new Promise( (resolve) => {
            this.state.user_engagements.forEach(async (engagee, index) => {
                let engagement = await getEngagement(engagee.engagement_id).catch(error => {
                    console.log(error)
                });
                let event = engagement !== undefined && engagement !== null ? await getEvent(engagement.event_id) : undefined;

                if(event !== undefined){
                    eventNames[event._id] = event.name;

                    let newEvents = sortedUserEngagements[event._id] === undefined ? [] : sortedUserEngagements[event._id];
                    newEvents.push(engagement);
                    sortedUserEngagements[event._id] = newEvents;
                }
                if (index === this.state.user_engagements.length -1) resolve();
            })
        })
        this.setState({sortedUserEngagements: sortedUserEngagements, eventNames: eventNames, loadingEvents: false});
    }

    rewardTab(){
        return (
            <Tab.Pane
                style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Reward Tab */}
                {/* Show fake reward cards */}
                {this.state.rewards.length > 0 ?       
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >   
                        <Card.Group
                            style={{
                                marginTop: 20,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                marginBottom: 20
                            }}
                        >
                            {
                                this.state.rewards.map((reward_id) => {
                                    let database_reward = this.state.reward_list.find((reward) => reward._id === reward_id.reward_id)

                                    if(database_reward === undefined){
                                        return "";
                                    }

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
                                                count={reward_id.remaining_uses}
                                            />
                                        </div>
                                    );
                                })
                            }
                        </Card.Group>
                    </div>   
                : <div style={{marginLeft: 'auto', marginRight: 'auto', marginTop: 20, marginBottom: 20}}>Empty</div>
                }
                <Button 
                    icon 
                    labelPosition='left'
                    color='grey'
                    style={{
                        width: 200,
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                    onClick={() => this.props.openUserRewards(this.state.user_id)}
                >
                <Icon name='setting' />
                    Manage Rewards
                </Button>
            </Tab.Pane>
        )
    }

    getFilteredUserEvents(searchValue) {
        if(this.state.sortedUserEngagements === null || this.state.sortedUserEngagements === undefined){
            return [];
        }
        if (searchValue === "" || searchValue === undefined) {
            return Object.keys(this.state.sortedUserEngagements);
        }
        return Object.keys(this.state.sortedUserEngagements).filter(key => 
            {
                let eventName = this.state.eventNames[key];
                if(eventName === undefined){
                    return false;
                }
                return eventName.toLowerCase().includes(searchValue.toLowerCase()) 
            }
        );
    }

    eventsTab(){
        return (
            <Tab.Pane
                style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
                loading={this.state.loadingEvents}
            >
                <Input
                    icon='search'
                    placeholder='Search...'
                    style={{ width: '45%', marginLeft: 'auto', marginRight: 'auto', marginBottom: 10 }}
                    value={this.state.eventSearchValue}
                    onChange={(e, { name, value }) => {
                        this.setState({ eventSearchValue: value })
                    }}
                />
                <Accordion 
                    styled
                    style={{
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    {
                        this.getFilteredUserEvents(this.state.eventSearchValue).map((key) => {
                            let eventName = this.state.eventNames[key];
                            let engagements = this.state.sortedUserEngagements[key];
                            return (
                                <div>
                                    <Accordion.Title 
                                        active={this.state.selectedEvent === key}
                                        index={key}
                                        onClick={() => {
                                            let newKey = this.state.selectedEvent === key ? "" : key;
                                            this.setState({selectedEvent: newKey})
                                        }}
                                        style={{
                                            color: 'black'
                                        }}
                                    >
                                        <Icon name='dropdown' />
                                        {eventName}
                                    </Accordion.Title>
                                    <Accordion.Content active={this.state.selectedEvent === key}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                        {
                                            engagements.map((engagement) => {
                                                return (
                                                    <div
                                                        style={{
                                                            marginTop: 5,
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {"- "}{engagement.keyword}
                                                    </div>
                                                )
                                            })
                                        }
                                        </div>
                                    </Accordion.Content>
                                </div>
                            )
                        })
                    }
                </Accordion>
            </Tab.Pane>
        )
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
                                <div>User Information</div>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Content
                        style={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 5
                                }}
                            >
                                Name:
                                <div
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5
                                    }}
                                >
                                    {this.state.name}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 5
                                }}
                            >
                                Email:
                                <a
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5,
                                    }}
                                    href={`mailto:${this.state.email}`}
                                >
                                    {this.state.email}
                                </a>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 5
                                }}
                            >
                                Student ID:
                                <div
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5
                                    }}
                                >
                                    {this.state.student_id}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 5
                                }}
                            >
                                Phone Number:
                                <a
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5
                                    }}
                                    href={`tel:${this.state.phone_number}`}
                                >
                                    {this.state.phone_number}
                                </a>
                            </div>                            
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 5
                                }}
                            >
                                User ID:
                                <div
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5
                                    }}
                                >
                                    {this.state.user_id}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 15
                                }}
                            >
                                Reward Points:
                                <div
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5
                                    }}
                                >
                                    {this.state.reward_points}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    fontSize: 20,
                                    marginTop: 5
                                }}
                            >
                                Reward Tier:
                                <div
                                    style={{
                                        fontWeight: 'normal',
                                        marginLeft: 5,
                                        color: this.state.tier !== null ? this.state.tier.color : 'black'
                                    }}
                                >
                                    {this.state.tier !== null ? this.state.tier.name : "Error"}
                                </div>
                            </div>
                        </div>


                        {/* Tabs */}                        
                        <Tab
                            panes={
                                [
                                    {
                                        menuItem: "Rewards",
                                        render: () => this.rewardTab()
                                    },
                                    {
                                        menuItem: "Attendence",
                                        render: () => this.eventsTab()
                                    }
                                ]
                            }
                            style={{
                                marginTop: 10
                            }}
                            onTabChange={(e, data) => {
                                if(data.activeIndex === 1){
                                    //Switching to events
                                    this.sortUserEngagements();
                                }
                            }}
                        />

                            
                    </Modal.Content>
                </Modal>
            </div>
        );
    }
}

export default UserInfoModal;