import { TypeWave } from '../../src';

const events = [
    {
        type: 'type',
        value: 'Hello, World!'
    },
    {
        type: 'pause',
        value: 1000
    },
    {
        type: 'delete',
        value: 6
    },
    {
        type: 'type',
        value: 'TypeWave!'
    },
    {
        type: 'pause',
        value: 500
    },
    {
        type: 'move',
        value: -5
    },
    {
        type: 'type',
        value: ' amazing'
    },
    {
        type: 'pause',
        value: 1000
    },
    {
        type: 'loop',
        value: 0
    }
];

function Example() {
    const handleOnEvent = (currentEvent, eventIndex) => {
        console.log('onEvent:', currentEvent, 'Event Index:', eventIndex);
    };

    const handleOnEnd = () => {
        console.log('Animation has ended.');
    };

    return (
        <TypeWave
            component="h1"
            events={events}
            cursorCharacter="_"
            onEvent={handleOnEvent}
            onEnd={handleOnEnd}
        />
    );
}

export default Example;
