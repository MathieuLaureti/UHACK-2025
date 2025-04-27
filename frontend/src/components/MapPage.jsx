import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';
import Login from './login';
import StreetSearch from './StreetSearch';

const MapPage = () => {
  const [layersByType, setLayersByType] = useState({});
  const [mapInstance, setMapInstance] = useState(null);
  const [streetsData, setStreetsData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favorisFilterActive, setFavorisFilterActive] = useState(true); // 👈 Nouveau pour suivre l'état du filtre

  useEffect(() => {
    let map;

    if (L.DomUtil.get('map') != null) {
      L.DomUtil.get('map')._leaflet_id = null;
    }

    map = L.map('map').setView([45.4765, -75.7013], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    setMapInstance(map);

    function getColor(hierarchie) {
      switch (hierarchie) {
        case 'Autoroute': return '#ffff36';
        case 'Artère principale': return '#f781bf';
        case 'Artère secondaire': return '#ff7f00';
        case 'Collectrice principale': return '#4daf4a';
        case 'Collectrice secondaire': return '#984ea3';
        case 'Rue locale': return '#377eb8';
        default: return '#000000';
      }
    }

    Promise.all([
      fetch('http://localhost:3000/api/TROTTOIR').then(res => res.json()),
      fetch('http://localhost:3000/api/VOIE_PUBLIQUE').then(res => res.json())
    ])
    .then(([trottoirData, routeData]) => {
      const newLayers = {};
      const trottoirLayers = [];
      const routeLayersByType = {};

      trottoirData.forEach(item => {
        try {
          if (!item.coordinates) return;
          const coords = JSON.parse(item.coordinates);
          if (!Array.isArray(coords) || coords.length < 2) return;

          const fixedCoords = coords.map(pt => [pt[1], pt[0]]);

          const layer = L.polyline(fixedCoords, {
            color: '#bbbbbb',
            weight: 8,
            opacity: 0.5
          });

          layer.bindTooltip(item.NOM_TOPO || 'Trottoir', {
            permanent: false,
            direction: 'top'
          });

          trottoirLayers.push(layer);

        } catch (e) {
          console.error('Erreur parsing trottoir:', item, e);
        }
      });

      const trottoirsGroup = L.layerGroup(trottoirLayers).addTo(map);
      newLayers['Trottoirs'] = trottoirsGroup;

      routeData.forEach(item => {
        try {
          if (!item.coordinates) return;
          const coords = JSON.parse(item.coordinates);
          if (!Array.isArray(coords) || coords.length < 2) return;

          const fixedCoords = coords.map(pt => [pt[1], pt[0]]);
          const type = item.HIERARCHI || 'Autre';

          const layer = L.polyline(fixedCoords, {
            color: getColor(item.HIERARCHI),
            weight: 5,
            opacity: 1
          });

          // Stocke infos dans options
          layer.options.nomTopo = item.NOM_TOPO;
          layer.options.hierarchie = item.HIERARCHI;
          layer.options.originalColor = getColor(item.HIERARCHI);

          layer.bindTooltip(item.NOM_TOPO || 'Route', {
            permanent: false,
            direction: 'top'
          });

          if (!routeLayersByType[type]) routeLayersByType[type] = [];
          routeLayersByType[type].push(layer);

          item.fixedCoords = fixedCoords;
        } catch (e) {
          console.error('Erreur parsing route:', item, e);
        }
      });

      for (const type in routeLayersByType) {
        const group = L.layerGroup(routeLayersByType[type]).addTo(map);
        newLayers[type] = group;
      }

      setLayersByType(newLayers);
      setStreetsData(routeData);
    })
    .catch(error => {
      console.error('Erreur chargement des données:', error);
    });

    return () => {
      if (map) map.remove();
    };
  }, []);

  const toggleTypeVisibility = (typeName, updatedFavorites = favorites) => {
    if (typeName === 'Favoris') {
      const nextState = !favorisFilterActive;
  
      Object.values(mapInstance._layers).forEach(layer => {
        if (layer.options && layer.options.nomTopo) {
          const isFavorite = updatedFavorites.includes(layer.options.nomTopo);
  
          if (isFavorite) {
            if (nextState) {
              // 🛠️ ACTIVER l'affichage favori : rouge pointillé
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
              // 🛠️ DÉSACTIVER l'affichage favori : remettre la couleur originale
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
        }
      });
  
      setFavorisFilterActive(nextState); // ➔ seulement après avoir fini les changements visuels
    } else {
      const group = layersByType[typeName];
      if (!group) return;
  
      if (mapInstance && mapInstance.hasLayer(group)) {
        mapInstance.removeLayer(group);
      } else if (mapInstance) {
        group.addTo(mapInstance);
      }
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      height: '100vh',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ marginBottom: '20px' }}>Carte de déneigement</h1>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        width: '100%',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '800px',
          height: '700px',
          border: '2px solid #ccc',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div id="map" style={{
            width: '100%',
            height: '100%'
          }}></div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '700px',
          overflowY: 'auto'
        }}>
          <Legend toggleTypeVisibility={(type) => toggleTypeVisibility(type, favorites)} />
          <StreetSearch streetsData={streetsData} map={mapInstance} favorites={favorites} setFavorites={setFavorites} />
          <Login />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
