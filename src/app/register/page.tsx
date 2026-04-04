"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Something went wrong.");
      }

      // If successful, log them in automatically
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      }

      // Automatically redirecting to dashboard will occur, or explicit via router
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 lg:p-12 bg-surface text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed font-body">
      {/* Left Side: Branding / Background Visual (Hidden on mobile) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-secondary-fixed/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-primary/5 blur-[100px]"></div>
      </div>
      <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,52,52,0.06)]">
        {/* Form Section */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          {/* Brand Anchor */}
          <div className="mb-12 flex items-center gap-2">
            <Link href="/" className="text-3xl font-bold tracking-tighter text-primary font-headline">
              Kliq
            </Link>
          </div>
          {/* Sign Up Form */}
          <div className="space-y-8" id="signup-form">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
                Create an account
              </h1>
              <p className="text-on-surface-variant text-sm">Join the curated network of creative architects.</p>
            </div>
            {/* Social Login */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-surface-container rounded-xl text-on-surface font-semibold hover:bg-surface-variant transition-all duration-200 active:scale-95"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Google Logo"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUeRT6YkgBbWySnH5xwpZZOWfqSX9TgjnOBdW9BM8mcoradSwkLZSRCbGA3VV1rYHnxYVIHtt48qJCCNkznefW_sWOJ7xXC3MefOGKrPmstyojaHPJEvsQ75tGNnVW59vCsRHLgsPvMg5VWUn9ie_15pfOwCpVySC4ziThx9-1n_WykS7HtJtFJfKqgIaN3Xf-RKMKDLKAoQ5RSOkx03sJnXxBkYj4FmbxXrZV-u7ExywcbxTrDVOWFHDxylmZSlWZW2kDKxk-oyk"
              />
              <span>Continue with Google</span>
            </button>
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-outline-variant/30"></div>
              <span className="absolute bg-surface-container-lowest px-4 text-xs font-bold text-on-surface-variant tracking-widest uppercase">
                Or email
              </span>
            </div>
            
            {error && (
              <div className="p-3 bg-error-container text-on-error-container text-sm font-bold rounded-xl">
                {error}
              </div>
            )}

            {/* Input Fields */}
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant tracking-wide ml-1">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-high rounded-xl border-none focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-outline"
                    placeholder="Adewale Okafor"
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant tracking-wide ml-1">
                    Business Name <span className="font-normal opacity-50">(Optional)</span>
                  </label>
                  <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-high rounded-xl border-none focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-outline"
                    placeholder="Studio Kliq"
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant tracking-wide ml-1">Email Address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-surface-container-high rounded-xl border-none focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-outline"
                  placeholder="hello@kliq.design"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant tracking-wide ml-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-high rounded-xl border-none focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-outline"
                    placeholder="••••••••"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <button
                className="w-full py-4 bg-primary text-on-primary flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide shadow-lg shadow-primary/10 hover:translate-y-[-2px] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
            <p className="text-center text-sm font-medium text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline decoration-secondary-fixed decoration-2 underline-offset-4">
                Log in
              </Link>
            </p>
          </div>
        </div>
        {/* Visual Column (Editorial Feel) */}
        <div className="hidden lg:flex relative bg-primary items-end p-12 overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Creative architectural studio"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjRg-eWPTZn4L4P4RxV9aBPqkatedtEaMhr6cwpnK6iBJo8CBc17A8iLr6WFF2ajCN22Xp2Xzw86WwHh3x84OP7Uhai5UfQjYnmuTQAUYLwmdDVzQf6uyFt65IbgBxfbzyBLIY8C1kwiWWbGMN6oKI4e8ARmqEeL9IDY-mM6L9dUu76kpcG_4eQFklJJj_oRUIulUSSopvqzN97ePAFSlZpGc4tQqsmuT2Vs7Rk__6QeYaTTbOQolbeIxe69VbAHWSbWqDFGbO1EE"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
          </div>
          {/* Quote/Info Layer */}
          <div className="relative z-10 space-y-6">
            <div className="h-1 w-12 bg-secondary-fixed"></div>
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight font-headline">
              Empowering the next generation of Nigerian creators.
            </h2>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUMcUttFRzF1suZwy6n8xPjLdtqgOW3U5P0DtRqDdR1dfeBAnZd7Mb8TzvZWVlUvxuCgaSpjVzYR0uvmGKMZSAJhvMfuKOn591tLlo6X02ITY76emDA2SJx-_q58L6IaAHVU2VK6dWGveu9Zq29QzhVtjjdBZ8DDUx0B2lHMUhp5ndlhnlLqXtV1P8VE8ySDl-h-2p5QbvaWWAQJ8k0DrVEWk16MaLuTeVn4USiPBAnKkU6dfEMAMwFjizVwM4NL5fMvqfaBxBEpI"
                />
                <img
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV3e8vFuB04ym1SMHSBsOFq1UW5F8uUATG0FHyyUaLcDOvv-oIEOz6YgNeDbrEGiJ7EMU-VDSoFoJ43GYZx9JfKGftnmH4sYowwm5tefxZ4E_dCi8PlQuIMcbJqK5Ctrbx9_js8KYJi5naAJnO1AnRg5yMnL0fH4JzAO3ZuVgTIGP_LupADTJz6DMaGcVtXB9BANvT5pGJquX0LI4vHyrOimkuMOwa84BoBJ0Cs7NAg-J6yZt6gPefIvlGh5Vp7DmneU5bsPaoU8k"
                />
                <img
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYfrt2cjnTPyy7vxJKUqkB1Jri7o_Y536qfSdkWL2yYjgFL2LYv33mwdm3koq-ro8Y7Ew5icgXmDrI3e6cFEBfM5twTgcCJ9DStQMa11bAS70lJF71wcXFjF5KnXaLTbQu4jC1UHoy_3ThR0nX6nj1HMT6osTZ6yZjYLWecClm_WVZXgkSfcdrEYcAn5CzUXGuNZiucLlduR_K8snwPqjBtKL5aDe5wm7OT1_u-H7K3bBiFGN6aSTs2AjS7eM6ekrAy_zxZq1dgmo"
                />
              </div>
              <p className="text-white/80 text-sm font-medium">Join 2,000+ architects and designers</p>
            </div>
            {/* Editorial Detail */}
            <div className="pt-12 flex justify-between items-center text-white/40 text-[10px] tracking-[0.2em] uppercase font-bold">
              <span>Lagos, NG</span>
              <span>© 2026 Kliq Platform</span>
            </div>
          </div>
          {/* Floating Abstract Accent */}
          <div className="absolute top-12 right-12 w-24 h-24 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-1000">
            <span className="material-symbols-outlined text-secondary-fixed text-4xl">architecture</span>
          </div>
        </div>
      </div>
    </main>
  );
}
