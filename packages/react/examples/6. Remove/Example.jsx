import { useState } from 'react';
import { TypeWave } from '../../src';

const animation = [
    {
        type: 'type',
        value: 'Hello, '
    },
    {
        type: 'type',
        value: 'World!'
    },
    {
        type: 'delete',
        value: 6,
    },
    {
        type: 'type',
        value: 'Typewave!',
        remove: true
    },
    {
        type: 'delete',
        value: 9,
        remove: true
    },
    {
        type: 'loop',
        value: 1
    }
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