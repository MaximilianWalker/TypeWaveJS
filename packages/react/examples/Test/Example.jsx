import React, { useState } from 'react';
import { TypeWave } from '@typewavejs/react';
import './Example.css';

const LOOP_PAUSE = 5000;


const events = [
    {
        type: "type",
        value: "<DiogoCrava />"
    },
    {
        type: "pause",
        value: LOOP_PAUSE
    },
    {
        type: "delete"
    },
    {
        type: "type",
        value: "<FullStack />"
    },
    {
        type: "pause",
        value: LOOP_PAUSE
    },
    {
        type: "delete"
    },
    {
        type: "type",
        value: "<Dev />"
    },
    {
        type: "pause",
        value: LOOP_PAUSE
    },
    {
        type: "delete"
    },
    {
        type: "type",
        value: "<Code />"
    },
    {
        type: "pause",
        value: LOOP_PAUSE
    },
    {
        type: "delete"
    },
    {
        type: "loop",
        value: 0
    }
];

function Example() {
    return (
        <TypeWave
            className="hi"
            typeSpeed={50}
            deleteSpeed={50}
            cursorCharacter="_"
            events={events}
        />
    );
}

export default Example;