import React from 'react';

const TestApp = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>🚨 TEST APP WORKING!</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '2px solid red' }}>
        <h2>Debug Info:</h2>
        <p>✅ React is rendering</p>
        <p>✅ Components are loading</p>
        <p>✅ CSS styles are working</p>
        <button onClick={() => alert('JavaScript is working!')}>Test JavaScript</button>
      </div>
    </div>
  );
};

export default TestApp;