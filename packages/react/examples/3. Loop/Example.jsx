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
        <TypeWave events={events} cursorCharacter="_" />
    );
}

export default Example;