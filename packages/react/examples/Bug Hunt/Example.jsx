import React, { useState } from 'react';
import { TypeWave } from '@typewavejs/react';
import './Example.css';

const LOOP_PAUSE = 5000;

const events = [
    {
        type: 'type',
        value: 'Loading'
    },
    {
        type: 'type',
        value: '...'
    },
    {
        type: 'delete',
        value: 3
    },
    {
        type: 'loop',
        value: 1
    }
];

function Example() {
    const [counter, setCounter] = useState(0);
    return (
        <div className='container'>
            <TypeWave
                // key={counter}
                className="hi"
                typeSpeed={50}
                deleteSpeed={50}
                showCursor={false}
                events={events}
            />
            <button className='refresh' onClick={() => setCounter(counter + 1)}>Refresh</button>
        </div>
    );
}

export default Example;