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

  // load counters
  $.getJSON("data/counts.geojson", function (data) {
    drawCounters(data);
    drawLegend(data);
  });

  // load parks
  $.getJSON("data/parks.geojson", function (data) {
    drawParks(data);
  });

  // load trails
  $.getJSON("data/trails.geojson", function (data) {
    drawTrails(data);
  });

  // load facilities
  $.getJSON("data/facilities.geojson", function (data) {
    drawFacilities(data);
  });

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


  function drawCounters(data) {
    const counters = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          color: '#653279',
          opacity: 1,
          weight: 2
        })
      }
    }).addTo(map);

    // fit the bounds of the map to the counters
    map.fitBounds(counters.getBounds());

    // adjust zoom level of map
    map.setZoom(map.getZoom() - .4);

    resizeCircles(counters, "11_2020");

  }

  function drawLegend(data) {

    // empty array to hold values
    const dataValues = [];

    data.features.forEach(function (counter) {
      // console.log(counter.properties);
      for (let month in counter.properties) {
        const value = counter.properties[month];

        if (+value) {
          dataValues.push(+value);
        }

      }
    });

    // sort the array
    const sortedValues = dataValues.sort(function(a, b) {
      return b - a;
    });

    const maxValue = Math.round(sortedValues[0] / 1000) * 1000;

    // calc the diameters
    const largeDiameter = calcRadius(maxValue) * 2,
        smallDiameter = largeDiameter / 2;

    // select our circles container and set the height
    $(".legend-circles").css('height', largeDiameter.toFixed());

    // set width and height for large circle
    $('.legend-large').css({
        'width': largeDiameter.toFixed(),
        'height': largeDiameter.toFixed()
    });
    // set width and height for small circle and position
    $('.legend-small').css({
        'width': smallDiameter.toFixed(),
        'height': smallDiameter.toFixed(),
        'top': largeDiameter - smallDiameter,
        'left': smallDiameter / 2
    })

    // label the max and median value
    $(".legend-large-label").html(maxValue.toLocaleString());
    $(".legend-small-label").html((maxValue / 2).toLocaleString());

    // adjust the position of the large based on size of circle
    $(".legend-large-label").css({
        'top': -11,
        'left': largeDiameter + 30,
    });

    // adjust the position of the large based on size of circle
    $(".legend-small-label").css({
        'top': smallDiameter - 11,
        'left': largeDiameter + 30
    });

    // insert a couple hr elements and use to connect value label to top of each circle
    $("<hr class='large'>").insertBefore(".legend-large-label")
    $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8);
  }

  function calcRadius(val) {

    const radius = Math.sqrt(val / Math.PI);
    return radius * 1; // adjust number as a scale factor

  }

  function resizeCircles(counters, currentMonth) {

    counters.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties[currentMonth]));
      layer.setRadius(radius);
    });

  }

  function drawParks(data) {
    // need to add popup and mouseover affordance
    // also add in addtl information to geojson file to
    // populate popup
    const parks = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          color: '#658D1B',
          fillOpacity: 1,
          radius: 5
        });
      }
    }).addTo(map);
  }

  function drawTrails(data) {
    // need to separate trails based on type
    // and add tooltip? or just legend entry
    console.log(data);
    const trails = L.geoJSON(data, {

    }).addTo(map);
  }

  function drawFacilities(data) {
    // need to separate facilities based on type
    const facilities = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          color: '#53565A',
          fillOpacity: 1,
          radius: 2
        });
      }
    }).addTo(map);
  }
})();
