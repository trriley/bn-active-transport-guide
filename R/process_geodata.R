# process_geodata.R
# by Tim Riley
# reads shapefiles, selects features of interest, and converts into geoJSON

# define packages
pkgs <- c("tidyverse", "janitor", "sf")

# uncomment and run as needed to install/update packages
# install.packages(pkgs)

# load packages
invisible(lapply(pkgs, require, character.only = TRUE))


# load data from shapefiles -----------------------------------------------
parks <- read_sf("data/shp/Park_Point.shp") %>%
  st_transform(4326) %>%
  clean_names() %>%
  select(name) %>%
  filter(
    name %in% c(
      "Anderson Park",
      "Fairview Park",
      "Hidden Creek Nature Sanctuary",
      "One Normal Plaza",
      "Tipton Park (South Entrance)"
    )
  )

parks %>% write_sf("data/parks.geojson")

facilities <- read_sf("data/shp/Trail_Facilities.shp") %>%
  st_transform(4326) %>%
  clean_names() %>%
  rename(type = feature_typ) %>%
  select(type) %>%
  filter(
    type %in% c(
      "Restroom", 
      "Bike Rack",
      "Fix-It Station",
      "Bike Share 309 Stations"
    )
  )

facilities %>% write_sf("data/facilities.geojson")

trails <- read_sf("data/shp/Trails.shp") %>%
  st_transform(4326) %>%
  clean_names() %>%
  select(facilityid, name) %>%
  filter(
    facilityid %in% c(
      "PARK TRAILS",
      "CONSTITUTION TRAIL",
      "PROPOSED TRAIL"
    )
  )

trails %>% write_sf("data/trails.geojson")

