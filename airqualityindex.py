import requests
import io

class Client(object):
    DEFAULT_BASE_URL = "https://airquality.googleapis.com"

    def __init__(self, key):
        self.session = requests.Session()
        self.key = key

    def request_post(self, url, params):
        request_url = self.compose_url(url)
        request_header = self.compose_header()
        request_body = params

        response = self.session.post(
            request_url,
            headers=request_header,
            json=request_body,
        )

        return self.get_body(response)

    def compose_url(self, path):
        return self.DEFAULT_BASE_URL + path + "?" + "key=" + self.key

    @staticmethod
    def get_body(response):
        body = response.json()

        if "error" in body:
            return body["error"]

        return body

    @staticmethod
    def compose_header():
        return {
            "Content-Type": "application/json",
        }

def current_conditions(
    client,
    location,
    include_local_AQI=True,
    include_health_suggestion=False,
    include_all_pollutants=True,
    include_additional_pollutant_info=False,
    include_dominent_pollutant_conc=True,
    language=None,
):
    """
    See documentation for this API here
    https://developers.google.com/maps/documentation/air-quality/reference/rest/v1/currentConditions/lookup
    """
    params = {}

    if isinstance(location, dict):
        params["location"] = location
    else:
        raise ValueError(
            "Location argument must be a dictionary containing latitude and longitude"
        )

    extra_computations = []
    if include_local_AQI:
        extra_computations.append("LOCAL_AQI")

    if include_health_suggestion:
        extra_computations.append("HEALTH_RECOMMENDATIONS")

    if include_additional_pollutant_info:
        extra_computations.append("POLLUTANT_ADDITIONAL_INFO")

    if include_all_pollutants:
        extra_computations.append("POLLUTANT_CONCENTRATION")

    if include_dominent_pollutant_conc:
        extra_computations.append("DOMINANT_POLLUTANT_CONCENTRATION")

    if language:
        params["language"] = language

    params["extraComputations"] = extra_computations

    return client.request_post("/v1/currentConditions:lookup", params)


client = Client(key="AIzaSyB1OfBFYxJNPW45l7cU1fNOUlFxegZki4E")
# a location in Los Angeles, CA
location = {"longitude":-118.3,"latitude":34.1}
# a JSON response
current_conditions_data = current_conditions(
  client,
  location,
  include_health_suggestion=True,
  include_additional_pollutant_info=True
)
# print(current_conditions_data)


def get_air_quality(location):
    from gmaps import geocode_result
    result = geocode_result(location)
    location = {
        "longitude": result[0]["geometry"]["location"]["lat"],
        "latitude": result[0]["geometry"]["location"]["lng"]
    }
    current_conditions_data = current_conditions(
        client,
        location,
        include_health_suggestion=True,
        include_additional_pollutant_info=True
    )
    return current_conditions_data
