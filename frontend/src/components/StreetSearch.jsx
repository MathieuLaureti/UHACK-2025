import React, { useState, useEffect } from 'react';
import L from 'leaflet';

const StreetSearch = ({ streetsData, map, favorites, setFavorites }) => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [showFavorites, setShowFavorites] = useState(true);
  const [favoriteCircles, setFavoriteCircles] = useState([]);
  const [addressesData, setAddressesData] = useState([]);

  // Charger la table des adresses au démarrage
  useEffect(() => {
    fetch('http://localhost:3000/api/ADRESSE')
      .then(res => res.json())
      .then(data => setAddressesData(data))
      .catch(err => console.error('Erreur chargement adresse', err));
  }, []);

  // Charger favoris depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, [setFavorites]);

  // Sauvegarder favoris dans localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Mettre à jour les cercles sur la carte
  useEffect(() => {
    if (!map) return;

    favoriteCircles.forEach(circle => map.removeLayer(circle));

    const newCircles = [];

    favorites.forEach(fav => {
      if (fav.coords) {
        const circle = L.circle(fav.coords, {
          radius: 750,
          color: '#00BFFF',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);

        newCircles.push(circle);
      }
    });

    setFavoriteCircles(newCircles);
  }, [favorites, map]);

  // Filtrer recherche (rues + adresses)
  useEffect(() => {
    if (searchInput.length > 1) {
      const lowerSearch = searchInput.toLowerCase();
      const results = [];
  
      streetsData.forEach(street => {
        const streetName = (street.NOM_TOPO || '').toLowerCase();
        if (streetName.includes(lowerSearch)) {
          results.push({
            ...street,
            ADR_COMPLE: null // Ce sont des rues normales
          });
        }
      });
  
      addressesData.forEach(address => {
        const fullAddress = (address.ADR_COMPLE || '').toLowerCase();
        if (fullAddress.includes(lowerSearch)) {
          // On cherche la vraie rue correspondante dans streetsData
          const matchedStreet = streetsData.find(street => 
            fullAddress.includes((street.NOM_TOPO || '').toLowerCase())
          );
  
          if (matchedStreet && matchedStreet.fixedCoords?.length > 0) {
            results.push({
              ...matchedStreet,
              ADR_COMPLE: address.ADR_COMPLE // 🚀 important: on garde l'adresse complète
            });
          }
        }
      });
  
      setFilteredStreets(results);
    } else {
      setFilteredStreets([]);
    }
  }, [searchInput, streetsData, addressesData]);
  

  const handleSelectStreet = (item) => {
    if (!item) return;
  
    if (item.fixedCoords?.length > 0) {
      const [lat, lng] = item.fixedCoords[0];
      map.setView([lat, lng], 18);
      setSelectedStreet(item);
    } else {
      alert('Impossible de localiser cet élément.');
    }
  
    setSearchInput('');
    setFilteredStreets([]);
  };
  
  const handleAddFavorite = () => {
    if (selectedStreet) {
      const name = selectedStreet.NOM_TOPO;
      const adresse = selectedStreet.ADR_COMPLE || selectedStreet.NOM_TOPO;
      const coords = selectedStreet.fixedCoords?.length > 0 ? selectedStreet.fixedCoords[0] : null;
  
      if (!favorites.some(fav => fav.adresse === adresse)) {
        if (!coords) {
          alert('Impossible d’ajouter cette adresse : pas de coordonnées disponibles.');
          return;
        }
        setFavorites(prev => [...prev, { name, adresse, coords }]);
      }
    }
  };
  

  const handleRemoveFavorite = (favToRemove) => {
    const confirmRemove = window.confirm(`Retirer "${favToRemove.adresse}" des favoris ?`);
    if (confirmRemove) {
      setFavorites(prev => prev.filter(fav => fav.adresse !== favToRemove.adresse));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredStreets.length > 0) {
      handleSelectStreet(filteredStreets[0]);
    }
  };

  const handleFavoriteClick = (fav) => {
    if (fav.coords) {
      map.setView(fav.coords, 18);
    } else {
      alert('Coordonnées manquantes pour cette adresse.');
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
        placeholder="Rechercher une rue ou une adresse..."
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
        }}
      />

      {filteredStreets.length > 0 && (
        <ul style={{
          listStyleType: 'none',
          padding: 0,
          marginTop: '8px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
      {filteredStreets.map((street, idx) => (
        <li
          key={idx}
          onClick={() => handleSelectStreet(street)}
        style={{
          padding: '8px',
          cursor: 'pointer',
          borderBottom: '1px solid #555'
      }}>
    {street.ADR_COMPLE || street.NOM_TOPO}
  </li>
))}
        </ul>
      )}

      {selectedStreet && (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={handleAddFavorite}
            style={{
              padding: '8px',
              width: '100%',
              borderRadius: '4px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
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
              {favorites.map((fav, idx) => (
                <li key={idx} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    onClick={() => handleFavoriteClick(fav)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {fav.adresse}
                  </span>
                  <button
                    onClick={() => handleRemoveFavorite(fav)}
                    style={{
                      marginLeft: '8px',
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
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
