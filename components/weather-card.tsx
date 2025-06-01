import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeatherData } from "@/types/travel"
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react"

interface WeatherCardProps {
  title: string
  weatherData: WeatherData | null
}

export function WeatherCard({ title, weatherData }: WeatherCardProps) {
  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 text-muted-foreground">Weather data unavailable</div>
        </CardContent>
      </Card>
    )
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
              <h3 className="text-lg font-medium">{weatherData.location.name}</h3>
              <p className="text-sm text-muted-foreground">
                {weatherData.location.region}, {weatherData.location.country}
              </p>
              <p className="text-sm text-muted-foreground">Local time: {weatherData.location.localtime}</p>
            </div>
            {weatherData.current.condition.icon && (
              <img
                src={`https:${weatherData.current.condition.icon}`}
                alt={weatherData.current.condition.text}
                width={64}
                height={64}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-xl">{weatherData.current.temp_c}°C</p>
                <p className="text-xs text-muted-foreground">Feels like {weatherData.current.feelslike_c}°C</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Wind className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Wind</p>
                <p className="text-xl">{weatherData.current.wind_kph} km/h</p>
                <p className="text-xs text-muted-foreground">{weatherData.current.wind_dir}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Humidity</p>
                <p className="text-xl">{weatherData.current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Cloud Cover</p>
                <p className="text-xl">{weatherData.current.cloud}%</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Condition</p>
            <p>{weatherData.current.condition.text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
