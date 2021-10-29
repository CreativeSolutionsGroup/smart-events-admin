import React from 'react';
import { Loader, Segment, Image as SemanticImage} from 'semantic-ui-react';

const AsyncImage = (props) => {
    const [loadedSrc, setLoadedSrc] = React.useState(null);
    React.useEffect(() => {
        setLoadedSrc(null);
        if (props.src) {
            const handleLoad = () => {
                setLoadedSrc(props.src);
            };
            const image = new Image();
            image.addEventListener('load', handleLoad);
            image.src = props.src;
            return () => {
                image.removeEventListener('load', handleLoad);
            };
        }
    }, [props.src]);
    if (loadedSrc === props.src) {
        return (
            <SemanticImage {...props} />
        );
    }
    return (
        <div style={{display: 'flex', height: 150}}>
            <Segment style={{margin: 'auto', width: '100%', height: '100%'}}>
                <Loader active size='large'/>
            </Segment>
        </div>
    );
};

export default AsyncImage;