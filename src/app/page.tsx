import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="bg-surface text-on-surface min-h-screen font-body">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-teal-950 dark:text-white font-headline">
              Kliq
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="#about" className="text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors font-medium">
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2 text-primary font-semibold hover:text-teal-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2.5 bg-primary text-white rounded-full font-bold shadow-[0_4px_20px_rgba(0,52,52,0.15)] active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs uppercase tracking-wider mb-6">
              For Nigerian Creatives
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight leading-[1.1] mb-6 font-headline">
              Send it. <br />
              Track it. <br />
              <span className="text-secondary">Get paid.</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg">
              Stop chasing clients. Describe your gig, generate pro-grade invoices with your voice, and get paid instantly. Professionalism that works at the speed of your creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 group transition-all">
                Start Invoicing Free
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="flex -space-x-3">
                  {/* eslint-disable @next/next/no-img-element */}
                  <img
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1BGgRA8953qSRfSe2GUPOKaGvJEJKVUTfYYq_vSwxekkfCtosHreVzl_Sr4iPDyTYCcgSlmwcIUcboDgStIe_DNZ45E1NPF4hx2MGuPmZ96mgiouO_k0jDYMu8jFPNjBk5tG28o2o7FfdLZiNqwO_CXszMW8ePeagbxfpPW_rNOsm4gOLUlbwkokdyldMuDMbsTaQz1337XdgAkmQELHFCQcFdJC_YsdmJHKQOQxei1ata4Wb4KoNlOEvJSJ8FRD1KL19h_ja4ss"
                  />
                  <img
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5B5YsuP5my6Y4-StcVRooTuGoUz3cHzTGJ01Y_hY-IkjKQsMcsoxKa-dFfJxATVUOtBOaKolPl7IJal1zOX8OL5a3bPwQa9WUd_3DujFGFkZHJadjDel7xG9JUr1y2DHiFVgsW0VvWQZ5ZYDwQhdy5GL6cnpoh-1KxyXr3LwGi1Pg1a_xC4RXu_sqEMDcZefP8fLCqGRUlcYW7KG-4Rg-ZKYdLEXr69th0rpHXgRtcZ1hE13_NAnyaEg6ng5Nxfx4HNp8Ak6HSIE"
                  />
                  <img
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgEYRfNAm_MM4HJ1AIBop9H62ayw2OvU65ewP52ish9lDvbKdnqkG8ABZNPmF2brE0rCh1GPolTvGvTxNCd0R24Qr8rpB4Al8is7zqtL_SIEb3XRg5NL8169E6DiSTHfRsBpYtGiTmmqi47HASHyrErvXkA3YzJUJkxxZNrQvBibCaqqE_r46c8Anb92fL8DU7F1lLMdgGLoQNoW3dIHhdodyhWSH5xVhN1pLOQFoogQ1cI6H3T3X7y7pMh7EW34XxcunEmoUhvjo"
                  />
                </div>
                <span className="text-sm font-medium text-on-surface-variant">
                  Joined by 2,000+ Nigerian artists
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview / Invoice Card */}
          <div className="relative">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-fixed opacity-10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary-container opacity-10 blur-3xl rounded-full"></div>
            <div className="relative bg-surface-container-lowest rounded-3xl shadow-[0_32px_80px_rgba(0,52,52,0.08)] border border-outline-variant/15 p-8">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-lg">K</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface font-headline">Invoice #8829</h3>
                    <p className="text-xs text-on-surface-variant">Sent to Adobe Lagos</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full">
                  PENDING
                </span>
              </div>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-end pb-4 border-b border-surface-container-high">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Service</p>
                    <p className="font-bold text-primary">Brand Identity Design</p>
                  </div>
                  <p className="font-bold text-on-surface font-headline">₦450,000</p>
                </div>
                <div className="flex justify-between items-end pb-4 border-b border-surface-container-high">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Extras</p>
                    <p className="font-bold text-primary">Revision Cycle #2</p>
                  </div>
                  <p className="font-bold text-on-surface font-headline">₦75,000</p>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-6 mb-8 flex justify-between items-center">
                <p className="text-sm font-semibold text-on-surface-variant">Total Amount Due</p>
                <p className="text-2xl font-black text-primary font-headline">₦525,000</p>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-black text-sm uppercase tracking-widest">
                  SEND REMINDER
                </button>
                <button className="w-14 h-14 border border-outline-variant/30 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
            
            {/* Floating Context Card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-outline-variant/10 flex items-center gap-4 max-w-xs animate-bounce">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Payment Confirmed</p>
                <p className="text-[10px] text-on-surface-variant">₦525,000 from Adobe Lagos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section: Bento Grid */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-primary mb-4 font-headline">Everything you need to scale.</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Built for the specific needs of Nigerian freelancers who value speed, beauty, and reliability.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Voice Generation */}
            <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-[2rem] border border-outline-variant/10 group hover:border-primary/20 transition-all">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <span className="material-symbols-outlined text-3xl">mic</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4 font-headline">Voice-to-Invoice Generation</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    Walking out of a client meeting? Just speak into the app: &quot;Invoice Kola for 3 hours of photography at 50k an hour.&quot; Kliq generates the line items instantly.
                  </p>
                </div>
                <div className="flex-1 w-full relative">
                  <div className="h-40 bg-surface-container rounded-2xl flex items-center justify-center gap-1">
                    <div className="w-1 h-8 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-1 h-16 bg-primary rounded-full"></div>
                    <div className="w-1 h-12 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-1 h-20 bg-secondary rounded-full"></div>
                    <div className="w-1 h-14 bg-primary rounded-full"></div>
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Reminders */}
            <div className="bg-primary text-white p-10 rounded-[2rem] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-secondary-fixed mb-6">
                  <span className="material-symbols-outlined text-3xl">notifications_active</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Smart Reminders</h3>
                <p className="text-primary-fixed leading-relaxed">
                  Gentle, automated nudges that don&apos;t make it awkward. We handle the &quot;please pay me&quot; so you can keep the relationship.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm font-medium text-secondary-fixed">84% faster payment collection</p>
              </div>
            </div>

            {/* Instant Confirmation */}
            <div className="bg-surface-container-lowest p-10 rounded-[2rem] border border-outline-variant/10 flex flex-col items-start">
              <div className="w-14 h-14 bg-secondary-container/30 rounded-2xl flex items-center justify-center text-on-secondary-container mb-6">
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4 font-headline">Instant Confirmation</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Automatic bank-level confirmation the moment funds hit. Your dashboard updates before your banking app notifications do.
              </p>
            </div>

            {/* Smart Pricing Assistant (Pricing Coach feature) */}
            <div className="md:col-span-2 bg-secondary-fixed text-on-secondary-fixed p-10 rounded-[2rem] overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 font-headline">Unsure of your worth?</h3>
                <p className="text-on-secondary-fixed-variant max-w-md text-lg leading-relaxed">
                  Kliq acts as your personal pricing coach, analyzing your unique skills and specific project details from your AI chats to help you confidently determine your true market value only when you need it.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-80 h-full p-6 flex flex-col justify-end">
                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-secondary text-sm">insights</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">AI Market Insight</span>
                  </div>
                  <p className="text-xs font-bold text-on-surface mb-1 font-headline">Recommended: ₦65,000/hr</p>
                  <p className="text-[9px] text-on-surface-variant">
                    This is 15% above average for Branding in Ikeja. Your portfolio supports this premium.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Pricing / Value Prop CTA */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-extrabold text-primary mb-8 tracking-tight font-headline">
            Your work is premium. <br />Your tools should be too.
          </h2>
          <p className="text-xl text-on-surface-variant mb-12">
            No subscription fees for your first 5 invoices. Then, just ₦5,000/month for unlimited everything. Nigerian pricing for the Nigerian hustle.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/register" className="px-10 py-5 bg-primary text-white rounded-full font-bold text-xl shadow-xl hover:-translate-y-1 transition-all">
              Create Your First Invoice
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 border-t border-zinc-200/10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-lg font-bold text-teal-950 dark:text-white font-headline">Kliq</span>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs text-center md:text-left">
              © 2026 Kliq. Built for the Nigerian Creative Economy.
            </p>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-teal-500 transition-opacity underline decoration-lime-400 underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-teal-500 transition-opacity">
              Terms of Service
            </Link>
            <Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-teal-500 transition-opacity">
              Contact
            </Link>
          </div>
          <div className="flex gap-4">
            {/* Twitter / Social Icons */}
            <Link href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-secondary-fixed transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
              </svg>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-secondary-fixed transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.977 6.981 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.351-.2 6.78-2.618 6.981-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.351-2.618-6.78-6.98-6.981C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
