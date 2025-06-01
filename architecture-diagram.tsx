"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ArchitectureDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 1000
    canvas.height = 700

    // Define colors
    const colors = {
      background: "#f8fafc",
      primary: "#0f172a",
      secondary: "#64748b",
      accent: "#0ea5e9",
      success: "#22c55e",
      warning: "#eab308",
      error: "#ef4444",
      neutral: "#e2e8f0",
      border: "#cbd5e1",
      text: "#1e293b",
      lightText: "#94a3b8",
    }

    // Clear canvas
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw title
    ctx.font = "bold 24px Inter, sans-serif"
    ctx.fillStyle = colors.primary
    ctx.textAlign = "center"
    ctx.fillText("Eco-Friendly Travel Assistant - Architecture Diagram", canvas.width / 2, 40)

    // Draw legend
    drawLegend(ctx, colors, 800, 80)

    // Draw frontend section
    drawSection(ctx, "Frontend (Next.js)", 100, 100, 800, 180, colors.neutral, colors.primary)

    // Draw components in frontend
    drawComponent(ctx, "Travel Form", 150, 140, 180, 80, colors.accent, colors.text)
    drawComponent(ctx, "Results Display", 350, 140, 180, 80, colors.accent, colors.text)
    drawComponent(ctx, "Map View", 550, 140, 180, 80, colors.accent, colors.text)

    // Draw API section
    drawSection(ctx, "API Layer (Next.js API Routes)", 100, 320, 800, 100, colors.neutral, colors.primary)
    drawComponent(ctx, "Travel Recommendations API", 350, 340, 300, 60, colors.warning, colors.text)

    // Draw services section
    drawSection(ctx, "Services & Agents", 100, 460, 800, 180, colors.neutral, colors.primary)

    // Draw service components
    drawComponent(ctx, "Weather Service", 150, 500, 180, 80, colors.success, colors.text)
    drawComponent(ctx, "Air Quality Service", 350, 500, 180, 80, colors.success, colors.text)
    drawComponent(ctx, "Directions Service", 550, 500, 180, 80, colors.success, colors.text)
    drawComponent(ctx, "Recommendation Engine", 350, 600, 300, 60, colors.error, colors.text)

    // Draw arrows
    // Frontend to API
    drawArrow(ctx, 250, 220, 250, 320, colors.primary)
    drawArrow(ctx, 450, 220, 450, 320, colors.primary)
    drawArrow(ctx, 650, 220, 650, 320, colors.primary)

    // API to Services
    drawArrow(ctx, 250, 420, 250, 500, colors.primary)
    drawArrow(ctx, 450, 420, 450, 500, colors.primary)
    drawArrow(ctx, 650, 420, 650, 500, colors.primary)

    // Services to Recommendation Engine
    drawArrow(ctx, 250, 580, 350, 600, colors.primary)
    drawArrow(ctx, 450, 580, 450, 600, colors.primary)
    drawArrow(ctx, 650, 580, 550, 600, colors.primary)

    // Recommendation Engine to API
    drawArrow(ctx, 500, 600, 500, 400, colors.primary, true, true)

    // API to Frontend
    drawArrow(ctx, 500, 340, 500, 220, colors.primary, true, true)

    // Add labels to arrows
    ctx.font = "12px Inter, sans-serif"
    ctx.fillStyle = colors.secondary
    ctx.textAlign = "center"

    ctx.fillText("User Input", 250, 280)
    ctx.fillText("Display Results", 500, 280)
    ctx.fillText("Show Map", 650, 280)

    ctx.fillText("Weather Data", 250, 460)
    ctx.fillText("Air Quality Data", 450, 460)
    ctx.fillText("Route Data", 650, 460)

    ctx.fillText("Generate", 500, 520)
    ctx.fillText("Recommendations", 500, 535)
  }, [])

  // Helper function to draw a rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string,
    stroke?: string,
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()

    ctx.fillStyle = fill
    ctx.fill()

    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Helper function to draw a section
  const drawSection = (
    ctx: CanvasRenderingContext2D,
    title: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    textColor: string,
  ) => {
    drawRoundedRect(ctx, x, y, width, height, 10, fill)

    ctx.font = "bold 16px Inter, sans-serif"
    ctx.fillStyle = textColor
    ctx.textAlign = "left"
    ctx.fillText(title, x + 20, y + 30)
  }

  // Helper function to draw a component
  const drawComponent = (
    ctx: CanvasRenderingContext2D,
    title: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    textColor: string,
  ) => {
    drawRoundedRect(ctx, x, y, width, height, 8, fill)

    ctx.font = "14px Inter, sans-serif"
    ctx.fillStyle = textColor
    ctx.textAlign = "center"
    ctx.fillText(title, x + width / 2, y + height / 2 + 5)
  }

  // Helper function to draw an arrow
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    dashed = false,
    bidirectional = false,
  ) => {
    const headLength = 10
    const headAngle = Math.PI / 6

    // Calculate the angle of the line
    const angle = Math.atan2(toY - fromY, toX - fromX)

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)

    if (dashed) {
      ctx.setLineDash([5, 3])
    } else {
      ctx.setLineDash([])
    }

    ctx.lineTo(toX, toY)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    // Draw the arrow head
    ctx.beginPath()
    ctx.moveTo(toX, toY)
    ctx.lineTo(toX - headLength * Math.cos(angle - headAngle), toY - headLength * Math.sin(angle - headAngle))
    ctx.lineTo(toX - headLength * Math.cos(angle + headAngle), toY - headLength * Math.sin(angle + headAngle))
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()

    // If bidirectional, draw another arrow head at the start
    if (bidirectional) {
      const reverseAngle = angle + Math.PI

      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(
        fromX - headLength * Math.cos(reverseAngle - headAngle),
        fromY - headLength * Math.sin(reverseAngle - headAngle),
      )
      ctx.lineTo(
        fromX - headLength * Math.cos(reverseAngle + headAngle),
        fromY - headLength * Math.sin(reverseAngle + headAngle),
      )
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }
  }

  // Helper function to draw the legend
  const drawLegend = (ctx: CanvasRenderingContext2D, colors: Record<string, string>, x: number, y: number) => {
    const legendItems = [
      { color: colors.accent, label: "UI Components" },
      { color: colors.warning, label: "API Routes" },
      { color: colors.success, label: "Service Agents" },
      { color: colors.error, label: "Core Engine" },
    ]

    ctx.font = "12px Inter, sans-serif"
    ctx.textAlign = "left"

    legendItems.forEach((item, index) => {
      const itemY = y + index * 25

      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(x, itemY, 15, 15)

      // Draw label
      ctx.fillStyle = colors.text
      ctx.fillText(item.label, x + 25, itemY + 12)
    })
  }

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Eco-Friendly Travel Assistant Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded-md"
              style={{ minWidth: "1000px", height: "700px" }}
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              This diagram illustrates the architecture of the Eco-Friendly Travel Assistant application, showing how
              different components and services interact to provide eco-friendly travel recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
