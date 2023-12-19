const globalVars = {
  map: null,
  currentBasemap: null,
  overlayLayers: {}
};

function changeBasemap(basemapUrl) {
  const { map, currentBasemap } = globalVars;
  if (currentBasemap) {
    map.removeLayer(currentBasemap);
  }
  const tiles = L.tileLayer(basemapUrl, { attribution: '' }).addTo(map);
  globalVars.currentBasemap = tiles;
}

function loadGeoJSON(url, name, options = {}) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      const { map, overlayLayers } = globalVars;
      let layer;

      if (options.markerIcon) {
        layer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => {
            const selectedProperties = {
              basisOfRec: feature.properties.basisOfRec,
              species: feature.properties.species,
              stateProvi: feature.properties.stateProvi,
              decimalLat: feature.properties.decimalLat,
              decimalLon: feature.properties.decimalLon,
              eventDate: feature.properties.eventDate,
              references: feature.properties.references,
              identified: feature.properties.identified
            };

            const marker = L.marker(latlng, { icon: options.markerIcon });
            marker.on('click', () => {
              const popupContent = Object.entries(selectedProperties)
                .map(([key, value]) => {
                  if (key === 'references') {
                    return `<b>${key}:</b> <a href="${value}" target="_blank">${value}</a>`;
                  }
                  return `<b>${key}:</b> ${value}`;
                })
                .join('<br>');
              marker.bindPopup(popupContent).openPopup();
            });
            return marker;
          },
        });
      } else {
        layer = L.geoJSON(data, {
          style: options.style,
          pointToLayer: options.style ? null : (feature, latlng) => L.marker(latlng),
        });
      }

      if (options.style && !options.markerIcon) {
        layer.setStyle(options.style);
      }

      overlayLayers[name] = layer.addTo(map);
    });
}


function initializeMap() {
  globalVars.map = L.map('mapid').setView([-1.724593, -79.552002], 6);

  const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(globalVars.map);
  globalVars.currentBasemap = streets;

  const geoJSONData = [
    { url: 'osos.geojson', name: 'Avistamiento de osos', options: { markerIcon: new L.Icon({ iconUrl: 'osito.png', iconSize: [25, 25], iconAnchor: [12, 41], popupAnchor: [1, -34] }) } },
    { url: 'bosques_vegetacion.geojson', name: 'Bosques y Vegetación', options: { style: { color: 'purple', fillOpacity: 0.3 } } },
    { url: 'areas_protegidas.geojson', name: 'Áreas Protegidas', options: { style: { color: 'green', fillOpacity: 0.3 } } },
    { url: 'provincias.geojson', name: 'Provincias' },
    { url: 'cantones.geojson', name: 'Cantones' },
    { url: 'parroquias.geojson', name: 'Parroquias' }
  ];

  const geoJSONPromises = geoJSONData.map(item => loadGeoJSON(item.url, item.name, item.options));

  Promise.all(geoJSONPromises).then(() => {
    const { map, overlayLayers } = globalVars;
    L.control.layers(null, overlayLayers, { collapsed: false }).addTo(map);
    ['Bosques y Vegetación', 'Provincias', 'Cantones', 'Parroquias'].forEach(layerName => {
      map.removeLayer(overlayLayers[layerName]);
    });
  });

  const basemapButtons = {
    'openstreetmap-button': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'esri-button': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    'opentopomap-button': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    'CartoDB.DarkMatterNoLabels': 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
  };

  Object.keys(basemapButtons).forEach(buttonId => {
    document.getElementById(buttonId).addEventListener('click', () => changeBasemap(basemapButtons[buttonId]));
  });
}

window.onload = initializeMap;
