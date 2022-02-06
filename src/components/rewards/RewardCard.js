import React from "react";
import { Card, CardContent } from "semantic-ui-react";
import AsyncImage from "../AsyncImage";

class RewardCard extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Card onClick={this.props.onClick} key={"reward_" + this.props.reward_id}>
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