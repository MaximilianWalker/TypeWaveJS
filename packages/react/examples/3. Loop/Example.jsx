import React, { useState } from 'react';
import { TypeWave } from '../../src';

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
    return (
        <div>
            <h1>Typewave.js React Example</h1>
            <h1>Basics</h1>
            <TypeWave events={events} cursorCharacter="_" />
        </div>
    );
}

export default Example;