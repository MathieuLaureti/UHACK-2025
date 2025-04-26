import React from 'react';

const MapPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '20px' }}>
        Carte de déneigement
      </h1>
      <iframe
        src="/snow_clearing_map.html"
        style={{
          width: '80%',
          height: '70vh',
          border: '2px solid #ccc',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
        }}
        title="Carte interactive de déneigement"
      />
    </div>
  );
};

export default MapPage;
