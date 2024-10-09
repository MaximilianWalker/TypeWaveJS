import { useEffect, useState } from 'react';
import { TypeWave } from '../../src';

const events = [
    {
        type: 'type',
        value: 'This is a super long text that will be interrupted by a priority event.'
    }
];

const priorityEvents1 = [
    {
        type: 'type',
        value: ' ... This is a priority event! ... '
    }
];

const priorityEvents2 = [
    {
        type: 'type',
        value: ' ... This is another priority event! ... '
    }
];

function Example() {
    const [priorityEvents, setPriorityEvents] = useState();

    useEffect(() => {
        setTimeout(() => {
            setPriorityEvents(priorityEvents1);
        }, 2000);
        setTimeout(() => {
            setPriorityEvents(priorityEvents2);
        }, 2500);
    }, []);

    return (
        <TypeWave
            component="h1"
            events={events}
            cursorCharacter="_"
            priorityEvents={priorityEvents}
        />
    );
}

export default Example;