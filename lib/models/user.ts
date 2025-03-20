import type { ObjectId } from "mongodb"
import clientPromise from "../mongodb"
import bcrypt from "bcryptjs"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  createdAt: Date
}

export async function createUser(userData: Omit<User, "_id" | "createdAt">): Promise<User> {
  const client = await clientPromise
  const db = client.db()

  console.log(`Checking if user exists: ${userData.email}`)

  // Check if user already exists
  const existingUser = await db.collection("users").findOne({ email: userData.email })
  if (existingUser) {
    console.log(`User already exists: ${userData.email}`)
    throw new Error("User already exists")
  }

  console.log(`Creating new user: ${userData.email}`)

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const newUser: Omit<User, "_id"> = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
  }

  const result = await db.collection("users").insertOne(newUser)
  console.log(`User created with ID: ${result.insertedId}`)

  return {
    ...newUser,
    _id: result.insertedId,
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise
  const db = client.db()

  return db.collection("users").findOne({ email }) as Promise<User | null>
}

export async function validateUser(email: string, password: string): Promise<Omit<User, "password"> | null> {
  console.log(`Validating user: ${email}`)

  const user = await findUserByEmail(email)

  if (!user) {
    console.log(`User not found: ${email}`)
    return null
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    console.log(`Invalid password for user: ${email}`)
    return null
  }

  console.log(`User validated successfully: ${email}`)

  // Don't return the password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

