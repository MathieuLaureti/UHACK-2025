import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';
import Login from './login';

const MapPage = () => {
  const [layersByType, setLayersByType] = useState({});
  const [mapInstance, setMapInstance] = useState(null);

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

    const newLayers = {};

    Promise.all([
      fetch('http://localhost:3000/api/TROTTOIR').then(res => res.json()),
      fetch('http://localhost:3000/api/VOIE_PUBLIQUE').then(res => res.json())
    ])
    .then(([trottoirData, routeData]) => {
      console.log('Fetched trottoirs and routes');

      const trottoirLayers = [];
      const routeLayersByType = {};

      // Ajouter les trottoirs
      trottoirData.forEach(item => {
        try {
          if (!item.coordinates) return;
          const coords = JSON.parse(item.coordinates);

          if (!Array.isArray(coords) || coords.length < 2) return;
          const allPointsValid = coords.every(pt => Array.isArray(pt) && pt.length === 2);
          if (!allPointsValid) return;

          const fixedCoords = coords.map(pt => [pt[1], pt[0]]);

          const layer = L.polyline(fixedCoords, {
            color: '#bbbbbb',
            weight: 8,
            opacity: 0.5
          });

          trottoirLayers.push(layer);

        } catch (e) {
          console.error('Erreur parsing trottoir:', item, e);
        }
      });

      // Groupe des trottoirs
      const trottoirsGroup = L.layerGroup(trottoirLayers).addTo(map);
      newLayers['Trottoirs'] = trottoirsGroup;

      // Ajouter les routes
      routeData.forEach(item => {
        try {
          if (!item.coordinates) return;
          const coords = JSON.parse(item.coordinates);

          if (!Array.isArray(coords) || coords.length < 2) return;
          const allPointsValid = coords.every(pt => Array.isArray(pt) && pt.length === 2);
          if (!allPointsValid) return;

          const fixedCoords = coords.map(pt => [pt[1], pt[0]]);

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

          const type = item.HIERARCHI || 'Autre';

          const layer = L.polyline(fixedCoords, {
            color: getColor(item.HIERARCHI),
            weight: 5,
            opacity: 1
          });

          if (!routeLayersByType[type]) routeLayersByType[type] = [];
          routeLayersByType[type].push(layer);

        } catch (e) {
          console.error('Erreur parsing route:', item, e);
        }
      });

      // Créer un LayerGroup pour chaque type de route
      for (const type in routeLayersByType) {
        const group = L.layerGroup(routeLayersByType[type]).addTo(map);
        newLayers[type] = group;
      }

      setLayersByType(newLayers);
    })
    .catch(error => {
      console.error('Erreur chargement des données:', error);
    });

    return () => {
      if (map) map.remove();
    };
  }, []);

  const toggleTypeVisibility = (typeName) => {
    const group = layersByType[typeName];
    if (!group) return;

    if (mapInstance && mapInstance.hasLayer(group)) {
      mapInstance.removeLayer(group);
    } else if (mapInstance) {
      group.addTo(mapInstance);
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
          flexDirection: 'column'
        }}>
          <Legend toggleTypeVisibility={toggleTypeVisibility} />
          <Login />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
