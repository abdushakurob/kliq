"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
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
        
        {/* Visual Column / Brand Hero */}
        <div className="hidden lg:flex relative bg-primary items-center justify-center p-12 overflow-hidden group">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Creative architectural studio"
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjRg-eWPTZn4L4P4RxV9aBPqkatedtEaMhr6cwpnK6iBJo8CBc17A8iLr6WFF2ajCN22Xp2Xzw86WwHh3x84OP7Uhai5UfQjYnmuTQAUYLwmdDVzQf6uyFt65IbgBxfbzyBLIY8C1kwiWWbGMN6oKI4e8ARmqEeL9IDY-mM6L9dUu76kpcG_4eQFklJJj_oRUIulUSSopvqzN97ePAFSlZpGc4tQqsmuT2Vs7Rk__6QeYaTTbOQolbeIxe69VbAHWSbWqDFGbO1EE"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent"></div>
          </div>
          <div className="relative z-10 text-center space-y-6">
            <span className="material-symbols-outlined text-secondary-fixed text-6xl group-hover:scale-110 transition-transform duration-700">architecture</span>
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight font-headline">
              Welcome Back.
            </h2>
            <p className="text-white/80 font-medium"> Continue shaping the creative ecosystem.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-12 flex items-center lg:hidden gap-2">
            <Link href="/" className="text-3xl font-bold tracking-tighter text-primary font-headline">
              Kliq
            </Link>
          </div>
          <div className="space-y-8" id="login-form">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Sign in</h1>
              <p className="text-on-surface-variant text-sm">Access your studio and manage your workflow.</p>
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
            <form className="space-y-5" onSubmit={handleLogin}>
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
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-on-surface-variant tracking-wide">Password</label>
                  <Link href="#" className="text-xs font-bold text-primary hover:underline decoration-secondary-fixed">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-high rounded-xl border-none focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-outline"
                    placeholder="••••••••"
                    type="password"
                    required
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
            <p className="text-center text-sm font-medium text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline decoration-secondary-fixed decoration-2 underline-offset-4">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
