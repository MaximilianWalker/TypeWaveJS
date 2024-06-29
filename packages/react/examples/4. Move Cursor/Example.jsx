import React, { useState } from 'react';
import { TypeWave } from '../../src';

const events = [
    {
        type: 'type',
        value: 'Helooo, Wrld!'
    },
    {
        type: 'move',
        value: -8
    },
    {
        type: 'delete',
        value: 2
    },
    {
        type: 'type',
        value: 'l'
    },
    {
        type: 'move',
        value: 4
    },
    {
        type: 'type',
        value: 'o'
    },
    {
        type: 'move',
        value: 4
    }
];

function Example() {
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