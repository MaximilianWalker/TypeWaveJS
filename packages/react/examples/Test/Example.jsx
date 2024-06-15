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
                {" !"}
            </>
        )
    },

];

function Example() {
    return (
        <div>
            <h1>Typewave.js React Example</h1>
            <h1>Basic</h1>
            <TypeWave
                className="hi"
                // typeSpeed={50}
                // deleteSpeed={50}
                cursorCharacter="_"
                events={events}
            />
        </div>
    );
}

export default Example;