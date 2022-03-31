import React, {createRef} from "react";
import { Card, Button, Icon, Dropdown, Message, Transition, Form, TextArea, Popup } from "semantic-ui-react";
import { getEventEngagements, getEvents, getEngagementEngagees } from "../../utils";
import { CSVLink } from "react-csv";
import TextGroupModal from "./TextGroupModal";

export default class TextBlast extends React.Component {
    textGroupModalRef = createRef();

    constructor(props) {
        super(props);

        this.state = {
            eventList: [],
            eventId: props.eventId === undefined ? "" : props.eventId,
            numbers: [],
            downloadCSV: [],
            text: "",
            engagements: [],
            filterEngagements: [],
            showTextToast: false
        };

        this.getEntries = this.getEntries.bind(this);
        this.loadEvents = this.loadEvents.bind(this);
        this.loadEventEngagements = this.loadEventEngagements.bind(this);
        this.showTextGroupModal = this.showTextGroupModal.bind(this);
        this.onTextSent = this.onTextSent.bind(this);
        this.updateCSVData = this.updateCSVData.bind(this);
    }

    componentDidMount() {
        this.loadEvents();
        this.loadEventEngagements(this.state.eventId);        
    }

    loadEvents() {
        if(this.state.eventId !== "")return;
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

    updateCSVData(numbers) {
        let data = [];
        data.push(["Phone"])
        numbers.forEach((element) => {
            data.push([element]);
        })
        this.setState({ downloadCSV: data })
    }

    //List of events
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

    //List of engagements 
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

    getEntries(filterEngagements) {
        this.setState({ numbers: [] });
        this.updateCSVData([]);
        
        filterEngagements.forEach((engagement) => {
            getEngagementEngagees(engagement)
            .then((engagees) => {
                let numberList = this.state.numbers === undefined ? [] : this.state.numbers;
                engagees.forEach(engagee => {
                    if(numberList.includes(engagee.phone) === false){
                        numberList.push(engagee.phone);
                    }
                })
                this.setState({ numbers: numberList });
                this.updateCSVData(numberList);
            })
        })
    }

    handleChangeEvent = (e, { name, value }) => {
        this.setState({ eventId: value, filterEngagements: [] })
        this.changeEventSelection(value);
    }

    handleChangeFilter = (e, { name, value }) => {
        this.setState({ filterEngagements: value });
        this.getEntries(value)
    }

    changeEventSelection(eventId) {
        this.loadEventEngagements(eventId);
        this.refreshEngagees();
    }

    refreshEngagees() {
        this.getEntries(this.state.filterEngagements);
    }

    updateCSVData(numbers) {
        let data = [];
        data.push(["Phone"])
        numbers.forEach((element) => {
            data.push([element]);
        })
        this.setState({ downloadCSV: data })
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    showTextGroupModal() {

        let engagementNames = [];
        this.state.engagements.forEach((engagement) => {
            if(this.state.filterEngagements.find((val) => val === engagement._id) === undefined){
                return;
            }
            engagementNames.push(engagement.keyword);
        });

        this.textGroupModalRef.current.setState({
            engagements: this.state.filterEngagements,
            engagementNames: engagementNames,
            numbers: this.state.numbers,
            text: this.state.text,
            open: true
        });
    }

    onTextSent(){
        this.setState({showTextToast: true});
        setTimeout(() => this.setState({showTextToast: false}), 3000);
    }

    render() {
        return (
            <div style={{width: '90%', marginTop: 5, marginBottom: 5}}>
            <Card fluid>
                <Card.Content>
                    <Card.Header>
                        Text Blast
                    </Card.Header>
                </Card.Content>
                <Card.Content>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Dropdown
                            placeholder='Select Event'
                            selection
                            search
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
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <Form>
                            <Form.Field>
                                <label>Text Message</label>
                                <TextArea
                                    value={this.state.text}
                                    name='text'
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                        <div style={{marginLeft: 'auto', marginRight: 5, color: (this.state.text.length > 160 ? 'red' : 'black')}}><Popup position='top right' content='SMS character limit' trigger={<div>{this.state.text.length} / 160</div>} /></div>
                    </div>
                </Card.Content>
                <Card.Content>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', marginLeft: 'auto', marginRight: 'auto'}}>
                            <Icon name='users' size='large' style={{marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto', marginRight: 5}}/>
                            <div style={{marginLeft: 5, marginRight: 5}}>
                                <b>
                                {
                                    `Recipients: ${this.state.numbers.length}`
                                }
                                </b>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', marginTop: 10, marginBottom: 5, marginLeft: 'auto', marginRight: 'auto'}}>
                            <Popup
                                position='top center'
                                content={"Download Numbers"}
                                trigger={
                                    <CSVLink
                                        data={this.state.downloadCSV}
                                        filename={"Text Blast Numbers.csv"}
                                        target="_blank"
                                        onClick={event => {
                                            if (this.state.numbers.length === 0) {
                                                return false;
                                            }
                                        }}
                                        style={{marginTop: 'auto', marginBottom: 'auto'}}
                                    >
                                        <Button color='green' disabled={this.state.numbers.length === 0} icon="download" />
                                    </CSVLink>
                                }
                            />
                            <Button 
                                onClick={() => this.showTextGroupModal()} 
                                style={{marginLeft: 5, marginRight: 5}}
                                disabled={(this.state.numbers.length <= 0 || this.state.text.length === 0 || this.state.text.length > 160)}
                                color='green'
                                icon labelPosition='left'
                                size="huge"
                            >
                                <Icon name="bullhorn"/>
                                Send Message
                            </Button>
                            <Popup
                                position='top center'
                                content={"Refresh List"}
                                trigger={
                                    <Button 
                                        icon="refresh"
                                        onClick={() => this.refreshEngagees()} 
                                        style={{marginTop: 'auto', marginBottom: 'auto'}}
                                    />  
                                }
                            />                          
                        </div>
                    </div>
                </Card.Content>
            </Card>
            <TextGroupModal ref={this.textGroupModalRef} messageSent={this.onTextSent}/>
            <Transition visible={this.state.showTextToast} animation='scale' duration={500}>
                <Message floating icon positive style={{display: 'flex'}}>
                    <Icon name='check' style={{marginLeft: 'auto', marginRight: 'auto'}}/>
                    <Message.Header style={{display: 'flex'}}>
                        <div style={{marginLeft: 'auto', marginRight: 'auto'}}>Text message successfully sent</div>
                    </Message.Header>
                </Message>
            </Transition>
            </div>
        );
    }
}