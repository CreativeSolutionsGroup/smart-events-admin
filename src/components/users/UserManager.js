import React, {createRef} from "react";
import { Divider, Table, Input, Checkbox, Button, Pagination, Loader, Dimmer } from "semantic-ui-react";
import { getAllRewards, getAllRewardTiers, getAllUserEngagements, getAllUserRewards, getAllUsers, getEngagement, getEvent, getUserPermissions } from "../../utils";
import EditUserRewardsModal from "./EditUserRewardsModal";
import UserInfoModal from "./UserInfoModal";

const PAGE_USER_COUNT = 20;

export default class UserManager extends React.Component {
    userInfoModalRef = createRef();
    userRewardsModalRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            sortedUsers: [],
            visiblePageUsers: [],
            selectedUsers: [],
            sortOrder: 0,
            searchValue: "",
            reward_tiers: [],
            reward_list: [],
            loading_users: false
        }

        this.loadUsers = this.loadUsers.bind(this);
        this.loadRewards = this.loadRewards.bind(this);
    }

    componentDidMount() {
        this.loadUsers();
        this.loadRewardTiers();
        this.loadRewards();
        getUserPermissions(localStorage.getItem("email")).then(response => {
            this.setState({ permissions: response });
        })
    }

    loadUsers() {
        this.setState({loading_users: true});
        getAllUsers()
        .then((res) => {
            this.setState({ users: res });
            this.sortUsers(res);
        })
    }

    loadRewardTiers() {
        getAllRewardTiers()
        .then((res) => {
            let sorted = res.sort((a, b) => b.min_points > a.min_points ? 1 : -1);
            this.setState({ reward_tiers: sorted });
        })
    }

    loadRewards() {
        getAllRewards()
        .then((res) => {
            this.setState({ reward_list: res });
        })
    }

    async sortUsers(users){
        //Sort Alphabetically by lastname
        let newUsers = users.sort((a, b) => {
            let lastNameA = a.name.split(" ").at(-1); //Get Lastname
            let lastNameB = b.name.split(" ").at(-1); //Get Lastname
            if(lastNameA.toLowerCase() < lastNameB.toLowerCase()) return -1;
            if(lastNameA.toLowerCase() > lastNameB.toLowerCase()) return 1;
            return 0;
        });

        let largeSet = newUsers;
        //TODO Sort by reward points and tier options

        //Duplicate users to test large lists
        /*await new Promise( (resolve) => {
            newUsers.forEach(async (user, index) => {
                for (var i = 0; i < 400; i++) {
                    largeSet.push(user);
                }
                if (index === newUsers.length -1) resolve();
            })
        })*/

        this.setState({sortedUsers: largeSet, loading_users: false});
        this.updatePageUsers(1)
    }

    updatePageUsers(activePage){
        let begin = activePage * PAGE_USER_COUNT - PAGE_USER_COUNT;
        let end = activePage * PAGE_USER_COUNT;
        let visibleUsers = this.state.sortedUsers.slice(begin, end);
        this.setState({visiblePageUsers: visibleUsers});
    }

    getFilteredUsers(searchValue) {
        if (searchValue === "") {
            return this.state.sortedUsers;
        }
        return this.state.sortedUsers.filter(user => 
                (
                    user.name.toLowerCase().includes(searchValue.toLowerCase()) 
                    || user.email.toLowerCase().includes(searchValue.toLowerCase()) 
                    || user.student_id.toLowerCase().includes(searchValue.toLowerCase())
                    || user.phone_number.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
    }

    async showUserInfoModal(user) {
        let userRewards = await getAllUserRewards(user._id);
        let userEngagements = await getAllUserEngagements(user._id);
        
        let userTier = this.state.reward_tiers.find((tier) => tier.min_points <= user.reward_points);

        this.userInfoModalRef.current.setState({
            user_id: user._id,
            name: user.name,
            email: user.email,
            student_id: user.student_id,
            phone_number: user.phone_number,
            reward_points: user.reward_points,
            tier: userTier,
            rewards: userRewards,
            user_engagements: userEngagements,
            sortedUserEngagements: {},
            eventNames: [],
            reward_list: this.state.reward_list,
            open: true
        });
    }

    async showEditUserRewardsModal(user_id) {
        let userRewards = await getAllUserRewards(user_id);
        this.userRewardsModalRef.current.setState({
            user_id: user_id,
            rewards: userRewards,
            formRewards: userRewards,
            reward_list: this.state.reward_list,
            open: true
        });
    }

    addOrRemoveUserFromSelected(selected, user_id){
        let selectedUsersCopy = [...this.state.selectedUsers]
        if(selected){
            selectedUsersCopy.push(user_id);
            this.setState({selectedUsers: selectedUsersCopy});
        }
        else {
            var index = selectedUsersCopy.indexOf(user_id)
            if (index !== -1) {
                selectedUsersCopy.splice(index, 1);
                this.setState({selectedUsers: selectedUsersCopy});
            }
        }
    }

    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: 50
                }}
            >
                {/* User Table */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <h2 style={{ marginLeft: 'auto', marginRight: 'auto' }}>Users</h2>
                        <Divider />
                        {this.state.loading_users ?
                            <Loader content="Loading Users" active/>
                        :
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Input
                                    icon='search'
                                    placeholder='Search...'
                                    style={{ width: '45%', marginLeft: 'auto', marginRight: 'auto' }}
                                    value={this.state.searchValue}
                                    onChange={(e, { name, value }) => {
                                        this.setState({ searchValue: value })
                                    }}
                                />
                                <div
                                    style={{
                                        width: '75%',
                                        marginTop: 10,
                                        marginLeft: 'auto',
                                        marginRight: 'auto'
                                    }}
                                >
                                    <Table 
                                        celled 
                                        padded                                    
                                        color="grey"
                                        inverted
                                    >
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell></Table.HeaderCell>
                                                <Table.HeaderCell>Name</Table.HeaderCell>
                                                <Table.HeaderCell>Email</Table.HeaderCell>
                                                <Table.HeaderCell singleLine textAlign="center">Student ID</Table.HeaderCell>
                                                <Table.HeaderCell textAlign="center">Phone #</Table.HeaderCell>
                                                <Table.HeaderCell singleLine textAlign="center">Reward Points</Table.HeaderCell>
                                                <Table.HeaderCell singleLine textAlign="center">Reward Tier</Table.HeaderCell>
                                                <Table.HeaderCell></Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>

                                        <Table.Body>
                                            {
                                                //Show page users unless searching
                                                (this.state.searchValue !== "" ? this.getFilteredUsers(this.state.searchValue).slice(0, PAGE_USER_COUNT) : this.state.visiblePageUsers).map((user, i) => {
                                                    let userTier = this.state.reward_tiers.find((tier) => tier.min_points <= user.reward_points);
                                                    return (
                                                        <Table.Row
                                                            key={"row_" + i}
                                                        >
                                                            <Table.Cell 
                                                                collapsing
                                                                textAlign="center"
                                                            >
                                                                <Checkbox
                                                                    onChange={(e, data) => {
                                                                        this.addOrRemoveUserFromSelected(data.checked, user._id);
                                                                    }}
                                                                    checked={this.state.selectedUsers.includes(user._id)}
                                                                >
                                                                </Checkbox>
                                                            </Table.Cell>
                                                            <Table.Cell singleLine>
                                                                {user.name}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <a
                                                                    style={{
                                                                        fontWeight: 'normal',
                                                                        color: 'white',
                                                                        textDecoration: 'underline'
                                                                    }}
                                                                    href={`mailto:${user.email}`}
                                                                >
                                                                    {user.email}
                                                                </a>
                                                            </Table.Cell>
                                                            <Table.Cell collapsing textAlign="center">
                                                                {user.student_id}
                                                            </Table.Cell>
                                                            <Table.Cell collapsing>
                                                                <a
                                                                    style={{
                                                                        fontWeight: 'normal',
                                                                        color: 'white',
                                                                        textDecoration: 'underline'
                                                                    }}
                                                                    href={`tel:${user.phone_number}`}
                                                                >
                                                                    {user.phone_number}
                                                                </a>
                                                            </Table.Cell>
                                                            <Table.Cell collapsing textAlign="center">
                                                                {user.reward_points}
                                                            </Table.Cell>
                                                            <Table.Cell collapsing textAlign="center" style={{color: userTier.color, fontWeight: 'bold'}}>
                                                                {userTier.name}
                                                            </Table.Cell>
                                                            <Table.Cell collapsing>
                                                                <Button
                                                                    icon='setting'
                                                                    color='orange'
                                                                    size='tiny'
                                                                    style={{
                                                                        marginLeft: 'auto',
                                                                        marginRight: 'auto'
                                                                    }}
                                                                    onClick={() => this.showUserInfoModal(user)}
                                                                >
                                                                </Button>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    );
                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                    {/* Selected User Counter */}
                                    {this.state.selectedUsers.length > 0 ?
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                marginLeft: 10,
                                                marginRight: 'auto'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    marginTop: 'auto',
                                                    marginBottom: 'auto',
                                                    marginRight: 5,
                                                    fontSize: 16,
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {`Selected Users: ${this.state.selectedUsers.length}`}
                                            </div>
                                            <Button 
                                                size="mini"
                                                content="X"
                                                onClick={() => {
                                                    this.setState({selectedUsers: []})
                                                }}
                                            />
                                        </div>
                                    : ""}
                                </div>

                                {/* Page picker that is hidden when searching */}
                                {this.state.searchValue === "" ?
                                    <Pagination
                                        activePage={this.state.activePage}
                                        onPageChange={(e, { activePage }) => {
                                            this.setState({ activePage: activePage })
                                            this.updatePageUsers(activePage)
                                        }}
                                        totalPages={Math.ceil(this.state.sortedUsers.length / PAGE_USER_COUNT)}
                                        pointing secondary
                                        defaultActivePage={1}
                                        style={{
                                            marginLeft: 'auto',
                                            marginRight: 'auto'
                                        }}
                                    />
                                : ""}
                            </div>
                        }
                    <Divider />
                    {/* {
                        this.state.permissions !== undefined && (this.state.permissions.includes("admin") || this.state.permissions.includes("edit")) ?
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button
                                    icon labelPosition='left'
                                    onClick={() => {
                                        this.showAddUserModal();
                                    }}
                                    style={{ marginTop: 10, marginBottom: 10, marginLeft: 'auto', marginRight: 'auto', backgroundColor: COLOR_CEDARVILLE_YELLOW }}
                                >
                                    <Icon name='add' />
                                    Add User
                                </Button>
                            </div>
                            : ""
                    } */}
                </div>
                <UserInfoModal ref={this.userInfoModalRef} openUserRewards={(user_id) => this.showEditUserRewardsModal(user_id)}/>
                <EditUserRewardsModal ref={this.userRewardsModalRef} />
            </div>
        );
    }
}