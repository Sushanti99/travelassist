import { type NextRequest, NextResponse } from "next/server"
import type { TravelRecommendation, WeatherData, AirQualityData, TravelPreferences } from "@/types/travel"

// Hardcoded API keys for simplicity in this demo
const WEATHER_API_KEY = "74db61df503f4befa2b221929250503"
const GOOGLE_MAPS_API_KEY = "AIzaSyB1OfBFYxJNPW45l7cU1fNOUlFxegZki4E"

async function getWeatherData(location: string): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({
      key: WEATHER_API_KEY,
      q: location,
      aqi: "yes",
    })

    const response = await fetch(`https://api.weatherapi.com/v1/current.json?${params.toString()}`)

    if (!response.ok) {
      console.error(`Weather API error: ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Weather API fetch error:", error)
    return null
  }
}

// Mock air quality data to use as fallback
function getMockAirQualityData(location: string): AirQualityData {
  return {
    indexes: [
      {
        code: "us_aqi",
        displayName: "US AQI",
        aqi: 42,
        aqiDisplay: "42",
        color: {
          red: 118,
          green: 211,
          blue: 94,
        },
        category: "Good",
        dominantPollutant: "PM2.5",
      },
    ],
    pollutants: [
      {
        code: "pm25",
        displayName: "PM2.5",
        fullName: "Fine particulate matter (<2.5µm)",
        concentration: {
          value: 10.2,
          units: "µg/m³",
        },
        additionalInfo: {
          sources: "Dust, vehicle emissions, industrial activities",
          effects: "Respiratory issues, heart problems",
        },
      },
      {
        code: "o3",
        displayName: "O₃",
        fullName: "Ozone",
        concentration: {
          value: 38.5,
          units: "µg/m³",
        },
        additionalInfo: {
          sources: "Formed by chemical reactions between oxides of nitrogen and volatile organic compounds in sunlight",
          effects: "Breathing problems, reduced lung function, asthma aggravation",
        },
      },
    ],
    healthRecommendations: {
      generalPopulation: "Enjoy your usual outdoor activities.",
      elderly: "Enjoy your usual outdoor activities.",
      lungDiseasePopulation: "Enjoy your usual outdoor activities.",
      heartDiseasePopulation: "Enjoy your usual outdoor activities.",
      athletes: "Enjoy your usual outdoor activities.",
      pregnantWomen: "Enjoy your usual outdoor activities.",
      children: "Enjoy your usual outdoor activities.",
    },
  }
}

// Mock weather data to use as fallback
function getMockWeatherData(location: string): WeatherData {
  const locationName = location.split(",")[0].trim()
  const region = location.split(",")[1]?.trim() || "California"
  const country = location.split(",")[2]?.trim() || "United States of America"

  return {
    location: {
      name: locationName,
      region: region,
      country: country,
      localtime: new Date().toLocaleString(),
    },
    current: {
      temp_c: 18,
      temp_f: 64.4,
      condition: {
        text: "Partly cloudy",
        icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      },
      wind_kph: 12,
      wind_degree: 270,
      wind_dir: "W",
      pressure_mb: 1015,
      humidity: 65,
      cloud: 25,
      feelslike_c: 18,
      feelslike_f: 64.4,
      vis_km: 16,
      uv: 5,
    },
  }
}

// Mock directions data to use as fallback
function getMockDirectionsData(origin: string, destination: string, isEco = false): any {
  // Create different mock data for eco vs standard routes
  const distanceValue = isEco ? 15290 : 19312 // 9.5 miles vs 12 miles in meters
  const distanceText = isEco ? "9.5 mi" : "12 mi"
  const durationValue = isEco ? 2100 : 1500 // 35 mins vs 25 mins in seconds
  const durationText = isEco ? "35 mins" : "25 mins"
  const travelMode = isEco ? "TRANSIT" : "DRIVING"

  return {
    routes: [
      {
        legs: [
          {
            steps: [
              {
                travel_mode: travelMode,
                distance: { text: distanceText, value: distanceValue },
                duration: { text: durationText, value: durationValue },
                html_instructions: isEco ? "Take public transit" : "Drive to destination",
              },
            ],
            duration: { text: durationText, value: durationValue },
            distance: { text: distanceText, value: distanceValue },
          },
        ],
        overview_polyline: { points: "abc123" },
      },
    ],
  }
}

// Generate recommendations based on data
function generateRecommendations(
  origin: string,
  destination: string,
  directionsData: any,
  originWeather: WeatherData | null,
  destinationWeather: WeatherData | null,
  originAirQuality: AirQualityData | null,
  destinationAirQuality: AirQualityData | null,
  preferences: TravelPreferences,
): string {
  // Use fallbacks if data is missing
  const originTemp = originWeather?.current?.temp_c ?? 18
  const originCondition = originWeather?.current?.condition?.text ?? "Clear"
  const destTemp = destinationWeather?.current?.temp_c ?? 18
  const destCondition = destinationWeather?.current?.condition?.text ?? "Clear"

  // Get AQI values with fallbacks
  const originAqi = originAirQuality?.indexes?.[0]?.aqi ?? 50
  const originAqiCategory = originAirQuality?.indexes?.[0]?.category ?? "Good"
  const destAqi = destinationAirQuality?.indexes?.[0]?.aqi ?? 50
  const destAqiCategory = destinationAirQuality?.indexes?.[0]?.category ?? "Good"

  // Get route information with fallbacks
  const route = directionsData?.routes?.[0] ?? {
    legs: [{ distance: { text: "10 mi", value: 16093 }, duration: { text: "30 mins", value: 1800 }, steps: [] }],
  }
  const leg = route.legs[0]
  const totalDistance = leg.distance.text
  const totalDuration = leg.duration.text

  // Determine primary recommendation based on preferences and conditions
  let primaryMode = preferences.preferredMode !== "any" ? preferences.preferredMode : "transit" // Default
  let alternativeMode1 = "walking"
  let alternativeMode2 = "bicycling"

  // If no specific mode is preferred, determine the best one
  if (preferences.preferredMode === "any") {
    // Adjust based on environmental impact priority
    if (preferences.environmentalImpactPriority && preferences.environmentalImpactPriority > 7) {
      // High environmental priority - prefer zero-emission options
      if (leg.distance.value <= preferences.maxWalkingDistance * 1000) {
        primaryMode = "walking"
      } else {
        primaryMode = "bicycling"
      }
      alternativeMode1 = "transit"
      alternativeMode2 = "driving"
    } else if (preferences.environmentalImpactPriority && preferences.environmentalImpactPriority < 4) {
      // Lower environmental priority - balance with convenience
      if (leg.distance.value <= preferences.maxWalkingDistance * 1000) {
        primaryMode = "walking"
      } else if (leg.distance.value <= 8000) {
        // 5 miles
        primaryMode = "bicycling"
      } else {
        primaryMode = "transit"
      }
      alternativeMode1 = "driving"
      alternativeMode2 = "bicycling"
    }

    // Adjust based on air quality
    if (preferences.prioritizeAirQuality && (originAqi > 100 || destAqi > 100)) {
      primaryMode = "driving" // Less exposure to poor air quality
      alternativeMode1 = "transit"
    }

    // Adjust based on weather
    if (preferences.prioritizeWeather) {
      // If weather is bad, recommend covered transport
      if (
        originCondition.toLowerCase().includes("rain") ||
        destCondition.toLowerCase().includes("rain") ||
        originCondition.toLowerCase().includes("snow") ||
        destCondition.toLowerCase().includes("snow")
      ) {
        primaryMode = "driving"
        alternativeMode1 = "transit"
      }
    }

    // Adjust based on luggage
    if (preferences.luggageAmount === "heavy" || preferences.luggageAmount === "medium") {
      if (primaryMode === "walking" || primaryMode === "bicycling") {
        primaryMode = "transit"
        alternativeMode1 = "driving"
      }
    }

    // Adjust based on accessibility needs
    if (preferences.accessibilityNeeded) {
      if (primaryMode === "walking" || primaryMode === "bicycling") {
        primaryMode = "transit"
        alternativeMode1 = "driving"
      }
    }

    // Adjust based on travel time constraints
    if (preferences.maxTravelTime && leg.duration.value > preferences.maxTravelTime * 60) {
      // If current mode exceeds max time, choose faster option
      if (primaryMode === "walking") {
        primaryMode = "bicycling"
      } else if (primaryMode === "bicycling") {
        primaryMode = "transit"
      } else if (primaryMode === "transit") {
        primaryMode = "driving"
      }
    }
  }

  // Generate the recommendation text
  return `
<h2>PRIMARY RECOMMENDATION: ${getPrimaryRecommendationTitle(primaryMode, origin, destination)}</h2>

<p>Based on current conditions and your preferences, ${getPrimaryRecommendationDescription(primaryMode, origin, destination)} is your most eco-friendly option.</p>

<h3>ENVIRONMENTAL IMPACT:</h3>
<ul>
<li>${getEnvironmentalImpact(primaryMode, leg.distance.value)}</li>
<li>Reduces traffic congestion in the area</li>
<li>${getEmissionsSaved(primaryMode, leg.distance.value)}</li>
</ul>

<h3>WEATHER CONSIDERATIONS:</h3>
<p>Current weather in ${origin} is ${originCondition.toLowerCase()} with temperatures of ${originTemp}°C, and ${destination} is ${destCondition.toLowerCase()} with temperatures of ${destTemp}°C. ${getWeatherAdvice(primaryMode, originCondition, destCondition)}</p>

<h3>AIR QUALITY CONSIDERATIONS:</h3>
<p>Air quality is ${originAqiCategory} in ${origin} (AQI ${originAqi}) and ${destAqiCategory} in ${destination} (AQI ${destAqi}). ${getAirQualityAdvice(primaryMode, originAqiCategory, destAqiCategory)}</p>

<h3>PRACTICAL TIPS:</h3>
<ul>
${getPracticalTips(primaryMode, leg.steps, totalDistance, totalDuration, preferences)}
</ul>

${
  preferences.additionalPrompt
    ? `<h3>BASED ON YOUR ADDITIONAL INFORMATION:</h3>
<p>${getAdditionalPromptResponse(preferences.additionalPrompt, primaryMode)}</p>`
    : ""
}

<h2>ALTERNATIVES:</h2>

<h3>1. ${getAlternativeTitle(alternativeMode1)}</h3>
<p>${getAlternativeDescription(alternativeMode1, origin, destination, totalDistance)}</p>
<ul>
<li>Pros: ${getAlternativePros(alternativeMode1)}</li>
<li>Cons: ${getAlternativeCons(alternativeMode1)}</li>
</ul>

<h3>2. ${getAlternativeTitle(alternativeMode2)}</h3>
<p>${getAlternativeDescription(alternativeMode2, origin, destination, totalDistance)}</p>
<ul>
<li>Pros: ${getAlternativePros(alternativeMode2)}</li>
<li>Cons: ${getAlternativeCons(alternativeMode2)}</li>
</ul>
`
}

function getAdditionalPromptResponse(additionalPrompt: string, mode: string): string {
  // Simple response based on the additional prompt
  if (additionalPrompt.toLowerCase().includes("child") || additionalPrompt.toLowerCase().includes("kid")) {
    return `When traveling with children, ${
      mode === "transit"
        ? "public transit can be a good option. Look for family-friendly seating areas and plan for extra time at transfers."
        : mode === "walking"
          ? "walking allows for flexibility to take breaks as needed. Bring snacks and water, and plan for rest stops along the way."
          : mode === "bicycling"
            ? "consider child seats or trailers if the children are young. Plan for frequent breaks and bring plenty of water."
            : "carpooling provides comfort and flexibility. Make sure to have appropriate car seats if needed."
    }`
  }

  if (
    additionalPrompt.toLowerCase().includes("time") ||
    additionalPrompt.toLowerCase().includes("late") ||
    additionalPrompt.toLowerCase().includes("hurry")
  ) {
    return `For time-sensitive travel, ${
      mode === "transit"
        ? "check real-time transit updates before departing and have a backup plan in case of delays."
        : mode === "walking"
          ? "walking may not be the fastest option. Consider a faster alternative if you're in a hurry."
          : mode === "bicycling"
            ? "bicycling can be faster than walking or transit in congested areas. Plan your route to use bike lanes where available."
            : "driving may be faster in some cases, but be aware of potential traffic delays, especially during peak hours."
    }`
  }

  if (
    additionalPrompt.toLowerCase().includes("rain") ||
    additionalPrompt.toLowerCase().includes("snow") ||
    additionalPrompt.toLowerCase().includes("weather")
  ) {
    return `Given the weather conditions, ${
      mode === "transit"
        ? "public transit provides shelter from the elements. Bring an umbrella for the walks to and from stops."
        : mode === "walking"
          ? "if walking, dress appropriately for the weather with waterproof clothing and footwear."
          : mode === "bicycling"
            ? "cycling in adverse weather requires proper gear. Consider fenders for your bike and waterproof clothing."
            : "driving provides the most protection from the elements, but be cautious as road conditions may be affected."
    }`
  }

  // Generic response if no specific keywords are found
  return `We've taken your additional information into account when making these recommendations. For the most personalized experience, consider factors like time of day, specific needs, and local events that might affect your journey.`
}

// Helper functions for generating recommendation text
function getPrimaryRecommendationTitle(mode: string, origin: string, destination: string): string {
  switch (mode) {
    case "transit":
      return "Take Public Transit"
    case "walking":
      return "Walk"
    case "bicycling":
      return "Bicycle"
    case "driving":
      return "Carpool/Rideshare"
    default:
      return "Take Public Transit"
  }
}

function getPrimaryRecommendationDescription(mode: string, origin: string, destination: string): string {
  switch (mode) {
    case "transit":
      return `taking public transit from ${origin} to ${destination}`
    case "walking":
      return `walking from ${origin} to ${destination}`
    case "bicycling":
      return `bicycling from ${origin} to ${destination}`
    case "driving":
      return `carpooling from ${origin} to ${destination}`
    default:
      return `taking public transit from ${origin} to ${destination}`
  }
}

function getEnvironmentalImpact(mode: string, distanceMeters: number): string {
  const distanceKm = distanceMeters / 1000

  switch (mode) {
    case "transit":
      return `Carbon footprint: Approximately ${(distanceKm * 0.03).toFixed(1)} kg CO2 (compared to ${(distanceKm * 0.12).toFixed(1)} kg for driving alone)`
    case "walking":
      return "Carbon footprint: Zero emissions"
    case "bicycling":
      return "Carbon footprint: Zero emissions"
    case "driving":
      return `Carbon footprint: Approximately ${(distanceKm * 0.07).toFixed(1)} kg CO2 (when shared with 2 people, compared to ${(distanceKm * 0.12).toFixed(1)} kg for driving alone)`
    default:
      return `Carbon footprint: Approximately ${(distanceKm * 0.03).toFixed(1)} kg CO2`
  }
}

function getEmissionsSaved(mode: string, distanceMeters: number): string {
  const distanceKm = distanceMeters / 1000
  const drivingEmissions = distanceKm * 0.12

  switch (mode) {
    case "transit":
      return `Saves approximately ${(drivingEmissions - distanceKm * 0.03).toFixed(1)} kg of CO2 emissions compared to driving alone`
    case "walking":
      return `Saves approximately ${drivingEmissions.toFixed(1)} kg of CO2 emissions compared to driving alone`
    case "bicycling":
      return `Saves approximately ${drivingEmissions.toFixed(1)} kg of CO2 emissions compared to driving alone`
    case "driving":
      return `Saves approximately ${(drivingEmissions - distanceKm * 0.07).toFixed(1)} kg of CO2 emissions compared to driving alone`
    default:
      return `Saves approximately ${(drivingEmissions - distanceKm * 0.03).toFixed(1)} kg of CO2 emissions compared to driving alone`
  }
}

function getWeatherAdvice(mode: string, originCondition: string, destCondition: string): string {
  const isBadWeather =
    originCondition.toLowerCase().includes("rain") ||
    destCondition.toLowerCase().includes("rain") ||
    originCondition.toLowerCase().includes("snow") ||
    destCondition.toLowerCase().includes("snow") ||
    originCondition.toLowerCase().includes("storm") ||
    destCondition.toLowerCase().includes("storm")

  switch (mode) {
    case "transit":
      return isBadWeather
        ? "Public transit provides shelter from the current weather conditions."
        : "The weather is suitable for the short walks to and from transit stops."
    case "walking":
      return isBadWeather
        ? "Consider bringing rain gear or choosing an alternative mode due to the weather."
        : "The weather is ideal for walking."
    case "bicycling":
      return isBadWeather
        ? "Consider an alternative mode due to the weather conditions."
        : "The weather is suitable for bicycling."
    case "driving":
      return isBadWeather
        ? "Carpooling provides shelter from the current weather conditions."
        : "While the weather is nice enough for other modes, carpooling is still a good option if you need to bring items or prefer comfort."
    default:
      return "Consider the weather conditions when choosing your mode of transport."
  }
}

function getAirQualityAdvice(mode: string, originAqiCategory: string, destAqiCategory: string): string {
  const isPoorAirQuality =
    originAqiCategory.includes("Unhealthy") ||
    destAqiCategory.includes("Unhealthy") ||
    originAqiCategory.includes("Hazardous") ||
    destAqiCategory.includes("Hazardous")

  switch (mode) {
    case "transit":
      return isPoorAirQuality
        ? "Public transit reduces your exposure to poor air quality compared to walking or cycling."
        : "Taking public transit helps maintain good air quality by reducing vehicle emissions."
    case "walking":
      return isPoorAirQuality
        ? "Consider wearing a mask or choosing an alternative mode due to the air quality."
        : "Walking produces zero emissions and helps maintain the good air quality in the area."
    case "bicycling":
      return isPoorAirQuality
        ? "Consider wearing a mask or choosing an alternative mode due to the air quality."
        : "Bicycling produces zero emissions and helps maintain the good air quality in the area."
    case "driving":
      return isPoorAirQuality
        ? "Carpooling reduces your exposure to poor air quality while still reducing emissions compared to driving alone."
        : "While air quality is good, carpooling still helps maintain it by reducing the number of vehicles on the road."
    default:
      return "Consider the air quality when choosing your mode of transport."
  }
}

function getPracticalTips(
  mode: string,
  steps: any[],
  totalDistance: string,
  totalDuration: string,
  preferences: TravelPreferences,
): string {
  const accessibilityTip = preferences.accessibilityNeeded
    ? `<li>Look for accessible stations, vehicles, and routes</li>`
    : ""

  const luggageTip =
    preferences.luggageAmount && preferences.luggageAmount !== "none"
      ? `<li>Plan for ${preferences.luggageAmount} luggage: ${
          mode === "transit"
            ? "check transit policies for large items"
            : mode === "walking"
              ? "consider a backpack or rolling bag for easier carrying"
              : mode === "bicycling"
                ? "use panniers or a backpack for carrying items"
                : "ensure your vehicle has enough space for luggage"
        }</li>`
      : ""

  const timeTip = preferences.maxTravelTime
    ? `<li>Your trip should take approximately ${totalDuration}, which ${
        Number.parseInt(totalDuration) > preferences.maxTravelTime ? "exceeds" : "is within"
      } your maximum travel time of ${preferences.maxTravelTime} minutes</li>`
    : ""

  switch (mode) {
    case "transit":
      const transitSteps = steps.filter((step) => step.travel_mode === "TRANSIT")
      const firstTransitStep = transitSteps.length > 0 ? transitSteps[0] : null

      return `
        <li>Total travel time: approximately ${totalDuration}</li>
        <li>Total distance: ${totalDistance}</li>
        ${firstTransitStep ? `<li>Take ${firstTransitStep.html_instructions}</li>` : ""}
        <li>Check transit schedules before departing</li>
        <li>Consider using a transit app for real-time updates</li>
        ${accessibilityTip}
        ${luggageTip}
        ${timeTip}
        <li>Bring a book, podcast, or other entertainment for the journey</li>
        <li>Travel during off-peak hours if possible to avoid crowds</li>
      `
    case "walking":
      return `
        <li>Total walking time: approximately ${totalDuration}</li>
        <li>Total distance: ${totalDistance}</li>
        <li>Wear comfortable shoes</li>
        <li>Stay hydrated, especially in warm weather</li>
        <li>Use pedestrian crossings and sidewalks where available</li>
        ${accessibilityTip}
        ${luggageTip}
        ${timeTip}
        <li>Consider a sun hat and sunscreen on sunny days</li>
        <li>Plan your route to include green spaces or interesting sights</li>
      `
    case "bicycling":
      return `
        <li>Total cycling time: approximately ${totalDuration}</li>
        <li>Total distance: ${totalDistance}</li>
        <li>Wear a helmet and use lights if cycling near dusk</li>
        <li>Use dedicated bike lanes where available</li>
        <li>Consider bike-sharing options if you don't have your own bicycle</li>
        ${accessibilityTip}
        ${luggageTip}
        ${timeTip}
        <li>Bring a water bottle and stay hydrated</li>
        <li>Check your bike's tire pressure and brakes before departing</li>
      `
    case "driving":
      return `
        <li>Total driving time: approximately ${totalDuration}</li>
        <li>Total distance: ${totalDistance}</li>
        <li>Use ride-sharing apps to find carpool partners</li>
        <li>Consider electric or hybrid vehicles for further emissions reduction</li>
        <li>Check traffic conditions before departing</li>
        ${accessibilityTip}
        ${luggageTip}
        ${timeTip}
        <li>Park in a central location if visiting multiple destinations</li>
        <li>Practice eco-driving: maintain steady speed and avoid rapid acceleration</li>
      `
    default:
      return `
        <li>Total travel time: approximately ${totalDuration}</li>
        <li>Total distance: ${totalDistance}</li>
        <li>Plan your journey in advance</li>
        <li>Check weather conditions before departing</li>
        ${accessibilityTip}
        ${luggageTip}
        ${timeTip}
      `
  }
}

function getAlternativeTitle(mode: string): string {
  switch (mode) {
    case "transit":
      return "Public Transit"
    case "walking":
      return "Walking"
    case "bicycling":
      return "Bicycling"
    case "driving":
      return "Carpool/Rideshare"
    default:
      return "Public Transit"
  }
}

function getAlternativeDescription(mode: string, origin: string, destination: string, totalDistance: string): string {
  switch (mode) {
    case "transit":
      return `Public transit options are available between ${origin} and ${destination}.`
    case "walking":
      return `The ${totalDistance} route from ${origin} to ${destination} is walkable.`
    case "bicycling":
      return `The ${totalDistance} route from ${origin} to ${destination} can be traveled by bicycle.`
    case "driving":
      return `Carpooling from ${origin} to ${destination} is an option if other modes don't meet your needs.`
    default:
      return `Alternative transportation is available between ${origin} and ${destination}.`
  }
}

function getAlternativePros(mode: string): string {
  switch (mode) {
    case "transit":
      return "Lower emissions than driving alone, no parking costs, can be productive during travel"
    case "walking":
      return "Zero emissions, good exercise, no parking costs, most flexible routing"
    case "bicycling":
      return "Zero emissions, good exercise, no parking costs, often faster than walking"
    case "driving":
      return "More convenient than public transit, lower emissions per person than driving alone"
    default:
      return "Provides an alternative option for travel"
  }
}

function getAlternativeCons(mode: string): string {
  switch (mode) {
    case "transit":
      return "Subject to schedules, may require transfers, limited coverage in some areas"
    case "walking":
      return "Longer travel time, requires physical exertion, weather dependent"
    case "bicycling":
      return "Requires physical exertion, weather dependent, may require special equipment"
    case "driving":
      return "Still produces significant emissions, subject to traffic delays, parking costs"
    default:
      return "May have limitations depending on specific conditions"
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json().catch(() => {
      throw new Error("Failed to parse request body")
    })

    const { origin, destination, preferences } = body

    // Validate inputs
    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    // Use mock data for everything to avoid API errors
    const originWeatherData = getMockWeatherData(origin)
    const destinationWeatherData = getMockWeatherData(destination)
    const originAirQualityData = getMockAirQualityData(origin)
    const destinationAirQualityData = getMockAirQualityData(destination)

    // Create different mock routes for eco and standard
    const ecoRouteData = getMockDirectionsData(origin, destination, true)
    const standardRouteData = getMockDirectionsData(origin, destination, false)
    const directionsData = ecoRouteData // Use eco route as the main directions data

    // Generate recommendations
    const recommendations = generateRecommendations(
      origin,
      destination,
      directionsData,
      originWeatherData,
      destinationWeatherData,
      originAirQualityData,
      destinationAirQualityData,
      preferences || {},
    )

    // Construct the response
    const response: TravelRecommendation = {
      success: true,
      origin,
      destination,
      recommendations,
      weatherData: {
        origin: originWeatherData,
        destination: destinationWeatherData,
      },
      airQualityData: {
        origin: originAirQualityData,
        destination: destinationAirQualityData,
      },
      directionsData,
      ecoRoute: ecoRouteData,
      standardRoute: standardRouteData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error processing travel recommendation request:", error)
    return NextResponse.json(
      {
        error: "Failed to process travel recommendation request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
