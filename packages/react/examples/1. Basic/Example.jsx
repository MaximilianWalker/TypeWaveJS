import { useState } from 'react';
import { TypeWave } from '../../src';

const animation = [
    {
        type: 'type',
        value: 'Hello, World!'
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