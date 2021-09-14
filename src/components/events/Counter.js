import React, {createRef} from "react";
import { Card, Button, Icon, Checkbox, List, Dropdown, Message, Transition } from "semantic-ui-react";
import { getEventEngagements, getEvents, formatTimeHour, getEngagementEngagees } from "../../utils";
import CountUp from 'react-countup';

export default class Counter extends React.Component {
    counterRef = createRef();
    constructor(props) {
        super(props);

        this.state = {
            eventList: [],
            eventId: props.eventId === undefined ? "" : props.eventId,
            lastCount : 0,
            currentCount: 0,
            engagements: [],
            filterEngagements: []
        };

        this.getEntryCount = this.getEntryCount.bind(this);
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
        if(eventId === undefined || eventId === "")return;
        getEventEngagements(eventId)
        .then((eventEngagements) => {
            this.setState({ engagements: eventEngagements });
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

    async getEntryCount(filterEngagements) {
        const oldCount = this.state.currentCount;
        let count = filterEngagements.map(async (engagement) => {
            let engagements = await getEngagementEngagees(engagement);
            return engagements.length;
        })
        this.setState({lastCount: oldCount, currentCount: count});
        this.counterRef.current.start();
    }

    handleChangeEvent = (e, { name, value }) => {
        this.setState({ eventId: value, filterEngagements: [] })
        this.changeEventSelection(value);
    }

    handleChangeFilter = (e, { name, value }) => {
        this.setState({ filterEngagements: value });
        this.getEntryCount(value)
    }

    changeEventSelection(eventId) {
        this.loadEventEngagements(eventId);
        this.refreshEngagees();
    }

    refreshEngagees() {
        this.getEntryCount(this.state.filterEngagements);
    }

    render() {
        return (
            <div style={{width: '90%', marginTop: 5, marginBottom: 5}}>
            <Card fluid>
                <Card.Content>
                    <Card.Header>
                        Counter
                    </Card.Header>
                </Card.Content>
                <Card.Content>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Dropdown
                            placeholder='Select Event'
                            selection
                            value={this.state.eventId}
                            options={this.eventSelectionList()}
                            onChange={this.handleChangeEvent}
                            style={{marginTop: 5, marginBottom: 5}} 
                        />
                        <Dropdown
                            clearable
                            selection
                            multiple
                            placeholder='Engagement(s)'
                            options={this.engagmentKeywordSelectionList()}
                            value={this.state.filterEngagements}
                            onChange={this.handleChangeFilter}
                            style={{marginTop: 5, marginBottom: 5}}
                        />
                    </div>
                </Card.Content>
                <Card.Content>
                    <div style={{ display: 'flex', flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
                        <Icon name='users' size='large' style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5}}/>
                        <div style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 5, marginRight: 5}}>
                            {
                               <CountUp duration={5} start={this.state.lastCount} end={this.state.currentCount} ref={this.counterRef}/>
                            }
                        </div>
                        <Button 
                            icon='refresh' 
                            onClick={() => this.refreshEngagees()} 
                            style={{ marginLeft: 5, marginRight: 'auto' }}
                        />
                    </div>
                </Card.Content>
            </Card>
            </div>
        );
    }
}