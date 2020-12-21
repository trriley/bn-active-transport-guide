# bn-active-transport-guide

## Intro
This application presents trail counter data alongside some information about the trail system. It is powered primarily by Assembly.css and Leaflet.js, with a Mapbox tileset basemap and jQuery for asynchronous data loading.

## Data
Trail counter data downloaded from ecoCounter portal is processed in get_monthly_avg.R. The top 10% and bottom 10% of all counts are dropped from the monthly means in an attempt to exclude erroneous data. Other spatial data is processed (drop fields, transform projections) in process_geodata.R.

## Application
The BN Active Transportation Guide application can be accessed at this link: https://trriley.github.io/bn-active-transport-guide/
To see it alongside my other projects, check out my portfolio here: https://trriley.github.io/


## Attributions
Icons:
- Bus by i cons from the Noun Project

- landmark by Ates Evren Aydinel from the Noun Project

- trail amenity icons (restrooms, bike racks, etc.) from NPS symbol library
  https://github.com/nationalparkservice/symbol-library/
