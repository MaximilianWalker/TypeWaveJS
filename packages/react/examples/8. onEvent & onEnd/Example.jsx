import { useEffect, useState } from 'react';
import { TypeWave } from '../../src';

const events = [
    {
        type: 'type',
        value: 'Random stuff...'
    }
];

const endEvent = [
    {
        type: 'type',
        value: ' ... This is the end! ... '
    }
];

function Example() {
    const [priorityEvents, setPriorityEvents] = useState();

    return (
        <TypeWave
            component="h1"
            events={events}
            cursorCharacter="_"
            priorityEvents={priorityEvents}
            onEvent={(event) => console.log(event)}
            onEnd={() => {
                console.log("End event");
                setPriorityEvents(endEvent)
            }}
        />
    );
}

export default Example;