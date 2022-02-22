import React from "react";
import { Card, CardContent, Icon } from "semantic-ui-react";
import AsyncImage from "../AsyncImage";

class RewardCard extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card onClick={this.props.onClick} key={"reward_" + this.props.reward_id}>
                 {this.props.closeable !== undefined && this.props.closeable ? 
                    <Card.Header
                        style={{
                            display: 'flex'
                        }}
                    >
                        <Icon 
                            style={{
                                marginLeft: 'auto',
                                marginRight: 5,
                                marginTop: 5
                            }}
                            name='close'
                            onClick={() => {
                                this.props.closeCard()
                            }}
                        />
                    </Card.Header>
                : ""}
                 
                 <CardContent
                     style={{
                         display: 'flex'
                     }}
                 >
                     <div
                         style={{
                             display: 'flex',
                             flexDirection: 'row',
                             marginTop: 'auto',
                             marginBottom: 'auto'
                         }}
                     >
                         {this.props.image_url !== undefined && this.props.image_url !== "" ?
                             <div>
                                 <AsyncImage
                                     src={this.props.image_url}
                                     size='medium'
                                     centered
                                     resizeMode='center'
                                     style={{
                                         aspectRatio: 1,
                                         width: 100,
                                         objectFit: 'scale-down',
                                         marginTop: 'auto',
                                         marginBottom: 'auto'
                                     }}
                                 />
                             </div>
                             : ""}
                         <div
                             style={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 marginLeft: 20,
                                 marginTop: 'auto',
                                 marginBottom: 'auto'
                             }}
                         >
                             <div
                                 style={{
                                     color: 'black',
                                     fontWeight: 'bold',
                                     fontSize: 20
                                 }}
                             >
                                 {this.props.name}
                                 {this.props.count !== undefined ? ` x${this.props.count}` : ""}
                             </div>
                             <div
                                 style={{
                                     color: 'black',
                                     marginTop: 5
                                 }}
                             >
                                 {this.props.description}
                             </div>
                         </div>
                     </div>
                 </CardContent>
             </Card> 
        );
    }
}

export default RewardCard;