import { useState } from 'react';
import { TypeWave } from '../../src';

const animation = [
    {
        type: 'type',
        value: 'Hello, World!'
    },
    {
        type: 'delete',
        value: 7,
        instant: true
    },
    {
        type: 'type',
        value: 'Typewave!',
        instant: true
    },
    {
        type: 'move',
        value: -5,
        instant: true
    },

];

function Example() {
    const [events, setEvents] = useState(animation);

    return (
        <TypeWave
            component="h1"
            events={events}
            cursorCharacter="_"
        />
    );
}

export default Example;