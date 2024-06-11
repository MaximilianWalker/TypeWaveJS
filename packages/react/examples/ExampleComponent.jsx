import React, { useState, useEffect } from 'react';

function ExampleComponent() {
    const [Component, setComponent] = useState(null);

    useEffect(() => {
        const exampleDir = import.meta.env.VITE_EXAMPLE_DIR;
        import(`./${exampleDir}/Example.jsx`)
            .then(module => setComponent(() => module.default))
            .catch(error => console.error(`Failed to load the component from ${exampleDir}`, error));
    }, []);

    return Component ? <Component /> : <div>Loading...</div>;
};

export default ExampleComponent;