# get_monthly_avg.R
# by Tim Riley
# takes counter data timeseries and coordinates and returns 
# monthly average counts in geoJSON format

# define packages
pkgs <- c("tidyverse", "janitor", "lubridate", "sf")

# uncomment and run as needed to install/update packages
# install.packages(pkgs)

# load packages
invisible(lapply(pkgs, require, character.only = TRUE))

# read count locations data
sites <- read_csv("data/locations.csv") %>%
  select(-sensor_id)

# read counter timeseries data
counts <- read_csv(
  "data/export.csv",
  skip = 2,
  col_types = cols(Time = col_datetime(format = "%m/%d/%Y %H:%M"))
) %>%
  clean_names() %>%
  remove_empty("cols") %>% # remove counters with only null data
  pivot_longer(2:12) %>%
  mutate(
    year = year(time),
    month = month(time)
  ) %>%
  group_by(name, year, month) %>%
  summarize(
    avg_count = value %>% 
      mean(trim = .05, na.rm = TRUE)
  ) %>%
  filter(avg_count > 1) %>%
  pivot_wider(
    id_cols = name,
    names_from = c(month, year),
    values_from = avg_count
  ) %>%
  left_join(sites) %>%
  st_as_sf(coords = c("long", "lat"))

write_sf(counts, "data/counts.geojson")
