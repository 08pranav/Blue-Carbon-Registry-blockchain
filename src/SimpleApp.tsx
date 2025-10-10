import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Simple test components
const SimpleHome = () => (
  <div style={{ padding: '20px', background: 'lightgreen', minHeight: '100vh' }}>
    <h1 style={{ color: 'darkgreen', fontSize: '32px' }}>🌊 Blue Carbon Credits System</h1>
    <p style={{ fontSize: '18px', marginTop: '20px' }}>Frontend is working!</p>
    <div style={{ marginTop: '30px', padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h2>System Status:</h2>
      <p>✅ React Router Working</p>
      <p>✅ Components Rendering</p>
      <p>✅ Styles Loading</p>
      <p>✅ JavaScript Functional</p>
    </div>
  </div>
);

const SimpleApp = () => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<SimpleHome />} />
    </Routes>
  </BrowserRouter>
);

export default SimpleApp;