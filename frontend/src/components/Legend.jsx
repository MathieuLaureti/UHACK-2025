import React, { useState } from 'react';

const hierarchies = [
  { name: 'Autoroute', color: '#ffff36' },
  { name: 'Artère principale', color: '#f781bf' },
  { name: 'Artère secondaire', color: '#ff7f00' },
  { name: 'Collectrice principale', color: '#4daf4a' },
  { name: 'Collectrice secondaire', color: '#984ea3' },
  { name: 'Rue locale', color: '#377eb8' },
  { name: 'Trottoirs', color: '#bbbbbb' },
  { name: 'Favoris', color: '#FF0000', isDashed: true },
  { name: 'Autre', color: '#000000' }
];

const Legend = ({ toggleTypeVisibility }) => {
  const [disabledFilters, setDisabledFilters] = useState([]);

  const handleClick = (name) => {
    const isCurrentlyDisabled = disabledFilters.includes(name);

    // 🔥 Toujours appeler toggleTypeVisibility pour mettre à jour la carte
    toggleTypeVisibility(name);

    setDisabledFilters(prev => {
      if (isCurrentlyDisabled) {
        // Si le filtre était désactivé, on le réactive => on le retire des désactivés
        return prev.filter(f => f !== name);
      } else {
        // Sinon on le désactive => on l'ajoute dans disabled
        return [...prev, name];
      }
    });
  };

  return (
    <div style={{
      width: '200px',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
      fontSize: '14px',
      height: 'fit-content'
    }}>
      <h4>Types de voies</h4>
      {hierarchies.map((item, index) => (
        <button
          key={index}
          onClick={() => handleClick(item.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <div style={{
            backgroundColor: item.color,
            width: '18px',
            height: '18px',
            marginRight: '8px',
            borderRadius: '3px',
            border: item.isDashed ? '2px dashed red' : 'none'
          }}></div>

          <span style={{
            textDecoration: disabledFilters.includes(item.name) ? 'line-through' : 'none',
            color: disabledFilters.includes(item.name) ? '#888' : 'white'
          }}>
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Legend;
