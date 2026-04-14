import { useState } from 'react'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { contactApi } from '@/api/contactApi'

const inputCls =
  'w-full rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#111C14] text-[#07110A] dark:text-[#E8F0E9] placeholder:text-[rgba(0,0,0,0.35)] dark:placeholder:text-[rgba(255,255,255,0.3)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853]/40 transition-all'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email and message.')
      return
    }
    setLoading(true)
    try {
      await contactApi.submit(form)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />

      <main className="pt-[68px] md:pt-[132px]">
        {/* Hero */}
        <section className="bg-[#07110A] py-14 px-6">
          <div className="max-w-[1260px] mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00C853] mb-3">
              Get in Touch
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
              Contact Us
            </h1>
            <p className="mt-3 text-[rgba(255,255,255,0.55)] text-sm max-w-lg">
              Have a question or need help sourcing a part? Our team is ready to assist you.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-[1260px] mx-auto px-6 py-14">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Left — contact info */}
            <div>
              <h2 className="font-display text-xl font-bold mb-6">Reach Us Directly</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] dark:bg-[rgba(0,200,83,0.08)] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#00C853]" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">Phone</p>
                    <a
                      href="tel:+254700225100"
                      className="text-sm text-[#07110A] dark:text-[#E8F0E9] hover:text-[#00C853] transition-colors"
                    >
                      +254 700 225 100
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] dark:bg-[rgba(0,200,83,0.08)] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#00C853]" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">Email</p>
                    <a
                      href="mailto:info@africaautopart.com"
                      className="text-sm text-[#07110A] dark:text-[#E8F0E9] hover:text-[#00C853] transition-colors"
                    >
                      info@africaautopart.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(0,200,83,0.1)] dark:bg-[rgba(0,200,83,0.08)] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#00C853]" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-[#4A6B50] dark:text-[#7A9A80] mb-0.5">Location</p>
                    <p className="text-sm text-[#07110A] dark:text-[#E8F0E9]">
                      Nairobi, Kenya<br />
                      Serving all of Africa
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-5 rounded-xl bg-[rgba(0,200,83,0.06)] dark:bg-[rgba(0,200,83,0.05)] border border-[rgba(0,200,83,0.15)]">
                <p className="text-xs font-mono uppercase tracking-widest text-[#00C853] mb-2">Business Hours</p>
                <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">Monday – Friday: 8:00 AM – 6:00 PM EAT</p>
                <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80]">Saturday: 9:00 AM – 2:00 PM EAT</p>
              </div>
            </div>

            {/* Right — form */}
            <div>
              <h2 className="font-display text-xl font-bold mb-6">Send a Message</h2>

              {success && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-[rgba(0,200,83,0.1)] border border-[rgba(0,200,83,0.25)] text-[#00933C] dark:text-[#00C853]">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-medium">Message sent! We'll get back to you shortly.</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#4A6B50] dark:text-[#7A9A80] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Kamau"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A6B50] dark:text-[#7A9A80] mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A6B50] dark:text-[#7A9A80] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+254 7xx xxx xxx"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A6B50] dark:text-[#7A9A80] mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us how we can help you…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-2.5 text-sm hover:bg-[#39FF88] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-[#07110A]/30 border-t-[#07110A] rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
