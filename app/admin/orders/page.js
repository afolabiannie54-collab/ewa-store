'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to load orders')
    }
    setLoading(false)
  }

  const statusColors = {
    Pending: { bg: '#FFF3CD', text: '#8A6D00' },
    Confirmed: { bg: '#E3F2E8', text: '#4A7C59' },
    Shipped: { bg: '#E3EAF2', text: '#3A5A8A' },
    Delivered: { bg: '#EAF3EC', text: '#4A7C59' },
    Cancelled: { bg: '#FBEAEA', text: '#C0392B' }
  }

  const filteredOrders = filterStatus ? orders.filter(o => o.status === filterStatus) : orders

  if (loading) return <div style={{ padding: '40px' }}>Loading orders...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'serif', fontSize: '28px', color: '#283618', marginBottom: '24px' }}>Orders</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '8px 16px', borderRadius: '100px', fontSize: '12px',
              border: filterStatus === s ? '1px solid #606C38' : '1px solid #D6CEB8',
              background: filterStatus === s ? '#606C38' : 'transparent',
              color: filterStatus === s ? '#FEFAE0' : '#283618',
              cursor: 'pointer'
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #D6CEB8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#283618' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Order #</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Customer</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Total</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#FEFAE0', fontSize: '12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id} style={{ borderBottom: '1px solid #D6CEB8' }}>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>{order.orderNumber}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                  {order.guestName || order.userId?.name || 'N/A'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7A7A5C' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px' }}>₦{order.total.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '100px',
                    background: statusColors[order.status]?.bg, color: statusColors[order.status]?.text
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/orders/${order._id}`} style={{ color: '#606C38', fontSize: '12px' }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <p style={{ textAlign: 'center', color: '#7A7A5C', padding: '40px' }}>No orders found.</p>
      )}
    </div>
  )
}