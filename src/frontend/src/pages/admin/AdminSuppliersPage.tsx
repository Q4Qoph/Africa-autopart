import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { supplierApi } from '@/api/supplierApi'
import type { Supplier } from '@/types/supplier'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

export default function AdminSuppliersPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('admin')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supplierApi
      .getAll()
      .then(({ data }) => setSuppliers(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(t('suppliers_delete_confirm', { name }))) return
    if (!auth) return
    try {
      await supplierApi.delete(id, auth.token)
      setSuppliers((prev) => prev.filter((s) => s.id !== id))
    } catch {
      alert(t('suppliers_delete_error'))
    }
  }

  const filtered = suppliers.filter(
    (s) =>
      !search ||
      `${s.businessName} ${s.category} ${s.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-6">
        <p className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00C853] mb-2">
          <span className="block w-6 h-px bg-[#00C853]" />
          {t('admin_label')}
        </p>
        <h1 className="text-2xl font-extrabold text-[#07110A] dark:text-white">{t('suppliers_heading')}</h1>
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm mt-1">{t('suppliers_count', { count: suppliers.length })}</p>
      </div>

      <input
        type="text"
        placeholder={t('suppliers_search_placeholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 w-full max-w-sm bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.2)] rounded-lg px-4 py-2 text-sm text-[#07110A] dark:text-white placeholder-[#7A9A80] focus:outline-none focus:border-[#00C853]"
      />

      {loading ? (
        <p className="text-[#4A6B50] dark:text-[#7A9A80] text-sm">{t('loading')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <Table>
            <TableHeader className="bg-[#E8F2EA] dark:bg-[#0D1810] border-b border-[rgba(0,200,83,0.12)]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_id')}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_name')}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_category')}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_email')}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_phone')}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_parts')}</TableHead>
                <TableHead className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80]">{t('suppliers_col_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <React.Fragment key={s.id}>
                  <TableRow
                    className="border-b border-border/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80] font-mono">#{s.id}</TableCell>
                    <TableCell className="px-4 py-3 font-medium text-[#07110A] dark:text-white">{s.businessName}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className="bg-[rgba(0,200,83,0.08)] text-[#00C853] border-[rgba(0,200,83,0.2)] text-[10px]">
                        {s.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80]">{s.email}</TableCell>
                    <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80]">{s.phone}</TableCell>
                    <TableCell className="px-4 py-3 text-[#4A6B50] dark:text-[#7A9A80]">{s.parts.length}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {s.parts.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setExpandedId(expandedId === s.id ? null : s.id)
                            }
                            className="border-[rgba(0,200,83,0.3)] text-[#00C853] bg-transparent hover:bg-[rgba(0,200,83,0.08)] h-7 text-xs px-3"
                          >
                            {expandedId === s.id ? t('suppliers_hide_parts') : t('suppliers_view_parts')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(s.id, s.businessName)}
                          className="border-red-400/30 text-red-400 bg-transparent hover:bg-red-400/10 h-7 text-xs px-3"
                        >
                          {t('suppliers_delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === s.id && (
                    <TableRow className="bg-[#E8F2EA] dark:bg-[#0D1810] hover:bg-transparent">
                      <TableCell colSpan={7} className="px-6 py-4">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-3">
                          {t('suppliers_parts_section', { count: s.parts.length })}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {s.parts.map((p) => (
                            <div
                              key={p.id}
                              className="bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.1)] rounded-lg px-3 py-2"
                            >
                              <p className="text-[#07110A] dark:text-white text-xs font-semibold">{p.partName}</p>
                              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px] mt-0.5">
                                #{p.partNumber} · {p.condition} · KES {p.price.toLocaleString()}
                              </p>
                              <p className="text-[#4A6B50] dark:text-[#7A9A80] text-[10px]">{t('suppliers_stock', { count: p.stock })}</p>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[#4A6B50] dark:text-[#7A9A80] text-sm">
                    {t('suppliers_no_suppliers')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
