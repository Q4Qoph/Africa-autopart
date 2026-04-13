import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supplierApi } from '@/api/supplierApi'
import type { Supplier, PartResponse } from '@/types/supplier'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function SuppliersPage() {
  const { auth } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchResults, setSearchResults] = useState<PartResponse[] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supplierApi
      .getAll()
      .then(({ data }) => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(value: string) {
    setSearchTerm(value)
    if (debounce.current) clearTimeout(debounce.current)
    if (!value.trim()) {
      setSearchResults(null)
      return
    }
    if (!auth) return
    debounce.current = setTimeout(() => {
      setSearching(true)
      supplierApi
        .search(value.trim(), auth.token)
        .then(({ data }) => setSearchResults(data))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false))
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#07110A] text-[#E8F0E9]">
      <Navbar />
      <main className="pt-[68px] md:pt-[104px]">
        <div className="max-w-[1260px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
              <span className="block w-6 h-px bg-[#00C853]" />
              Marketplace
            </p>
            <h1 className="text-3xl font-extrabold text-white font-display mb-6">
              Suppliers &amp; Parts
            </h1>
            <div className="max-w-lg">
              {auth ? (
                <Input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search parts by name, number, or condition…"
                  className="bg-[#162019] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[#3D5942] focus:border-[#00C853] h-11"
                />
              ) : (
                <p className="text-[#7A9A80] text-sm">
                  <Link to="/login" className="text-[#00C853] hover:text-[#39FF88] font-medium">Log in</Link>
                  {' '}to search parts across all suppliers.
                </p>
              )}
            </div>
          </div>

          {/* Search results */}
          {searchTerm && (
            <div className="mb-10">
              <p className="text-xs font-mono uppercase tracking-widest text-[#7A9A80] mb-3">
                {searching ? 'Searching…' : `${searchResults?.length ?? 0} results`}
              </p>
              {searchResults && searchResults.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((part) => (
                    <PartCard key={part.id} part={part} />
                  ))}
                </div>
              )}
              {searchResults?.length === 0 && !searching && (
                <p className="text-[#7A9A80] text-sm">No parts found for "{searchTerm}".</p>
              )}
            </div>
          )}

          {/* Suppliers grid */}
          {!searchTerm && (
            <>
              {loading && <p className="text-[#7A9A80] text-sm">Loading suppliers…</p>}
              {!loading && suppliers.length === 0 && (
                <p className="text-[#7A9A80] text-sm">No suppliers registered yet.</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((s) => (
                  <SupplierCard key={s.id} supplier={s} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-[#111C14] border border-[rgba(0,200,83,0.12)] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
      >
        <div>
          <p className="text-white font-semibold">{supplier.businessName}</p>
          <p className="text-[#7A9A80] text-xs mt-0.5">{supplier.category}</p>
          <p className="text-[#3D5942] text-xs mt-1">{supplier.parts.length} parts in stock</p>
        </div>
        <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] shrink-0 mt-1">
          {supplier.parts.length}
        </Badge>
      </button>

      {open && supplier.parts.length > 0 && (
        <div className="border-t border-[rgba(0,200,83,0.1)] px-6 py-4 grid gap-3">
          {supplier.parts.map((p) => (
            <PartCard key={p.id} part={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function PartCard({ part }: { part: { partName: string; partNumber: string; condition: string; price: number; stock: number; imageURL?: string } }) {
  return (
    <div className="bg-[#162019] rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white text-sm font-medium">{part.partName}</p>
          <p className="text-[#3D5942] text-xs font-mono">{part.partNumber}</p>
        </div>
        <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.15)] text-[10px] shrink-0">
          {part.condition}
        </Badge>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[#00C853] font-semibold text-sm">
          ${part.price.toLocaleString()}
        </span>
        <span className="text-[#7A9A80] text-xs">{part.stock} in stock</span>
      </div>
    </div>
  )
}
