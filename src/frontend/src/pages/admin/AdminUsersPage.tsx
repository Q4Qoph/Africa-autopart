import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/api/userApi'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const roleLabel: Record<number, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Customer]: 'Customer',
  [UserRole.Supplier]: 'Supplier',
}

const roleBadgeClass: Record<number, string> = {
  [UserRole.Admin]: 'bg-purple-900/40 text-purple-300 border-purple-700/30',
  [UserRole.Customer]: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
  [UserRole.Supplier]: 'bg-amber-900/40 text-amber-300 border-amber-700/30',
}

export default function AdminUsersPage() {
  const { auth } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!auth) return
    userApi
      .getAllUsers(auth.token)
      .then(({ data }) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auth])

  async function handleApprove(id: number) {
    if (!auth) return
    try {
      await userApi.approveUser(id, auth.token)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isApproved: true } : u)))
    } catch {
      alert('Failed to approve user.')
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    if (!auth) return
    try {
      await userApi.deleteUser(id, auth.token)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      alert('Failed to delete user.')
    }
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          Admin
        </p>
        <h1 className="text-2xl font-extrabold text-white">Users</h1>
        <p className="text-[#7A9A80] text-sm mt-1">{users.length} registered accounts</p>
      </div>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 w-full max-w-sm bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-lg px-4 py-2 text-sm text-white placeholder-[#7A9A80] focus:outline-none focus:border-[#00C853]"
      />

      {loading ? (
        <p className="text-[#7A9A80] text-sm">Loading users…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[rgba(0,200,83,0.15)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,200,83,0.12)] bg-[#0D1810]">
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Approved</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <Td className="text-[#7A9A80] font-mono">#{u.id}</Td>
                  <Td className="font-medium text-white">
                    {u.firstName} {u.lastName}
                  </Td>
                  <Td className="text-[#7A9A80]">{u.email}</Td>
                  <Td className="text-[#7A9A80]">{u.phone}</Td>
                  <Td>
                    <Badge className={`text-[10px] border ${roleBadgeClass[u.role] ?? ''}`}>
                      {roleLabel[u.role] ?? u.role}
                    </Badge>
                  </Td>
                  <Td>
                    {u.role === UserRole.Supplier ? (
                      u.isApproved ? (
                        <Badge className="bg-[rgba(0,200,83,0.1)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-red-900/30 text-red-400 border-red-700/30 text-[10px]">
                          Pending
                        </Badge>
                      )
                    ) : (
                      <span className="text-[#7A9A80] text-xs">—</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {u.role === UserRole.Supplier && !u.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(u.id)}
                          className="bg-[#00C853] text-[#07110A] hover:bg-[#39FF88] h-7 text-xs px-3"
                        >
                          Approve
                        </Button>
                      )}
                      {u.role !== UserRole.Admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                          className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7A9A80] text-sm">
                    No users found.
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
