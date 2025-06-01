"use client"

import { useState } from "react"
import { TravelForm } from "@/components/travel-form"
import { TravelResults } from "@/components/travel-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeatherCard } from "@/components/weather-card"
import { AirQualityCard } from "@/components/air-quality-card"
import { MapView } from "@/components/map-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { TravelRecommendation } from "@/types/travel"

export default function Home() {
  const [results, setResults] = useState<TravelRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("recommendations")

  const handleSubmit = async (origin: string, destination: string, preferences: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/travel-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination, preferences }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        try {
          // Try to parse as JSON
          const errorJson = JSON.parse(errorData)
          throw new Error(errorJson.error || "Failed to get travel recommendations")
        } catch (e) {
          // If not JSON, use the text
          throw new Error(`Failed to get travel recommendations: ${errorData}`)
        }
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error fetching travel recommendations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">Eco-Friendly Travel Assistant</h1>

      <TravelForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="mt-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="weather">Weather & Air Quality</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="mt-4">
              <TravelResults results={results} />
            </TabsContent>

            <TabsContent value="weather" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.weatherData?.origin && (
                  <WeatherCard title="Origin Weather" weatherData={results.weatherData.origin} />
                )}
                {results.airQualityData?.origin && (
                  <AirQualityCard title="Origin Air Quality" airQualityData={results.airQualityData.origin} />
                )}
                {results.weatherData?.destination && (
                  <WeatherCard title="Destination Weather" weatherData={results.weatherData.destination} />
                )}
                {results.airQualityData?.destination && (
                  <AirQualityCard title="Destination Air Quality" airQualityData={results.airQualityData.destination} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-4">
              <MapView
                origin={results.origin}
                destination={results.destination}
                directionsData={results.directionsData}
                ecoRoute={results.ecoRoute}
                standardRoute={results.standardRoute}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  )
}
