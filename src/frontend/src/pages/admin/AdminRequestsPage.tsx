import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { requestApi } from '@/api/requestApi'
import type { PartRequest } from '@/types/request'
import { Urgency } from '@/types/request'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const urgencyLabel: Record<number, string> = {
  [Urgency.Standard]: 'Standard',
  [Urgency.Express]: 'Express',
  [Urgency.Urgent]: 'Urgent',
}

const urgencyClass: Record<number, string> = {
  [Urgency.Standard]: 'bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)]',
  [Urgency.Express]: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  [Urgency.Urgent]: 'bg-red-900/30 text-red-400 border-red-700/30',
}

export default function AdminRequestsPage() {
  const { auth } = useAuth()
  const [requests, setRequests] = useState<PartRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'sorted'>('all')

  useEffect(() => {
    if (!auth) return
    requestApi
      .getAll(auth.token)
      .then(({ data }) => setRequests(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  async function handleMarkSorted(id: number) {
    if (!auth) return
    try {
      await requestApi.markAsSorted(id, auth.token)
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, isSorted: true } : r)))
    } catch {
      alert('Failed to mark request as sorted.')
    }
  }

  async function handleDelete(id: number, partName: string) {
    if (!window.confirm(`Delete request for "${partName}"? This cannot be undone.`)) return
    if (!auth) return
    try {
      await requestApi.delete(id, auth.token)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch {
      alert('Failed to delete request.')
    }
  }

  const filtered = requests.filter((r) => {
    if (filter === 'open') return !r.isSorted
    if (filter === 'sorted') return r.isSorted
    return true
  })

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          Admin
        </p>
        <h1 className="text-2xl font-extrabold text-white">Part Requests</h1>
        <p className="text-[#7A9A80] text-sm mt-1">{requests.length} total requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        {(['all', 'open', 'sorted'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-[rgba(0,200,83,0.12)] text-[#00C853] border border-[rgba(0,200,83,0.3)]'
                : 'text-[#7A9A80] border border-transparent hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#7A9A80] text-sm">Loading requests…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#0D1810]">
                <Th>ID</Th>
                <Th>Part</Th>
                <Th>Vehicle</Th>
                <Th>Urgency</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <Td className="text-[#7A9A80] font-mono">#{r.id}</Td>
                  <Td className="text-white font-medium">{r.partName}</Td>
                  <Td className="text-[#7A9A80]">
                    {r.vehicleMake} {r.model} {r.year}
                  </Td>
                  <Td>
                    <Badge className={`text-[10px] border ${urgencyClass[r.urgency] ?? ''}`}>
                      {urgencyLabel[r.urgency] ?? r.urgency}
                    </Badge>
                  </Td>
                  <Td>
                    {r.isSorted ? (
                      <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                        Sorted
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-900/30 text-amber-300 border-amber-700/30 text-[10px]">
                        Open
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-[#7A9A80] text-xs">
                    {new Date(r.dateCreated).toLocaleDateString()}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {!r.isSorted && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkSorted(r.id)}
                          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3"
                        >
                          Mark Sorted
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(r.id, r.partName)}
                        className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                      >
                        Delete
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7A9A80] text-sm">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#7A9A80]">
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ''}`}>{children}</td>
}
