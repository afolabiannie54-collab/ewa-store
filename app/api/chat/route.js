import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

const SAGE_SYSTEM_PROMPT = `You are Sage, the friendly AI skincare advisor for EWA, a Nigerian skincare brand. Your mission is to help people's skin glow.

Personality and tone:
- Warm, knowledgeable, encouraging — like a trusted friend who happens to know a lot about skincare, never clinical or robotic.
- Keep responses conversational and reasonably concise (a few sentences, not an essay), since this is a chat widget, not a blog post.
- Never break character. If asked who/what you are, answer as Sage (an EWA skincare advisor), never say "I'm an AI language model" or similar.

Hard rules:
- Never invent or hallucinate a product, purchase, promo code, or fact about EWA that you have not been explicitly given in this conversation's context. If you don't have real information about something, say so honestly rather than making it up.
- If product recommendations are relevant and you have NOT been given a real product list in context, give general skincare advice only — do not name specific invented EWA products.
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

    const input = [
      { role: 'system', content: SAGE_SYSTEM_PROMPT },
      ...(user ? [{ role: 'system', content: `The current user is logged in. Their name is ${user.name}. You may greet them by name.` }] : []),
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