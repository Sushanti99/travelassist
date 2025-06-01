"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TravelRecommendation } from "@/types/travel"

interface TravelResultsProps {
  results: TravelRecommendation
}

export function TravelResults({ results }: TravelResultsProps) {
  return (
    <Card className="bg-slate-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">Travel Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <style jsx global>{`
            .prose h2 {
              color: #fbbf24; /* yellow-400 */
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }
            .prose h3 {
              color: #fbbf24; /* yellow-400 */
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
            }
            .prose p, .prose li {
              color: white;
            }
            .prose ul {
              margin-top: 0.5rem;
              margin-bottom: 1rem;
            }
          `}</style>
          <div dangerouslySetInnerHTML={{ __html: results.recommendations.replace(/\n/g, "<br />") }} />
        </div>
      </CardContent>
    </Card>
  )
}
