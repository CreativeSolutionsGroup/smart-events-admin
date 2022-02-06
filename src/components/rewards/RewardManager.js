import React, { createRef } from "react";
import { Icon, Card, Button, Divider, CardContent, Input } from "semantic-ui-react";
import { getEvents, COLOR_CEDARVILLE_YELLOW, getRewardById, getAllRewards, getUserPermissions, getAllRewardTiers } from "../../utils";
import AsyncImage from "../AsyncImage";
import AddRewardModal from "./AddRewardModal";
import AddRewardTierModal from "./AddRewardTierModal";
import EditRewardModal from "./EditRewardModal";
import EditRewardTierModal from "./EditRewardTierModal";
import RewardCard from "./RewardCard";

export default class RewardManager extends React.Component {
    addRewardModalRef = createRef();
    editRewardModalRef = createRef();
    addRewardTierModalRef = createRef();
    editRewardTierModalRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            rewards: [],
            reward_tiers: [],
            tier_rewards: {},
            windowWidth: window.innerWidth,
            searchValue: ""
        }

        this.loadRewardTiers = this.loadRewardTiers.bind(this);
        this.loadTierRewards = this.loadTierRewards.bind(this);
        this.buildStringList = this.buildStringList.bind(this);

        this.loadRewards = this.loadRewards.bind(this);

        this.showAddRewardModal = this.showAddRewardModal.bind(this);
        this.showEditRewardModal = this.showEditRewardModal.bind(this);
        this.showAddRewardTierModal = this.showAddRewardTierModal.bind(this);    
        this.showEditRewardTierModal = this.showEditRewardTierModal.bind(this);        
    }

    componentDidMount() {
        this.loadRewardTiers();
        this.loadRewards();
        getUserPermissions(localStorage.getItem("email")).then(response => {
            this.setState({ permissions: response });
        })
    }

    showAddRewardModal() {
        this.addRewardModalRef.current.setState({
            name: "",
            description: "",
            instructions: "",
            image_url: "",
            open: true
        });
    }

    showEditRewardModal(reward) {
        this.editRewardModalRef.current.setState({
            reward_id: reward._id,
            name: reward.name,
            formName: reward.name,
            description: reward.description,
            formDescription: reward.description,
            instructions: reward.instructions,
            formInstructions: reward.instructions,
            image_url: reward.image_url,
            formImage_url: reward.image_url,
            open: true
        });
    }

    showAddRewardTierModal() {
        this.addRewardTierModalRef.current.setState({
            name: "",
            description: "",
            color: "",
            min_points: 0, 
            rewards: [],
            reward_list: this.state.rewards,
            open: true
        });
    }

    showEditRewardTierModal(reward_tier) {
        this.editRewardTierModalRef.current.setState({
            reward_tier_id: reward_tier._id,
            name: reward_tier.name,
            formName: reward_tier.name,
            description: reward_tier.description,
            formDescription: reward_tier.description,
            color: reward_tier.color,
            formColor: reward_tier.color,
            min_points: reward_tier.min_points,
            formMin_points: reward_tier.min_points,
            rewards: reward_tier.rewards,
            formRewards: reward_tier.rewards,
            reward_list: this.state.rewards,
            open: true
        });
    }

    loadRewardTiers() {
        getAllRewardTiers()
            .then((res) => {
                let tiers = res.sort((a, b) => b.min_points > a.min_points ? 1 : -1); //Sort them by points
                this.setState({ reward_tiers: tiers });

                this.loadTierRewards(tiers);
            })
    }

    loadTierRewards(tiers) {
        if (tiers === undefined || tiers.length == 0) {
            this.setState({ tier_rewards: {} });
        }
        tiers.forEach(async (tier) => {
            let reward_ids = tier.rewards;
            if (reward_ids.length > 0) {
                let rewards = await Promise.all(reward_ids.map(async (tierReward) => {
                    let reward = await getRewardById(tierReward); //Async grab of the rewards information
                    return reward;
                }));
                let newTierRewards = this.state.tier_rewards;
                newTierRewards[tier._id] = rewards;
                this.setState({ tier_rewards: newTierRewards });
            }
        })
    }

    buildStringList(list) {
        let listOfNames = list.map((element) => {
            return element.name
        });
        return listOfNames.join(', ');
    }

    loadRewards() {
        getAllRewards()
            .then((res) => {
                this.setState({ rewards: res });
            })
    }

    clickReward(reward) {
        this.showEditRewardModal(reward);
    }

    clickTier(tier) {
        this.showEditRewardTierModal(tier);
    }

    getFilteredRewards(searchValue) {
        if (searchValue === "") {
            return this.state.rewards;
        }
        return this.state.rewards.filter(reward => (reward.name.toLowerCase().includes(searchValue.toLowerCase()) || reward.description.toLowerCase().includes(searchValue.toLowerCase())));
    }

    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 50
                }}
            >
                {/* Tiers */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '30%',
                        maxWidth: 300
                    }}
                >
                    <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Tiers</h2>
                    <Divider />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            paddingLeft: 20,
                            paddingRight: 20
                        }}
                    >
                        {
                            this.state.reward_tiers.map((tier) => {
                                return (
                                    <Card
                                        onClick={() => this.clickTier(tier)}
                                        key={"tier_" + tier._id}
                                        style={{
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                            minHeight: 100
                                        }}
                                    >
                                        <Card.Header style={{ backgroundColor: tier.color }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: 'black',
                                                        fontWeight: 'bold',
                                                        fontSize: 20,
                                                        marginTop: 5,
                                                        marginBottom: 5,
                                                        marginLeft: 5,
                                                        marginRight: 'auto'
                                                    }}
                                                >
                                                    {tier.name}
                                                </div>
                                                <div
                                                    style={{
                                                        color: 'black',
                                                        fontWeight: 'bold',
                                                        fontSize: 20,
                                                        marginTop: 5,
                                                        marginBottom: 5,
                                                        marginLeft: 'auto',
                                                        marginRight: 5
                                                    }}
                                                >
                                                    {tier.min_points}
                                                </div>
                                            </div>
                                        </Card.Header>
                                        <Card.Content>
                                            <Card.Description style={{ whiteSpace: 'pre-line', color: 'black' }}>{tier.description}</Card.Description>
                                            {this.state.tier_rewards[tier._id] !== null && this.state.tier_rewards[tier._id] !== undefined ?
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        color: 'black',
                                                        marginTop: 5
                                                    }}
                                                >
                                                    <div
                                                        style={{ fontWeight: 'bold' }}
                                                    >
                                                        Rewards
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginLeft: 10
                                                        }}
                                                    >
                                                        {this.buildStringList(this.state.tier_rewards[tier._id])}
                                                    </div>
                                                </div>
                                                : ""}
                                        </Card.Content>
                                    </Card>
                                );
                            })
                        }
                    </div>
                    <Divider />
                    {
                        this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button
                                    icon labelPosition='left'
                                    onClick={() => {
                                        this.showAddRewardTierModal();
                                    }}
                                    style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                                >
                                    <Icon name='add' />
                                    Add Tier
                                </Button>
                            </div>
                            : ""
                    }
                </div>

                {/* Rewards */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '75%'
                    }}
                >
                    <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Rewards</h2>
                    <Divider />
                    <Input
                            icon='search'
                            placeholder='Search...'
                            style={{ width: '45%', marginLeft: 'auto', marginRight: 'auto' }}
                            value={this.state.searchValue}
                            onChange={(e, { name, value }) => {
                                this.setState({ searchValue: value })
                            }}
                        />
                    <Card.Group style={{ margin: 5 }} centered>
                        {
                            this.getFilteredRewards(this.state.searchValue).map((reward) => {
                                return (
                                    <RewardCard
                                        onClick={() => this.clickReward(reward)}
                                        reward_id={reward._id}
                                        name={reward.name}
                                        description={reward.description}
                                        image_url={reward.image_url}
                                    />
                                );
                            })
                        }
                    </Card.Group>
                    <Divider />
                    {
                        this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button
                                    icon labelPosition='left'
                                    onClick={() => {
                                        this.showAddRewardModal();
                                    }}
                                    style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                                >
                                    <Icon name='add' />
                                    Add Reward
                                </Button>
                            </div>
                            : ""
                    }
                </div>
                <AddRewardModal ref={this.addRewardModalRef} />
                <EditRewardModal ref={this.editRewardModalRef} />
                <AddRewardTierModal ref={this.addRewardTierModalRef} />
                <EditRewardTierModal ref={this.editRewardTierModalRef} />
            </div>
        );
    }
}