import { createRoot } from "react-dom/client";

console.log('🎯 Ultra simple main.tsx executing...');

const UltraSimpleApp = () => {
  return (
    <div style={{ 
      backgroundColor: '#ff0000', 
      color: '#ffffff', 
      padding: '50px', 
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '30px' }}>🚨 EMERGENCY TEST</h1>
      <p>If you can see this RED screen, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <button 
        onClick={() => alert('JavaScript is working!')}
        style={{ 
          padding: '10px 20px', 
          fontSize: '18px', 
          marginTop: '20px',
          backgroundColor: 'white',
          color: 'red',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Click
      </button>
    </div>
  );
};

console.log('📍 Root element exists:', !!document.getElementById("root"));
createRoot(document.getElementById("root")!).render(<UltraSimpleApp />);