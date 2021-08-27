import React from "react";
import { Card, Button, Icon, Checkbox, List, Dropdown } from "semantic-ui-react";
import { getEventEngagements, getEvents, formatTime, authorizedFetch, API_URL } from "../../utils";

export default class Giveaway extends React.Component {

    constructor(props) {
        super(props);

        this.showPicker = props.showPicker;

        this.state = {
            eventList: [],
            eventId: props.eventId === undefined ? "" : props.eventId,
            entries: {},
            blacklist: [],
            engagements: [],
            filterEngagements: [],
            winners: []
        };

        this.getEntries = this.getEntries.bind(this);
        this.loadEvents = this.loadEvents.bind(this);
        this.loadEventEngagements = this.loadEventEngagements.bind(this);
    }

    componentDidMount() {
        this.loadEvents();
        this.loadEventEngagements(this.state.eventId);        
    }

    loadEvents() {
        getEvents()
            .then((events) => {
                this.setState({ eventList: events });
            });
    }

    loadEventEngagements(eventId) {
        getEventEngagements(eventId)
            .then((eventEngagements) => {
                this.setState({ engagements: eventEngagements });
                this.getEntries();
            });
    }

    eventSelectionList() {
        let list = [];
        this.state.eventList.forEach((event) => {
            let selection = {
                key: event._id,
                text: event.name,
                value: event._id
            }
            list.push(selection);
        })
        return list;
    }

    engagmentKeywordSelectionList() {
        let list = [];
        this.state.engagements.forEach((engagement) => {
            let selection = {
                key: engagement._id,
                text: engagement.keyword,
                value: engagement._id
            }
            list.push(selection);
        })
        return list;
    }

    entrySelectionList() {
        let list = [];
        const keys = Object.keys(this.state.entries);
        keys.forEach((message) => {
            let selection = {
                key: message,
                text: message,
                value: message
            }
            list.push(selection);
        })
        this.state.blacklist.forEach((entry) => {
            let selection = {
                key: entry,
                text: entry,
                value: entry
            }
            list.push(selection);
        })
        return list;
    }

    blackListSelectionList() {
        let list = [];
        this.state.blacklist.forEach((entry) => {
            let selection = {
                key: entry,
                text: entry,
                value: entry
            }
            list.push(selection);
        })
        return list;
    }

    getEntries() {
        authorizedFetch(API_URL + '/api/engagees/')
            .then((res) => res.json())
            .then(
                (res) => {
                    if (res.status !== "success") {
                        console.log("Failed to retrieve Engagements");
                        console.log(res.message);
                    }

                    let entryDict = {};
                    res.data.forEach((element) => {
                        if (this.state.filterEngagements.includes(element.engagement_id)) {
                            let message = element.message_received;
                            if (!(this.filterOutEngagee(message))) {
                                entryDict[message] = element.phone;
                            }
                        }
                    });
                    this.setState({ entries: entryDict });
                },
                (err) => {
                    console.error("Failed to retrieve Engagements");
                    console.error(err);
                }
            );
    }

    filterOutEngagee(message) {
        let foundInWinners = false;
        this.state.winners.forEach((winner) => {
            if (winner.message === message) {
                foundInWinners = true;
            }
        });
        return this.state.blacklist.includes(message) || foundInWinners;
    }

    handleChangeEvent = (e, { name, value }) => {
        this.setState({ eventId: value, filterEngagements: [] })
        this.changeEventSelection(value);
    }

    handleChangeFilter = (e, { name, value }) => {
        this.setState({ filterEngagements: value });
        this.refreshEngagees();
    }

    handleAdditionBlacklist = (e, { value }) => {
        let newBlackList = this.state.blacklist;
        newBlackList.push(value);
        this.setState({blacklist: newBlackList});
    }

    handleChangeBlacklist = (e, { name, value }) => {
        this.setState({ blacklist: value });
        this.refreshEngagees();
    }

    changeEventSelection(eventId) {
        this.loadEventEngagements(eventId);
        this.refreshEngagees();
    }

    refreshEngagees() {
        this.getEntries()
    }

    pickWinner() {
        const keys = Object.keys(this.state.entries);
        let i = keys.length - 1;
        const j = Math.floor(Math.random() * i);
        let winningObject = { message: keys[j], phone: this.state.entries[keys[j]], time: new Date().toISOString() }
        let winnerList = this.state.winners;
        winnerList.push(winningObject);
        this.setState({ winners: winnerList })
        this.refreshEngagees();
    }

    removeWinner(element) {
        let filteredArray = this.state.winners.filter(item => item !== element)
        this.setState({ winners: filteredArray });
        this.refreshEngagees();
    }

    textWinner(element){

    }

    render() {
        return (
            <Card style={{width: '90%', marginTop: 5, marginBottom: 5}}>
                <Card.Content>
                    <Card.Header>
                        Giveaway
                    </Card.Header>
                </Card.Content>
                <Card.Content fluid>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {this.showPicker ? <Dropdown
                            placeholder='Select Event'
                            selection
                            value={this.state.eventId}
                            options={this.eventSelectionList()}
                            onChange={this.handleChangeEvent}
                            style={{marginTop: 5, marginBottom: 5}}
                        /> : ""}
                        <Dropdown
                            clearable
                            selection
                            multiple
                            placeholder='Engagement(s)'
                            options={this.engagmentKeywordSelectionList()}
                            value={this.state.filterEngagements}
                            onChange={this.handleChangeFilter}
                            style={{marginTop: 5, marginBottom: 5}}
                            fluid
                        />
                        <Dropdown
                            clearable
                            options={this.entrySelectionList()}
                            values={this.blackListSelectionList()}
                            search
                            selection
                            multiple
                            placeholder='Blacklist'
                            allowAdditions
                            onAddItem={this.handleAdditionBlacklist}
                            onChange={this.handleChangeBlacklist}
                            style={{marginTop: 5, marginBottom: 5}}
                            fluid
                        />
                    </div>
                </Card.Content>
                <Card.Content fluid>
                    <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
                        <Icon name='users' size='large' style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5}}/>
                        <div style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5}}>
                            {
                                Object.keys(this.state.entries).length
                            }
                        </div>
                        <Button 
                            onClick={() => this.pickWinner()} 
                            style={{marginLeft: 5, marginRight: 5}}
                            disabled={(Object.keys(this.state.entries).length <= 0)}
                            color='green'
                            icon labelPosition='left'
                        >
                            <Icon name="winner"/>
                            Pick Winner
                        </Button>
                        <Button 
                            icon='refresh' 
                            onClick={() => this.refreshEngagees()} 
                            style={{ marginLeft: 5, marginRight: 'auto' }}
                        />
                    </div>
                    <List fluid>
                        {
                            this.state.winners.map((element) => {
                                return (
                                    <List.Item style={{ display: 'flex', flexDirection: 'row', marginTop: 5, marginBottom: 5, marginLeft: 'auto', marginRight: 'auto'}}>
                                        <Checkbox style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5 }}>
                                            <div style={{  marginLeft: 'auto', marginRight: 'auto' }}>
                                                {element.message}
                                            </div>
                                            <div>{element.phone}</div>
                                        </div>
                                        <div style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5 }}>
                                            {formatTime(element.time)}
                                        </div>                                        
                                        <Button
                                            icon="comment"
                                            onClick={() => this.textWinner(element)}
                                            style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5 }}
                                        />
                                        <Button
                                            icon="trash"
                                            onClick={() => this.removeWinner(element)}
                                            style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 'auto' }}
                                        />
                                    </List.Item>
                                );
                            })
                        }
                    </List>
                </Card.Content>
            </Card>
        );
    }
}