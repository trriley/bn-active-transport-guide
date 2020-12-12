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

  // define currentMonth as a global variable
  let currentMonth = '11_2020';

  // request a mapbox raster tile layer and add to map
  L.tileLayer('https://api.mapbox.com/styles/v1/trrile1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'ckhjhn6zt009g19qwjrvcve0p',
    accessToken: accessToken
  }).addTo(map);

  // load facilities
  $.getJSON("data/facilities.geojson", function (data) {
    drawFacilities(data);
  });

  // load counters
  $.getJSON("data/counts.geojson", function (data) {
    drawCounters(data);
    drawLegend(data);
  });

  // load parks
  $.getJSON("data/parks.geojson", function (data) {
    drawParks(data);
  });

  const landmarkIcon = L.icon({
    iconUrl: 'icons/noun_landmark_2181603_green.svg',
    iconSize: [30, 30]
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

    resizeCircles(counters);

    sequenceUI(counters);

    // add tooltip
    makeCounterTooltip(counters);
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

  function resizeCircles(counters) {

    counters.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties[currentMonth]));
      layer.setRadius(radius);
    });

    // update slider label with current month
    // TODO need to translate into something more readable
    $("#slider-label").html(`${currentMonth}`)

  }

  function sequenceUI(counters) {

    // use Set object instead of array to avoid duplicate values
    const monthValues = new Set();

    counters.eachLayer(function (layer) {
      for (prop in layer.feature.properties) {
        if (prop != 'name') {
          monthValues.add(prop);
        }
      }
    });

    // console.log([...monthValues])

    // create Leaflet control for the slider
    const sliderControl = L.control({
      position: 'bottomleft'
    });

    sliderControl.onAdd = function (map) {

      const controls = L.DomUtil.get("slider");

      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;

    }

    // add it to the map
    sliderControl.addTo(map);

    // select the slider's input and listen for change
    $('#slider input[type=range]')
      .on('input', function () {

        // console.log(this.value);

        // current value of slider is current month
        let sliderInput = +this.value;

        // hacky solution to limit input to only 12 most recent months
        if (monthValues.size > 12) {
          sliderInput += (monthValues.size - 12);
        }

        currentMonth = [...monthValues][sliderInput - 1];
        // console.log(currentMonth)

        // resize the circles with updated month
        resizeCircles(counters);

        // update tooltip
        makeCounterTooltip(counters);
      });
  }

  function makeCounterTooltip(counters) {
    // update tooltip
    counters.eachLayer(function (layer) {
      const props = layer.feature.properties;
      let value = props[currentMonth];
      if (!value) {
        value = "Unavailable"
      }
      const popupInfo = `<b>${props["name"]}</b><br>Monthly average: ${value}`;
      layer.bindPopup(popupInfo);
    });
  }

  function drawParks(data) {
    // TODO need to add popup and mouseover affordance
    // also add in addtl information to geojson file to
    // populate popup
    const parks = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        return L.marker(ll, {
          icon: landmarkIcon
        });
      }
    }).addTo(map);

    // add tooltip
    parks.eachLayer(function (layer) {
      const props = layer.feature.properties;
      let popupInfo = `<b>${props["name"]}</b>`;
      layer.bindPopup(popupInfo);
    });
  }

  function drawFacilities(data) {
    // TODO need to separate facilities based on type
    // and symbolize accordingly
    // additionally, it may make sense to make them appear only at certain
    // zoom levels
    const facilities = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          color: '#53565A',
          fillOpacity: 1,
          radius: 2
        });
      }
    }).addTo(map);

    // add tooltip
    facilities.eachLayer(function (layer) {
      const props = layer.feature.properties;
      // console.log(props);
      let popupInfo = `<b>${props["type"]}</b>`;
      layer.bindPopup(popupInfo);
    });
  }
})();
