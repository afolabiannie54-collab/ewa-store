'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

const statusStyle = {
  Pending: { background: '#FFF3CD', color: '#8A6D00' },
  Confirmed: { background: '#E3F2E8', color: '#4A7C59' },
  Shipped: { background: '#E3EAF2', color: '#3A5A8A' },
  Delivered: { background: '#EAF3EC', color: '#4A7C59' },
  Cancelled: { background: '#FBEAEA', color: '#C0392B' },
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40">{label}</p>
      <p className="text-[14px] text-forest font-medium">{value || '—'}</p>
    </div>
  )
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const userId = params.id

  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Failed to load user')
        } else {
          setUser(data.user)
          setOrders(data.orders || [])
          setTotalSpent(data.totalSpent || 0)
        }
      } catch {
        setError('Something went wrong')
      }
      setLoading(false)
    }
    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="px-8 md:px-12 py-10">
        <p className="text-error text-[14px]">{error || 'User not found'}</p>
        <Link href="/admin/users" className="text-[13px] text-olive hover:underline mt-3 inline-block">
          ← Back to Users
        </Link>
      </div>
    )
  }

  const nonCancelledOrders = orders.filter(o => o.status !== 'Cancelled')

  return (
    <div className="px-8 md:px-12 py-10 md:py-14 max-w-[1100px]">

      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest/50 hover:text-olive transition-colors mb-8">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        All Users
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
        <div>
          <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-1">CRM</p>
          <h1 className="font-display font-bold text-forest text-[36px] md:text-[44px] leading-none" style={{ letterSpacing: '-0.02em' }}>
            {user.name}
          </h1>
        </div>
        <span
          className="self-start inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide"
          style={user.role === 'admin'
            ? { background: '#E3EAF2', color: '#3A5A8A' }
            : { background: '#E3F2E8', color: '#4A7C59' }
          }
        >
          {user.role}
        </span>
      </div>

      {/* PROFILE CARD */}
      <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 md:p-8 mb-6">
        <h2 className="font-display font-bold text-forest text-[17px] mb-6">Profile</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <InfoRow label="Email" value={user.email} />
          <InfoRow
            label="Verified"
            value={user.isEmailVerified ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          />
          <InfoRow
            label="Last Login"
            value={user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Never'
            }
          />
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-1">Orders</p>
          <p className="font-display font-bold text-forest text-[30px]">{orders.length}</p>
        </div>
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-1">Completed</p>
          <p className="font-display font-bold text-forest text-[30px]">{nonCancelledOrders.length}</p>
        </div>
        <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-forest/40 mb-1">Total Spent</p>
          <p className="font-display font-bold text-forest text-[28px]">
            {totalSpent > 0 ? `₦${totalSpent.toLocaleString()}` : '—'}
          </p>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden">
        <div className="px-7 py-5 border-b-[1.5px] border-border">
          <h2 className="font-display font-bold text-forest text-[17px]">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-7 py-12 text-center text-[14px] text-forest/45">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b-[1.5px] border-border">
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Order</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Date</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Items</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Status</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Total</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order._id}
                    className={`border-b-[1.5px] border-border last:border-0 hover:bg-cream/60 transition-colors ${i % 2 === 0 ? '' : 'bg-cream/20'}`}
                  >
                    <td className="px-6 py-4 font-medium text-forest">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-forest/60">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-forest/60">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
                        style={statusStyle[order.status]}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-forest">₦{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-[12px] font-bold text-olive hover:text-forest transition-colors uppercase tracking-wide"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
