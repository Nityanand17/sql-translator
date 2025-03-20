import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, chatHistory } = await req.json()

    // Format chat history for context
    const formattedHistory = chatHistory
      .map((msg: any) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n")

    const historyContext = chatHistory.length > 0 ? `\nPrevious conversation:\n${formattedHistory}\n` : ""

    const systemInstruction = `You are an expert SQL query generator. 
    Your task is to convert natural language descriptions into correct SQL queries.
    Always format your response as valid SQL code that can be executed directly.
    Do not include explanations unless specifically asked.
    Make sure to use proper SQL syntax and best practices.
    If the request is ambiguous, make reasonable assumptions and note them briefly.
    ${historyContext}`

    console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...")

    // Direct fetch to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
        }),
      },
    )

    console.log("API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error response:", errorText)
      return NextResponse.json(
        { error: "Failed to generate SQL query", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("API Response structure:", JSON.stringify(data).substring(0, 200) + "...")

    // Extract the generated text from the Gemini API response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    if (!generatedText) {
      console.error("No text generated from API response:", data)
      return NextResponse.json(
        { error: "No SQL query generated", details: "The API response did not contain any generated text" },
        { status: 500 },
      )
    }

    return NextResponse.json({ result: generatedText })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      { error: "Failed to generate SQL query", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

