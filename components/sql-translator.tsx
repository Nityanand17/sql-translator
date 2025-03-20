"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Trash2, Send, Database, History, LogIn, LogOut, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import AuthModal from "./auth/auth-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  isError?: boolean
}

export default function SqlTranslator() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState<string>("chat")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("sqlTranslatorHistory")
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse chat history:", e)
      }
    }
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sqlTranslatorHistory", JSON.stringify(chatHistory))
  }, [chatHistory])

  const generateQuery = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    }

    const updatedHistory = [...chatHistory, userMessage]
    setChatHistory(updatedHistory)

    try {
      console.log("Sending request to API")
      const response = await fetch("/api/generate-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          chatHistory: chatHistory.slice(-6), // Send last 6 messages for context
        }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to generate SQL query")
      }

      const data = await response.json()

      if (!data.result) {
        throw new Error("No SQL query was generated")
      }

      // Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result,
        timestamp: Date.now(),
      }

      setChatHistory([...updatedHistory, aiMessage])
      setPrompt("")
    } catch (error) {
      console.error("Error generating query:", error)

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Failed to generate SQL query. Please try again."}`,
        timestamp: Date.now(),
        isError: true,
      }

      setChatHistory([...updatedHistory, errorMessage])

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate SQL query. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const clearChat = () => {
    setChatHistory([])
    setPrompt("")
    toast({
      title: "Chat cleared",
      description: "All messages have been removed",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "SQL query copied to clipboard",
    })
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to handle login button click
  const handleLoginClick = () => {
    setIsAuthModalOpen(true)
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">SQL Translator</h2>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {user.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={handleLoginClick} className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        )}
      </div>

      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4 mt-4">
          <div className="flex flex-col space-y-4 h-[60vh] overflow-y-auto p-4 rounded-lg border">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Database className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-sm">Start by describing the SQL query you need in plain English</p>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col p-4 rounded-lg max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground self-end"
                      : message.isError
                        ? "bg-destructive/10 border-destructive/20 border self-start"
                        : "bg-muted self-start",
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium flex items-center gap-1">
                      {message.role === "user" ? "You" : "AI"}
                    </span>
                    <span className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</span>
                  </div>

                  {message.role === "assistant" ? (
                    <div className="relative group">
                      <pre
                        className={cn(
                          "text-sm whitespace-pre-wrap font-mono p-2 rounded overflow-x-auto",
                          message.isError ? "bg-destructive/5" : "bg-black/10 dark:bg-white/10",
                        )}
                      >
                        <code>{message.content}</code>
                      </pre>
                      {!message.isError && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Textarea
              placeholder="Describe the SQL query you need in plain English..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault()
                  generateQuery()
                }
              }}
            />
            <div className="flex space-x-2">
              <Button onClick={generateQuery} disabled={isGenerating || !prompt.trim()} className="flex-1">
                {isGenerating ? "Generating..." : "Generate Query"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={clearChat} disabled={chatHistory.length === 0}>
                Clear Chat
                <Trash2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Press Ctrl+Enter to generate query</p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Query History</h3>
              {chatHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No query history yet</p>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {chatHistory
                    .filter((msg) => msg.role === "assistant" && !msg.isError)
                    .map((message) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(message.content)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap font-mono p-2 bg-muted rounded overflow-x-auto">
                          <code>{message.content}</code>
                        </pre>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

