import { useState } from 'react';
const modules = import.meta.glob('./**/Example.jsx');

const examples = Object.keys(modules).map((key) => ({
    name: key.split('/')[1],
    module: modules[key]
}));

function Examples() {
    const [Component, setComponent] = useState();

    console.log(examples);

    const loadComponent = async (moduleImport) => {
        const { default: component } = await moduleImport();
        setComponent(() => component);
    };

    return (
        <div className='main'>
            <div className='sidebar'>
                <h2>TypeWave JS</h2>
                {examples.map(({ name, module: moduleImport }) => (
                    <button
                        key={name}
                        type='button'
                        className='tab'
                        onClick={() => loadComponent(moduleImport)}
                    >
                        {name}
                    </button>
                ))}
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