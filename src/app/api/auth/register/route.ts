import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
})

export async function POST(req: Request) {
  try {
    // Parse and validate the request body
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Try to create the user directly - let Prisma handle unique constraints
    const user = await db.users.create({
      data: {
        username: name,
        email,
        password: hashedPassword,
        isAdmin: false,
        description: "No About Me"
      },
    })

    // Return success response
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
      }
    }, { status: 201 })

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      // P2002 is Prisma's error code for unique constraint violations
      if (error.code === 'P2002') {
        return NextResponse.json(
          { message: "A user with this email already exists" },
          { status: 409 }
        )
      }
    }

    // Log the error for debugging
    console.error("Registration error:", error)

    // Return a generic error message
    return NextResponse.json(
      { message: "Something went wrong while creating your account" },
      { status: 500 }
    )
  }
} 