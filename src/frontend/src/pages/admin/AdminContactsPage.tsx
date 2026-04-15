import { useEffect, useState } from 'react'
import { MessageSquare, Phone, Mail, User, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { contactApi, type ContactDTO } from '@/api/contactApi'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy ${value}`}
      className="p-1 rounded hover:bg-[rgba(0,200,83,0.1)] text-[#4A6B50] dark:text-[#7A9A80] hover:text-[#00C853] transition-colors"
    >
      {copied
        ? <Check className="w-3 h-3 text-[#00C853]" />
        : <Copy className="w-3 h-3" />}
    </button>
  )
}

export default function AdminContactsPage() {
  const { auth } = useAuth()
  const { t } = useTranslation('admin')
  const [messages, setMessages] = useState<ContactDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth?.token) return
    contactApi.getAll(auth.token)
      .then((res) => setMessages([...res.data].reverse()))
      .catch(() => setError(t('contacts_load_error')))
      .finally(() => setLoading(false))
  }, [auth?.token])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00C853]">{t('contacts_admin_label')}</p>
          <h1 className="font-display text-xl font-bold text-[#07110A] dark:text-white mt-0.5">
            {t('contacts_heading')}
          </h1>
        </div>
        {!loading && !error && (
          <span className="ml-auto text-xs font-mono bg-[rgba(0,200,83,0.1)] text-[#00C853] border border-[rgba(0,200,83,0.2)] px-2.5 py-1 rounded-full">
            {t('contacts_count', { count: messages.length })}
          </span>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="w-6 h-6 border-2 border-[#00C853]/30 border-t-[#00C853] rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-10 h-10 text-[rgba(0,0,0,0.15)] dark:text-[rgba(255,255,255,0.1)] mb-3" />
          <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">{t('contacts_no_messages')}</p>
        </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id ?? msg.email}
              className="p-5 rounded-xl bg-white dark:bg-[#111C14] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.06)]"
            >
              {/* Sender info row */}
              <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-1.5 text-xs text-[#07110A] dark:text-[#E8F0E9] font-medium">
                  <User className="w-3.5 h-3.5 text-[#00C853]" />
                  {msg.name}
                </div>

                <div className="flex items-center gap-1 text-xs text-[#4A6B50] dark:text-[#7A9A80]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{msg.email}</span>
                  <CopyButton value={msg.email} />
                </div>

                {msg.phone && (
                  <div className="flex items-center gap-1 text-xs text-[#4A6B50] dark:text-[#7A9A80]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{msg.phone}</span>
                    <CopyButton value={msg.phone} />
                  </div>
                )}

                <span className="ml-auto text-[10px] font-mono text-[#4A6B50] dark:text-[#7A9A80]">
                  #{msg.id}
                </span>
              </div>

              {/* Message body */}
              <p className="text-sm text-[#07110A] dark:text-[#E8F0E9] whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
