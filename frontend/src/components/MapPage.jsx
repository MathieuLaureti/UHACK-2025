import React, { useEffect, useState } from 'react';
import Legend from '../components/Legend';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Login from '../components/login';

const MapPage = () => {
  const [layersByType, setLayersByType] = useState({});
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    let map;
  
    if (L.DomUtil.get('map') != null) {
      L.DomUtil.get('map')._leaflet_id = null; // Reset id (problème vite hot reload)
    }
  
    map = L.map('map').setView([45.4765, -75.7013], 13);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    setMapInstance(map);
  
    fetch('http://localhost:3000/api/VOIE_PUBLIQUE')
      .then(response => response.json())
      .then(data => {
        const newLayers = {};
        //console.log("fetched data", data);
        console.log("fetched data", data);
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
  
        const geoJsonLayer = L.geoJSON(data, {
          style: function (feature) {
            return {
              color: getColor(feature.properties.HIERARCHI),
              weight: 3,
              opacity: 0.8
            };
          },
          onEachFeature: function (feature, layer) {
            const type = feature.properties.HIERARCHI || 'Autre';
  
            if (!newLayers[type]) {
              newLayers[type] = [];
            }
            newLayers[type].push(layer);
  
            if (feature.properties && feature.properties.NOM_TOPO) {
              const tooltipContent = document.createElement('div');
              tooltipContent.textContent = feature.properties.NOM_TOPO;
              layer.bindTooltip(tooltipContent, {
                permanent: false,
                direction: 'top'
              });
            }
  
            layer.addTo(map);
          }
        });
  
        setLayersByType(newLayers);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des voies publiques:', error);
      });
  
    // TRÈS IMPORTANT : détruire la carte proprement si le composant se démonte
    return () => {
      if (map) {
        map.remove();  // => détruit tous les handlers (drag, zoom etc.)
      }
    };
  }, []);
  

  const toggleTypeVisibility = (typeName) => {
    if (!layersByType[typeName]) return;

    layersByType[typeName].forEach(layer => {
      if (mapInstance && mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      } else if (mapInstance) {
        layer.addTo(mapInstance);
      }
    });
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
        {/* Map container */}
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

        {/* Legend */}
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
