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

    fetch('http://localhost:3000/api/VOIE_PUBLIQUE')
      .then(response => response.json())
      .then(data => {
        console.log('fetched data', data);
        const newLayers = {};

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

        function fixCoordinates(coords) {
          if (!Array.isArray(coords)) return [];
          if (typeof coords[0] === 'number') {
            const newCoords = [];
            for (let i = 0; i < coords.length; i += 2) {
              newCoords.push([coords[i], coords[i + 1]]);
            }
            return newCoords;
          }
          return coords.map(coord => {
            if (Array.isArray(coord) && coord.length > 2) {
              return [coord[0], coord[1]];
            }
            return coord;
          });
        }

        let ignoredRoutes = 0;

        const wrappedData = {
          type: "FeatureCollection",
          features: data
            .map(item => {
              try {
                const coords = JSON.parse(item.coordinates);
                const cleanCoords = fixCoordinates(coords);

                if (!Array.isArray(cleanCoords) || cleanCoords.length < 2) {
                  console.warn("Coordonnées invalides pour:", item.NOM_TOPO);
                  ignoredRoutes++;
                  return null;
                }

                const allPointsValid = cleanCoords.every(
                  pt => Array.isArray(pt) && pt.length === 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number'
                );

                if (!allPointsValid) {
                  console.warn("Points invalides pour:", item.NOM_TOPO, cleanCoords);
                  ignoredRoutes++;
                  return null;
                }

                return {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: cleanCoords
                  },
                  properties: {
                    NOM_TOPO: item.NOM_TOPO,
                    HIERARCHI: item.HIERARCHI
                  }
                };
              } catch (e) {
                console.error("Erreur parsing pour:", item.NOM_TOPO, item.coordinates, e);
                ignoredRoutes++;
                return null;
              }
            })
            .filter(f => f !== null)
        };

        console.log(`Nombre de routes ignorées: ${ignoredRoutes}`);

        const geoJsonLayer = L.geoJSON(wrappedData, {
          style: feature => ({
            color: getColor(feature?.properties?.HIERARCHI),
            weight: 5,
            opacity: 1,
            fillOpacity: 0
          }),
          onEachFeature: (feature, layer) => {
            const type = feature.properties?.HIERARCHI || 'Autre';

            if (!newLayers[type]) {
              newLayers[type] = [];
            }
            newLayers[type].push(layer);

            if (feature.properties?.NOM_TOPO) {
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

    return () => {
      if (map) {
        map.remove();
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
