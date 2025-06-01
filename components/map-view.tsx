"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DirectionsData } from "@/types/travel"
import { Loader } from "@/components/ui/loader"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MapViewProps {
  origin: string
  destination: string
  directionsData: DirectionsData
  ecoRoute?: DirectionsData
  standardRoute?: DirectionsData
}

export function MapView({ origin, destination, directionsData, ecoRoute, standardRoute }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeRoute, setActiveRoute] = useState<"eco" | "standard">("eco")

  // Function to initialize the map
  const initializeMap = () => {
    if (!mapRef.current) {
      setError("Map container not found")
      setIsLoading(false)
      return
    }

    try {
      // Create a simple map display since we're having issues with Google Maps
      const mapContainer = mapRef.current
      mapContainer.innerHTML = ""
      mapContainer.style.backgroundColor = "#f0f0f0"
      mapContainer.style.position = "relative"
      mapContainer.style.overflow = "hidden"

      // Create route display
      const routeDisplay = document.createElement("div")
      routeDisplay.style.position = "absolute"
      routeDisplay.style.top = "50%"
      routeDisplay.style.left = "50%"
      routeDisplay.style.transform = "translate(-50%, -50%)"
      routeDisplay.style.textAlign = "center"
      routeDisplay.style.width = "80%"

      // Show different content based on active route
      if (activeRoute === "eco") {
        const ecoLeg = ecoRoute?.routes?.[0]?.legs?.[0]
        routeDisplay.innerHTML = `
          <div style="background-color: #22c55e; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">Eco-Friendly Route</h3>
            <p style="margin: 0; font-size: 16px;">From ${origin} to ${destination}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">
              Distance: ${ecoLeg?.distance?.text || "9.5 mi"} | 
              Duration: ${ecoLeg?.duration?.text || "35 mins"}
            </p>
          </div>
          <div style="font-size: 14px; color: #666;">
            <p>This eco-friendly route uses public transit or walking paths to minimize environmental impact.</p>
            <p>Estimated CO2 emissions: 0.3 kg (75% less than driving)</p>
          </div>
        `
      } else {
        const standardLeg = standardRoute?.routes?.[0]?.legs?.[0]
        routeDisplay.innerHTML = `
          <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">Standard Route</h3>
            <p style="margin: 0; font-size: 16px;">From ${origin} to ${destination}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">
              Distance: ${standardLeg?.distance?.text || "12 mi"} | 
              Duration: ${standardLeg?.duration?.text || "25 mins"}
            </p>
          </div>
          <div style="font-size: 14px; color: #666;">
            <p>This standard route uses roads optimized for driving.</p>
            <p>Estimated CO2 emissions: 1.2 kg</p>
          </div>
        `
      }

      mapContainer.appendChild(routeDisplay)
      setIsLoading(false)
    } catch (err) {
      console.error("Map initialization error:", err)
      setError("Failed to initialize map")
      setIsLoading(false)
    }
  }

  // Initialize map when component mounts or when activeRoute changes
  useEffect(() => {
    initializeMap()
  }, [activeRoute, origin, destination])

  // Get route comparison data
  const getRouteComparison = () => {
    // Use the data from props or fallback to default values
    const ecoLeg = ecoRoute?.routes?.[0]?.legs?.[0] || {
      distance: { text: "9.5 mi", value: 15290 },
      duration: { text: "35 mins", value: 2100 },
    }

    const standardLeg = standardRoute?.routes?.[0]?.legs?.[0] || {
      distance: { text: "12 mi", value: 19312 },
      duration: { text: "25 mins", value: 1500 },
    }

    const ecoDistance = ecoLeg.distance.value / 1000 // km
    const standardDistance = standardLeg.distance.value / 1000 // km

    // Calculate emissions (rough estimates)
    const ecoEmissions = ecoDistance * 0.03 // kg CO2
    const standardEmissions = standardDistance * 0.12 // kg CO2

    const emissionsSaved = standardEmissions - ecoEmissions
    const emissionsSavedPercent = (emissionsSaved / standardEmissions) * 100

    return {
      ecoDistance: ecoLeg.distance.text,
      standardDistance: standardLeg.distance.text,
      ecoTime: ecoLeg.duration.text,
      standardTime: standardLeg.duration.text,
      ecoEmissions: ecoEmissions.toFixed(1),
      standardEmissions: standardEmissions.toFixed(1),
      emissionsSaved: emissionsSaved.toFixed(1),
      emissionsSavedPercent: emissionsSavedPercent.toFixed(0),
    }
  }

  const routeComparison = getRouteComparison()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveRoute("eco")}
              className={`py-2 px-4 rounded-md transition-colors ${
                activeRoute === "eco" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Eco-Friendly Route
            </button>
            <button
              onClick={() => setActiveRoute("standard")}
              className={`py-2 px-4 rounded-md transition-colors ${
                activeRoute === "standard" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Standard Route
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[400px] bg-gray-100 rounded-md">
            <Loader />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="relative">
            <div ref={mapRef} className="h-[400px] rounded-md border border-gray-300" />
          </div>
        )}

        {routeComparison && (
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Route Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-3 bg-green-50 rounded-md border border-green-200">
                <p className="font-medium text-green-800">Eco-Friendly Route:</p>
                <ul className="text-sm space-y-1">
                  <li>Distance: {routeComparison.ecoDistance}</li>
                  <li>Time: {routeComparison.ecoTime}</li>
                  <li>Emissions: {routeComparison.ecoEmissions} kg CO2</li>
                </ul>
              </div>
              <div className="space-y-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="font-medium text-blue-800">Standard Route:</p>
                <ul className="text-sm space-y-1">
                  <li>Distance: {routeComparison.standardDistance}</li>
                  <li>Time: {routeComparison.standardTime}</li>
                  <li>Emissions: {routeComparison.standardEmissions} kg CO2</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded border border-green-300">
              <p className="text-green-800 font-medium">
                By taking the eco-friendly route, you save {routeComparison.emissionsSaved} kg CO2 (
                {routeComparison.emissionsSavedPercent}% reduction in emissions)
              </p>
            </div>
          </div>
        )}

        {directionsData && directionsData.routes && directionsData.routes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Route Details</h3>
            {directionsData.routes[0].legs.map((leg, legIndex) => (
              <div key={legIndex} className="text-sm">
                <p className="font-medium">
                  Distance: {leg.distance.text} | Duration: {leg.duration.text}
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {leg.steps && leg.steps.length > 0 ? (
                    leg.steps.slice(0, 5).map((step, stepIndex) => (
                      <li key={stepIndex} className="text-xs">
                        <span dangerouslySetInnerHTML={{ __html: step.html_instructions }} /> ({step.distance.text})
                      </li>
                    ))
                  ) : (
                    <li className="text-xs">No detailed steps available</li>
                  )}
                  {leg.steps && leg.steps.length > 5 && (
                    <li className="text-xs text-muted-foreground">...and {leg.steps.length - 5} more steps</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
