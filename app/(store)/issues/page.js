'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Loader from '@/components/Loader'

const STATUS_STYLES = {
  Pending: 'bg-cream text-forest border-border',
  Approved: 'bg-olive/15 text-olive border-olive/30',
  Resolved: 'bg-success/15 text-success border-success/30',
  Rejected: 'bg-error/10 text-error border-error/30'
}

export default function MyIssuesPage() {
  const { status } = useSession()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchIssues()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues')
      const data = await res.json()
      setIssues(data.issues || [])
    } catch (err) {
      console.error('Failed to load issues')
    }
    setLoading(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-forest/60 text-[16px] mb-6">Please log in to view your reported issues.</p>
          <Link href="/login" className="inline-block rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-9 py-4 hover:bg-forest transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 py-12 md:py-16">

        <h1 className="font-display font-bold text-forest text-[44px] md:text-[60px] leading-none mb-2" style={{ letterSpacing: '-0.02em' }}>
          Reported Issues
        </h1>
        <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-12">
          {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </p>

        {issues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-forest/60 text-[16px]">You haven&apos;t reported any issues.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {issues.map(issue => (
              <div
                key={issue._id}
                className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden"
              >
                <div className="flex items-center justify-between px-7 py-5 bg-forest">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wide text-cream/50 mb-1">
                      Order {issue.orderId?.orderNumber}
                    </p>
                    <p className="font-display font-bold text-cream text-[18px] md:text-[20px]">
                      {issue.reasonType}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full border-[1.5px] ${STATUS_STYLES[issue.status]}`}>
                    {issue.status}
                  </span>
                </div>

                <div className="px-7 py-6">
                  <p className="text-[14px] text-forest/75 leading-relaxed mb-4">{issue.details}</p>

                  {issue.images?.length > 0 && (
                    <div className="flex gap-2.5 mb-4">
                      {issue.images.map((img, i) => (
                        <div key={i} className="relative w-[60px] h-[60px] rounded-[10px] overflow-hidden border-[1.5px] border-border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {issue.adminNote && (
                    <div className="rounded-[14px] bg-cream border-[1.5px] border-border px-5 py-4 mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-olive mb-1.5">Response from EWA</p>
                      <p className="text-[14px] text-forest/80 leading-relaxed">{issue.adminNote}</p>
                    </div>
                  )}

                  <p className="text-[12px] text-forest/40">
                    Reported on {new Date(issue.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}