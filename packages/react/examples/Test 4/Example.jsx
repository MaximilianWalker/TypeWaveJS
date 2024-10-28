import { TypeWave } from '@typewavejs/react';
import './Example.css';

const events = [
    {
        type: "type",
        value: <span style={{ color: '#569cd6' }}>ai-clone@diogocrava-os:~$ </span>
    },
    {
        type: "type",
        value: [
            "Sure thing! Here's a little snippet of React code, color-coded for your aesthetic enjoyment.\n\n",
            <pre>
                <code>
                    <span style={{ color: '#569cd6' }}>import</span>{' '}
                    <span style={{ color: '#569cd6' }}>React</span>{' '}
                    <span style={{ color: '#569cd6' }}>from</span>{' '}
                    <span style={{ color: '#569cd6' }}>'react'</span>;
                    {'\n'}
                    <span style={{ color: '#569cd6' }}>import</span>{' '}
                    <span style={{ color: '#569cd6' }}>TypeWave</span>{' '}
                    <span style={{ color: '#569cd6' }}>from</span>{' '}
                    <span style={{ color: '#569cd6' }}>'@typewavejs/react'</span>;
                    {'\n\n'}
                    <span style={{ color: '#569cd6' }}>const</span>{' '}
                    <span style={{ color: '#569cd6' }}>events</span> = [
                    {'\n'}
                    {'    '}
                    <span style={{ color: '#569cd6' }}>"</span>
                    <span style={{ color: '#ce9178' }}>type</span>
                    <span style={{ color: '#569cd6' }}>"</span>
                    <span style={{ color: '#569cd6' }}>,</span>
                    {'\n'}
                    {'    '}
                    <span style={{ color: '#569cd6' }}>"</span>
                    <span style={{ color: '#ce9178' }}>value</span>
                    <span style={{ color: '#569cd6' }}>"</span>
                    <span style={{ color: '#569cd6' }}>:</span>{' '}
                    <span style={{ color: '#569cd6' }}>"</span>
                    <span style={{ color: '#ce9178' }}>Loading</span>
                    <span style={{ color: '#569cd6' }}>"</span>
                    {'\n'}
                    <span style={{ color: '#569cd6' }}>];</span>
                    {'\n\n'}
                    <span style={{ color: '#569cd6' }}>function</span>{' '}
                    <span style={{ color: '#569cd6' }}>Example</span>
                    <span style={{ color: '#569cd6' }}>()</span>{' '}
                    <span style={{ color: '#569cd6' }}>{"{"}</span>
                    {'\n'}
                    {'    '}
                    <span style={{ color: '#569cd6' }}>return</span>{' '}
                    <span style={{ color: '#569cd6' }}>{"("}</span>
                    {'\n'}
                    {'        '}
                    <span style={{ color: '#569cd6' }}>{"<TypeWave"}</span>{' '}
                    <span style={{ color: '#569cd6' }}>events</span>
                    <span style={{ color: '#569cd6' }}>=</span>
                    <span style={{ color: '#569cd6' }}>{"{"}</span>
                    <span style={{ color: '#569cd6' }}>events</span>
                    <span style={{ color: '#569cd6' }}>{"}"}</span>{' '}
                    <span style={{ color: '#569cd6' }}>cursorCharacter</span>
                    <span style={{ color: '#569cd6' }}>=</span>
                    <span style={{ color: '#569cd6' }}>"_"</span>{' '}
                    <span style={{ color: '#569cd6' }}>/</span>
                    <span style={{ color: '#569cd6' }}>{">"}</span>
                    {'\n'}
                    {'    '}
                    <span style={{ color: '#569cd6' }}>{")"}</span>;
                    {'\n'}
                    <span style={{ color: '#569cd6' }}>{"}"}</span>
                </code>
                {"\n"}
            </pre>,
            "\n\nFancy, isn't it?"
        ]
    }
];

function Example() {
    return (
        <div className='container'>
            <TypeWave
                className="text"
                typeSpeed={5}
                deleteSpeed={50}
                events={events}
                showCursor={false}
            />
        </div>
    );
}

export default Example;