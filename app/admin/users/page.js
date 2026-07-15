'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Loader from '@/components/Loader'
import AdminEmptyState from '@/components/AdminEmptyState'
import Pagination from '@/components/Pagination'

const ROLE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Customers', value: 'customer' },
  { label: 'Admins', value: 'admin' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimerRef = useRef(null)

  useEffect(() => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(searchTimerRef.current)
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const params = new URLSearchParams({ page })
      if (roleFilter) params.set('role', roleFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (!res.ok) {
        setFetchError(true)
      } else {
        setUsers(data.users || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      setFetchError(true)
    }
    setLoading(false)
  }, [page, roleFilter, debouncedSearch])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleRoleChange = (r) => {
    setRoleFilter(r)
    setPage(1)
  }

  return (
    <div className="px-8 md:px-12 py-10 md:py-14">

      <p className="text-olive text-[13px] font-bold uppercase tracking-[0.15em] mb-3">CRM</p>
      <h1 className="font-display font-bold text-forest text-[40px] md:text-[48px] leading-none mb-10" style={{ letterSpacing: '-0.02em' }}>
        Users
      </h1>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[400px] rounded-[12px] border-[2px] border-forest/15 bg-cream px-5 py-3 text-[14px] text-forest placeholder:text-forest/35 outline-none focus:border-olive transition-colors"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {ROLE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleRoleChange(f.value)}
            className={`rounded-full px-5 py-2 text-[13px] font-bold uppercase tracking-wide transition-colors ${
              roleFilter === f.value
                ? 'bg-forest text-cream'
                : 'bg-surface border-[1.5px] border-border text-forest hover:border-olive'
            }`}
          >
            {f.label}
          </button>
        ))}
        {total > 0 && (
          <span className="ml-auto text-[13px] text-forest/45 self-center">
            {total} user{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="lg" />
        </div>
      ) : fetchError ? (
        <div className="text-center py-20">
          <p className="text-forest/60 text-[15px] mb-4">Failed to load users.</p>
          <button
            onClick={fetchUsers}
            className="rounded-full bg-olive text-cream text-[13px] font-bold uppercase tracking-[0.1em] px-7 py-3 hover:bg-forest transition-colors"
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <AdminEmptyState message="No users found." />
      ) : (
        <>
          {/* TABLE */}
          <div className="rounded-[20px] border-[1.5px] border-border bg-surface overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b-[1.5px] border-border">
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Name</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Email</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Role</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Joined</th>
                    <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Orders</th>
                    <th className="text-right px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Total Spent</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-forest/45">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr
                      key={user._id}
                      className={`border-b-[1.5px] border-border last:border-0 hover:bg-cream/60 transition-colors ${i % 2 === 0 ? '' : 'bg-cream/20'}`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="font-medium text-forest hover:text-olive transition-colors"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-forest/60">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
                          style={user.role === 'admin'
                            ? { background: '#E3EAF2', color: '#3A5A8A' }
                            : { background: '#E3F2E8', color: '#4A7C59' }
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-forest/60">
                        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-forest">{user.orderCount}</td>
                      <td className="px-6 py-4 text-right font-medium text-forest">
                        {user.totalSpent > 0 ? `₦${user.totalSpent.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.isEmailVerified ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-olive" title="Verified" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-border" title="Not verified" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
