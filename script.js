// Variables globales
var map;
var currentBasemap;

// Función para cambiar el basemap
function changeBasemap(basemapUrl) {
  if (currentBasemap) {
    map.removeLayer(currentBasemap);
  }
  const tiles = L.tileLayer(basemapUrl, { attribution: '' });
  tiles.addTo(map);
  tiles.on('load', function () {
    currentBasemap = tiles;
  });
}

// Función para mostrar las coordenadas del marcador
function showMarkerCoordinates(marker) {
  var position = marker.getLatLng();
  marker.setPopupContent("<b>Coordenadas WGS 84</b><br>Latitud: " + position.lat.toFixed(6) + "<br>Longitud: " + position.lng.toFixed(6));
  marker.openPopup();
}


function setgeoJson(data){
  var geoJsonLayer = L.geoJson(data, {
    style: function(feature){
      var fillColor;
      colors = ["#85C1E9", "#A9CCE3", "#3498DB", "#2E86C1", "#2874A6"];
      fillColor = colors[Math.floor(Math.random() * colors.length)];
      return { color: "#fff", weight: 0.2, fillColor: fillColor, fillOpacity: .5 };
    },
    onEachFeature: function(feature, layer){
      layer.bindPopup( "<strong>Especie: " + feature.properties.species + "<br/> Provincia: " + feature.properties.stateProvi + "<br/> Avistamiento: " + feature.properties.eventDate )
    }
  }
 ).addTo(map);
  // geoJsonLayer.eachLayer(function (layer) {
  //     layer._path.id = 'estado' + layer.feature.properties.state_code+'-mun'+layer.feature.properties.mun_code;
  // });
 }
 
// Función para inicializar el mapa
function initMap() {
  // Creamos el mapa
  map = L.map('mapid').setView([-1.180947, -78.414917], 8);

  var redIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  // Agregamos un marcador
  var marker = L.marker([-1.180947, -78.414917], { draggable: true, icon: redIcon }).addTo(map);

  marker.bindPopup("<b>Coordenadas WGS 84</b><br>Latitud: " + marker.getLatLng().lat.toFixed(6) + "<br>Longitud: " + marker.getLatLng().lng.toFixed(6)).openPopup();

  marker.on('mousemove', function (event) {
    showMarkerCoordinates(marker);
  });

  // Añadimos el basemap inicial
  var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' });
  streets.addTo(map);
  currentBasemap = streets;

  // Agregamos los botones para cambiar de basemap
  var openStreetMapButton = document.getElementById('openstreetmap-button');
  openStreetMapButton.addEventListener('click', function () {
    changeBasemap('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });

  var esriButton = document.getElementById('esri-button');
  esriButton.addEventListener('click', function () {
    changeBasemap('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
  });

  var openTopoMapButton = document.getElementById('opentopomap-button');
  openTopoMapButton.addEventListener('click', function () {
    changeBasemap('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
  });
  
  // $.getJSON("states.geojson",function(data){
  //   L.geoJson(data).addTo(map);
  // });
   
   //var munjson;
   $.getJSON("osos.geojson", setgeoJson);
}

// Inicializamos el mapa cuando la página carga
window.onload = initMap;
