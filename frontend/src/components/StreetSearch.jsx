import React, { useState, useEffect } from 'react';

const StreetSearch = ({ streetsData, map, favorites, setFavorites }) => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [showFavorites, setShowFavorites] = useState(true);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [setFavorites]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (searchInput.length > 1) {
      const uniqueNames = new Map();
  
      streetsData.forEach((street) => {
        const name = (street.NOM_TOPO || '').toLowerCase();
        if (name.includes(searchInput.toLowerCase()) && !uniqueNames.has(name)) {
          uniqueNames.set(name, street);
        }
      });
  
      setFilteredStreets(Array.from(uniqueNames.values()));
    } else {
      setFilteredStreets([]);
    }
  }, [searchInput, streetsData]);

  const handleSelectStreet = (street) => {
    if (street && street.fixedCoords && street.fixedCoords.length > 0) {
      const [lat, lng] = street.fixedCoords[0];
      map.setView([lat, lng], 18);
      setSelectedStreet(street);
    }

    setSearchInput('');
    setFilteredStreets([]);
  };

  const handleAddFavorite = () => {
    if (selectedStreet) {
      const streetName = selectedStreet.NOM_TOPO;
      if (streetName && !favorites.includes(streetName)) {
        const updatedFavorites = [...favorites, streetName];
        setFavorites(updatedFavorites);
  
        refreshFavoritesOnMap(updatedFavorites); // 🔥 avec la bonne liste
      }
    }
  };
  
  

  const handleRemoveFavorite = (streetName) => {
    const confirmRemove = window.confirm(`Êtes-vous sûr de vouloir retirer "${streetName}" des favoris ?`);
    if (confirmRemove) {
      const updatedFavorites = favorites.filter(name => name !== streetName);
      setFavorites(updatedFavorites);
      
      refreshFavoritesOnMap(updatedFavorites); // 🔥 avec la bonne liste
    }
  };
  
  
  const refreshFavoritesOnMap = (map, favorites) => {
    if (!map || !map._layers) return;
  
    Object.values(map._layers).forEach(layer => {
      if (layer.options && layer.options.nomTopo) {
        const isFavori = favorites.includes(layer.options.nomTopo);
  
        if (isFavori) {
          // 🔥 Si dans favoris ➔ mettre en rouge pointillé
          layer.setStyle({
            color: '#FF0000',
            weight: 5,
            opacity: 1,
            dashArray: '5,5'
          });
          if (layer._path) {
            layer._path.setAttribute('stroke-dasharray', '5,5');
          }
        } else {
          // 🔥 Sinon ➔ remettre à sa couleur d'origine
          layer.setStyle({
            color: layer.options.originalColor || '#000000',
            weight: 5,
            opacity: 1,
            dashArray: null
          });
          if (layer._path) {
            layer._path.removeAttribute('stroke-dasharray');
          }
        }
      }
    });
  };
  
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredStreets.length > 0) {
      handleSelectStreet(filteredStreets[0]);
    }
  };

  const handleFavoriteClick = (favoriteName) => {
    const foundStreet = streetsData.find(
      street => (street.NOM_TOPO || '').toLowerCase() === favoriteName.toLowerCase()
    );

    if (foundStreet) {
      handleSelectStreet(foundStreet);
    } else {
      alert('Rue introuvable!');
    }
  };

  return (
    <div style={{
      width: '250px',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
      fontSize: '14px',
      height: 'fit-content',
      backgroundColor: '#1e1e1e',
      color: 'white'
    }}>
      <input
        type="text"
        placeholder="Rechercher une rue..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
      style={{
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        backgroundColor: '#333',
        color: 'white',
        border: '1px solid #555',
        boxSizing: 'border-box'
  }}/>
      {filteredStreets.length > 0 && (
        <ul style={{
          listStyleType: 'none',
          padding: 0,
          marginTop: '8px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          {filteredStreets.map((street, index) => (
            <li
              key={index}
              onClick={() => handleSelectStreet(street)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #555'
              }}
            >
              {street.NOM_TOPO}
            </li>
          ))}
        </ul>
      )}

      {selectedStreet && (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={handleAddFavorite}
            style={{ padding: '8px', width: '100%', borderRadius: '4px', backgroundColor: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            ⭐ Ajouter aux favoris
          </button>
        </div>
      )}

      {favorites.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ cursor: 'pointer' }} onClick={() => setShowFavorites(!showFavorites)}>
            {showFavorites ? '⬇️ Favoris' : '➡️ Favoris'}
          </h4>
          {showFavorites && (
            <ul style={{
              listStyleType: 'none',
              padding: 0,
              marginTop: '8px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {favorites.map((name, idx) => (
                <li key={idx} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    onClick={() => handleFavoriteClick(name)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {name}
                  </span>
                  <button
                    onClick={() => handleRemoveFavorite(name)}
                    style={{ marginLeft: '8px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px' }}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default StreetSearch;
