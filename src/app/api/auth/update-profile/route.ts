import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, email, description } = await request.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: 'The username and email are required' },
        { status: 400 }
      );
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.email !== email) {
      const existingEmail = await prisma.users.findFirst({
        where: { email: email }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'This email is already in use' },
          { status: 400 }
        );
      }
    }   
 
    if (user.username !== username) {
      const existingUsername = await prisma.users.findFirst({
          where: { username: username }
      });
      
      if (existingUsername) {
        return NextResponse.json(
          { error: 'This username is already in use' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.users.update({
      where: { username: user.username || "" },
      data: {
        email,
        username,
        description
      },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        description: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the profile' },
      { status: 500 }
    );
  }
}