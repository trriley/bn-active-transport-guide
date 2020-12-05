(function(){
  // initialize map, centered on Kenya
  const map = L.map('map', {
    zoomSnap: .1,
    center: [40.49828, -88.98337],
    zoom: 12,
    minZoom: 10,
    maxZoom: 15,
    maxBounds: L.latLngBounds([40.2, -89.2], [40.7, -88.7])
  });

  const accessToken = 'pk.eyJ1IjoidHJyaWxlMSIsImEiOiJja2ljOWtranEwM2xvMnhrODVpcjZuM2t4In0.l8PybKD_NV7k9Fv4LaXOVQ';

  // request a mapbox raster tile layer and add to map
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'light-v10',
    accessToken: accessToken
  }).addTo(map);

  // create Leaflet control for the legend
  const legendControl = L.control({
    position: 'bottomright'
  });

  // when the control is added to the map
  legendControl.onAdd = function (map) {

    // select the legend using id attribute of legend
    const legend = L.DomUtil.get("legend");

    // disable scroll and click functionality
    L.DomEvent.disableScrollPropagation(legend);
    L.DomEvent.disableClickPropagation(legend);

    // return the selection
    return legend;

  }

  legendControl.addTo(map);


  function drawMap(data) {
    // adjust zoom level of map
    map.setZoom(map.getZoom() - .4);
  }

  function drawLegend(data) {
    // empty array to hold values
    const dataValues = [];
  }
})();
