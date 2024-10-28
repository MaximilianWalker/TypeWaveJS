import { TypeWave } from '@typewavejs/react';
import parse from 'html-react-parser';
import './Example.css';

const events = [
    {
        type: "type",
        value: <span style={{ color: '#569cd6' }}>ai-clone@diogocrava-os:~$ </span>
    },
    {
        type: "type",
        value: parse(`Sure thing! Here's a little snippet of React code, color-coded for your aesthetic enjoyment.

<pre style="color:#D1D1D1;">
<code>
<span style="color:#D94085;">import</span> React <span style="color:#D94085;">from</span> <span style="color:#66d9ef;">'react'</span>;

<span style="color:#66d9ef;">const</span> Component = <span style="color:#D94085;">(</span><span style="color:#66d9ef;">)</span> => <span style="color:#D94085;">{</span>
<span style="color:#D1D1D1;">  return</span> <span style="color:#D94085;"><</span><span style="color:#66d9ef;">div</span><span style="color:#D94085;">></span>
<span style="color:#D1D1D1;">    Hello from Diogo's AI Clone!</span>
<span style="color:#D94085;"><</span><span style="color:#D94085;">/</span><span style="color:#66d9ef;">div</span><span style="color:#D94085;">></span>
<span style="color:#D94085;">}</span>
<span style="color:#66d9ef;">export </span><span style="color:#66d9ef;">default</span> Component;
</code>
</pre>

Fancy, isn't it?`)
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