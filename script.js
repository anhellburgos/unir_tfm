// Variables globales
var map;
var currentBasemap;
var overlayLayers = {};

// Función para cambiar el basemap
function changeBasemap(basemapUrl) {
  if (currentBasemap) {
    map.removeLayer(currentBasemap);
  }
  const tiles = L.tileLayer(basemapUrl, { attribution: '' }).addTo(map);
  currentBasemap = tiles;
}

// Función para mostrar las coordenadas del marcador
function showMarkerCoordinates(marker) {
  const position = marker.getLatLng();
  marker.setPopupContent(`<b>Coordenadas WGS 84</b><br>Latitud: ${position.lat.toFixed(6)}<br>Longitud: ${position.lng.toFixed(6)}`);
  marker.openPopup();
}
// Función para cargar y agregar capas GeoJSON al mapa
function loadGeoJSON(url, name, markerIcon = null) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      let layer;
      if (markerIcon) {
        layer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => L.marker(latlng, { icon: markerIcon })
        });
      } else {
        layer = L.geoJSON(data);
      }
      overlayLayers[name] = layer.addTo(map);
    });
}

// Función para inicializar el mapa
function initMap() {
  map = L.map('mapid').setView([-1.724593, -79.552002], 6);

  const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
  currentBasemap = streets;

  Promise.all([
    loadGeoJSON('osos.geojson', 'Avistamiento de osos', new L.Icon({
      iconUrl: 'osito.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    })),
    loadGeoJSON('bosques_vegetacion.geojson', 'Bosques y Vegetación'),
    loadGeoJSON('areas_protegidas.geojson', 'Áreas Protegidas'),
    loadGeoJSON('provincias.geojson', 'Provincias'),
    loadGeoJSON('cantones.geojson', 'Cantones'),
    loadGeoJSON('parroquias.geojson', 'Parroquias')
  ]).then(() => {
    L.control.layers(null, overlayLayers, { collapsed: false }).addTo(map);
    ['Bosques y Vegetación', 'Provincias', 'Cantones', 'Parroquias'].forEach(layerName => {
      map.removeLayer(overlayLayers[layerName]);
    });
  });

  const redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const marker = L.marker([-0.289763, -78.327026], { draggable: true, icon: redIcon }).addTo(map);
  marker.bindPopup(`<b>Coordenadas WGS 84</b><br>Latitud: ${marker.getLatLng().lat.toFixed(6)}<br>Longitud: ${marker.getLatLng().lng.toFixed(6)}`).openPopup();

  marker.on('drag', event => showMarkerCoordinates(marker));

  document.getElementById('openstreetmap-button').addEventListener('click', () => changeBasemap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));
  document.getElementById('esri-button').addEventListener('click', () => changeBasemap('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'));
  document.getElementById('opentopomap-button').addEventListener('click', () => changeBasemap('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'));
  document.getElementById('CartoDB.DarkMatterNoLabels').addEventListener('click', () => changeBasemap('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'));

}
// Inicializamos el mapa cuando la página carga
window.onload = initMap;
