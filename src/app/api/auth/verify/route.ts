import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    return NextResponse.json(
      { message: 'Missing verification token or email' },
      { status: 400 }
    )
  }

  try {
    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        email,
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user to verified status
    await prisma.user.update({
      where: { id: verificationToken.userId! },
      data: {
        emailVerified: new Date(),
        status: 'ACTIVE',
      },
    })

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Delete existing tokens
    await prisma.verificationToken.deleteMany({
      where: { email },
    })

    // Generate new verification token
    const verificationToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        email,
        expires,
        userId: user.id,
      },
    })

    // Send verification email (implement this function)
    // await sendVerificationEmail(email, verificationToken, user.name || email)

    return NextResponse.json(
      { message: 'Verification email sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}