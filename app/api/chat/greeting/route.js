import { getCurrentUser } from '@/lib/auth'
import { getPersonalizationContext } from '@/lib/chatPersonalization'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ greeting: null }, { status: 200 })
    }

    const firstName = user.name?.trim().split(' ')[0] || user.name
    const context = await getPersonalizationContext(user.id)

    let greeting

    if (context.recentPurchases.length > 0) {
      const mostRecent = context.recentPurchases[0]
      greeting = `Hi ${firstName}, I'm Sage — your EWA skincare advisor. How's the ${mostRecent.name} working out for you?`
    } else if (context.isFirstTimeCustomer) {
      greeting = `Hi ${firstName}, I'm Sage — your EWA skincare advisor. My mission is to help your skin glow. Looking for something to start your routine with?`
    } else {
      greeting = `Hi ${firstName}, I'm Sage — your EWA skincare advisor. My mission is to help your skin glow. What's on your mind today?`
    }

    return NextResponse.json({ greeting }, { status: 200 })

  } catch (error) {
    console.error('Greeting personalization error:', error)
    // A failure here should never block the chat widget from opening —
    // the client falls back to the generic greeting if this returns null/errors.
    return NextResponse.json({ greeting: null }, { status: 200 })
  }
}