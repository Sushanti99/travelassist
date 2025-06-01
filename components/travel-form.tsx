"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TravelPreferences } from "@/types/travel"

interface TravelFormProps {
  onSubmit: (origin: string, destination: string, preferences: TravelPreferences) => void
  isLoading: boolean
}

declare global {
  interface Window {
    google: any
  }
}

export function TravelForm({ onSubmit, isLoading }: TravelFormProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [additionalPrompt, setAdditionalPrompt] = useState("")
  const [preferences, setPreferences] = useState<TravelPreferences>({
    maxWalkingDistance: 2,
    prioritizeWeather: false,
    prioritizeAirQuality: false,
    preferredMode: "any",
    maxTravelTime: 60,
    accessibilityNeeded: false,
    environmentalImpactPriority: 5,
    avoidHighways: false,
    avoidTolls: false,
    luggageAmount: "none",
  })

  const originAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const originInputRef = useRef<HTMLInputElement>(null)
  const destinationInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(origin, destination, {
      ...preferences,
      additionalPrompt,
    })
  }

  const handlePreferenceChange = (key: keyof TravelPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB1OfBFYxJNPW45l7cU1fNOUlFxegZki4E&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initAutocomplete
      document.head.appendChild(script)
      return () => {
        document.head.removeChild(script)
      }
    } else {
      initAutocomplete()
    }
  }, [])

  const initAutocomplete = () => {
    if (originInputRef.current && !originAutocompleteRef.current) {
      originAutocompleteRef.current = new window.google.maps.places.Autocomplete(originInputRef.current, {
        types: ["geocode"],
      })

      originAutocompleteRef.current.addListener("place_changed", () => {
        const place = originAutocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          setOrigin(place.formatted_address)
        }
      })
    }

    if (destinationInputRef.current && !destinationAutocompleteRef.current) {
      destinationAutocompleteRef.current = new window.google.maps.places.Autocomplete(destinationInputRef.current, {
        types: ["geocode"],
      })

      destinationAutocompleteRef.current.addListener("place_changed", () => {
        const place = destinationAutocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          setDestination(place.formatted_address)
        }
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Your Eco-Friendly Trip</CardTitle>
        <CardDescription>
          Enter your origin and destination to get environmentally friendly travel recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                placeholder="e.g., Berkeley, CA"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                ref={originInputRef}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., San Francisco, CA"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                ref={destinationInputRef}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredMode">Preferred Transportation Mode</Label>
            <Select
              value={preferences.preferredMode}
              onValueChange={(value) => handlePreferenceChange("preferredMode", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any (Most Eco-Friendly)</SelectItem>
                <SelectItem value="transit">Public Transit</SelectItem>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="bicycling">Bicycling</SelectItem>
                <SelectItem value="driving">Driving (Carpool/Rideshare)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxWalkingDistance">Maximum Walking Distance (km)</Label>
              <span className="text-sm text-muted-foreground">{preferences.maxWalkingDistance} km</span>
            </div>
            <Input
              id="maxWalkingDistance"
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={preferences.maxWalkingDistance}
              onChange={(e) => handlePreferenceChange("maxWalkingDistance", Number.parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxTravelTime">Maximum Travel Time (minutes)</Label>
              <span className="text-sm text-muted-foreground">{preferences.maxTravelTime} min</span>
            </div>
            <Input
              id="maxTravelTime"
              type="range"
              min="10"
              max="120"
              step="5"
              value={preferences.maxTravelTime}
              onChange={(e) => handlePreferenceChange("maxTravelTime", Number.parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="environmentalImpactPriority">Environmental Impact Priority</Label>
              <span className="text-sm text-muted-foreground">{preferences.environmentalImpactPriority}/10</span>
            </div>
            <Input
              id="environmentalImpactPriority"
              type="range"
              min="1"
              max="10"
              step="1"
              value={preferences.environmentalImpactPriority}
              onChange={(e) => handlePreferenceChange("environmentalImpactPriority", Number.parseInt(e.target.value))}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Balance with convenience</span>
              <span>Environment first</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="luggageAmount">Luggage Amount</Label>
            <Select
              value={preferences.luggageAmount}
              onValueChange={(value) => handlePreferenceChange("luggageAmount", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select luggage amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Just a small bag)</SelectItem>
                <SelectItem value="light">Light (Backpack/Small bag)</SelectItem>
                <SelectItem value="medium">Medium (Carry-on suitcase)</SelectItem>
                <SelectItem value="heavy">Heavy (Large suitcase)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prioritizeWeather"
                checked={preferences.prioritizeWeather}
                onCheckedChange={(checked) => handlePreferenceChange("prioritizeWeather", checked === true)}
              />
              <Label htmlFor="prioritizeWeather">Prioritize weather comfort</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="prioritizeAirQuality"
                checked={preferences.prioritizeAirQuality}
                onCheckedChange={(checked) => handlePreferenceChange("prioritizeAirQuality", checked === true)}
              />
              <Label htmlFor="prioritizeAirQuality">Prioritize air quality</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessibilityNeeded"
                checked={preferences.accessibilityNeeded}
                onCheckedChange={(checked) => handlePreferenceChange("accessibilityNeeded", checked === true)}
              />
              <Label htmlFor="accessibilityNeeded">Need accessible route</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidHighways"
                checked={preferences.avoidHighways}
                onCheckedChange={(checked) => handlePreferenceChange("avoidHighways", checked === true)}
              />
              <Label htmlFor="avoidHighways">Avoid highways</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidTolls"
                checked={preferences.avoidTolls}
                onCheckedChange={(checked) => handlePreferenceChange("avoidTolls", checked === true)}
              />
              <Label htmlFor="avoidTolls">Avoid tolls</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalPrompt">Additional Information</Label>
            <Textarea
              id="additionalPrompt"
              placeholder="Add any specific requirements or information about your trip (e.g., traveling with children, need to arrive by a specific time, etc.)"
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="h-4 w-4" /> Getting Recommendations...
              </span>
            ) : (
              "Get Recommendations"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
