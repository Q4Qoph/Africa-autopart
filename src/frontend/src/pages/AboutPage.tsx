import { Link } from 'react-router-dom'
import { Zap, ShieldCheck, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/layout/Navbar'

export default function AboutPage() {
  const { t } = useTranslation('pages')

  const values = [
    {
      icon: Zap,
      title: t('about_value_speed_title'),
      body: t('about_value_speed_body'),
    },
    {
      icon: ShieldCheck,
      title: t('about_value_trust_title'),
      body: t('about_value_trust_body'),
    },
    {
      icon: Globe,
      title: t('about_value_coverage_title'),
      body: t('about_value_coverage_body'),
    },
  ]

  return (
    <div className="min-h-screen bg-[#F7FDF8] dark:bg-[#07110A] text-[#07110A] dark:text-[#E8F0E9]">
      <Navbar />

      <main className="pt-[68px] md:pt-[132px]">

        {/* Hero */}
        <section className="bg-[#07110A] py-16 px-6">
          <div className="max-w-[1260px] mx-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00C853] mb-3">
              {t('about_eyebrow')}
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
              {t('about_heading')}
            </h1>
            <p className="mt-4 text-[rgba(255,255,255,0.55)] text-sm max-w-xl leading-relaxed">
              {t('about_subtext')}
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="max-w-[1260px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00C853] mb-3">
                {t('about_story_eyebrow')}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-5 leading-snug">
                {t('about_story_heading')}
              </h2>
              <div className="space-y-4 text-sm text-[#4A6B50] dark:text-[#7A9A80] leading-relaxed">
                <p>{t('about_story_p1')}</p>
                <p>{t('about_story_p2')}</p>
                <p>{t('about_story_p3')}</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[rgba(0,200,83,0.12)]">
              <img
                src="/images/about-1903x1903.jpg"
                alt="Auto parts in Africa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[rgba(0,200,83,0.03)] dark:bg-[rgba(0,200,83,0.03)] border-y border-[rgba(0,200,83,0.1)] py-16 px-6">
          <div className="max-w-[1260px] mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00C853] mb-3">
                {t('about_values_eyebrow')}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold">{t('about_values_heading')}</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl bg-white dark:bg-[#111C14] border border-[rgba(0,200,83,0.1)] hover:border-[rgba(0,200,83,0.25)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(0,200,83,0.1)] dark:bg-[rgba(0,200,83,0.08)] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#00C853]" />
                  </div>
                  <h3 className="font-display font-bold text-base mb-2">{title}</h3>
                  <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1260px] mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
            {t('about_cta_heading')}
          </h2>
          <p className="text-sm text-[#4A6B50] dark:text-[#7A9A80] mb-8 max-w-md mx-auto">
            {t('about_cta_subtext')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/requests/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00C853] text-[#07110A] font-semibold px-6 py-2.5 text-sm hover:bg-[#39FF88] transition-colors"
            >
              {t('about_cta_request')}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.12)] text-[rgba(0,0,0,0.65)] dark:text-[rgba(255,255,255,0.7)] font-semibold px-6 py-2.5 text-sm hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
            >
              {t('about_cta_contact')}
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
