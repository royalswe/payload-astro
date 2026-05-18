import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if subscriber already exists
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      // Already subscribed — return success silently
      return NextResponse.json({ success: true })
    }

    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        name: typeof name === 'string' ? name : '',
        email,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 })
  }
}
