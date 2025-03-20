import { NextResponse } from "next/server"
import { validateUser } from "@/lib/models/user"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`Attempting login for user: ${email}`)

    // Validate user
    const user = await validateUser(email, password)

    if (!user) {
      console.log(`Login failed for user: ${email} - Invalid credentials`)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log(`Login successful for user: ${email}`)

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Failed to login", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

