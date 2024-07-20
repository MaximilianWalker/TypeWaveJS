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
        <TypeWave
            component="h1"
            events={events}
            cursorCharacter="_"
        />
    );
}

export default Example;