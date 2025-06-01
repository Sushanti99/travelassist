import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AirQualityData } from "@/types/travel"

interface AirQualityCardProps {
  title: string
  airQualityData: AirQualityData | null
}

export function AirQualityCard({ title, airQualityData }: AirQualityCardProps) {
  if (!airQualityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            Air quality data unavailable
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find the main AQI index (usually US EPA)
  const mainIndex = airQualityData.indexes.find((index) => index.code === "us_aqi") || airQualityData.indexes[0]

  // Function to get color based on AQI
  const getAqiColor = () => {
    if (!mainIndex || !mainIndex.color) return "bg-gray-200"

    const { red, green, blue } = mainIndex.color
    return `rgb(${red}, ${green}, ${blue})`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Air Quality Index</h3>
              <p className="text-sm text-muted-foreground">{mainIndex?.displayName || "AQI"}</p>
            </div>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: getAqiColor() }}
            >
              {mainIndex?.aqi || "N/A"}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Category</p>
            <p className="text-lg">{mainIndex?.category || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">
              Dominant pollutant: {mainIndex?.dominantPollutant || "Unknown"}
            </p>
          </div>

          {airQualityData.healthRecommendations && (
            <div>
              <p className="text-sm font-medium">Health Recommendations</p>
              <p className="text-sm mt-1">{airQualityData.healthRecommendations.generalPopulation}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Pollutants</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {airQualityData.pollutants.map((pollutant) => (
                <div key={pollutant.code} className="text-sm">
                  <span className="font-medium">{pollutant.displayName}: </span>
                  {pollutant.concentration.value} {pollutant.concentration.units}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
