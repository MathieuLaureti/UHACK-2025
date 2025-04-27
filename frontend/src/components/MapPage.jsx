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
  const [favorisFilterActive, setFavorisFilterActive] = useState(true);

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
        if (!item.coordinates) return;
        const coords = JSON.parse(item.coordinates);
        if (!Array.isArray(coords) || coords.length < 2) return;

        const fixedCoords = coords.map(pt => [pt[1], pt[0]]);

        const layer = L.polyline(fixedCoords, {
          color: '#bbbbbb',
          weight: 8,
          opacity: 0.5
        });

        trottoirLayers.push(layer);
      });

      const trottoirsGroup = L.layerGroup(trottoirLayers).addTo(map);
      newLayers['Trottoirs'] = trottoirsGroup;

      routeData.forEach(item => {
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

        layer.options.nomTopo = item.NOM_TOPO;
        layer.options.hierarchie = item.HIERARCHI;
        layer.options.originalColor = getColor(item.HIERARCHI);

        if (!routeLayersByType[type]) routeLayersByType[type] = [];
        routeLayersByType[type].push(layer);

        item.fixedCoords = fixedCoords;
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

  // 🔥 useEffect qui surveille FAVORITES et actualise la carte automatiquement
  useEffect(() => {
    if (!mapInstance) return;

    Object.values(mapInstance._layers).forEach(layer => {
      if (layer.options && layer.options.nomTopo) {
        const isFavorite = favorites.includes(layer.options.nomTopo);

        if (isFavorite && favorisFilterActive) {
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
  }, [favorites, favorisFilterActive, mapInstance]);

  const toggleTypeVisibility = (typeName) => {
    if (typeName === 'Favoris') {
      setFavorisFilterActive(prev => !prev);
    } else {
      const group = layersByType[typeName];
      if (!group) return;

      if (mapInstance.hasLayer(group)) {
        mapInstance.removeLayer(group);
      } else {
        group.addTo(mapInstance);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', height: '100vh', boxSizing: 'border-box' }}>
      <h1 style={{ marginBottom: '20px' }}>Carte de déneigement</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', justifyContent: 'center' }}>
        <div style={{ width: '800px', height: '700px', border: '2px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
          <div id="map" style={{ width: '100%', height: '100%' }}></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '700px', overflowY: 'auto' }}>
          <Legend toggleTypeVisibility={toggleTypeVisibility} />
          <StreetSearch streetsData={streetsData} map={mapInstance} favorites={favorites} setFavorites={setFavorites} />
          <Login />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
