import requests
import json


def get_current_weather(location, api_key="74db61df503f4befa2b221929250503", aqi="yes"):
    """
    Get current weather data for a location using WeatherAPI.com.

    Parameters:
    -----------
    location : str
        Location name (e.g., "Berkeley"), zip/postal code, latitude/longitude (e.g., "37.8716,-122.2727"),
        or IP address
    api_key : str
        Your WeatherAPI.com API key (default is the example key from the URL)
    aqi : str
        Include air quality data, "yes" or "no" (default: "no")

    Returns:
    --------
    dict
        Dictionary containing the weather data response

    Example:
    --------
    >>> get_current_weather("Berkeley")
    {
        "location": {"name": "Berkeley", "region": "California", ...},
        "current": {"temp_c": 18.0, "temp_f": 64.4, ...}
    }
    """
    # Build URL
    base_url = "http://api.weatherapi.com/v1/current.json"

    # Set up parameters
    params = {
        "key": api_key,
        "q": location,
        "aqi": aqi
    }

    # Make API request
    try:
        response = requests.get(base_url, params=params)

        # Check if request was successful
        response.raise_for_status()  # Raise exception for HTTP errors (4xx, 5xx)

        # Parse JSON response
        data = response.json()
        # print(data)
        return data

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP Error occurred: {http_err}")
        if response.status_code == 400:
            error_data = response.json()
            print(f"API Error: {error_data.get('error', {}).get('message', 'Unknown error')}")
        return None

    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection Error occurred: {conn_err}")
        return None

    except requests.exceptions.Timeout as timeout_err:
        print(f"Timeout Error occurred: {timeout_err}")
        return None

    except requests.exceptions.RequestException as req_err:
        print(f"Request Error occurred: {req_err}")
        return None

    except json.JSONDecodeError as json_err:
        print(f"JSON Decode Error occurred: {json_err}")
        return None


def display_weather_summary(weather_data):
    """
    Display a formatted summary of weather data.

    Parameters:
    -----------
    weather_data : dict
        Weather data dictionary returned by get_current_weather()
    """
    if not weather_data:
        print("No weather data available.")
        return

    try:
        location = weather_data["location"]
        current = weather_data["current"]

        print(f"Weather for {location['name']}, {location['region']}, {location['country']}")
        print(f"Local time: {location['localtime']}")
        print("-" * 40)
        print(f"Temperature: {current['temp_c']}°C / {current['temp_f']}°F")
        print(f"Condition: {current['condition']['text']}")
        print(f"Wind: {current['wind_kph']} kph, {current['wind_degree']}° {current['wind_dir']}")
        print(f"Pressure: {current['pressure_mb']} mb")
        print(f"Humidity: {current['humidity']}%")
        print(f"Cloud cover: {current['cloud']}%")
        print(f"Feels like: {current['feelslike_c']}°C / {current['feelslike_f']}°F")
        print(f"Visibility: {current['vis_km']} km")
        print(f"UV Index: {current['uv']}")

        if "air_quality" in current:
            print("-" * 40)
            print("Air Quality:")
            aqi = current["air_quality"]
            print(f"CO: {aqi.get('co', 'N/A')}")
            print(f"NO2: {aqi.get('no2', 'N/A')}")
            print(f"O3: {aqi.get('o3', 'N/A')}")
            print(f"SO2: {aqi.get('so2', 'N/A')}")
            print(f"PM2.5: {aqi.get('pm2_5', 'N/A')}")
            print(f"PM10: {aqi.get('pm10', 'N/A')}")
            if "us-epa-index" in aqi:
                print(f"US EPA Index: {aqi['us-epa-index']}")
            if "gb-defra-index" in aqi:
                print(f"UK DEFRA Index: {aqi['gb-defra-index']}")

    except KeyError as e:
        print(f"Error parsing weather data: Missing key {e}")


# Example usage
berkeley_weather = get_current_weather("Berkeley")