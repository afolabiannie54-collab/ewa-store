'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'

const STORAGE_KEY = 'ewa-sage-conversation'
const MAX_MESSAGES_PER_SESSION = 20
const GUEST_NUDGE_THRESHOLD = 5


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

function SageMark(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <path
        d="M16 4C9 8 6 14 6 19c0 5.5 4.5 9 10 9s10-3.5 10-9c0-5-3-11-10-15Z"
        fill="currentColor"
      />
      <path
        d="M16 9v17"
        stroke="#FEFAE0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M16 13c-1.5 1-3 2.5-3 4M16 18c1.5 1 3 2.5 3 4"
        stroke="#FEFAE0"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
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


const QUICK_PROMPTS = [
  "What's good for oily skin?",
  'Help me build a routine',
  "What's the difference between AM and PM skincare?",
]

function linkifyProducts(text, products) {
  if (!products || products.length === 0) return text
  const sorted = [...products].sort((a, b) => b.name.length - a.name.length)
  let segments = [text]
  let linkIdx = 0

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
              key={`link-${linkIdx++}`}
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
  const pathname = usePathname()
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

  const panelRef = useRef(null)
  const openButtonRef = useRef(null)
  const abortControllerRef = useRef(null)

  const [panelWidth, setPanelWidth] = useState(380)
  const [panelHeight, setPanelHeight] = useState(560)
  const [isResizing, setIsResizing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isClosingMobile, setIsClosingMobile] = useState(false)
  const dragStartRef = useRef({ startX: 0, startY: 0, startWidth: 380, startHeight: 560 })
  const swipeTouchRef = useRef(null)

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

      setMessages([])
      return
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.filter(m => m.role === 'user').length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch (err) {}

    setMessages([])
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const savedWidth = localStorage.getItem('ewa-sage-panel-width')
    const savedHeight = localStorage.getItem('ewa-sage-panel-height')
    if (savedWidth) setPanelWidth(Number(savedWidth))
    if (savedHeight) setPanelHeight(Number(savedHeight))
  }, [])

  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('sage:open', handler)
    return () => window.removeEventListener('sage:open', handler)
  }, [])

  // Abort any in-flight stream when the widget closes or the component unmounts
  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort() }
  }, [])

  useEffect(() => {
    if (!isOpen || isMobile) return
    function handleClickOutside(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        openButtonRef.current && !openButtonRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, isMobile])

  useEffect(() => {
    function handleMouseMove(e) {
      if (!isResizing) return
      const newWidth = Math.min(560, Math.max(320, dragStartRef.current.startWidth + (dragStartRef.current.startX - e.clientX)))
      const newHeight = Math.min(720, Math.max(400, dragStartRef.current.startHeight + (dragStartRef.current.startY - e.clientY)))
      setPanelWidth(newWidth)
      setPanelHeight(newHeight)
    }
    function handleMouseUp() {
      if (isResizing) {
        setIsResizing(false)
        localStorage.setItem('ewa-sage-panel-width', String(panelWidth))
        localStorage.setItem('ewa-sage-panel-height', String(panelHeight))
      }
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'nwse-resize'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing, panelWidth, panelHeight])

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
        setMessages([])
        setActiveConversationId(null)
      }
    } catch (err) {
      console.error('Failed to delete conversation')
    }
    setDeletingConversation(false)
    setDeleteTarget(null)
  }

  const startNewChat = () => {
    setMessages([])
    setActiveConversationId(null)
    setError('')
    setView('chat')
    if (!isLoggedIn) {
      try {
        localStorage.removeItem(STORAGE_KEY)
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

    // Cancel any in-flight stream before starting a new one
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

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
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal
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

      while (true) {
        const { done, value } = await reader.read()
        if (done || controller.signal.aborted) break

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

        const errorMatch = fullReply.match(/__ERROR__(.*?)__END_ERROR__/s)
        if (errorMatch) {
          throw new Error(errorMatch[1])
        }

        // Capture values outside the setter to avoid side effects inside it
        const currentContent = fullReply
        const currentProducts = parsedProducts
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: currentContent, products: currentProducts }
          return updated
        })
      }

      if (!controller.signal.aborted) {
        // Build finalMessages for persistence outside the state setter
        const finalMessages = [
          ...newMessages,
          { role: 'assistant', content: fullReply, products: parsedProducts }
        ]

        if (shouldShowLoginNudge) {
          setMessages(prev => [...prev, { role: 'assistant', content: '', products: [], isLoginNudge: true }])
        }

        await persistConversation(finalMessages, isFirstUserMessage ? trimmed : null)
      }

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong. Please try again.')
        setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && m.content === '')))
      }
    }

    setStreaming(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const startDrag = (e) => {
    e.preventDefault()
    dragStartRef.current = { startX: e.clientX, startY: e.clientY, startWidth: panelWidth, startHeight: panelHeight }
    setIsResizing(true)
  }

  const handleHeaderTouchStart = (e) => {
    swipeTouchRef.current = { startY: e.touches[0].clientY }
  }

  const handleHeaderTouchEnd = (e) => {
    if (!swipeTouchRef.current) return
    const deltaY = e.changedTouches[0].clientY - swipeTouchRef.current.startY
    swipeTouchRef.current = null
    if (deltaY > 80) closeMobilePanel()
  }

  const closeMobilePanel = () => {
    setIsClosingMobile(true)
  }

  const isAdminUser = session?.user?.role === 'admin'
  const EXCLUDED_ROUTE_PREFIXES = ['/admin', '/checkout', '/cart']
  const isExcludedRoute = EXCLUDED_ROUTE_PREFIXES.some(prefix => pathname?.startsWith(prefix))

  if (isAdminUser || isExcludedRoute) {
    return null
  }

  return (
    <>
      <style>{`
        .sage-hide-scroll { scrollbar-width: none; }
        .sage-hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes sage-msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sage-msg { animation: sage-msg-in 0.18s ease-out both; }
        @keyframes sage-panel-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sage-panel-down {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        .sage-panel-mobile { animation: sage-panel-up 0.42s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .sage-panel-closing { animation: sage-panel-down 0.28s cubic-bezier(0.4, 0, 1, 1) both; }
      `}</style>
      {!(isMobile && isOpen) && (
        <button
          ref={openButtonRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Sage chat' : 'Open Sage chat'}
          style={{
            position: 'fixed', bottom: '80px', right: '24px', zIndex: 55,
            background: isOpen
              ? 'linear-gradient(135deg, #384c17 0%, #283618 100%)'
              : 'linear-gradient(135deg, #627c30 0%, #283618 100%)',
            boxShadow: '0 8px 32px -4px rgba(40,54,24,0.6), 0 2px 8px rgba(40,54,24,0.2)',
          }}
          className="w-12 h-12 rounded-full text-cream flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        >
          {isOpen ? <CloseIcon className="w-5 h-5" /> : <SageMark className="w-[26px] h-[26px]" />}
        </button>
      )}

      {isOpen && (
        <div
          ref={panelRef}
          style={isMobile ? {
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: 60,
            background: '#ffffff',
          } : {
            position: 'fixed', bottom: '160px', right: '24px', zIndex: 55,
            width: panelWidth, height: panelHeight,
            boxShadow: '0 32px 80px -8px rgba(40,54,24,0.5), 0 0 0 1px rgba(40,54,24,0.07)',
            background: '#ffffff',
            borderRadius: '24px',
          }}
          className={`flex flex-col overflow-hidden${isMobile ? (isClosingMobile ? ' sage-panel-closing' : ' sage-panel-mobile') : ''}`}
          onAnimationEnd={() => {
            if (isClosingMobile) {
              setIsClosingMobile(false)
              setIsOpen(false)
            }
          }}
        >

          {/* HEADER */}
          <div
            className="px-5 py-4 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #283618 0%, #384c17 100%)' }}
            onTouchStart={handleHeaderTouchStart}
            onTouchEnd={handleHeaderTouchEnd}
          >
            <div className="flex items-center gap-3">
              {view === 'history' ? (
                <button onClick={() => setView('chat')} aria-label="Back to chat" className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-cream hover:bg-cream/10 transition-colors">
                  <BackIcon className="w-5 h-5" />
                </button>
              ) : (
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f6425 0%, #627c30 100%)' }}>
                    <SageMark className="w-5 h-5 text-cream" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: '#4ade80', borderColor: '#283618' }} />
                </div>
              )}
              <div>
                <p className="font-display font-bold text-cream text-[16px] leading-tight">
                  {view === 'history' ? 'Your Conversations' : 'Sage'}
                </p>
                <p className="text-[11px] font-medium" style={{ color: 'rgba(254,250,224,0.45)' }}>
                  {view === 'history' ? 'Your chat history with Sage' : 'Your skin advisor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isMobile && (
                <button onClick={closeMobilePanel} aria-label="Close Sage chat" className="text-cream/60 hover:text-cream transition-colors">
                  <CloseIcon className="w-5 h-5" />
                </button>
              )}
              {isLoggedIn && view === 'chat' && (
                <button onClick={openHistory} aria-label="View past conversations" className="text-cream/60 hover:text-cream transition-colors">
                  <HistoryIcon className="w-[18px] h-[18px]" />
                </button>
              )}
              {view === 'chat' && (
                <button
                  onClick={startNewChat}
                  className="text-[12px] font-bold uppercase tracking-wide transition-colors"
                  style={{ color: 'rgba(254,250,224,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FEFAE0'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(254,250,224,0.5)'}
                >
                  New Chat
                </button>
              )}
            </div>
          </div>

          {/* HISTORY VIEW */}
          {view === 'history' ? (
            <>
            <div className="sage-hide-scroll flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2">
              {loadingHistory ? (
                <div className="flex flex-col gap-2.5">
                  {[0.72, 0.85, 0.58, 0.78].map((w, n) => (
                    <div key={n} className="animate-pulse rounded-[16px] border-[1.5px] border-border px-5 py-4" style={{ background: '#faf9f6' }}>
                      <div className="h-3.5 rounded-full mb-3" style={{ background: 'rgba(40,54,24,0.09)', width: `${w * 100}%` }} />
                      <div className="h-2.5 rounded-full" style={{ background: 'rgba(40,54,24,0.05)', width: '28%' }} />
                    </div>
                  ))}
                </div>
              ) : pastConversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(40,54,24,0.06)' }}>
                    <span style={{ color: 'rgba(40,54,24,0.3)' }}><HistoryIcon className="w-5 h-5" /></span>
                  </div>
                  <p className="text-[14px] font-semibold text-forest" style={{ opacity: 0.6 }}>No conversations yet</p>
                  <p className="text-[12px] mt-1" style={{ color: 'rgba(40,54,24,0.35)', lineHeight: '1.6' }}>Your chats with Sage will appear here once you start a conversation.</p>
                </div>
              ) : (
                pastConversations.map(conv => (
                  <div
                    key={conv._id}
                    className="group relative flex items-center gap-2 rounded-[14px] border-[1.5px] border-border hover:border-olive transition-colors"
                    style={{ background: '#faf9f6' }}
                  >
                    <button
                      onClick={() => openPastConversation(conv._id)}
                      className="flex-1 text-left px-4 py-3 min-w-0"
                    >
                      <p className="text-[13px] font-medium text-forest truncate pr-6">{conv.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(40,54,24,0.4)' }}>
                        {new Date(conv.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(conv._id)}
                      aria-label="Delete conversation"
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                      style={{ color: 'rgba(40,54,24,0.35)' }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex-shrink-0" style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(40,54,24,0.07)' }}>
              <button
                onClick={startNewChat}
                className="w-full rounded-full text-cream font-semibold flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)', padding: '11px 20px', fontSize: '14px' }}
              >
                Start new conversation
              </button>
            </div>
            </>
          ) : (
            <>
              {/* MESSAGES — empty state or active conversation */}
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                  <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)', boxShadow: '0 8px 24px -4px rgba(40,54,24,0.4)' }}>
                    <SageMark className="w-8 h-8 text-cream" />
                  </div>
                  <h2 className="font-display font-bold text-forest mb-2" style={{ fontSize: '19px' }}>
                    Your Skin Advisor Is Online
                  </h2>
                  <p className="leading-relaxed mb-5 max-w-[250px]" style={{ fontSize: '13px', color: 'rgba(40,54,24,0.48)' }}>
                    Ask anything about routines, ingredients, or what works for your skin.
                  </p>

                  <div className="flex flex-col gap-2 w-full max-w-[280px]">
                    {QUICK_PROMPTS.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="group flex items-center justify-between gap-3 text-left px-4 py-3 rounded-[14px] border-[1.5px] border-border hover:border-olive transition-all duration-150"
                        style={{ background: '#f5f4f0', fontSize: '13px', color: 'rgba(40,54,24,0.72)' }}
                      >
                        <span>{prompt}</span>
                        <span className="flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 text-olive">→</span>
                      </button>
                    ))}
                  </div>

                  {error && <p className="text-[12px] text-error mt-4">{error}</p>}
                </div>
              ) : (
                <div className="sage-hide-scroll flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`sage-msg max-w-[85%] px-4 py-2.5 rounded-[16px] text-[14px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'self-end text-cream rounded-br-[4px]'
                          : 'self-start border-[1.5px] border-border text-forest rounded-bl-[4px]'
                      }`}
                      style={msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)' }
                        : { background: '#f4f3ee' }}
                    >
                      {msg.isLoginNudge
                        ? <LoginNudgeMessage pathname={typeof window !== 'undefined' ? window.location.pathname : '/'} />
                        : msg.content
                          ? renderFormattedText(msg.content, msg.products)
                          : (streaming && i === messages.length - 1 ? '···' : '')}
                    </div>
                  ))}

                  {error && <p className="text-[12px] text-error px-1">{error}</p>}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* INPUT */}
              <form
                onSubmit={handleSubmit}
                className="flex-shrink-0"
                style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(40,54,24,0.07)' }}
              >
                <div
                  className="flex items-center gap-2 rounded-full border-[1.5px] border-border focus-within:border-olive transition-colors"
                  style={{ background: '#f5f4f0', padding: '5px 5px 5px 16px' }}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Sage anything..."
                    disabled={streaming}
                    className="flex-1 bg-transparent outline-none disabled:opacity-50"
                    style={{ fontSize: '16px', color: '#283618' }}
                  />
                  <button
                    type="submit"
                    disabled={streaming || !input.trim()}
                    aria-label="Send message"
                    className="flex-shrink-0 w-9 h-9 rounded-full text-cream flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #4f6425 0%, #283618 100%)' }}
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}
          {!isMobile && (
            <div
              onMouseDown={startDrag}
              title="Drag to resize"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '28px',
                height: '28px',
                cursor: 'nwse-resize',
                zIndex: 2,
              }}
            />
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