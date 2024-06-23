import React, { useState } from 'react';
import { TypeWave } from '@typewavejs/react';
import './Example.css';

const events = [
    {
        type: "type",
        value: "> Hello World!"
    },
    {
        type: "pause",
        value: 1000
    },
    {
        type: "delete",
        value: 6
    },
    {
        type: "type",
        value: "ups..."
    },
    {
        type: "pause",
        value: 500
    },
    {
        type: "delete",
        value: 6
    },
    {
        type: "type",
        value: "user! ヽ(´▽`)/"
    },
    {
        type: "pause",
        value: 600
    },
    {
        type: "type",
        value: "\n"
    },
    {
        type: "type",
        value: (
            <>
                {"> My name is "}
                <b style={{ color: "#4EC9B0" }}>
                    Diogo Crava
                </b>
                {"!"}
            </>
        )
    },
    {
        type: "pause",
        value: 500
    },
    {
        type: "type",
        value: (
            <>
                {"\n> And I'm a "}
                <b>
                    <span style={{ color: '#808080' }}>{"<"}</span>
                    <span style={{ color: '#569CD6' }}>FullStack Developer</span>
                    <span style={{ color: '#808080' }}>{">"}</span>
                </b>
            </>
        )
    },
    {
        type: "pause",
        value: 20000
    },
    {
        type: "type",
        value: "\n> Scroll to continue..."
    },
    {
        type: "pause",
        value: 20000
    },
    {
        type: "type",
        value: "\n> Knock knock... is anyone there?"
    }
];

function Example() {
    return (
        <div>
            <h1>Typewave.js React Example</h1>
            <h1>Basic</h1>
            <TypeWave
                className="hi"
                typeSpeed={50}
                deleteSpeed={50}
                cursorCharacter="_"
                events={events}
            />
        </div>
    );
}

export default Example;