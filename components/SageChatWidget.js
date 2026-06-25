'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

const STORAGE_KEY = 'ewa-sage-conversation'
const MAX_MESSAGES_PER_SESSION = 20

function SageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3c2 2.5 3 5 3 7.5a3 3 0 0 1-6 0C9 8 10 5.5 12 3Z" />
      <path d="M8 14c.5 2 2 4 4 4s3.5-2 4-4" />
    </svg>
  )
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function getGreeting(userName) {
  return userName
    ? `Hi ${userName}, I'm Sage — your EWA skincare advisor. My mission is to help your skin glow. What's on your mind today?`
    : `Hi, I'm Sage — your EWA skincare advisor. My mission is to help your skin glow. What's on your mind today?`
}

const QUICK_PROMPTS = [
  "What's good for oily skin?",
  'Help me build a routine',
  "What's the difference between AM and PM skincare?",
]

export default function SageChatWidget() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const hasInitialized = useRef(false)

  const userName = session?.user?.name

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch (err) {
      // Corrupt or missing localStorage data — fall through to fresh greeting
    }

    setMessages([{ role: 'assistant', content: getGreeting(userName) }])
  }, [userName])

  useEffect(() => {
    if (messages.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (err) {
      // localStorage may be full or unavailable (private browsing) — fail silently
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    const userMessageCount = messages.filter(m => m.role === 'user').length
    if (userMessageCount >= MAX_MESSAGES_PER_SESSION) {
      setError("We've reached the limit for this conversation. Please start a new chat to keep talking with Sage.")
      return
    }

    setError('')
    const newMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Sage is unavailable right now.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullReply = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullReply += chunk

        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullReply }
          return updated
        })
      }

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && m.content === '')))
    }

    setStreaming(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const startNewChat = () => {
    const fresh = [{ role: 'assistant', content: getGreeting(userName) }]
    setMessages(fresh)
    setError('')
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    } catch (err) {}
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Sage chat' : 'Open Sage chat'}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-olive text-cream shadow-[0_12px_32px_-8px_rgba(40,54,24,0.4)] flex items-center justify-center hover:bg-forest transition-colors"
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <SageIcon className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[92vw] max-w-[380px] h-[560px] max-h-[75vh] rounded-[24px] border-[1.5px] border-border bg-cream shadow-[0_24px_64px_-12px_rgba(40,54,24,0.35)] flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-forest px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center">
                <SageIcon className="w-4 h-4 text-cream" />
              </div>
              <p className="font-display font-bold text-cream text-[16px]">Sage</p>
            </div>
            <button
              onClick={startNewChat}
              className="text-cream/60 text-[12px] font-bold uppercase tracking-wide hover:text-cream transition-colors"
            >
              New Chat
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-4 py-2.5 rounded-[16px] text-[14px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'self-end bg-olive text-cream rounded-br-[4px]'
                    : 'self-start bg-surface border-[1.5px] border-border text-forest rounded-bl-[4px]'
                }`}
              >
                {msg.content || (streaming && i === messages.length - 1 ? '···' : '')}
              </div>
            ))}

            {messages.length <= 1 && !streaming && (
              <div className="flex flex-col gap-2 mt-2">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="self-start text-left px-4 py-2.5 rounded-[14px] border-[1.5px] border-border bg-surface text-[13px] text-forest/80 hover:border-olive transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="text-[12px] text-error px-1">{error}</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <form onSubmit={handleSubmit} className="flex-shrink-0 border-t-[1.5px] border-border bg-surface p-3 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sage anything..."
              disabled={streaming}
              className="flex-1 rounded-full border-[1.5px] border-border bg-cream px-4 py-2.5 text-[14px] text-forest placeholder:text-forest/35 outline-none focus:border-olive transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="Send message"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-olive text-cream flex items-center justify-center hover:bg-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}