import React, { useEffect, useState } from 'react';

const App = () => {
    const [message, setMessage] = useState('Loading...');
    useEffect(() => {
        const fetchMessage = async () => {
            const response = await fetch(`http://localhost:${import.meta.env.PUBLIC_BACKEND_PORT}`)
            console.log(response);
            
            setMessage(await response.text());
        }
        fetchMessage();
    }, [message]);
    
    return <h1>Server says: {message}</h1>;
}

export default App;