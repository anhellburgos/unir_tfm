// Variables globales
var map;
var currentBasemap;
var overlayLayers = {};

// Función para cambiar el basemap
function changeBasemap(basemapUrl) {
  if (currentBasemap) {
    map.removeLayer(currentBasemap);
  }
  const tiles = L.tileLayer(basemapUrl, { attribution: '' });
  tiles.addTo(map);
  currentBasemap = tiles;
}

// Función para mostrar las coordenadas del marcador
function showMarkerCoordinates(marker) {
  var position = marker.getLatLng();
  marker.setPopupContent("<b>Coordenadas WGS 84</b><br>Latitud: " + position.lat.toFixed(6) + "<br>Longitud: " + position.lng.toFixed(6));
  marker.openPopup();
}

// Función para inicializar el mapa
function initMap() {
  // Creamos el mapa
  map = L.map('mapid').setView([-1.724593, -79.552002], 6);

  // Agregamos la capa base inicial
  var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' });
  streets.addTo(map);
  currentBasemap = streets;

  // Cargar capas GeoJSON y agregarlas por defecto
  fetch('osos.geojson')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var ososLayer = L.geoJSON(data);
      overlayLayers["Osos"] = ososLayer;
      ososLayer.addTo(map);
    });

  fetch('cantones.geojson')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var cantonesLayer = L.geoJSON(data);
      overlayLayers["Cantones"] = cantonesLayer;
      L.control.layers(null, overlayLayers, { collapsed: false }).addTo(map);
    });


  // Agregamos el marcador draggable
  var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  var marker = L.marker([-1.724593, -79.552002], { draggable: true, icon: redIcon }).addTo(map);

  marker.bindPopup("<b>Coordenadas WGS 84</b><br>Latitud: " + marker.getLatLng().lat.toFixed(6) + "<br>Longitud: " + marker.getLatLng().lng.toFixed(6)).openPopup();

  marker.on('drag', function (event) {
    showMarkerCoordinates(marker);
  });

  // Botones para cambiar los basemaps
  document.getElementById('openstreetmap-button').addEventListener('click', function () {
    changeBasemap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });

  document.getElementById('esri-button').addEventListener('click', function () {
    changeBasemap('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
  });

  document.getElementById('opentopomap-button').addEventListener('click', function () {
    changeBasemap('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
  });
}

// Inicializamos el mapa cuando la página carga
window.onload = initMap;