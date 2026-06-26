'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'

const STORAGE_KEY = 'ewa-sage-conversation'
const MAX_MESSAGES_PER_SESSION = 20
const GUEST_NUDGE_THRESHOLD = 5

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

function HistoryIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-7 3.5L3 8" />
      <path d="M3 4v4h4" /><path d="M12 7v5l3 2" />
    </svg>
  )
}

function BackIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
    </svg>
  )
}

function LoginNudgeMessage({ pathname }) {
  const callbackParam = `?callbackUrl=${encodeURIComponent(pathname || '/')}`
  return (
    <p className="mb-1.5 last:mb-0">
      Want me to remember this and give you more tailored advice next time? You can{' '}
      <a href={`/login${callbackParam}`} className="font-bold text-olive underline hover:text-forest">
        log in
      </a>
      {' '}or{' '}
      <a href={`/register${callbackParam}`} className="font-bold text-olive underline hover:text-forest">
        create an account
      </a>
      {' '}anytime.
    </p>
  )
}

function getFirstName(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(' ')[0]
}

function getGreeting(userName) {
  const firstName = getFirstName(userName)
  return firstName
    ? `Hi ${firstName}, I'm Sage — your EWA skincare advisor. My mission is to help your skin glow. What's on your mind today?`
    : `Hi, I'm Sage — your EWA skincare advisor. My mission is to help your skin glow. What's on your mind today?`
}

const QUICK_PROMPTS = [
  "What's good for oily skin?",
  'Help me build a routine',
  "What's the difference between AM and PM skincare?",
]

function linkifyProducts(text, products) {
  if (!products || products.length === 0) return text
  const sorted = [...products].sort((a, b) => b.name.length - a.name.length)
  let segments = [text]

  for (const product of sorted) {
    const next = []
    for (const segment of segments) {
      if (typeof segment !== 'string') {
        next.push(segment)
        continue
      }
      const parts = segment.split(product.name)
      parts.forEach((part, i) => {
        next.push(part)
        if (i < parts.length - 1) {
          next.push(
            <Link
              key={`${product.slug}-${Math.random()}`}
              href={`/shop/${product.slug}`}
              className="font-bold text-olive underline hover:text-forest"
            >
              {product.name}
            </Link>
          )
        }
      })
    }
    segments = next
  }
  return segments
}

function renderInline(text, products) {
  let cleaned = text
  if (products && products.length > 0) {
    for (const product of products) {
      const boldedName = `**${product.name}**`
      if (cleaned.includes(boldedName)) {
        cleaned = cleaned.split(boldedName).join(product.name)
      }
    }
  }

  const boldParts = cleaned.split(/(\*\*[^*]+\*\*)/g)
  const withBold = boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
    }
    return part
  })

  return withBold.flatMap((piece) => {
    if (typeof piece !== 'string') return [piece]
    const linked = linkifyProducts(piece, products)
    return Array.isArray(linked) ? linked : [linked]
  })
}

function renderFormattedText(content, products = []) {
  const lines = content.split('\n')
  const elements = []
  let currentList = []

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-4 my-1.5 flex flex-col gap-1">
          {currentList.map((item, i) => (
            <li key={i}>{renderInline(item, products)}</li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2))
    } else {
      flushList()
      if (trimmed) {
        elements.push(<p key={`line-${i}`} className="mb-1.5 last:mb-0">{renderInline(trimmed, products)}</p>)
      }
    }
  })
  flushList()

  return elements
}

export default function SageChatWidget() {
  const { data: session, status: sessionStatus } = useSession()
  const isLoggedIn = sessionStatus === 'authenticated'
  const userName = session?.user?.name

  const [isOpen, setIsOpen] = useState(false)
  // 'chat' = actively viewing/typing in a conversation, 'history' = browsing past conversations list
  const [view, setView] = useState('chat')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const hasInitialized = useRef(false)

  // Only meaningful for logged-in users: null means "new, unsaved conversation"
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [pastConversations, setPastConversations] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingConversation, setDeletingConversation] = useState(false)

  // --- Initial load ---
  // Critical: useSession() starts in a 'loading' state on first render, before
  // it has actually checked whether the user is logged in. If this effect ran
  // immediately and locked in "guest" via hasInitialized before the real
  // session status resolved, a genuinely logged-in user would get permanently
  // stuck on the guest code path for the rest of that page load. So we wait
  // for sessionStatus to settle into either 'authenticated' or 'unauthenticated'
  // before ever deciding which branch to take.
  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (isLoggedIn) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          const firstUserMsg = Array.isArray(parsed) ? parsed.find(m => m.role === 'user') : null
          if (firstUserMsg) {
            setMessages(parsed)
            localStorage.removeItem(STORAGE_KEY)
            ;(async () => {
              try {
                const createRes = await fetch('/api/conversations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ firstMessage: firstUserMsg.content })
                })
                const createData = await createRes.json()
                if (createRes.ok) {
                  setActiveConversationId(createData.conversation._id)
                  await fetch(`/api/conversations/${createData.conversation._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: parsed })
                  })
                }
              } catch (err) {
                console.error('Failed to save rescued conversation')
              }
            })()
            return
          }
        }
      } catch (err) {}

      setMessages([{ role: 'assistant', content: getGreeting(userName), products: [] }])
      return
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch (err) {}

    setMessages([{ role: 'assistant', content: getGreeting(userName), products: [] }])
  }, [isLoggedIn, userName, sessionStatus])

  // --- Persist to localStorage, guests only ---
  useEffect(() => {
    if (isLoggedIn || messages.length === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (err) {}
  }, [messages, isLoggedIn])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, view])

  const fetchPastConversations = async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setPastConversations(data.conversations || [])
    } catch (err) {
      console.error('Failed to load conversation history')
    }
    setLoadingHistory(false)
  }

  const openHistory = () => {
    setView('history')
    fetchPastConversations()
  }

  const openPastConversation = async (id) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      const data = await res.json()
      if (res.ok) {
        setMessages(data.conversation.messages)
        setActiveConversationId(id)
        setView('chat')
      }
    } catch (err) {
      setError('Could not load that conversation')
    }
  }

  const handleDeleteConversation = async () => {
    if (!deleteTarget) return
    setDeletingConversation(true)
    try {
      await fetch(`/api/conversations/${deleteTarget}`, { method: 'DELETE' })
      setPastConversations(prev => prev.filter(c => c._id !== deleteTarget))
      // If the conversation being deleted is the one currently open in the chat,
      // reset to a fresh unsaved conversation rather than leaving a deleted,
      // orphaned conversation visibly active in the chat window.
      if (activeConversationId === deleteTarget) {
        setMessages([{ role: 'assistant', content: getGreeting(userName), products: [] }])
        setActiveConversationId(null)
      }
    } catch (err) {
      console.error('Failed to delete conversation')
    }
    setDeletingConversation(false)
    setDeleteTarget(null)
  }

  const startNewChat = () => {
    setMessages([{ role: 'assistant', content: getGreeting(userName), products: [] }])
    setActiveConversationId(null)
    setError('')
    setView('chat')
    if (!isLoggedIn) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([{ role: 'assistant', content: getGreeting(userName), products: [] }]))
      } catch (err) {}
    }
  }

  // Persists the current message array to the database for logged-in users —
  // creating a new ChatConversation on the very first real exchange if one
  // doesn't exist yet, otherwise updating the existing one.
  const persistConversation = async (updatedMessages, firstUserMessage) => {
    if (!isLoggedIn) return

    try {
      if (!activeConversationId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: firstUserMessage })
        })
        const createData = await createRes.json()
        if (createRes.ok) {
          setActiveConversationId(createData.conversation._id)
          await fetch(`/api/conversations/${createData.conversation._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedMessages })
          })
        }
      } else {
        await fetch(`/api/conversations/${activeConversationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages })
        })
      }
    } catch (err) {
      console.error('Failed to save conversation')
    }
  }

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    const userMessageCount = messages.filter(m => m.role === 'user').length
    if (userMessageCount >= MAX_MESSAGES_PER_SESSION) {
      setError("We've reached the limit for this conversation. Please start a new chat to keep talking with Sage.")
      return
    }

    // After 5 guest exchanges, nudge toward logging in — once per conversation, not on every message after.
    const shouldShowLoginNudge = !isLoggedIn && userMessageCount === GUEST_NUDGE_THRESHOLD
      && !messages.some(m => m.isLoginNudge)

    setError('')
    const isFirstUserMessage = userMessageCount === 0
    const newMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', products: [] }])

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
      let rawBuffer = ''
      let fullReply = ''
      let parsedProducts = []
      let headerExtracted = false
      let finalMessages = newMessages

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })

        if (!headerExtracted) {
          rawBuffer += chunk
          const match = rawBuffer.match(/^__PRODUCTS__(.*?)__END_PRODUCTS__/s)
          if (match) {
            try {
              parsedProducts = JSON.parse(match[1])
            } catch (e) {
              parsedProducts = []
            }
            headerExtracted = true
            fullReply = rawBuffer.slice(match[0].length)
          }
          if (!headerExtracted) continue
        } else {
          fullReply += chunk
        }

        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullReply, products: parsedProducts }
          finalMessages = updated
          return updated
        })
      }

      if (shouldShowLoginNudge) {
        setMessages(prev => [...prev, { role: 'assistant', content: '', products: [], isLoginNudge: true }])
      }

      await persistConversation(finalMessages, isFirstUserMessage ? trimmed : null)

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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Sage chat' : 'Open Sage chat'}
        style={{ position: 'fixed', bottom: '88px', right: '24px', zIndex: 55 }}
        className="w-14 h-14 rounded-full bg-olive text-cream shadow-[0_12px_32px_-8px_rgba(40,54,24,0.4)] flex items-center justify-center hover:bg-forest transition-colors"
      >
        {isOpen ? <CloseIcon className="w-6 h-6" /> : <SageIcon className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          style={{ position: 'fixed', bottom: '156px', right: '24px', zIndex: 55 }}
          className="w-[92vw] max-w-[380px] h-[560px] max-h-[70vh] rounded-[24px] border-[1.5px] border-border bg-cream shadow-[0_24px_64px_-12px_rgba(40,54,24,0.35)] flex flex-col overflow-hidden"
        >

          {/* HEADER */}
          <div className="bg-forest px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              {view === 'history' ? (
                <button onClick={() => setView('chat')} aria-label="Back to chat" className="text-cream hover:text-cream/70 transition-colors">
                  <BackIcon className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center">
                  <SageIcon className="w-4 h-4 text-cream" />
                </div>
              )}
              <p className="font-display font-bold text-cream text-[16px]">
                {view === 'history' ? 'Your Conversations' : 'Sage'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn && view === 'chat' && (
                <button onClick={openHistory} aria-label="View past conversations" className="text-cream/60 hover:text-cream transition-colors">
                  <HistoryIcon className="w-[18px] h-[18px]" />
                </button>
              )}
              {view === 'chat' && (
                <button
                  onClick={startNewChat}
                  className="text-cream/60 text-[12px] font-bold uppercase tracking-wide hover:text-cream transition-colors"
                >
                  New Chat
                </button>
              )}
            </div>
          </div>

          {/* HISTORY VIEW */}
          {view === 'history' ? (
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2">
              {loadingHistory ? (
                <p className="text-[13px] text-forest/50 text-center py-8">Loading...</p>
              ) : pastConversations.length === 0 ? (
                <p className="text-[13px] text-forest/50 text-center py-8">No past conversations yet.</p>
              ) : (
                pastConversations.map(conv => (
                  <div
                    key={conv._id}
                    className="group relative flex items-center gap-2 rounded-[14px] border-[1.5px] border-border bg-surface hover:border-olive transition-colors"
                  >
                    <button
                      onClick={() => openPastConversation(conv._id)}
                      className="flex-1 text-left px-4 py-3 min-w-0"
                    >
                      <p className="text-[13px] font-medium text-forest truncate pr-6">{conv.title}</p>
                      <p className="text-[11px] text-forest/45 mt-0.5">
                        {new Date(conv.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(conv._id)}
                      aria-label="Delete conversation"
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-forest/40 hover:text-error transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-4 py-2.5 rounded-[16px] text-[14px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'self-end bg-olive text-cream rounded-br-[4px]'
                        : 'self-start bg-surface border-[1.5px] border-border text-forest rounded-bl-[4px]'
                    }`}
                  >
                    {msg.isLoginNudge
                      ? <LoginNudgeMessage pathname={typeof window !== 'undefined' ? window.location.pathname : '/'} />
                      : msg.content
                        ? renderFormattedText(msg.content, msg.products)
                        : (streaming && i === messages.length - 1 ? '···' : '')}
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

                {error && <p className="text-[12px] text-error px-1">{error}</p>}

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
            </>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConversation}
        title="Delete this conversation?"
        message="This conversation will be permanently removed from your history. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deletingConversation}
      />
    </>
  )
}