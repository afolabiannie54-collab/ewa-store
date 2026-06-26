import { getCurrentUser } from '@/lib/auth'
import { findRelevantProducts } from '@/lib/chatProductMatch'
import { getPersonalizationContext } from '@/lib/chatPersonalization'
import { NextResponse } from 'next/server'

const SAGE_SYSTEM_PROMPT = `You are Sage, the friendly AI skincare advisor for EWA, a Nigerian skincare brand. Your mission is to help people's skin glow.

Personality and tone:
- Warm, knowledgeable, encouraging — like a trusted friend who happens to know a lot about skincare, never clinical or robotic.
- Keep responses conversational and reasonably concise (a few sentences, not an essay), since this is a chat widget, not a blog post.
- Never use emojis in your responses, under any circumstance.
- Never break character. If asked who/what you are, answer as Sage (an EWA skincare advisor), never say "I'm an AI language model" or similar.

Hard rules:
- Never invent or hallucinate a product, purchase, promo code, or fact about EWA that you have not been explicitly given in this conversation's context. If you don't have real information about something, say so honestly rather than making it up.
- If you have been given a list of real EWA products below, you may recommend them by their EXACT name when relevant to what the user is asking. Mention the exact product name plainly in your response (do not abbreviate or rephrase it) so it can be linked automatically.
- If you have NOT been given any product list, or none of the given products are actually relevant to this specific question, give general skincare advice only — do not invent or name any EWA product.
- Never recommend a product that is out of stock without mentioning that it's currently unavailable.
- If you have been given the user's real purchase history, wishlist, or available promo codes below, you may reference them naturally when relevant — e.g. asking how a past purchase is working out, mentioning a wishlist item, or letting them know about a promo code they can actually use. Never invent a purchase, wishlist item, or promo code that wasn't given to you.
- If the user is marked as a first-time customer with no purchases yet, you can gently encourage them toward their first purchase when it fits naturally — never pushy, just warm and inviting.
- Be encouraging about skincare routines, never pushy or salesy. Checking in on how something is working for someone is welcome; aggressive upselling is not.
- Keep advice general and educational. For serious skin conditions, gently suggest seeing a dermatologist rather than diagnosing anything yourself.`

export async function POST(req) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    if (messages.length > 40) {
      return NextResponse.json({ error: 'Conversation is too long. Please start a new chat.' }, { status: 400 })
    }

    const user = await getCurrentUser()

    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')
    const relevantProducts = latestUserMessage
      ? await findRelevantProducts(latestUserMessage.content)
      : []

    // Personalization is only ever fetched for logged-in users — guests never
    // get this context at all, since there's no real account data to ground it in.
    let personalization = null
    if (user) {
      try {
        personalization = await getPersonalizationContext(user.id)
      } catch (err) {
        console.error('Failed to load personalization context', err)
        // A failure here should degrade gracefully to a non-personalized
        // reply, not break the chat entirely.
      }
    }

    const personalizationLines = []
    if (personalization) {
      if (personalization.recentPurchases.length > 0) {
        personalizationLines.push(
          `Recent delivered purchases (most recent first): ${personalization.recentPurchases.map(p => p.name).join(', ')}.`
        )
      }
      if (personalization.wishlistItems.length > 0) {
        personalizationLines.push(
          `Items currently on their wishlist: ${personalization.wishlistItems.map(p => p.name).join(', ')}.`
        )
      }
      if (personalization.usablePromos.length > 0) {
        personalizationLines.push(
          `Promo codes they can currently use: ${personalization.usablePromos.map(p =>
            `${p.code} (${p.discountType === 'percentage' ? `${p.discountValue}% off` : `₦${p.discountValue.toLocaleString()} off`}${p.minimumOrderAmount > 0 ? `, min order ₦${p.minimumOrderAmount.toLocaleString()}` : ''})`
          ).join('; ')}.`
        )
      }
      if (personalization.isFirstTimeCustomer) {
        personalizationLines.push(`This user has not completed any delivered orders yet — they are a first-time customer.`)
      }
    }

    const input = [
      { role: 'system', content: SAGE_SYSTEM_PROMPT },
      ...(user ? [{ role: 'system', content: `The current user is logged in. Their first name is ${user.name?.trim().split(' ')[0] || user.name}. Address them by this first name only, not their full name.` }] : []),
      ...(personalizationLines.length > 0
        ? [{ role: 'system', content: `Real account context for this user:\n${personalizationLines.join('\n')}` }]
        : []),
      ...(relevantProducts.length > 0
        ? [{
            role: 'system',
            content: `Here are real EWA products relevant to this conversation. Only recommend from this list — never invent others:\n${relevantProducts.map(p =>
              `- ${p.name} (${p.category}): ${p.description} — From ₦${p.startingPrice.toLocaleString()}${p.inStock ? '' : ' [OUT OF STOCK]'}`
            ).join('\n')}`
          }]
        : []),
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]

    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4-nano',
        input,
        max_output_tokens: 300,
        stream: true
      })
    })

    if (!openaiRes.ok || !openaiRes.body) {
      const errText = await openaiRes.text()
      console.error('OpenAI API error:', errText)
      return NextResponse.json({ error: 'Sage is unavailable right now. Please try again shortly.' }, { status: 502 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const productHeader = JSON.stringify(
          relevantProducts.map(p => ({ name: p.name, slug: p.slug }))
        )
        controller.enqueue(encoder.encode(`__PRODUCTS__${productHeader}__END_PRODUCTS__`))

        const reader = openaiRes.body.getReader()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'response.output_text.delta' && parsed.delta) {
                  controller.enqueue(encoder.encode(parsed.delta))
                }
              } catch (e) {
                // Skip malformed/partial JSON chunks rather than crashing the stream
              }
            }
          }
        } catch (err) {
          console.error('Stream reading error:', err)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}