import React from 'react';

export default function PingPage() {
    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <h1>Pong!</h1>
            <p>The deployment is working successfully.</p>
            <p>Timestamp: {new Date().toISOString()}</p>
        </div>
    );
}
