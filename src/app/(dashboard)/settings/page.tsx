"use client";

import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    telegramHandle: "",
    whatsappId: "",
    telegramVerificationCode: "",
    telegramConnected: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setFormData({
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              telegramHandle: data.user.telegramHandle || "",
              whatsappId: data.user.whatsappId || "",
              telegramVerificationCode: data.user.telegramVerificationCode || "",
              telegramConnected: !!data.user.telegramConnected
            });
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            telegramHandle: data.user.telegramHandle || "",
            whatsappId: data.user.whatsappId || "",
            telegramVerificationCode: data.user.telegramVerificationCode || "",
            telegramConnected: !!data.user.telegramConnected
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
          Settings
        </h1>
        <p className="text-on-surface-variant font-medium mt-1">
          Manage your account preferences and integrations.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Col: Settings Forms */}
        <section className="lg:col-span-2 space-y-8">
          
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
            <h2 className="text-xl font-bold font-headline mb-6 border-b border-surface-container-low pb-4">Personal Information</h2>
            
            {loading ? (
              <div className="py-10 text-on-surface-variant font-medium text-center">Loading settings...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    Studio / Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-medium text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="E.g. Creative Architect"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-surface-container-low/50 text-on-surface-variant cursor-not-allowed border-none rounded-xl px-4 py-3 font-medium outline-none"
                      title="Email cannot be changed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-medium text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      placeholder="+234..."
                    />
                  </div>
                </div>

                <h2 className="text-xl font-bold font-headline mt-10 mb-6 border-b border-surface-container-low pb-4 pt-4">App Integrations</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      name="whatsappId"
                      value={formData.whatsappId}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-medium text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      placeholder="For invoice alerts..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span>Telegram Handle</span>
                      {formData.telegramConnected ? (
                        <span className="text-[10px] text-primary flex items-center gap-1 font-black">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          CONNECTED
                        </span>
                      ) : formData.telegramHandle ? (
                        <span className="text-[10px] text-tertiary flex items-center gap-1 font-black">
                          <span className="material-symbols-outlined text-[12px]">pending</span>
                          VERIFICATION PENDING
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="text"
                      name="telegramHandle"
                      value={formData.telegramHandle}
                      onChange={handleChange}
                      className={`w-full bg-surface-container-low border-none rounded-xl px-4 py-3 font-medium text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none ${formData.telegramConnected ? 'ring-2 ring-primary/20' : ''}`}
                      placeholder="@username"
                    />
                    
                    {formData.telegramHandle && !formData.telegramConnected && formData.telegramVerificationCode && (
                      <div className="mt-4 p-5 bg-tertiary-container/30 rounded-2xl border border-tertiary-container/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined text-[18px]">lock_person</span>
                          </div>
                          <p className="text-sm font-black text-on-tertiary-container uppercase tracking-tight">Verify Your Handle</p>
                        </div>
                        
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                          To receive instant payment alerts, you must verify your account with our bot.
                        </p>

                        <div className="bg-white/40 p-3 rounded-xl border border-white/60 mb-4 flex items-center justify-between group">
                          <code className="text-secondary font-black text-xs">/verify {formData.telegramVerificationCode}</code>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`/verify ${formData.telegramVerificationCode}`);
                              alert("Verification command copied!");
                            }}
                            className="bg-white p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                        </div>

                        <a 
                          href={`https://t.me/KliqInvoicingBot?start=${formData.telegramVerificationCode}`} 
                          target="_blank" 
                          className="w-full h-11 rounded-xl bg-tertiary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-all shadow-lg shadow-tertiary/20"
                        >
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          Open Bot & Verify
                        </a>
                        
                        <p className="text-[10px] text-on-surface-variant mt-3 text-center font-medium">
                          Instructions: Click the button above, then click "Start" or send the copied command manually.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-surface-container-low flex justify-between items-center">
                   {message ? (
                      <span className={`text-sm font-bold ${message.type === 'success' ? 'text-primary' : 'text-error'}`}>
                        {message.text}
                      </span>
                   ) : (
                     <span></span> // spacer
                   )}
                   
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}
          </form>

        </section>

        {/* Right Col: Utility Links */}
        <section className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
            <h3 className="font-bold font-headline mb-4">Security</h3>
            <div className="space-y-3">
              <button className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <span className="text-sm font-medium">Change Password</span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
              </button>
              <button className="w-full text-left flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                <span className="text-sm font-medium">Two-Factor Auth</span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,52,52,0.04)] border border-white/40">
            <h3 className="font-bold font-headline mb-4 text-error">Danger Zone</h3>
            <p className="text-sm text-on-surface-variant mb-4">Permanently delete your account and all associated data.</p>
            <button className="w-full p-3 bg-error-container text-on-error-container font-bold text-sm rounded-xl hover:bg-error hover:text-white transition-colors">
              Delete Account
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
