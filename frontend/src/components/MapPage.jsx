import React from 'react';
import Legend from '../components/Legend';

const MapPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Titre */}
      <h1 style={{ marginBottom: '20px' }}>
        Carte de déneigement
      </h1>

      {/* Conteneur flex pour IFRAME + LEGEND */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',    // ici on place la carte et la légende côte à côte
        alignItems: 'flex-start',
        gap: '20px',
        width: '100%',
        justifyContent: 'center'
      }}>
        {/* Carte en iframe */}
        <iframe
          src="/snow_clearing_map.html"
          style={{
            width: '800px',
            height: '700px',
            border: '2px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
          }}
          title="Carte interactive de déneigement"
        />

        {/* Légende à côté */}
        <Legend />
      </div>
    </div>
  );
};

export default MapPage;
