import { Outlet, Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'

const BRANDS = [
  'Infiniti',
  'Kia',
  'Suzuki',
  'Mazda',
  'Honda',
  'Isuzu',
  'Mercedes',
  'Renault',
  'BMW',
  'Volkswagen',
  'Audi',
  'Chevrolet',
  'Land Rover',
  'Porsche',
  'Volvo',
  'Ford',
  'Chrysler',
  'Peugeot',
  'Jeep',
  'Dodge',
  'Ram',
];





export default function RootLayout() {
  return (
    <div
      className="min-h-screen text-slate-900 bg-slate-50 relative selection:bg-amber-500 selection:text-white"
      style={{
        backgroundImage: "url('/images/car_blueprint_pattern.jpg')",
        backgroundSize: '320px 320px',
        backgroundRepeat: 'repeat',
      }}
    >
      <Navbar />

      <main className="pt-[65px] w-full max-w-[1240px] mx-auto bg-white border-x border-slate-200 shadow-sm relative z-10 min-h-[90vh] flex flex-col justify-between font-sans">
        <div className="flex-grow flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* ── FOOTER (PartSouq Style Redesign) ────────────────────────────────────── */}
      <footer className="bg-[#002514] text-slate-300 font-sans border-t border-slate-800 relative z-10 select-none">
        
        {/* Logo Marquee */}
        <div className="bg-[#002514] border-b border-slate-800/80 py-4 overflow-hidden">
          <style>{`@keyframes marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}} .marquee__track{display:flex;width:max-content;animation:marquee 20s linear infinite;}`}</style>
          <div className="marquee__track">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <img
                key={i}
                src={`/images/brands/${b.toLowerCase().replace(/\s+/g, '-')}${['lexus','volkswagen'].includes(b.toLowerCase().replace(/\s+/g, '-')) ? '.png' : '.webp'}`}
                alt={b}
                className="h-10 object-contain mx-3"
              />
            ))}
          </div>
        </div>

        {/* Footer link columns */}
        <div className="w-full max-w-[1240px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('FAQ Section: Search for vehicle parts by inserting VIN. Sourcing options are provided instantly. For payment support, consult contact details.')
                  }}
                  className="hover:text-amber-500 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#articles"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Knowledgebase details catalog guidelines, parts maintenance, and cross-border customs declarations.')
                  }}
                  className="hover:text-amber-500 transition-colors"
                >
                  Articles
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              Information
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><a href="#policies" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Policies</a></li>
              <li><a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Terms & Conditions</a></li>
              <li><a href="#news" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">News</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              My Account
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link to="/orders" className="hover:text-amber-500 transition-colors">Orders</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Wishlist</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Garage</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500 transition-colors">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm border-b border-slate-800 pb-2 mb-4">
              Social Links
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Twitter</a></li>
              <li><a href="https://wa.me/25377577016" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors flex items-center gap-1.5">Whatsapp</a></li>
            </ul>
          </div>

        </div>

        {/* Footer bottom bar */}
        <div className="bg-[#002514] py-6 border-t border-slate-800/80">
          <div className="w-full max-w-[1240px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
            
            {/* Payment method icons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">PayPal</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">VISA</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">MasterCard</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">AMEX</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">Apple Pay</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">Bitcoin</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">FedEx</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">DHL</span>
              <span className="bg-[#002514] border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 font-bold">UPS</span>
            </div>

            {/* Copyright & registration details */}
            <div className="text-center md:text-right flex flex-col items-center md:items-end gap-1">
              <span>AFRICA AUTOPART WHOLESALERS L.L.C.</span>
              <span>© {new Date().getFullYear()} Africa Autopart. All rights reserved.</span>
            </div>

          </div>
        </div>

      </footer>
    </div>
  )
}
