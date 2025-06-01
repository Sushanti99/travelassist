export interface WeatherData {
  location: {
    name: string
    region: string
    country: string
    localtime: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
    }
    wind_kph: number
    wind_degree: number
    wind_dir: string
    pressure_mb: number
    humidity: number
    cloud: number
    feelslike_c: number
    feelslike_f: number
    vis_km: number
    uv: number
    air_quality?: {
      co: number
      no2: number
      o3: number
      so2: number
      pm2_5: number
      pm10: number
      "us-epa-index": number
      "gb-defra-index": number
    }
  }
}

export interface AirQualityData {
  indexes: {
    code: string
    displayName: string
    aqi: number
    aqiDisplay: string
    color: {
      red: number
      green: number
      blue: number
    }
    category: string
    dominantPollutant: string
  }[]
  pollutants: {
    code: string
    displayName: string
    fullName: string
    concentration: {
      value: number
      units: string
    }
    additionalInfo: {
      sources: string
      effects: string
    }
  }[]
  healthRecommendations?: {
    generalPopulation: string
    elderly: string
    lungDiseasePopulation: string
    heartDiseasePopulation: string
    athletes: string
    pregnantWomen: string
    children: string
  }
}

export interface DirectionsData {
  routes: {
    legs: {
      steps: {
        travel_mode: string
        distance: { text: string; value: number }
        duration: { text: string; value: number }
        html_instructions: string
      }[]
      duration: { text: string; value: number }
      distance: { text: string; value: number }
    }[]
    overview_polyline: { points: string }
  }[]
}

export interface TravelRecommendation {
  success: boolean
  origin: string
  destination: string
  recommendations: string
  weatherData: {
    origin: WeatherData
    destination: WeatherData
  }
  airQualityData: {
    origin: AirQualityData
    destination: AirQualityData
  }
  directionsData: DirectionsData
  ecoRoute?: DirectionsData // Our eco-friendly route
  standardRoute?: DirectionsData // Standard Google route
}

export interface TravelPreferences {
  maxWalkingDistance?: number
  maxTravelTime?: number
  prioritizeWeather?: boolean
  prioritizeAirQuality?: boolean
  preferredMode?: string
  accessibilityNeeded?: boolean
  environmentalImpactPriority?: number
  avoidHighways?: boolean
  avoidTolls?: boolean
  luggageAmount?: string
  additionalPrompt?: string
}
