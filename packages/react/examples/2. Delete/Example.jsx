import React, { useState } from 'react';
import { TypeWave } from '../../src';

const animation = [
    {
        type: 'type',
        value: 'Hello, everyone!'
    },
    {
        type: 'delete',
        value: 9
    },
    {
        type: 'type',
        value: 'World!'
    },
    {
        type: 'delete'
    }
];

function Example() {
    const [events, setEvents] = useState(animation);

    return (
        <div>
            <h1>Typewave.js React Example</h1>
            <h1>Basic</h1>
            <TypeWave
                component="h1"
                events={events}
                cursorCharacter="_"
            />
        </div>
    );
}

export default Example;