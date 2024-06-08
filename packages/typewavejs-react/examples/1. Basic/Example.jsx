import { useState } from 'react';
import { TypeWave } from '../../src';

const animation = [
    {
        type: 'type',
        value: 'Hello, World!',
        instant: false
    },
    {
        type: 'delete',
        value: 1,
        instant: false
    },
    {
        type: 'move',
        value: 3,
        instant: false
    }
];

function Example() {
    const [events, setEvents] = useState(animation);

    // function handleNext() {
    //     setEvents(resetEvents(events));
    // }

    return (
        <div>
            <h1>Typewave.js React Example</h1>
            <h1>Basic</h1>
            <TypeWave events={events} onComplete={handleNext} />
        </div>
    );
}

export default Example;