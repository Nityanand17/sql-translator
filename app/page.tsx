import SqlTranslator from "@/components/sql-translator"
import ErrorBoundary from "@/components/error-boundary"
import { Github } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 bg-clip-text  text-transparent">
            SQLGenie
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="https://github.com/Nityanand17/sql-translator"
              target="_blank"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <p className="text-center text-2xl font-bold mb-8 text-muted-foreground">Convert natural language to SQL queries using AI</p>
        <ErrorBoundary>
          <SqlTranslator />
        </ErrorBoundary>
      </div>
    </main>
  )
}

