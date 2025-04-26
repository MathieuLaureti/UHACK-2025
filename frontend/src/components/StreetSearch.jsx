import React, { useState, useEffect } from 'react';

const StreetSearch = ({ streetsData, map }) => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [showFavorites, setShowFavorites] = useState(true); // NEW for collapsible list

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (searchInput.length > 1) {
      const filtered = streetsData.filter((street) =>
        (street.properties?.NOM_TOPO || '')
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
      setFilteredStreets(filtered);
    } else {
      setFilteredStreets([]);
    }
  }, [searchInput, streetsData]);

  const handleSelectStreet = (street) => {
    if (street && street.geometry) {
      let latLng;

      if (street.geometry.type === "LineString") {
        const [lng, lat] = street.geometry.coordinates[0];
        latLng = [lat, lng];
      } else if (street.geometry.type === "MultiLineString") {
        const [lng, lat] = street.geometry.coordinates[0][0];
        latLng = [lat, lng];
      } else {
        console.error('Type de géométrie inconnu:', street.geometry.type);
        return;
      }

      map.setView(latLng, 18);
      setSelectedStreet(street);
    }

    setSearchInput('');
    setFilteredStreets([]);
  };

  const handleAddFavorite = () => {
    if (selectedStreet) {
      const streetName = selectedStreet.properties?.NOM_TOPO;
      if (streetName && !favorites.includes(streetName)) {
        setFavorites([...favorites, streetName]);
      }
    }
  };

  const handleRemoveFavorite = (streetName) => {
    const confirmRemove = window.confirm(`Êtes-vous sûr de vouloir retirer "${streetName}" des favoris ?`);
    if (confirmRemove) {
      setFavorites(favorites.filter(name => name !== streetName));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredStreets.length > 0) {
      handleSelectStreet(filteredStreets[0]);
    }
  };

  const handleFavoriteClick = (favoriteName) => {
    const foundStreet = streetsData.find(
      street => (street.properties?.NOM_TOPO || '').toLowerCase() === favoriteName.toLowerCase()
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
      backgroundColor: '#1e1e1e', // same color as your theme
      color: 'white'
    }}>
      <input
        type="text"
        placeholder="Rechercher une rue..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
      />
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
              {street.properties?.NOM_TOPO}
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
