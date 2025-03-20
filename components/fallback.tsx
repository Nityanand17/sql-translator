"use client"

import { AlertCircle } from "lucide-react"

interface FallbackProps {
  error: string
  retry: () => void
}

export default function Fallback({ error, retry }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/50 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <h3 className="text-lg font-medium mb-1">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <button onClick={retry} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
        Try again
      </button>
    </div>
  )
}

