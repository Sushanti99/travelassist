gmaps_key = "AIzaSyB1OfBFYxJNPW45l7cU1fNOUlFxegZki4E"

import googlemaps
from datetime import datetime

gmaps = googlemaps.Client(key=gmaps_key)


# Geocoding an address
def geocode_result(address):
    result = gmaps.geocode(address)
    return result

# Look up an address with reverse geocoding
reverse_geocode_result = gmaps.reverse_geocode((40.714224, -73.961452))

# Request directions via public transit
#
now = datetime.now()
directions_result = gmaps.directions("1713 Dwight Way, Berkeley",
                                     "University of California, Berkeley",
                                     mode="transit",
                                     departure_time=now)
# print(directions_result)


def get_directions(origin, destination, mode="transit"):
    now = datetime.now()
    directions_result = gmaps.directions(origin,
                                         destination,
                                         mode="transit",
                                         departure_time=now)
    # print(directions_result)
    return directions_result