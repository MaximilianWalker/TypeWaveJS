import { useState, useEffect } from 'react';
const modules = import.meta.glob('./**/Example.jsx');

const examples = Object.keys(modules).map((key) => ({
    name: key.split('/')[1],
    module: modules[key]
}));

function Examples() {
    const [name, setName] = useState();
    const [Component, setComponent] = useState();

    const loadComponent = async (example) => {
        const { name, module: exampleModule } = example;
        const { default: component } = await exampleModule();
        setName(name);
        setComponent(() => component);
        window.history.pushState(null, '', `#${encodeURIComponent(name)}`);
    };

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const name = decodeURIComponent(hash.substring(1));
            const example = examples.find((e) => e.name === name);
            if (example) loadComponent(example);
        }
    }, []);

    return (
        <div className='main'>
            <div className='sidebar'>
                <h2>TypeWave JS</h2>
                <div className='tabs'>
                    {examples.map((example) => (
                        <button
                            key={example.name}
                            type='button'
                            className='tab'
                            onClick={() => loadComponent(example)}
                        >
                            {example.name}
                        </button>
                    ))}
                </div>
                <div></div>
            </div>
            <div className='container'>
                <div className='content'>
                    {Component && <Component />}
                </div>
            </div>
        </div>
    );
};

export default Examples;