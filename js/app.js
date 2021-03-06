(function(){
  // initialize map, centered on Kenya
  const map = L.map('map', {
    zoomSnap: .1,
    center: [40.49828, -88.98337],
    zoom: 12,
    minZoom: 10,
    maxZoom: 15,
    maxBounds: L.latLngBounds([40.2, -89.2], [40.7, -88.7]),
    zoomControl: false
  });

  const accessToken = 'pk.eyJ1IjoidHJyaWxlMSIsImEiOiJja2ljOWtranEwM2xvMnhrODVpcjZuM2t4In0.l8PybKD_NV7k9Fv4LaXOVQ';

  // define currentMonth as a global variable
  let currentMonth = '11_2020';

  // initialize UI element tracker variables
  let infoToggle = false;
  let legendToggle = false;

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

  // load points of interest
  $.getJSON("data/poi.geojson", function (data) {
    drawPOI(data);
  });

  // load icons
  const parkIcon = L.icon({
    iconUrl: 'icons/noun_landmark_2181603_green.svg',
    iconSize: [30, 30]
  });

  const transitIcon = L.icon({
    iconUrl: 'icons/noun_Bus_2558229.svg',
    iconSize: [30, 30]
  });

  const defaultIcon = L.icon({
    iconUrl: 'icons/noun_landmark_2181603.svg',
    iconSize: [30, 30]
  });

  const restroomIcon = L.icon({
    iconUrl: 'icons/restrooms-black-14.svg',
    iconSize: [14, 14]
  });

  const bikeRackIcon = L.icon({
    iconUrl: 'icons/bike-rack-black-14.svg',
    iconSize: [14, 14]
  });

  const bikeFixIcon = L.icon({
    iconUrl: 'icons/bike-repairs-black-14.svg',
    iconSize: [14, 14]
  });

  const bikeShareIcon = L.icon({
    iconUrl: 'icons/bike-rental-black-14.svg',
    iconSize: [14, 14]
  });

  function drawCounters(data) {
    const counters = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
          color: '#f7f7f5',
          fillColor: '#653279',
          opacity: 1,
          fillOpacity: .9,
          weight: 2
        });
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
    // detect medium screen
    const mediaSizeQueryMedium = window.matchMedia('(min-width: 800px)');
    // detect small screen
    const mediaSizeQuerySmall = window.matchMedia('(min-width: 640px)');

    // create Leaflet control for the legend
    const legendControl = L.control({
      position: mediaSizeQuerySmall.matches ? 'bottomright': 'topright'
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
    const minimumRadius = 3;
    const scaleFactor = 1;
    return (radius * scaleFactor) + minimumRadius;

  }

  function resizeCircles(counters) {

    counters.eachLayer(function (layer) {
      const radius = calcRadius(Number(layer.feature.properties[currentMonth]));
      layer.setRadius(radius);
    });

    $("#current-month-legend").html(`${expandDate(currentMonth)}`)
    $("#current-month-slider").html(`${expandDate(currentMonth)}`)

  }

  function sequenceUI(counters) {

    // detect medium screen
    const mediaSizeQueryMedium = window.matchMedia('(min-width: 800px)');
    // detect small screen
    const mediaSizeQuerySmall = window.matchMedia('(min-width: 640px)');

    // get DOM elements that will be modified by UI
    const infoPanelDOM = document.getElementById('info');
    const infoIconDOM = document.getElementById('info-icon');
    const legendIconDOM = document.getElementById('legend-icon');
    const mapDOM = document.getElementById('map');
    const legendDOM = document.getElementById('legend');

    // use Set object instead of array to avoid duplicate values
    const monthValues = new Set();

    counters.eachLayer(function (layer) {
      for (prop in layer.feature.properties) {
        if (prop != 'name' & prop != 'longName') {
          monthValues.add(prop);
        }
      }
    });

    // console.log([...monthValues])

    // create Leaflet control for the slider
    const sliderControl = L.control({
      position: mediaSizeQuerySmall.matches ? 'bottomleft' : 'bottomright'
    });

    sliderControl.onAdd = function (map) {

      const controls = L.DomUtil.get("slider-container");

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

    // add info button to map
    const infoButtonControl = L.control({
      position: 'topleft'
    });

    infoButtonControl.onAdd = function (map) {

      const controls = L.DomUtil.get("info-button");

      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;

    }

    infoButtonControl.addTo(map);

    $('#info-button')
      .on('mouseover', function () {
          infoIconDOM.style.fill = 'rgba(255, 255, 255)';
      })
      .on('mouseout', function () {
          infoIconDOM.style.fill = 'currentColor'; // gray button
      })
      .on('click', function () {
        if (infoToggle) {
            // infoIconDOM.style.fill = 'currentColor'; // gray button
            // infoPanelDOM.style.visibility = 'visible';
            infoPanelDOM.style.display = 'block';
            if (!mediaSizeQueryMedium.matches) {
              mapDOM.classList.toggle('viewport-twothirds');
              mapDOM.classList.toggle('viewport-full');
            }
        } else {
            // infoIconDOM.style.fill = 'rgba(146, 146, 239, 0.8)'; // blue button
            // infoPanelDOM.style.visibility = 'hidden';
            infoPanelDOM.style.display = 'none';
            if (!mediaSizeQueryMedium.matches) {
              mapDOM.classList.toggle('viewport-twothirds');
              mapDOM.classList.toggle('viewport-full');
            }
        }
        infoToggle = !infoToggle
      });

    // add legend toggle button to map
    const legendButtonControl = L.control({
      position: 'topleft'
    });

    legendButtonControl.onAdd = function (map) {

      const controls = L.DomUtil.get('legend-button');

      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);

      return controls;

    }

    legendButtonControl.addTo(map);

    $('#legend-button')
      .on('mouseover', function () {
        legendIconDOM.style.fill = 'rgba(255, 255, 255)';
      })
      .on('mouseout', function () {
        legendIconDOM.style.fill = 'currentColor'; // gray button
      })
      .on('click', function () {
        if (legendToggle) {
            // infoIconDOM.style.fill = 'currentColor'; // gray button
            // infoPanelDOM.style.visibility = 'visible';
            legendDOM.style.display = 'block';
        } else {
            // infoIconDOM.style.fill = 'rgba(146, 146, 239, 0.8)'; // blue button
            // infoPanelDOM.style.visibility = 'hidden';
            legendDOM.style.display = 'none';
        }
        legendToggle = !legendToggle
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
      value = value.toLocaleString('default', { maximumFractionDigits: 0 });
      const popupInfo = `<b>${props["longName"]}</b><br>${expandDate(currentMonth)} average: ${value}`;
      layer.bindPopup(popupInfo);
    });
  }

  function expandDate(currentMonth) {
    // console.log(currentMonth);
    const currentMonthSplit = currentMonth.split('_');
    // console.log(currentMonthSplit[1], currentMonthSplit[0], 1);
    const currentMonthDate = new Date(currentMonthSplit[1], (currentMonthSplit[0]-1))
    // console.log(currentMonthDate);
    // console.log(currentMonthDate.toLocaleString('default', { month: 'short', year: '2-digit' }));
    return currentMonthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
  }

  function drawPOI(data) {
    // TODO need to add popup and mouseover affordance
    // also add in addtl information to geojson file to
    // populate popup
    const poi = L.geoJSON(data, {
      pointToLayer: function (feature, ll) {
        const type = feature.properties.type;
        switch(type) {
          case "park":
            return L.marker(ll, { icon: parkIcon });
            break;
          case "service":
            return L.marker(ll, { icon: defaultIcon });
            break;
          case "transit":
            return L.marker(ll, { icon: transitIcon });
        }
      }
    }).addTo(map);

    // add tooltip
    poi.eachLayer(function (layer) {
      const props = layer.feature.properties;
      let popupInfo = `<h3 class="txt-bold">${props["name"]}</h3>`
      // check for sites which have a photo associated
      if (props["img"]) {
        popupInfo +=
        `
        <div class="w240">
          <img class="poi-popup" src="images/${props["img"]}"</img>
        </div>
        `;
      }
      if (props["desc"]) {
        popupInfo +=
        `
        <p>${props["desc"]}</p>
        `;
      }
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
        const type = feature.properties.type;
        switch(type) {
          case "Restroom":
            return L.marker(ll, { icon: restroomIcon });
            break;
          case "Bike Rack":
            return L.marker(ll, { icon: bikeRackIcon });
            break;
          case "Bike Share 309 Stations":
            return L.marker(ll, { icon: bikeShareIcon });
            break;
          case "Fix-It Station":
            return L.marker(ll, { icon: bikeFixIcon });
        }
      }
    });

    // add tooltip
    facilities.eachLayer(function (layer) {
      const props = layer.feature.properties;
      // console.log(props);
      let popupInfo = `<b>${props["type"]}</b>`;
      layer.bindPopup(popupInfo);
    });

    // hide facilities layer at lower zoom levels
    // helps declutter the map
    map.on('zoomend', function facilitiesZoomEvent() {
      let zoomLevel = map.getZoom();
      if (zoomLevel < 13.8) {
        if (map.hasLayer(facilities)) {
          map.removeLayer(facilities);
        } else {
          // console.log("facilities not found")
        }
      } else {
        if (map.hasLayer(facilities)) {
          // console.log("facilities already shown");
        } else {
          map.addLayer(facilities);
        }
      }
      // console.log(`Current Zoom Level = ${zoomLevel}`)
    });
  }
})();
